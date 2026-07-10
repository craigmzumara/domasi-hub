<?php
header("Content-Type: application/json");
require_once "config.php";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Read the raw JSON payload sent from auth-signin.js
    $data = json_decode(file_get_contents("php://input"), true);

    $regNumber = trim($data["regNumber"] ?? "");
    $password = $data["password"] ?? "";

    // 1. Core Gatekeeper Validation check
    if (!preg_match('/^BED\/(SCI|HUM|SSC|LAC)(?:\/ODEL)?\/\d{3,4}\/\d{2}$/i', $regNumber)) {
        echo json_encode(["status" => "error", "message" => "Invalid registration number format."]);
        exit;
    }

    if (empty($regNumber) || empty($password)) {
        echo json_encode(["status" => "error", "message" => "All fields are required."]);
        exit;
    }

    // 2. Query the database for the matching student record
    $stmt = $conn->prepare("SELECT full_name, password_hash FROM users WHERE reg_number = ?");
    $stmt->bind_param("s", $regNumber);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();

        // 3. Verify the typed password against the hashed database password
        if (password_verify($password, $user["password_hash"])) {
            echo json_encode([
                "status" => "success",
                "message" => "Login successful!",
                "user" => [
                    "fullname" => $user["full_name"],
                    "regNumber" => $regNumber
                ]
            ]);
        } else {
            // Keep error messages ambiguous to prevent credential scanning
            echo json_encode(["status" => "error", "message" => "Invalid credentials."]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Invalid credentials."]);
    }

    $stmt->close();
    $conn->close();
}
?>