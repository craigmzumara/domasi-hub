<?php 
include 'config.php'; 
$stmt = $conn->prepare("SELECT * FROM listings WHERE category = 'accommodation' ORDER BY created_at DESC");
$stmt->execute();
$result = $stmt->get_result();
$listings = $result->fetch_all(MYSQLI_ASSOC);
$stmt->close();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accommodation Directory | Domasi Hub</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header class="main-header">
        <div class="logo"><h1><a href="index.html" style="color: white; text-decoration: none;">Domasi Hub</a></h1></div>
        <nav class="main-nav"><a href="portal.html" class="btn-secondary">Go to Portal</a></nav>
    </header>

    <main class="accommodation-container">
        <section class="section-title">
            <h3>Accommodation Directory</h3>
            <p>Verified off-campus student boarding houses and rental units near Domasi.</p>
        </section>

        <section class="rooms-grid">
            <?php if (!empty($listings)): ?>
                <?php foreach ($listings as $item): ?>
                    <div class="room-card" style="background: var(--bg-surface); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-subtle);">
                        <img src="<?php echo htmlspecialchars($item['image_path']); ?>" style="width:100%; height:200px; object-fit:cover; border-radius:6px;">
                        <div class="product-info" style="margin-top:1rem;">
                            <h3><?php echo htmlspecialchars($item['title']); ?></h3>
                            <p style="font-size:0.9rem; margin:0.3rem 0; color:var(--text-secondary);">🛡️ Security: <?php echo htmlspecialchars($item['security_condition']); ?></p>
                            <p style="font-size:0.9rem; margin:0.3rem 0; color:var(--text-secondary);">📍 Location: <?php echo htmlspecialchars($item['location_details']); ?></p>
                            <p class="price" style="font-weight:bold; color:var(--primary-color); margin:0.5rem 0;"><?php echo number_format($item['price'], 2); ?> MWK / month</p>
                            <a href="https://wa.me/<?php echo preg_replace('/[^0-9]/', '', $item['contact_number']); ?>?text=Hi,%20I'm%20inquiring%20about%20the%20hostel:%20<?php echo urlencode($item['title']); ?>%20on%20Domasi%20Hub" target="_blank" class="btn-primary" style="display:block; text-align:center; text-decoration:none; padding:0.6rem; border-radius:6px; background:var(--primary-color); color:white;">Contact Landlord</a>
                        </div>
                    </div>
                <?php endforeach; ?>
            <?php else: ?>
                <p style="grid-column: 1/-1; text-align: center; padding: 2rem;">No housing units listed yet.</p>
            <?php endif; ?>
        </section>
    </main>
    <script src="theme.js"></script>
</body>
</html>