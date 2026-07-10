document.addEventListener('DOMContentLoaded', () => {
    const regInput = document.getElementById('regNumber');
    const regFeedback = document.getElementById('validationFeedback');
    const passwordInput = document.getElementById('password');
    const signInForm = document.getElementById('signInForm');

    // Silent Gatekeeper Validation (Triggers only when clicking away)
    regInput.addEventListener('blur', () => {
        const value = regInput.value.trim();
        const regPattern = /^BED\/(SCI|HUM|SSC|LAC)(?:\/ODEL)?\/\d{3,4}\/\d{2}$/i;

        if (value === "") {
            regInput.className = "";
            regFeedback.textContent = "";
            return;
        }

        if (regPattern.test(value)) {
            // Keep it silent on success to protect the institutional template format
            regInput.className = "";
            regFeedback.textContent = "";
        } else {
            // Drop a generic error message only on blur
            regInput.className = "invalid";
            regFeedback.textContent = "Invalid credentials.";
            regFeedback.className = "feedback-message error";
        }
    });

    // Clear error UI styling when the user focuses back on the input field
    regInput.addEventListener('focus', () => {
        regInput.className = "";
        regFeedback.textContent = "";
    });

    // Intercept form submission & Send to PHP
    signInForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const rawReg = regInput.value.trim();
        const isRegValid = /^BED\/(SCI|HUM|SSC|LAC)(?:\/ODEL)?\/\d{3,4}\/\d{2}$/i.test(rawReg);

        if (!isRegValid || passwordInput.value.trim() === "") {
            // Generic security alert
            alert("Invalid sign-in attempt. Please verify your entries.");
            return;
        }

        // Bundle payload to dispatch to XAMPP sign-in service
        const payload = {
            regNumber: rawReg,
            password: passwordInput.value
        };

        fetch('signin.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                // Initialize session logs using real backend records
                localStorage.setItem('user_name', data.user.fullname);
                localStorage.setItem('user_reg', data.user.regNumber);
                localStorage.setItem('isLoggedIn', 'true');

                window.location.href = 'portal.html';
            } else {
                alert(data.message); // Displays structural "Invalid credentials."
            }
        })
        .catch(err => {
            console.error("Error connecting to API layer:", err);
            alert("Unable to reach authentication server.");
        });
    });
});