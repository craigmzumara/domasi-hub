<?php
include 'config.php'; 

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $title = $_POST['title'];
    $category = $_POST['category'];
    $price = $_POST['price'];
    $contact = $_POST['contact_number'];
    
    // Check specific custom modal strings safely
    $condition = isset($_POST['item_condition']) ? $_POST['item_condition'] : null;
    $security  = isset($_POST['security_condition']) ? $_POST['security_condition'] : null;
    $location  = isset($_POST['location_details']) ? $_POST['location_details'] : null;
    
    $targetDir = "uploads/";
    if (!is_dir($targetDir)) {
        mkdir($targetDir, 0755, true);
    }
    
    $fileName = time() . '_' . basename($_FILES["image"]["name"]);
    $targetFilePath = $targetDir . $fileName;
    $fileType = pathinfo($targetFilePath, PATHINFO_EXTENSION);
    
    $allowTypes = array('jpg', 'png', 'jpeg', 'gif', 'webp');
    if (in_array(strtolower($fileType), $allowTypes)) {
        if (move_uploaded_file($_FILES["image"]["tmp_name"], $targetFilePath)) {
            
            $stmt = $conn->prepare("INSERT INTO listings (title, category, price, contact_number, item_condition, security_condition, location_details, image_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("ssgsssss", $title, $category, $price, $contact, $condition, $security, $location, $targetFilePath);
            
            if ($stmt->execute()) {
                echo "<script>alert('Listing uploaded successfully!'); window.location.href='portal.html';</script>";
            } else {
                echo "Database upload failed: " . $stmt->error;
            }
            $stmt->close();
        } else {
            echo "Sorry, there was an error uploading your file.";
        }
    } else {
        echo "Sorry, only image files are allowed.";
    }
}
?>