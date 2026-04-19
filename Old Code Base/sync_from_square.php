<?php
/**
 * Sync products from Square into products.json
 * for Morgan 3D Prints admin.
 *
 * - RUNS ON POST ONLY
 * - Overwrites products.json completely
 * - Tries to download images from Square into /images/products
 */

$SQUARE_ACCESS_TOKEN = 'EAAAlyylgILkWzqrSMIJOFp8QDV4E8E0ScXUzurHyFkwbiTzblSS1UZELggg76nn'; // <-- PUT YOUR REAL TOKEN HERE
$SQUARE_API_BASE     = 'https://connect.squareup.com';
$SQUARE_VERSION      = '2025-01-23'; // Square API version (date string)

$productsFile = __DIR__ . '/products.json';
$imagesDir    = __DIR__ . '/images/products';

if (!is_dir($imagesDir)) {
    @mkdir($imagesDir, 0755, true);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Content-Type: application/json');
    echo json_encode(['ok' => false, 'error' => 'Method not allowed. Use POST.']);
    exit;
}

function slugify_local(string $text): string {
    $text = preg_replace('~[^\pL\d]+~u', '-', $text);
    $text = iconv('utf-8','us-ascii//TRANSLIT',$text);
    $text = preg_replace('~[^-\w]+~','',$text);
    $text = trim($text,'-');
    $text = preg_replace('~-+~','-',$text);
    $text = strtolower($text);
    return $text ?: 'product';
}

function callSquareApi(string $method, string $path, array $query = []): array {
    global $SQUARE_ACCESS_TOKEN, $SQUARE_API_BASE, $SQUARE_VERSION;

    $url = rtrim($SQUARE_API_BASE, '/') . $path;
    if (!empty($query)) {
        $url .= '?' . http_build_query($query);
    }

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $headers = [
        'Authorization: Bearer ' . $SQUARE_ACCESS_TOKEN,
        'Square-Version: ' . $SQUARE_VERSION,
        'Content-Type: application/json'
    ];
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    if (strtoupper($method) !== 'GET') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, strtoupper($method));
    }

    $response = curl_exec($ch);
    $err      = curl_error($ch);
    $status   = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($err) {
        throw new Exception('cURL error: ' . $err);
    }

    $decoded = json_decode($response, true);

    if ($status < 200 || $status >= 300) {
        $msg = isset($decoded['errors']) ? json_encode($decoded['errors']) : $response;
        throw new Exception("Square API error (HTTP $status): " . $msg);
    }

    return is_array($decoded) ? $decoded : [];
}

try {
    // 1) Pull catalog: items, variations, images
    $cursor = null;
    $allObjects = [];

    do {
        $query = [
            'types' => 'ITEM,ITEM_VARIATION,IMAGE'
        ];
        if ($cursor) {
            $query['cursor'] = $cursor;
        }

        $res = callSquareApi('GET', '/v2/catalog/list', $query);

        if (!empty($res['objects']) && is_array($res['objects'])) {
            $allObjects = array_merge($allObjects, $res['objects']);
        }

        $cursor = isset($res['cursor']) ? $res['cursor'] : null;
    } while ($cursor);

    // 2) Build lookup maps
    $images     = []; // id => url
    $variations = []; // itemId => [variation objects]
    $items      = []; // itemId => item object

    foreach ($allObjects as $obj) {
        if (empty($obj['id']) || empty($obj['type'])) continue;

        switch ($obj['type']) {
            case 'IMAGE':
                if (!empty($obj['image_data']['url'])) {
                    $images[$obj['id']] = $obj['image_data']['url'];
                }
                break;

            case 'ITEM_VARIATION':
                $itemId = $obj['item_variation_data']['item_id'] ?? null;
                if ($itemId) {
                    if (!isset($variations[$itemId])) {
                        $variations[$itemId] = [];
                    }
                    $variations[$itemId][] = $obj;
                }
                break;

            case 'ITEM':
                $items[$obj['id']] = $obj;
                break;
        }
    }

    // 3) Build local products array in *your* schema
    $products   = [];
    $nextIdInt  = 1;  // local numeric IDs
    $nowPrefix  = time(); // help keep filenames unique

    foreach ($items as $itemId => $itemObj) {
        $itemData = $itemObj['item_data'] ?? [];
        $name        = $itemData['name']        ?? '';
        $description = $itemData['description'] ?? '';
        $category    = $itemData['category_id'] ?? ''; // you can map to name later if you want

        if ($name === '') {
            continue; // ignore nameless items
        }

        $itemVariations = $variations[$itemId] ?? [];
        if (empty($itemVariations)) {
            continue; // we need a price from a variation
        }

        // Pick first variation as the "main" one
        $v       = $itemVariations[0];
        $varData = $v['item_variation_data'] ?? [];

        $priceCents = null;
        if (!empty($varData['price_money']['amount'])) {
            $priceCents = (int)$varData['price_money']['amount'];
        }

        if ($priceCents === null) {
            // skip items without a price
            continue;
        }

        $priceFloat    = $priceCents / 100.0;
        $priceDisplay  = '$' . number_format($priceFloat, 2);

        // Collect variation names just for display
        $varNames = [];
        foreach ($itemVariations as $vv) {
            $vn = trim($vv['item_variation_data']['name'] ?? '');
            if ($vn !== '') {
                $varNames[] = $vn;
            }
        }

        // Pick best image (variation image overrides item image)
        $imageUrl = null;
        if (!empty($varData['image_ids'][0])) {
            $vid = $varData['image_ids'][0];
            if (isset($images[$vid])) {
                $imageUrl = $images[$vid];
            }
        } elseif (!empty($itemData['image_ids'][0])) {
            $iid = $itemData['image_ids'][0];
            if (isset($images[$iid])) {
                $imageUrl = $images[$iid];
            }
        }

        // Try to download Square image into /images/products
        $localImageFilename = null;
        if ($imageUrl) {
            try {
                $imgData = @file_get_contents($imageUrl);
                if ($imgData !== false) {
                    $pathPart = parse_url($imageUrl, PHP_URL_PATH);
                    $ext = strtolower(pathinfo($pathPart, PATHINFO_EXTENSION));
                    if ($ext === '' || strlen($ext) > 5) {
                        $ext = 'jpg';
                    }

                    $safeSlug  = slugify_local($name);
                    $fileName  = $nowPrefix . '_' . $nextIdInt . '_' . $safeSlug . '.' . $ext;
                    $fullPath  = $imagesDir . '/' . $fileName;

                    if (@file_put_contents($fullPath, $imgData) !== false) {
                        $localImageFilename = $fileName;
                    }
                }
            } catch (Exception $e) {
                // if image fails, just skip image, keep product
            }
        }

        $product = [
            'id'            => $nextIdInt,
            'name'          => $name,
            'slug'          => slugify_local($name),
            'description'   => $description,
            'price'         => $priceCents,
            'price_display' => $priceDisplay,
            'category'      => $category,      // can later map category IDs to names
            'stock'         => null,           // use Square inventory later if needed
            'variations'    => $varNames,
            'image'         => $localImageFilename, // local filename or null
        ];

        $products[] = $product;
        $nextIdInt++;
    }

    // 4) Save to products.json
    $json = json_encode($products, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    if ($json === false) {
        throw new Exception('Failed to encode products as JSON.');
    }

    if (@file_put_contents($productsFile, $json) === false) {
        throw new Exception('Failed to write products file: ' . $productsFile);
    }

    header('Content-Type: application/json');
    echo json_encode([
        'ok'    => true,
        'count' => count($products),
    ]);
    exit;

} catch (Exception $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'ok'    => false,
        'error' => $e->getMessage(),
    ]);
    exit;
}
