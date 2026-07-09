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

    // Intercept form submission
    signInForm.addEventListener('submit', (e) => {
        const isRegValid = /^BED\/(SCI|HUM|SSC|LAC)(?:\/ODEL)?\/\d{3,4}\/\d{2}$/i.test(regInput.value.trim());

        if (!isRegValid || passwordInput.value.trim() === "") {
            e.preventDefault();
            // Generic security alert
            alert("Invalid sign-in attempt. Please verify your entries.");
        } else {
            alert("Validation passed! Submitting login request.");
        }
    });
});