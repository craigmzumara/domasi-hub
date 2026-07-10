document.addEventListener('DOMContentLoaded', () => {
    // DOM Element Selectors
    const fullNameInput = document.getElementById('fullName');
    const whatsappInput = document.getElementById('whatsappNumber');
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
            // Keep it completely silent. Remove classes and text to keep attackers guessing.
            regInput.className = "";
            regFeedback.textContent = "";
        } else {
            // Only flag errors when they leave the field completely
            regInput.className = "invalid";
            regFeedback.textContent = "Invalid entry.";
            regFeedback.className = "feedback-message error";
        }
    });

    // Clear error style immediately when they click back inside to fix it
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

    // 3. Prevent Form Submission If Submitting Invalid Info & Send to PHP
    signUpForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const rawReg = regInput.value.trim();
        const isRegValid = /^BED\/(SCI|HUM|SSC|LAC)(?:\/ODEL)?\/\d{3,4}\/\d{2}$/i.test(rawReg);
        const doPasswordsMatch = passwordInput.value === confirmInput.value;

        if (!isRegValid || !doPasswordsMatch || passwordInput.value === "" || fullNameInput.value.trim() === "") {
            alert("Please complete the form correctly before continuing.");
            return;
        }

        // Bundle payload to dispatch to XAMPP backend server
        const payload = {
            fullname: fullNameInput.value.trim(),
            regNumber: rawReg,
            whatsapp: whatsappInput.value.trim(),
            password: passwordInput.value
        };

        fetch('signup.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                // Initialize session logs
                localStorage.setItem('user_name', payload.fullname);
                localStorage.setItem('user_reg', payload.regNumber);
                localStorage.setItem('isLoggedIn', 'true');

                alert(data.message);
                window.location.href = 'portal.html';
            } else {
                alert(data.message); // Displays structural duplicate key errors
            }
        })
        .catch(err => {
            console.error("Error connecting to API layer:", err);
            alert("Unable to reach authentication server.");
        });
    });
});