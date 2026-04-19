<?php
// admin-save.php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'POST only']);
    exit;
}

$raw = file_get_contents('php://input');
if ($raw === false || $raw === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Empty body']);
    exit;
}

$data = json_decode($raw, true);
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON']);
    exit;
}

foreach ($data as &$item) {
    if (isset($item['priceCents'])) {
        $item['priceCents'] = (int)$item['priceCents'];
    }
}
unset($item);

$target = __DIR__ . '/products.json';
$backup = $target . '.bak';
if (file_exists($target)) {
    @copy($target, $backup);
}

if (file_put_contents($target, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)) === false) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to write products.json']);
    exit;
}

echo json_encode(['success' => true]);
