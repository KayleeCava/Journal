<?php

require_once 'headers.php';

// Check for POST request method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendErrorResponse("Only POST method is accepted.", 405);
}

require_once 'Hero.php';

// Get the plain JSON data
$data = getJsonInput();
validateRequiredFields($data, ['mapId', 'playerX', 'playerY', 'playerDirection', 'characterSrc']);

// Create the Hero object
$hero = new Hero(
    $data['mapId'],
    $data['playerX'],
    $data['playerY'],
    $data['playerDirection'],
    $data['characterSrc']
);

// 1. Serialize the Hero object
$serializedString = serialize($hero);

// 2. Base64 encode the final string
$base64EncodedString = base64_encode($serializedString);

// 3. Send the encoded string back in the response
sendSuccessResponse([
    "serialized_data" => $base64EncodedString
], "Data received, serialized, and encoded successfully.");
?>