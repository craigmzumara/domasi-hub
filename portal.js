document.addEventListener("DOMContentLoaded", () => {
    const marketplaceForm = document.getElementById("marketplaceForm");
    const printerForm = document.getElementById("printerForm");
    const accommodationForm = document.getElementById("accommodationForm");

    if (marketplaceForm) {
        marketplaceForm.addEventListener("submit", (e) => handleFormSubmit(e, "marketplace"));
    }
    if (printerForm) {
        printerForm.addEventListener("submit", (e) => handleFormSubmit(e, "printing"));
    }
    if (accommodationForm) {
        accommodationForm.addEventListener("submit", (e) => handleFormSubmit(e, "accommodation"));
    }
});

// Helper function to read file as Base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
}

async function handleFormSubmit(e, category) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Publishing...";
    }

    try {
        const formData = new FormData(form);
        const imageFile = formData.get("image");
        let imageBase64 = "";

        if (imageFile && imageFile.size > 0) {
            imageBase64 = await fileToBase64(imageFile);
        }

        // Construct the correct payload structure based on category
        const payload = {
            category: category,
            title: formData.get("title") || "",
            price: parseFloat(formData.get("price")) || 0,
            contact_number: formData.get("contact_number") || "",
            image_path: imageBase64, // Storing base64 source directly in SQLite
            item_condition: formData.get("item_condition") || "",
            security_condition: formData.get("security_condition") || "",
            location_details: formData.get("location_details") || ""
        };

        const response = await fetch("http://127.0.0.1:3000/api/listings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
            alert("Success: " + (result.message || "Listing created successfully!"));
            form.reset();
            // Close open modal overlay
            const activeModal = form.closest(".modal-overlay");
            if (activeModal) {
                activeModal.classList.remove("active");
            }
        } else {
            alert("Error: " + (result.error || "Failed to save listing."));
        }

    } catch (error) {
        console.error("Submission failed:", error);
        alert("Server communication error. Check if backend is running.");
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = category === "printing" ? "Launch Station" : 
                                   category === "accommodation" ? "Publish Lodging Unit" : "Publish Item";
        }
    }
}