<?php
$db = new SQLite3('domasi_hub.db');

$id = $_GET['id'] ?? null;
$type = $_GET['type'] ?? null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = $_POST['title'];
    $description = $_POST['description'];

    switch ($type) {
        case 'marketplace':
            $stmt = $db->prepare("UPDATE marketplace SET title = :title, description = :description WHERE id = :id");
            break;
        case 'accommodation':
            $stmt = $db->prepare("UPDATE accommodation SET title = :title, description = :description WHERE id = :id");
            break;
        case 'printing':
            $stmt = $db->prepare("UPDATE printing SET title = :title, description = :description WHERE id = :id");
            break;
        default:
            die("Invalid type");
    }

    $stmt->bindValue(':title', $title, SQLITE3_TEXT);
    $stmt->bindValue(':description', $description, SQLITE3_TEXT);
    $stmt->bindValue(':id', $id, SQLITE3_INTEGER);
    $stmt->execute();

    header("Location: dashboard.php");
    exit;
}
?>

<!DOCTYPE html>
<html>
<head>
  <title>Edit Item</title>
</head>
<body>
  <h2>Edit <?php echo htmlspecialchars($type); ?> Item</h2>
  <form method="post">
    <label>Title:</label><br>
    <input type="text" name="title" required><br><br>
    <label>Description:</label><br>
    <textarea name="description" rows="4" cols="40"></textarea><br><br>
    <button type="submit">Save Changes</button>
  </form>
</body>
</html>
