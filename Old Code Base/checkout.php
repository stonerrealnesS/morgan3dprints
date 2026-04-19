<?php
// === CONFIG ===

// Put your REAL Square PRODUCTION access token here:
$SQUARE_ACCESS_TOKEN = 'EAAAlyylgILkWzqrSMIJOFp8QDV4E8E0ScXUzurHyFkwbiTzblSS1UZELggg76nn';

// Your Square Location ID:
$SQUARE_LOCATION_ID  = 'LSYYXRN49K4RK';

// Where Square sends customers after successful payment:
$SUCCESS_URL         = 'https://morgan3dokc.com/checkout-success.html';

// Environment + API version:
$SQUARE_ENVIRONMENT  = 'production';
$SQUARE_API_VERSION  = '2023-12-13';

// =================

header('Content-Type: application/json');

// Read incoming JSON (cart + shipping from index.html)
$raw  = file_get_contents("php://input");
$data = json_decode($raw, true);

if (!$data || !isset($data["cart"]) || !is_array($data["cart"]) || count($data["cart"]) === 0) {
    echo json_encode([
        "success" => false,
        "error"   => "Cart empty or invalid."
    ]);
    exit;
}

// Shipping object from frontend
$shipping = $data["shipping"] ?? [
    "mode"        => "pickup",
    "amountCents" => 0
];

$shippingMode  = $shipping["mode"] ?? "pickup";
$shippingCents = isset($shipping["amountCents"]) ? (int)$shipping["amountCents"] : 0;

// Build items subtotal + human-readable note that goes on the Square side
$itemsSubtotalCents = 0;
$notesList          = [];

foreach ($data["cart"] as $item) {
    $qty   = (int)($item["qty"] ?? 0);
    $price = (int)($item["priceCents"] ?? 0);

    if ($qty <= 0 || $price < 0) {
        continue;
    }

    $itemsSubtotalCents += $qty * $price;

    $name  = $item["name"]  ?? "Item";
    $notes = trim($item["notes"] ?? "");

    $line = "{$qty}x {$name}";
    if ($notes !== "") {
        $line .= " ({$notes})";
    }
    $notesList[] = $line;
}

if ($itemsSubtotalCents <= 0 && $shippingCents <= 0) {
    echo json_encode([
        "success" => false,
        "error"   => "Total is zero."
    ]);
    exit;
}

// Add fulfillment note
if ($shippingMode === "ship") {
    $notesList[] = "Fulfillment: Ship (may be free over threshold)";
} else {
    $notesList[] = "Fulfillment: Pickup (OKC local)";
}

$totalCents = $itemsSubtotalCents + $shippingCents;

$note = implode("; ", $notesList);
if (strlen($note) > 450) {
    $note = substr($note, 0, 450) . "…";
}

// Choose the correct Square API base URL
$baseUrl = ($SQUARE_ENVIRONMENT === "production")
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com";

// Build Payment Link request payload
$payload = [
    "idempotency_key" => bin2hex(random_bytes(16)),
    "quick_pay" => [
        "name"        => "Morgan 3D Prints Order",
        "price_money" => [
            "amount"   => $totalCents, // items + shipping, in cents
            "currency" => "USD"
        ],
        "location_id" => $SQUARE_LOCATION_ID
    ],
    "checkout_options" => [
        "redirect_url" => $SUCCESS_URL
    ],
    "payment_note" => $note
];

// Call Square API
$ch = curl_init($baseUrl . "/v2/online-checkout/payment-links");

curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER     => [
        "Content-Type: application/json",
        "Square-Version: {$SQUARE_API_VERSION}",
        "Authorization: Bearer {$SQUARE_ACCESS_TOKEN}"
    ],
    CURLOPT_POSTFIELDS     => json_encode($payload)
]);

$response = curl_exec($ch);
$http     = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$decoded = json_decode($response, true);

// Handle errors from Square
if ($http >= 300 || isset($decoded["errors"])) {
    echo json_encode([
        "success" => false,
        "error"   => $decoded["errors"][0]["detail"] ?? "Square API error",
        "raw"     => $decoded
    ]);
    exit;
}

// Make sure we got a payment link back
if (!isset($decoded["payment_link"]["url"])) {
    echo json_encode([
        "success" => false,
        "error"   => "Missing checkout URL in Square response.",
        "raw"     => $decoded
    ]);
    exit;
}

// Success: send the URL back to the browser
echo json_encode([
    "success"      => true,
    "checkout_url" => $decoded["payment_link"]["url"]
]);
