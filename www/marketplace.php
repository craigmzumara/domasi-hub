<?php 
include 'config.php'; 
$stmt = $conn->prepare("SELECT * FROM listings WHERE category = 'marketplace' ORDER BY created_at DESC");
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
    <title>Campus Marketplace | Domasi Hub</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header class="main-header">
        <div class="logo"><h1><a href="index.html" style="color: white; text-decoration: none;">Domasi Hub</a></h1></div>
        <nav class="main-nav"><a href="portal.html" class="btn-secondary">Go to Portal</a></nav>
    </header>

    <main class="marketplace-container">
        <section class="section-title">
            <h3>Campus Marketplace</h3>
            <p>Buy or sell academic essentials directly via WhatsApp.</p>
        </section>

        <section class="products-grid">
            <?php if (!empty($listings)): ?>
                <?php foreach ($listings as $item): ?>
                    <div class="product-card">
                        <div class="product-image">
                            <img src="<?php echo htmlspecialchars($item['image_path']); ?>" alt="<?php echo htmlspecialchars($item['title']); ?>" style="width:100%; height:200px; object-fit:cover;">
                        </div>
                        <div class="product-info">
                            <h3><?php echo htmlspecialchars($item['title']); ?></h3>
                            <p class="condition" style="font-size:0.85rem; color:var(--text-secondary); margin:0.2rem 0;">Condition: <?php echo htmlspecialchars($item['item_condition']); ?></p>
                            <p class="price"><?php echo number_format($item['price'], 2); ?> MWK</p>
                            <a href="https://wa.me/<?php echo preg_replace('/[^0-9]/', '', $item['contact_number']); ?>?text=Hi,%20I'm%20interested%20in%20your%20listing:%20<?php echo urlencode($item['title']); ?>%20on%20Domasi%20Hub" target="_blank" class="btn-primary btn-marketplace" style="display:block; text-align:center; text-decoration:none; margin-top:1rem; padding:0.6rem;">Chat on WhatsApp</a>
                        </div>
                    </div>
                <?php endforeach; ?>
            <?php else: ?>
                <p style="grid-column: 1/-1; text-align: center; padding: 2rem;">No items listed yet.</p>
            <?php endif; ?>
        </section>
    </main>
    <script src="theme.js"></script>
</body>
</html>