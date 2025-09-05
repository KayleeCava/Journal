<?php

require_once 'headers.php';

// Check for POST request method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendErrorResponse("Only POST method is accepted.", 405);
}

require_once 'Hero.php';
require_once 'GameSession.php';
require_once 'InventoryManager.php';
require_once 'PlayerStatus.php';
require_once 'GameLogger.php';

$data = getJsonInput();
validateRequiredFields($data, ['save_game_string']);

// 1. Get the Base64 encoded string
$base64EncodedString = $data['save_game_string'];

// 2. Decode the Base64 string
$serializedString = base64_decode($base64EncodedString);
if ($serializedString === false) {
    sendErrorResponse("Invalid Base64 data provided. Cannot decode.", 400);
}

// 3. Unserialize the DECODED string
ob_start();
$heroObject = unserialize($serializedString);
ob_end_clean();

// Validate unserialization
if ($heroObject === false && $serializedString !== serialize(false)) {
    sendErrorResponse("Failed to unserialize the provided string after decoding.", 400);
}

// 4. Send the successful result back to the game client
sendSuccessResponse($heroObject, "Data decoded and unserialized successfully.");
?>