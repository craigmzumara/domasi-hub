document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('themeToggle');
    const bodyElement = document.body;

    // Check for saved theme preference; otherwise default to light mode
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    if (savedTheme === 'dark') {
        bodyElement.classList.add('dark-theme');
    }

    // Process the dynamic state transition toggle click
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            bodyElement.classList.toggle('dark-theme');
            
            // Persist preference across multi-page navigation tracks
            if (bodyElement.classList.contains('dark-theme')) {
                localStorage.setItem('theme', 'dark');
            } else {
                localStorage.setItem('theme', 'light');
            }
        });
    }
});