```javascript
// CloudShare Pro - Dashboard Controls

document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById("themeToggle");
    const themeIcon = document.getElementById("themeIcon");
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");

    // Dark and light theme
    themeToggle?.addEventListener("click", () => {
        document.body.classList.toggle("dark-theme");

        const darkMode = document.body.classList.contains("dark-theme");

        if (themeIcon) {
            themeIcon.textContent = darkMode ? "☀" : "◐";
        }

        const toast = document.getElementById("toast");

        if (toast) {
            toast.textContent = darkMode
                ? "Dark theme enabled."
                : "Light theme enabled.";

            toast.classList.add("show");

            clearTimeout(window.cloudShareToastTimer);

            window.cloudShareToastTimer = setTimeout(() => {
                toast.classList.remove("show");
            }, 2200);
        }
    });

    // Mobile navigation
    menuToggle?.addEventListener("click", () => {
        const isOpen = sidebar?.classList.toggle("open");

        menuToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
    });

    // Close sidebar after selecting a navigation link
    document.querySelectorAll(".sidebar a.nav-link").forEach(link => {
        link.addEventListener("click", () => {
            sidebar?.classList.remove("open");
            menuToggle?.setAttribute("aria-expanded", "false");
        });
    });

    // Highlight the selected navigation section
    document.querySelectorAll(".navigation a.nav-link").forEach(link => {
        link.addEventListener("click", () => {
            document.querySelectorAll(".navigation a.nav-link")
                .forEach(item => item.classList.remove("active"));

            link.classList.add("active");
        });
    });

    // Make navigation buttons accessible
    menuToggle?.setAttribute("aria-expanded", "false");

    // Initial dashboard greeting
    const greeting = document.querySelector(".welcome-row h1");

    if (greeting) {
        const hour = new Date().getHours();

        let message = "Good to see you!";

        if (hour < 12) {
            message = "Good morning!";
        } else if (hour < 17) {
            message = "Good afternoon!";
        } else {
            message = "Good evening!";
        }

        greeting.firstChild.textContent = message + " ";
    }
});
```
