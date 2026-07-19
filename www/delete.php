<?php
$db = new SQLite3('domasi_hub.db');

$id = $_GET['id'] ?? null;
$type = $_GET['type'] ?? null;

if ($id && $type) {
    switch ($type) {
        case 'marketplace':
            $stmt = $db->prepare("DELETE FROM marketplace WHERE id = :id");
            break;
        case 'accommodation':
            $stmt = $db->prepare("DELETE FROM accommodation WHERE id = :id");
            break;
        case 'printing':
            $stmt = $db->prepare("DELETE FROM printing WHERE id = :id");
            break;
        default:
            die("Invalid type");
    }

    $stmt->bindValue(':id', $id, SQLITE3_INTEGER);
    $stmt->execute();
}

header("Location: dashboard.php");
exit;
?>
