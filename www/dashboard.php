<?php
// Connect to SQLite database
$db = new SQLite3('domasi_hub.db');

// Debug: list all tables in the database
$res = $db->query("SELECT name FROM sqlite_master WHERE type='table'");
echo "<pre>Tables in DB:\n";
while ($row = $res->fetchArray(SQLITE3_ASSOC)) {
    echo $row['name'] . "\n";
}
echo "</pre>";

// Query users and their items (this will only work once we confirm table names)
$query = "
  SELECT u.id AS user_id, u.username,
         m.id AS marketplace_id, m.title AS marketplace_title,
         a.id AS accommodation_id, a.title AS accommodation_title,
         p.id AS printing_id, p.title AS printing_title
  FROM users u
  LEFT JOIN marketplace m ON u.id = m.user_id
  LEFT JOIN accommodation a ON u.id = a.user_id
  LEFT JOIN printing p ON u.id = p.user_id
  ORDER BY u.username;
";

$result = $db->query($query);
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Admin Dashboard</title>
  <link rel="stylesheet" href="style.css">
  <style>
    body {
      background-color: #000;
      color: #fff;
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background-color: #111;
      border-bottom: 1px solid #333;
    }
    header h2 { margin: 0; color: #fff; }
    .logout-btn {
      padding: 0.5rem 1rem;
      background: #007bff;
      color: #fff;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    }
    .logout-btn:hover { background: #0056b3; }
    #usersContainer { padding: 2rem; }
    .user-block {
      border: 1px solid #444;
      padding: 1rem;
      margin-bottom: 1rem;
      background-color: #222;
      border-radius: 8px;
    }
    .user-block h3 { margin-top: 0; color: #fff; }
    .user-block p { color: #ddd; }
    .user-block a {
      margin-left: 0.5rem;
      padding: 0.3rem 0.7rem;
      border-radius: 4px;
      text-decoration: none;
      font-weight: 600;
    }
    .edit-link { background: #28a745; color: #fff; }
    .delete-link { background: #dc3545; color: #fff; }
  </style>
</head>
<body>
  <header>
    <h2>Users and Published Items</h2>
    <button class="logout-btn" onclick="logout()">Logout</button>
  </header>

  <div id="usersContainer">
    <?php while ($row = $result->fetchArray(SQLITE3_ASSOC)): ?>
      <div class="user-block">
        <h3><?php echo htmlspecialchars($row['username']); ?></h3>
        <?php if ($row['marketplace_id']): ?>
          <p>
            🛒 Marketplace: <?php echo htmlspecialchars($row['marketplace_title']); ?>
            <a href="edit.php?id=<?php echo $row['marketplace_id']; ?>&type=marketplace" class="edit-link">Edit</a>
            <a href="delete.php?id=<?php echo $row['marketplace_id']; ?>&type=marketplace" class="delete-link">Delete</a>
          </p>
        <?php endif; ?>
        <?php if ($row['accommodation_id']): ?>
          <p>
            🏠 Accommodation: <?php echo htmlspecialchars($row['accommodation_title']); ?>
            <a href="edit.php?id=<?php echo $row['accommodation_id']; ?>&type=accommodation" class="edit-link">Edit</a>
            <a href="delete.php?id=<?php echo $row['accommodation_id']; ?>&type=accommodation" class="delete-link">Delete</a>
          </p>
        <?php endif; ?>
        <?php if ($row['printing_id']): ?>
          <p>
            🖨️ Printing: <?php echo htmlspecialchars($row['printing_title']); ?>
            <a href="edit.php?id=<?php echo $row['printing_id']; ?>&type=printing" class="edit-link">Edit</a>
            <a href="delete.php?id=<?php echo $row['printing_id']; ?>&type=printing" class="delete-link">Delete</a>
          </p>
        <?php endif; ?>
      </div>
    <?php endwhile; ?>
  </div>

  <script>
    function logout() {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('username');
      window.location.href = "index.html";
    }
  </script>
</body>
</html>
