<?php
/**
 * Common headers for all PHP services
 * Include this file at the top of all service files
 */

// CORS headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Common error response function
function sendErrorResponse($message, $statusCode = 400) {
    http_response_code($statusCode);
    echo json_encode([
        "error" => true,
        "message" => $message,
        "timestamp" => date('Y-m-d H:i:s')
    ]);
    exit();
}

// Common success response function
function sendSuccessResponse($data, $message = "Success") {
    http_response_code(200);
    echo json_encode([
        "error" => false,
        "message" => $message,
        "data" => $data,
        "timestamp" => date('Y-m-d H:i:s')
    ]);
    exit();
}

// Validate JSON input
function getJsonInput() {
    $jsonData = file_get_contents('php://input');
    $data = json_decode($jsonData, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        sendErrorResponse("Invalid JSON format", 400);
    }
    
    return $data;
}

// Validate required fields
function validateRequiredFields($data, $requiredFields) {
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            sendErrorResponse("Missing required field: $field", 400);
        }
    }
    return true;
}
?>
