// Core Application - Wi-Fi Nomads
// Navigation, 3D Effects, App Initialization

// ===== MOBILE MENU =====

function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking on nav links
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (event) => {
            if (!hamburger.contains(event.target) && !navMenu.contains(event.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });

        // Close mobile menu on escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
}

// ===== 3D EFFECTS AND ANIMATIONS =====

function getCursorPosition(container, event) {
    const rect = container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = event.clientX - centerX;
    const y = event.clientY - centerY;
    return { x, y };
}

function updateRotation(container, logo, cursorX, cursorY) {
    const rect = container.getBoundingClientRect();
    const containerWidth = rect.width;
    const containerHeight = rect.height;
    const maxRotation = 30;

    const rotationX = (cursorY / containerHeight) * maxRotation * 2 - maxRotation;
    const rotationY = (cursorX / containerWidth) * maxRotation * -2 + maxRotation;

    logo.style.transform = `perspective(1000px) rotateX(${rotationX}deg) rotateY(${rotationY}deg) translateZ(50px)`;
}

function init3DRotation() {
    const container = document.querySelector('.logo-container');
    const logo = document.querySelector('.hero-logo');

    if (container && logo) {
        container.addEventListener('mousemove', (event) => {
            const { x, y } = getCursorPosition(container, event);
            updateRotation(container, logo, x, y);
        });

        container.addEventListener('mouseleave', () => {
            logo.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(50px)';
        });
    }
}

// ===== APPLICATION INITIALIZATION =====

document.addEventListener('DOMContentLoaded', () => {
    // Initialize mobile menu (all pages)
    initMobileMenu();

    // Initialize 3D rotation (homepage only — safe if elements don't exist)
    init3DRotation();

    console.log('Wi-Fi Nomads initialized');
});