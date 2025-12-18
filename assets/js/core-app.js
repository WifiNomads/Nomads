// Core Application - Wi-Fi Nomads
// Consolidated: Navigation, 3D Effects, Cache Management, App Initialization

// ===== PREMIUM CLIENT-SIDE ROUTER SYSTEM =====

class PremiumRouter {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.basePath = this.getBasePath();
        this.isInitialized = false;

        // Define application routes
        this.setupRoutes();

        // Initialize router
        this.init();
    }

    getBasePath() {
        // For local file system, use the file path without index.html
        if (window.location.protocol === 'file:') {
            const path = window.location.pathname;
            const dir = path.substring(0, path.lastIndexOf('/') + 1);
            return dir;
        }

        // For web servers, use the current directory but strip index.html if present
        let path = window.location.pathname;
        if (path.endsWith('index.html')) {
            path = path.substring(0, path.lastIndexOf('index.html'));
        }
        return path.endsWith('/') ? path : path + '/';
    }

    setupRoutes() {
        // Define all application routes
        this.routes.set('/', {
            name: 'home',
            title: 'Wi-Fi Nomads - Professional Wi-Fi Community',
            handler: this.showHomePage.bind(this),
            description: 'Professional Wi-Fi networking community and tools'
        });

        this.routes.set('/wifiairtimecalculator', {
            name: 'wifi-calculator',
            title: 'Wi-Fi Airtime Calculator - Wi-Fi Nomads',
            handler: this.showWiFiCalculator.bind(this),
            description: 'Professional IEEE 802.11 airtime analysis tool'
        });

        this.routes.set('/ssidoverheadcalculator', {
            name: 'ssid-calculator',
            title: 'SSID Overhead Calculator - Wi-Fi Nomads',
            handler: this.showSSIDCalculator.bind(this),
            description: 'Calculate beacon frame overhead and optimize network performance'
        });
    }

    init() {
        if (this.isInitialized) return;

        // Handle browser navigation
        window.addEventListener('popstate', (event) => {
            this.handleNavigation(event.state?.path || this.getCurrentPath());
        });

        // Handle initial page load
        this.handleNavigation(this.getCurrentPath(), true);

        // Intercept clicks on internal links
        this.setupLinkInterception();

        this.isInitialized = true;
        console.log('Premium Router initialized with path-based routing');
    }

    getCurrentPath() {
        if (window.location.protocol === 'file:') {
            const pathname = window.location.pathname;
            const href = window.location.href;

            // Enhanced path detection for local files

            // Method 1: Check for pseudo path-based routing (index.html/route)
            if (pathname.includes('/')) {
                const parts = pathname.split('/');
                const lastPart = parts[parts.length - 1];
                const secondLastPart = parts[parts.length - 2];

                // Look for pattern: .../index.html/route or .../file.html/route
                if (secondLastPart && (secondLastPart.endsWith('.html') || secondLastPart === 'index.html')) {
                    if (lastPart && !lastPart.endsWith('.html')) {
                        return '/' + lastPart;
                    }
                }

                // Look for pattern: .../route where route is after index.html
                if (lastPart && !lastPart.endsWith('.html')) {
                    const indexOfHtml = pathname.indexOf('index.html');
                    if (indexOfHtml !== -1) {
                        const afterHtml = pathname.substring(indexOfHtml + 'index.html'.length);
                        if (afterHtml.startsWith('/') && afterHtml.length > 1) {
                            return afterHtml;
                        }
                    }
                }
            }

            // Method 2: Check URL for direct path indicators
            if (href.includes('index.html/')) {
                const routePart = href.split('index.html/')[1];
                if (routePart && !routePart.includes('#') && !routePart.includes('?')) {
                    return '/' + routePart.split('/')[0];
                }
            }

            // Method 3: Enhanced hash-based routing detection
            const hash = window.location.hash;
            if (hash.startsWith('#/')) {
                return hash.substring(1);
            } else if (hash.startsWith('#') && hash.length > 1) {
                return '/' + hash.substring(1);
            }

            // Method 4: Check history state
            if (window.history.state && window.history.state.path) {
                return window.history.state.path;
            }

            return '/';
        }

        // For web servers, use pathname
        return window.location.pathname.replace(this.basePath, '/') || '/';
    }

    setupLinkInterception() {
        document.addEventListener('click', (event) => {
            const link = event.target.closest('a[href]');
            if (!link) return;

            const href = link.getAttribute('href');

            // Only handle internal navigation links
            if (href.startsWith('/') || href.startsWith('./') || href.startsWith('#/')) {
                event.preventDefault();

                let path = href;
                if (href.startsWith('#/')) {
                    path = href.substring(1);
                } else if (href.startsWith('./')) {
                    path = href.substring(1);
                }

                this.navigateTo(path);
            }
        });
    }

    navigateTo(path, title = null) {
        // Normalize path
        if (!path.startsWith('/')) {
            path = '/' + path;
        }

        // Update browser history
        const route = this.routes.get(path);
        const pageTitle = title || (route ? route.title : 'Wi-Fi Nomads');

        if (window.location.protocol === 'file:') {
            // Aggressive approach for local files to achieve index.html/route format
            const routeName = path === '/' ? '' : path.substring(1);

            if (routeName) {
                // Get current file path
                const currentPath = window.location.pathname;

                // Create the desired URL format: path/to/index.html/route
                const desiredUrl = currentPath + '/' + routeName;

                try {
                    // Method 1: Direct pushState with pseudo-path
                    window.history.pushState({ path, routeName }, pageTitle, desiredUrl);
                    console.log(`✓ Successfully navigated to: ${desiredUrl}`);
                } catch (error1) {
                    try {
                        // Method 2: Alternative URL construction
                        const baseDir = currentPath.substring(0, currentPath.lastIndexOf('/'));
                        const fileName = currentPath.substring(currentPath.lastIndexOf('/') + 1);
                        const alternativeUrl = baseDir + '/' + fileName + '/' + routeName;
                        window.history.pushState({ path, routeName }, pageTitle, alternativeUrl);
                        console.log(`✓ Alternative method successful: ${alternativeUrl}`);
                    } catch (error2) {
                        try {
                            // Method 3: Force URL override with replaceState
                            const forceUrl = window.location.href.split('?')[0].split('#')[0] + '/' + routeName;
                            window.history.replaceState({ path, routeName }, pageTitle, forceUrl);
                            console.log(`✓ Force URL override successful: ${forceUrl}`);
                        } catch (error3) {
                            // Method 4: Enhanced hash-based fallback with custom handling
                            console.log('All path-based methods failed, implementing enhanced hash routing...');
                            const customUrl = currentPath + '#/' + routeName;
                            window.history.pushState({ path, routeName, isCustomHash: true }, pageTitle, customUrl);

                            // Custom URL display override (visual only)
                            this.updateAddressBarDisplay(currentPath + '/' + routeName);
                        }
                    }
                }
            } else {
                // For home route, clean up the URL
                const cleanPath = window.location.pathname.split('/')[0] || window.location.pathname;
                window.history.replaceState({ path }, pageTitle, cleanPath);
            }
        } else {
            // For web servers, use real path-based navigation
            const newPath = this.basePath + path.substring(1);
            if (window.location.pathname !== newPath) {
                window.history.pushState({ path }, pageTitle, newPath);
            }
        }

        // Update document title
        document.title = pageTitle;

        // Handle the navigation
        this.handleNavigation(path);
    }

    handleNavigation(path, isInitialLoad = false) {
        // Normalize path
        if (!path.startsWith('/')) {
            path = '/' + path;
        }

        // Find matching route
        const route = this.routes.get(path);

        if (route) {
            // Update current route
            this.currentRoute = path;

            // Update page title and meta
            document.title = route.title;
            this.updateMetaTags(route);

            // Execute route handler
            route.handler(isInitialLoad);

            // Record navigation for analytics
            if (window.cacheManager) {
                window.cacheManager.recordPerformance('route_navigation', Date.now());
            }
        } else {
            // Handle 404 - redirect to home
            console.warn(`Route not found: ${path}. Redirecting to home.`);
            this.navigateTo('/', 'Wi-Fi Nomads');
        }
    }

    updateMetaTags(route) {
        // Update meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content', route.description);
        }

        // Update Open Graph tags
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) {
            ogTitle.setAttribute('content', route.title);
        }

        const ogDescription = document.querySelector('meta[property="og:description"]');
        if (ogDescription) {
            ogDescription.setAttribute('content', route.description);
        }
    }

    showHomePage(isInitialLoad = false) {
        // Close any open modals
        this.closeAllModals();

        // Show home page content
        const homeSection = document.getElementById('home');
        if (homeSection) {
            homeSection.scrollIntoView({
                behavior: isInitialLoad ? 'auto' : 'smooth',
                block: 'start'
            });
        }

        console.log('Navigated to: Home');
    }

    showWiFiCalculator(isInitialLoad = false) {
        // Close other modals first
        this.closeAllModals();

        // Open Wi-Fi calculator
        if (typeof openCalculator === 'function') {
            openCalculator();
        } else {
            console.error('openCalculator function not found');
        }

        console.log('Navigated to: Wi-Fi Airtime Calculator');
    }

    showSSIDCalculator(isInitialLoad = false) {
        // Close other modals first
        this.closeAllModals();

        // Open SSID calculator
        if (typeof openSSIDCalculator === 'function') {
            openSSIDCalculator();
        } else {
            console.error('openSSIDCalculator function not found');
        }

        console.log('Navigated to: SSID Overhead Calculator');
    }

    closeAllModals() {
        const modals = [
            'calculatorModal',
            'ssidCalculatorModal'
        ];

        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal && modal.classList.contains('active')) {
                modal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    }

    // Enhanced URL display management for local files
    updateAddressBarDisplay(desiredUrl) {
        // This is a visual enhancement attempt for browsers that support it
        try {
            // Create a custom display element if needed
            if (!document.getElementById('custom-url-display')) {
                const urlDisplay = document.createElement('div');
                urlDisplay.id = 'custom-url-display';
                urlDisplay.style.cssText = `
                    position: fixed;
                    top: 10px;
                    right: 10px;
                    background: rgba(30, 58, 138, 0.9);
                    color: white;
                    padding: 5px 10px;
                    border-radius: 5px;
                    font-size: 12px;
                    z-index: 9999;
                    opacity: 0.8;
                    pointer-events: none;
                `;
                document.body.appendChild(urlDisplay);

                // Auto-hide after 3 seconds
                setTimeout(() => {
                    if (document.getElementById('custom-url-display')) {
                        document.getElementById('custom-url-display').remove();
                    }
                }, 3000);
            }

            const display = document.getElementById('custom-url-display');
            if (display) {
                display.textContent = `URL: ${desiredUrl.substring(desiredUrl.lastIndexOf('/') + 1)}`;
            }
        } catch (error) {
            console.log('Custom URL display not supported');
        }
    }

    // Force path-based URL appearance (experimental)
    forcePathBasedUrl(route) {
        if (window.location.protocol === 'file:') {
            const currentPath = window.location.pathname;
            const routeName = route.substring(1); // Remove leading slash

            // Try multiple aggressive approaches
            const approaches = [
                // Approach 1: Direct pathname manipulation
                () => {
                    const newUrl = currentPath + '/' + routeName;
                    window.history.replaceState({ path: route, forced: true }, '', newUrl);
                    return newUrl;
                },

                // Approach 2: URL constructor manipulation
                () => {
                    const url = new URL(window.location);
                    url.pathname = url.pathname + '/' + routeName;
                    window.history.replaceState({ path: route, forced: true }, '', url.href);
                    return url.href;
                },

                // Approach 3: Base manipulation
                () => {
                    const base = window.location.href.split('?')[0].split('#')[0];
                    const newUrl = base + '/' + routeName;
                    window.history.replaceState({ path: route, forced: true }, '', newUrl);
                    return newUrl;
                }
            ];

            for (let i = 0; i < approaches.length; i++) {
                try {
                    const result = approaches[i]();
                    console.log(`✓ Approach ${i + 1} successful: ${result}`);
                    return true;
                } catch (error) {
                    console.log(`✗ Approach ${i + 1} failed:`, error.message);
                    continue;
                }
            }

            return false;
        }
        return true;
    }

    // Public API methods
    getCurrentRoute() {
        return this.currentRoute;
    }

    getRoutes() {
        return Array.from(this.routes.entries()).map(([path, route]) => ({
            path,
            name: route.name,
            title: route.title
        }));
    }
}

// ===== NAVIGATION UTILITIES =====

// Updated navigation functions for premium routing
function goToHome() {
    if (window.router) {
        window.router.navigateTo('/');
    }
}

function goToWiFiCalculator() {
    if (window.router) {
        window.router.navigateTo('/wifiairtimecalculator');
    }
}

function goToSSIDCalculator() {
    if (window.router) {
        window.router.navigateTo('/ssidoverheadcalculator');
    }
}

// Mobile menu toggle functionality (enhanced)
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

// ===== CACHE MANAGEMENT SYSTEM =====

class CacheManager {
    constructor() {
        this.version = Date.now().toString();
        this.performanceMetrics = {};
        this.errorLog = [];
        this.init();
    }

    init() {
        // Log environment info for debugging
        console.log(`Wi-Fi Nomads - Running in ${this.isWebServerEnvironment() ? 'web server' : 'local file'} environment`);

        // Clear any existing cache on load
        this.clearBrowserCache();

        // Set up cache prevention
        this.preventCaching();

        // Monitor for updates
        this.setupUpdateDetection();
    }

    clearBrowserCache() {
        try {
            // Only attempt cache operations if we're running on a proper web server
            if (this.isWebServerEnvironment()) {
                // Clear application cache if available
                if ('applicationCache' in window && window.applicationCache.status !== window.applicationCache.UNCACHED) {
                    window.applicationCache.update();
                }

                // Clear service worker cache if available
                if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.getRegistrations().then(registrations => {
                        registrations.forEach(registration => {
                            registration.unregister();
                        });
                    }).catch(error => {
                        console.warn('Service worker clearing failed:', error);
                    });
                }
            }

            // Force reload stylesheets (works in all environments)
            this.reloadStylesheets();

        } catch (error) {
            console.warn('Cache clearing encountered an issue:', error);
        }
    }

    // Check if we're running in a web server environment vs local file
    isWebServerEnvironment() {
        const protocol = window.location.protocol;
        return protocol === 'http:' || protocol === 'https:';
    }

    reloadStylesheets() {
        const links = document.querySelectorAll('link[rel="stylesheet"]');
        links.forEach(link => {
            if (link.href.includes('style.css')) {
                const newLink = link.cloneNode();
                const timestamp = Date.now() + Math.random().toString(36).substr(2, 9);
                newLink.href = link.href.split('?')[0] + '?v=' + timestamp;
                link.parentNode.insertBefore(newLink, link);
                setTimeout(() => link.remove(), 100);
            }
        });
    }

    preventCaching() {
        // Only modify fetch behavior if we're in a web server environment
        if (this.isWebServerEnvironment()) {
            // Add no-cache headers to all AJAX requests
            const originalFetch = window.fetch;
            window.fetch = function (...args) {
                if (args[1]) {
                    args[1].headers = args[1].headers || {};
                    args[1].headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
                    args[1].headers['Pragma'] = 'no-cache';
                } else {
                    args[1] = {
                        headers: {
                            'Cache-Control': 'no-cache, no-store, must-revalidate',
                            'Pragma': 'no-cache'
                        }
                    };
                }
                return originalFetch.apply(this, args);
            };
        }
    }

    setupUpdateDetection() {
        // Only setup update detection for web server environments
        if (this.isWebServerEnvironment()) {
            // Check for updates every 5 minutes
            setInterval(() => {
                this.checkForUpdates();
            }, 300000);
        }
    }

    checkForUpdates() {
        // Skip update checks if not in web server environment
        if (!this.isWebServerEnvironment()) {
            return;
        }

        const timestamp = Date.now();
        fetch(`index.html?cache_check=${timestamp}`, {
            method: 'HEAD',
            cache: 'no-cache',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache'
            }
        }).then(response => {
            const lastModified = response.headers.get('last-modified');
            if (lastModified && this.lastModified && new Date(lastModified) > new Date(this.lastModified)) {
                this.notifyUpdate();
            }
            this.lastModified = lastModified;
        }).catch(error => {
            console.warn('Update check failed:', error);
        });
    }

    notifyUpdate() {
        if (confirm('A newer version of the website is available. Would you like to refresh to get the latest updates?')) {
            this.forceRefresh();
        }
    }

    forceRefresh() {
        // Clear all possible caches before refresh
        this.clearBrowserCache();

        // Force reload with cache bypass
        setTimeout(() => {
            window.location.reload(true);
        }, 500);
    }

    // Public method to force refresh
    refresh() {
        this.forceRefresh();
    }

    // Performance monitoring
    recordPerformance(action, startTime) {
        const duration = Date.now() - startTime;
        this.performanceMetrics[action] = {
            duration,
            timestamp: Date.now(),
            success: true
        };
    }

    // Error logging
    logError(error, context) {
        const errorEntry = {
            message: error.message || error,
            context,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        this.errorLog.push(errorEntry);

        // Keep only last 50 errors
        if (this.errorLog.length > 50) {
            this.errorLog.shift();
        }

        // Report critical errors
        if (context === 'critical') {
            this.reportCriticalError(errorEntry);
        }
    }

    // Report critical errors to user
    reportCriticalError(errorEntry) {
        console.error('Critical Error:', errorEntry);

        // Show user-friendly error message
        if (window.SharedUtils && window.SharedUtils.showError) {
            window.SharedUtils.showError(
                'An error occurred while loading the application. Please refresh the page or contact support if the issue persists.'
            );
        }
    }

    // Get performance report
    getPerformanceReport() {
        return {
            metrics: this.performanceMetrics,
            errors: this.errorLog,
            timestamp: Date.now()
        };
    }
}

// ===== GLOBAL ERROR HANDLING =====

// Global error handler
window.addEventListener('error', (event) => {
    if (window.cacheManager) {
        window.cacheManager.logError(event.error || event.message, 'global');
    }
    console.error('Global Error:', event.error || event.message);
});

// Promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    if (window.cacheManager) {
        window.cacheManager.logError(event.reason, 'promise');
    }
    console.error('Unhandled Promise Rejection:', event.reason);
});

// ===== APPLICATION INITIALIZATION =====

// Initialize the application on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    const startTime = Date.now();

    try {
        // Initialize cache manager
        const cacheManager = new CacheManager();
        window.cacheManager = cacheManager;

        // Initialize premium router system
        const router = new PremiumRouter();
        window.router = router;

        // Initialize 3D rotation
        init3DRotation();

        // Initialize mobile menu
        initMobileMenu();

        // Additional cache prevention for critical resources
        const criticalResources = ['style.css'];
        criticalResources.forEach(resource => {
            const timestamp = Date.now() + Math.random().toString(36).substr(2, 9);
            const link = document.querySelector(`link[href*="${resource}"]`);
            if (link && !link.href.includes('?v=')) {
                link.href += `?v=${timestamp}`;
            }
        });

        // Record initialization performance
        if (window.cacheManager) {
            window.cacheManager.recordPerformance('app_initialization', startTime);
        }

        console.log('Wi-Fi Nomads application initialized successfully with premium routing');

    } catch (error) {
        console.error('Application initialization failed:', error);
        if (window.cacheManager) {
            window.cacheManager.logError(error, 'critical');
        }
    }
});
