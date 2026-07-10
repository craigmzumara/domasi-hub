<?php
header("Content-Type: application/json");
require_once "config.php";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);

    $fullName = trim($data["fullname"] ?? "");
    $regNumber = trim($data["regNumber"] ?? "");
    $whatsapp = trim($data["whatsapp"] ?? ""); // Match your JS payload key exactly
    $password = $data["password"] ?? "";

    if (!preg_match('/^BED\/(SCI|HUM|SSC|LAC)(?:\/ODEL)?\/\d{3,4}\/\d{2}$/i', $regNumber)) {
        echo json_encode(["status" => "error", "message" => "Invalid registration format."]);
        exit;
    }

    if (empty($fullName) || empty($whatsapp) || empty($password)) {
        echo json_encode(["status" => "error", "message" => "All fields are required."]);
        exit;
    }

    $passwordHash = password_hash($password, PASSWORD_BCRYPT);

    $stmt = $conn->prepare("INSERT INTO users (full_name, reg_number, whatsapp_number, password_hash) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $fullName, $regNumber, $whatsapp, $passwordHash);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Registration successful!"]);
    } else {
        if ($conn->errno === 1062) {
            echo json_encode(["status" => "error", "message" => "This registration number is already registered."]);
        } else {
            echo json_encode(["status" => "error", "message" => "An error occurred during save operations."]);
        }
    }
    $stmt->close();
    $conn->close();
}
?>