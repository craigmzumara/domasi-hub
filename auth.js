document.addEventListener('DOMContentLoaded', () => {
    const regInput = document.getElementById('regNumber');
    const regFeedback = document.getElementById('validationFeedback');
    
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirmPassword');
    const passwordFeedback = document.getElementById('passwordFeedback');
    
    const signUpForm = document.getElementById('signUpForm');

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
            // Keep it completely silent on success
            regInput.className = "";
            regFeedback.textContent = "";
        } else {
            // Flag formatting error when focus leaves the input field
            regInput.className = "invalid";
            regFeedback.textContent = "Invalid entry.";
            regFeedback.className = "feedback-message error";
        }
    });

    // Clear error UI styling instantly when clicking inside to edit
    regInput.addEventListener('focus', () => {
        regInput.className = "";
        regFeedback.textContent = "";
    });

    // 2. Live Password Matching Validation
    const checkPasswords = () => {
        const pass = passwordInput.value;
        const confirmPass = confirmInput.value;

        if (confirmPass === "") {
            confirmInput.className = "";
            passwordFeedback.textContent = "";
            return;
        }

        if (pass === confirmPass) {
            confirmInput.className = "valid";
            passwordFeedback.textContent = "Passwords match.";
            passwordFeedback.className = "feedback-message success";
        } else {
            confirmInput.className = "invalid";
            passwordFeedback.textContent = "Passwords do not match.";
            passwordFeedback.className = "feedback-message error";
        }
    };

    passwordInput.addEventListener('input', checkPasswords);
    confirmInput.addEventListener('input', checkPasswords);

    // 3. Form Submission Handling & Session Generation
    signUpForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Stop standard form reload

        const fullNameInput = document.getElementById('fullName');
        const isRegValid = /^BED\/(SCI|HUM|SSC|LAC)(?:\/ODEL)?\/\d{3,