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

// Get and validate JSON input
$data = getJsonInput();

// Validate required fields
validateRequiredFields($data, ['save_game_string']);

// Unserialize the data
ob_start();
$heroObject = unserialize($data['save_game_string']);
ob_end_clean();

// Validate unserialization
if ($heroObject === false && $data['save_game_string'] !== serialize(false)) {
    sendErrorResponse("Failed to unserialize the provided string. It might be corrupted.");
}

// Send success response
sendSuccessResponse($heroObject, "Data unserialized successfully.");
?>