document.addEventListener("DOMContentLoaded", () => {
    // 1. Update Portal Nav Link
    const navWrapper = document.getElementById("portalNavWrapper");
    if (navWrapper) {
        if (localStorage.getItem('isLoggedIn') === 'true') {
            navWrapper.innerHTML = `<a href="portal.html" class="btn-secondary">Go to Portal</a>`;
        } else {
            navWrapper.innerHTML = `<a href="signin.html" class="btn-nav-signin">Sign In</a>`;
        }
    }

    // 2. Load Listings
    loadMarketplace();
});

async function loadMarketplace() {
    const grid = document.getElementById("marketplace-grid");
    if (!grid) return;

    try {
        const response = await fetch("http://127.0.0.1:3000/api/listings?category=marketplace");
        const data = await response.json();

        if (data.status === "success" && data.listings && data.listings.length > 0) {
            grid.innerHTML = ""; // Clear loader
            data.listings.forEach(item => {
                const card = document.createElement("div");
                card.className = "product-card";

                const priceFormatted = parseFloat(item.price || 0).toLocaleString() + " MWK";
                const cleanPhone = item.contact_number ? item.contact_number.replace(/[^0-9]/g, "") : "";
                const imageSrc = item.image_path || "https://via.placeholder.com/300x200?text=No+Image";

                card.innerHTML = `
                    <div class="product-image">
                        <img src="${imageSrc}" alt="${item.title || 'Marketplace Item'}" style="width:100%; height:200px; object-fit:cover; border-radius:6px;">
                    </div>
                    <div class="product-info">
                        <h3>${item.title || 'Untitled Item'}</h3>
                        <p class="condition" style="font-size:0.85rem; color:var(--text-secondary); margin:0.2rem 0;">Condition: ${item.item_condition || 'N/A'}</p>
                        <p class="price">${priceFormatted}</p>
                        <a href="https://wa.me/${cleanPhone}?text=Hi,%20I'm%20interested%20in%20your%20listing:%20${encodeURIComponent(item.title || '')}%20on%20Domasi%20Hub" target="_blank" class="btn-primary btn-marketplace" style="display:block; text-align:center; text-decoration:none; margin-top:1rem; padding:0.6rem;">Chat on WhatsApp</a>
                    </div>
                `;
                grid.appendChild(card);
            });
        } else {
            grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 2rem;">No items listed yet.</p>`;
        }
    } catch (error) {
        console.error("Failed to load listings:", error);
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 2rem; color: red;">Failed to load marketplace data.</p>`;
    }
}