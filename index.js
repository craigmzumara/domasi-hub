let allListings = [];

document.addEventListener("DOMContentLoaded", () => {
    // 1. Auth Navigation UI Setup
    setupAuthNav();

    // 2. Load Dynamic Featured Listings & Live Category Counts
    loadHomepageData();

    // 3. Search Bar Event Listeners
    const searchBtn = document.getElementById("heroSearchBtn");
    const searchInput = document.getElementById("heroSearchInput");
    const clearBtn = document.getElementById("clearSearchBtn");

    if (searchBtn && searchInput) {
        searchBtn.addEventListener("click", () => handleSearch());
        searchInput.addEventListener("keyup", (e) => {
            if (e.key === "Enter") handleSearch();
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            if (searchInput) searchInput.value = "";
            renderListings(allListings.slice(0, 3), false);
        });
    }
});

function getLoggedInUser() {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) return null;

    const directName = localStorage.getItem("user_name") || 
                       localStorage.getItem("user_fullname") || 
                       localStorage.getItem("fullname") || 
                       localStorage.getItem("username");
    if (directName) return { fullname: directName };

    const userObjStr = localStorage.getItem("user");
    if (userObjStr) {
        try {
            return JSON.parse(userObjStr);
        } catch (e) {
            console.error("Error parsing stored user JSON:", e);
        }
    }

    return null;
}

function setupAuthNav() {
    const container = document.getElementById("authNavContainer");
    if (!container) return;

    const user = getLoggedInUser();

    if (user && (user.fullname || user.user_fullname)) {
        const displayName = escapeHTML(user.fullname || user.user_fullname);
        container.innerHTML = `
            <span class="user-greeting">👋 ${displayName}</span>
            <a href="portal.html" class="btn-nav-register">Go to Portal</a>
            <button onclick="logout()" style="padding:0.55rem 1rem; background:#ef4444; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600;">
                Logout
            </button>
        `;
    } else {
        container.innerHTML = `
            <a href="signin.html" class="btn-nav-signin">Sign In</a>
            <a href="signup.html" class="btn-nav-register">Register</a>
        `;
    }
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_fullname');
    localStorage.removeItem('fullname');
    localStorage.removeItem('username');
    localStorage.removeItem('user_reg');
    localStorage.removeItem('user');
    window.location.href = "index.html";
}

async function loadHomepageData() {
    const featuredGrid = document.getElementById("featured-grid");
    
    try {
        const response = await fetch("http://127.0.0.1:3000/api/listings");
        const data = await response.json();

        if (data.status === "success" && data.listings) {
            allListings = data.listings;

            const formatCount = (count, singular, plural) => 
                `${count} ${count === 1 ? singular : plural}`;

            const marketCount = allListings.filter(item => item.category === "marketplace").length;
            const printCount = allListings.filter(item => item.category === "printing").length;
            const roomCount = allListings.filter(item => item.category === "accommodation").length;
            const totalCount = allListings.length;

            if (document.getElementById("marketplaceCount")) document.getElementById("marketplaceCount").textContent = formatCount(marketCount, "item", "items");
            if (document.getElementById("printingCount")) document.getElementById("printingCount").textContent = formatCount(printCount, "station", "stations");
            if (document.getElementById("accommodationCount")) document.getElementById("accommodationCount").textContent = formatCount(roomCount, "unit", "units");
            if (document.getElementById("totalActiveCount")) document.getElementById("totalActiveCount").textContent = `${totalCount} Total Live Listings`;

            renderListings(allListings.slice(0, 3), false);
        }
    } catch (error) {
        console.error("Failed to load portal data for home page:", error);
        if (featuredGrid) {
            featuredGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 2rem; color: red;">Failed to load dynamic listings.</p>`;
        }
    }
}

function handleSearch() {
    const searchInput = document.getElementById("heroSearchInput");
    if (!searchInput) return;

    const query = searchInput.value.trim().toLowerCase();

    if (!query) {
        renderListings(allListings.slice(0, 3), false);
        return;
    }

    const filtered = allListings.filter(item => {
        const titleMatch = (item.title || "").toLowerCase().includes(query);
        const locationMatch = (item.location_details || "").toLowerCase().includes(query);
        const conditionMatch = (item.item_condition || item.security_condition || "").toLowerCase().includes(query);
        const categoryMatch = (item.category || "").toLowerCase().includes(query);

        return titleMatch || locationMatch || conditionMatch || categoryMatch;
    });

    renderListings(filtered, true, query);
}

function renderListings(items, isSearchResult = false, query = "") {
    const featuredGrid = document.getElementById("featured-grid");
    const featuredTitle = document.getElementById("featuredTitle");
    const featuredSubtitle = document.getElementById("featuredSubtitle");
    const clearBtn = document.getElementById("clearSearchBtn");

    if (!featuredGrid) return;

    if (isSearchResult) {
        if (featuredTitle) featuredTitle.textContent = `Search Results (${items.length})`;
        if (featuredSubtitle) featuredSubtitle.textContent = `Listings matching "${query}"`;
        if (clearBtn) clearBtn.style.display = "inline-block";
    } else {
        if (featuredTitle) featuredTitle.textContent = "Featured Highlights";
        if (featuredSubtitle) featuredSubtitle.textContent = "Trending listings and active services available today.";
        if (clearBtn) clearBtn.style.display = "none";
    }

    if (items.length > 0) {
        featuredGrid.innerHTML = "";
        items.forEach(item => {
            const card = document.createElement("div");
            card.className = "module-card";

            const priceFormatted = "MWK " + parseFloat(item.price || 0).toLocaleString();
            const imageSrc = item.image_path || "https://via.placeholder.com/300x200?text=No+Image";

            let badgeText = "New Upload";
            let targetPage = "marketplace.html";
            let buttonLabel = "View Item";

            if (item.category === "printing") {
                badgeText = "Print Station";
                targetPage = "printing.html";
                buttonLabel = "Print Assignment";
            } else if (item.category === "accommodation") {
                badgeText = "Verified Unit";
                targetPage = "accommodation.html";
                buttonLabel = "Inspect Room";
            } else if (item.category === "marketplace") {
                badgeText = "Hot Deal";
                targetPage = "marketplace.html";
                buttonLabel = "View in Market";
            }

            card.innerHTML = `
                <div>
                    <span class="featured-badge" style="display:inline-block; margin-bottom: 0.5rem;">${badgeText}</span>
                    <h4 style="margin: 0 0 0.5rem 0;">${escapeHTML(item.title) || 'Untitled Listing'}</h4>
                </div>
                <div style="background: rgba(0, 0, 0, 0.03); border-radius: 8px; border: 1px solid var(--border-subtle); overflow: hidden; padding: 4px;">
                    <img src="${imageSrc}" alt="${escapeHTML(item.title) || 'Listing'}" style="width:100%; height:160px; object-fit:contain; border-radius:6px; display:block;">
                </div>
                <p style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.5rem;">
                    ${escapeHTML(item.location_details || item.security_condition || item.item_condition) || 'Active on Domasi Hub'}
                </p>
                <div style="font-weight: 700; color: var(--primary-color); font-size: 1.1rem; margin-top: auto;">${priceFormatted}</div>
                <a href="${targetPage}" class="btn-primary" style="text-align: center; margin-top: 0.75rem;">${buttonLabel}</a>
            `;

            featuredGrid.appendChild(card);
        });
    } else {
        featuredGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 2rem;">No matching listings found on the platform.</p>`;
    }
}

function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}