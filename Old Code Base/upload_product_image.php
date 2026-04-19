<?php
// upload_product_image.php
// Handles image uploads for admin drag & drop and saves them into images/products/

header('Content-Type: application/json');

// Basic security: only allow POST with a file named "image"
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Invalid request method']);
    exit;
}
if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['success' => false, 'error' => 'No file uploaded or upload error']);
    exit;
}

// Ensure upload directory exists
$uploadDir = __DIR__ . '/images/products/';
if (!is_dir($uploadDir)) {
    if (!mkdir($uploadDir, 0755, true)) {
        echo json_encode(['success' => false, 'error' => 'Could not create upload directory']);
        exit;
    }
}

// Sanitize filename
$originalName = basename($_FILES['image']['name']);
$sanitized = preg_replace('/[^A-Za-z0-9._-]/', '_', $originalName);
if ($sanitized === '' || $sanitized === '.' || $sanitized === '..') {
    $sanitized = 'upload_' . time() . '.png';
}

// Avoid overwriting existing files: add _1, _2, ... if needed
$dotPos = strrpos($sanitized, '.');
if ($dotPos === false) {
    $base = $sanitized;
    $ext  = '';
} else {
    $base = substr($sanitized, 0, $dotPos);
    $ext  = substr($sanitized, $dotPos);
}

$finalName = $sanitized;
$counter   = 1;
while (file_exists($uploadDir . $finalName)) {
    $finalName = $base . '_' . $counter . $ext;
    $counter++;
}

$targetPath = $uploadDir . $finalName;

// Move uploaded file
if (!move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
    echo json_encode(['success' => false, 'error' => 'Failed to move uploaded file']);
    exit;
}

echo json_encode([
    'success'  => true,
    'filename' => $finalName    // this is what admin.html will store in products.json
]);
