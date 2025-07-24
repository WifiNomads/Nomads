// Function to get the cursor position relative to the center of the container
function getCursorPosition(container, event) {
    const rect = container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = event.clientX - centerX;
    const y = event.clientY - centerY;
    return { x, y };
}

// Function to update the rotation based on cursor position
function updateRotation(container, logo, cursorX, cursorY) {
    const rect = container.getBoundingClientRect();
    const containerWidth = rect.width;
    const containerHeight = rect.height;
    const maxRotation = 30; // Maximum rotation angle in degrees

    // Calculate the rotation angles based on cursor position
    const rotationX = (cursorY / containerHeight) * maxRotation * 2 - maxRotation;
    const rotationY = (cursorX / containerWidth) * maxRotation * -2 + maxRotation;

    // Apply the rotation to the logo
    logo.style.transform = `perspective(1000px) rotateX(${rotationX}deg) rotateY(${rotationY}deg) translateZ(50px)`;
}

// Function to initialize the interactive 3D rotation
function init3DRotation() {
    const container = document.querySelector('.logo-container');
    const logo = document.querySelector('.hero-logo');

    if (container && logo) {
        container.addEventListener('mousemove', (event) => {
            const { x, y } = getCursorPosition(container, event);
            updateRotation(container, logo, x, y);
        });

        // Reset rotation when the cursor leaves the container
        container.addEventListener('mouseleave', () => {
            logo.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(50px)';
        });
    }
}

// Initialize the 3D rotation effect on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    init3DRotation();
});
