<?php
/**
 * sync-square-catalog.php
 *
 * Run this in your browser as:
 *   https://morgan3dokc.com/sync-square-catalog.php?key=YOUR_SECRET_KEY
 *
 * It will:
 *  - Call Square Catalog API (server-side, using your access token)
 *  - Pull active ITEMS and IMAGE objects
 *  - Build a products.json file in the same folder as index.html
 *  - Use Square's image URLs directly (no manual image uploads)
 */

// ================== CONFIG ==================
$SQUARE_ACCESS_TOKEN = 'EAAAlyylgILkWzqrSMIJOFp8QDV4E8E0ScXUzurHyFkwbiTzblSS1UZELggg76nn';   // Same kind as checkout.php
$SQUARE_ENVIRONMENT  = 'production';                          // or 'sandbox' for testing
$SQUARE_API_VERSION  = '2023-12-13';

// A simple shared secret so random people can’t sync your catalog:
$SYNC_SECRET = 'm3dp_9vX8wQ92L_secret';

// Where to write the products file:
$PRODUCTS_JSON_PATH = __DIR__ . '/products.json';
// ===========================================

// --- basic auth check ---
if (!isset($_GET['key']) || $_GET['key'] !== $SYNC_SECRET) {
    http_response_code(403);
    echo "Forbidden. Missing or incorrect ?key= parameter.";
    exit;
}

// --- small helper ---
function call_square($endpoint, $params = []) {
    global $SQUARE_ACCESS_TOKEN, $SQUARE_ENVIRONMENT, $SQUARE_API_VERSION;

    $baseUrl = ($SQUARE_ENVIRONMENT === 'production')
        ? 'https://connect.squareup.com'
        : 'https://connect.squareupsandbox.com';

    $url = $baseUrl . $endpoint;

    if (!empty($params)) {
        $url .= '?' . http_build_query($params);
    }

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            "Authorization: Bearer {$SQUARE_ACCESS_TOKEN}",
            "Square-Version: {$SQUARE_API_VERSION}",
            "Content-Type: application/json"
        ]
    ]);

    $res  = curl_exec($ch);
    $http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($res === false) {
        throw new Exception("cURL error calling Square.");
    }

    $decoded = json_decode($res, true);
    if ($http >= 300 || isset($decoded['errors'])) {
        $detail = $decoded['errors'][0]['detail'] ?? "Unknown Square API error";
        throw new Exception("Square API error ({$http}): {$detail}");
    }

    return $decoded;
}

try {
    // 1) Get CATALOG: ITEMS + IMAGES
    $allObjects = [];
    $cursor = null;

    do {
        $params = [
            'types' => 'ITEM,IMAGE'
        ];
        if ($cursor) {
            $params['cursor'] = $cursor;
        }

        $data = call_square('/v2/catalog/list', $params);

        if (!empty($data['objects']) && is_array($data['objects'])) {
            $allObjects = array_merge($allObjects, $data['objects']);
        }

        $cursor = $data['cursor'] ?? null;
    } while ($cursor);

    // 2) Build lookup of images by ID
    $imagesById = [];
    foreach ($allObjects as $obj) {
        if (($obj['type'] ?? '') === 'IMAGE' && isset($obj['id'])) {
            $imageData = $obj['image_data'] ?? [];
            if (!empty($imageData['url'])) {
                $imagesById[$obj['id']] = $imageData['url'];
            }
        }
    }

    // 3) Build products array for your site from ITEM objects
    $products = [];
    foreach ($allObjects as $obj) {
        if (($obj['type'] ?? '') !== 'ITEM') {
            continue;
        }

        $id        = $obj['id'] ?? null;
        $itemData  = $obj['item_data'] ?? [];
        $isArchived = !empty($itemData['is_archived']);
        $isDeleted  = !empty($obj['is_deleted']);

        // skip archived/deleted items
        if ($isArchived || $isDeleted) continue;

        $name        = $itemData['name'] ?? 'Untitled Item';
        $description = $itemData['description'] ?? '';
        $categoryId  = $itemData['category_id'] ?? null;
        $category    = $categoryId ? ("Category " . substr($categoryId, 0, 6)) : 'General';

        // pick first variation for price
        $priceCents = 0;
        if (!empty($itemData['variations']) && is_array($itemData['variations'])) {
            foreach ($itemData['variations'] as $variation) {
                $varData = $variation['item_variation_data'] ?? [];
                $money   = $varData['price_money'] ?? null;
                if ($money && isset($money['amount'])) {
                    $priceCents = (int)$money['amount'];
                    break;
                }
            }
        }

        // look for image_id in item_data
        $imageUrl = '';
        if (!empty($itemData['image_ids']) && is_array($itemData['image_ids'])) {
            foreach ($itemData['image_ids'] as $imgId) {
                if (!empty($imagesById[$imgId])) {
                    $imageUrl = $imagesById[$imgId];
                    break;
                }
            }
        }

        $products[] = [
            'id'            => $id,
            'name'          => $name,
            'description'   => $description,
            'category'      => $category,
            'price'         => $priceCents,                               // integer cents
            'price_display' => '$' . number_format($priceCents / 100, 2), // string for UI
            'image'         => $imageUrl,                                 // FULL URL to Square image
            'url'           => null                                       // you can fill with web link later if you want
        ];
    }

    if (empty($products)) {
        throw new Exception("No active Square items found to sync.");
    }

    // 4) Write products.json
    $json = json_encode($products, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    if ($json === false) {
        throw new Exception("Failed to JSON encode products.");
    }

    if (file_put_contents($PRODUCTS_JSON_PATH, $json) === false) {
        throw new Exception("Failed to write products.json at {$PRODUCTS_JSON_PATH}");
    }

    // 5) Output summary
    header('Content-Type: text/plain; charset=utf-8');
    echo "Sync complete.\n\n";
    echo "Products written: " . count($products) . "\n";
    echo "File: products.json\n\n";
    echo "Sample product:\n";
    echo $json ? substr($json, 0, 600) . "...\n" : '';

} catch (Exception $e) {
    http_response_code(500);
    header('Content-Type: text/plain; charset=utf-8');
    echo "Error syncing Square catalog:\n" . $e->getMessage();
    exit;
}
