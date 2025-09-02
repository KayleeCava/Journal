<?php
require_once 'headers.php';

// Check for POST request method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendErrorResponse("Only POST method is accepted.", 405);
}

require_once 'Hero.php';

// Get and validate JSON input
$data = getJsonInput();

// Validate required fields
validateRequiredFields($data, ['mapId', 'playerX', 'playerY', 'playerDirection', 'characterSrc']);

// Create an instance of the Hero class
$hero = new Hero(
    $data['mapId'],
    $data['playerX'],
    $data['playerY'],
    $data['playerDirection'],
    $data['characterSrc']
);

// Serialize the Hero object
$serializedString = serialize($hero);

// Send success response
sendSuccessResponse([
    "serialized_data" => $serializedString
], "Data received and serialized successfully.");
?>