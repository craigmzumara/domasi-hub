document.addEventListener('DOMContentLoaded', () => {
    const regInput = document.getElementById('regNumber');
    const regFeedback = document.getElementById('validationFeedback');
    const passwordInput = document.getElementById('password');
    const signInForm = document.getElementById('signInForm');

    // 1. Silent Gatekeeper Validation (Triggers only when clicking away)
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

    // 2. Form Submission Interception & Authentication Verification
    signInForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Halt page reload

        const rawReg = regInput.value.trim();
        const isRegValid = /^BED\/(SCI|HUM|SSC|LAC)(?:\/ODEL)?\/\d{3,4}\/\d{2}$/i.test(rawReg);

        if (!isRegValid || passwordInput.value.trim() === "") {
            alert("Invalid sign-in attempt. Please verify your entries.");
        } else {
            // Initialize login session parameters 
            localStorage.setItem('user_reg', rawReg);
            localStorage.setItem('isLoggedIn', 'true');
            
            // Build a clean identity fallback if they didn't pass through a fresh signup route
            if (!localStorage.getItem('user_name')) {
                const parts = rawReg.split('/');
                const uniqueId = parts[2] || 'Student';
                localStorage.setItem('user_name', 'Student (' + uniqueId + ')');
            }

            // Grant entry redirection pass
            window.location.href = 'portal.html';
        }
    });
});