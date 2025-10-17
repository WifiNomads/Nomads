// Shared Utilities - Wi-Fi Nomads
// Common functions, constants, and utilities used across modules

// ===== COMMON MODAL UTILITIES =====

// Generic modal management functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Close modal when clicking outside
function setupModalCloseHandlers(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        document.addEventListener('click', function(event) {
            if (event.target === modal) {
                hideModal(modalId);
            }
        });
    }
}

// ===== COMMON VALIDATION UTILITIES =====

// Input validation helpers
function validateRange(value, min, max, fieldName) {
    if (value < min || value > max) {
        throw new Error(`${fieldName} must be between ${min} and ${max}.`);
    }
    return true;
}

function validatePositiveNumber(value, fieldName) {
    if (isNaN(value) || value <= 0) {
        throw new Error(`${fieldName} must be a positive number.`);
    }
    return true;
}

function validateInteger(value, fieldName) {
    if (!Number.isInteger(value)) {
        throw new Error(`${fieldName} must be an integer.`);
    }
    return true;
}

// ===== COMMON CHART UTILITIES =====

// Chart color schemes
const CHART_COLORS = {
    primary: '#1e3a8a',
    secondary: '#0891b2', 
    accent: '#059669',
    danger: '#dc2626',
    warning: '#f59e0b',
    success: '#10b981',
    info: '#3b82f6'
};

// Common chart configuration
const CHART_DEFAULTS = {
    responsive: true,
    maintainAspectRatio: false,
    devicePixelRatio: window.devicePixelRatio || 1,
    plugins: {
        legend: {
            labels: {
                font: {
                    family: 'Inter',
                    size: 12
                }
            }
        },
        tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: CHART_COLORS.primary,
            borderWidth: 2,
            cornerRadius: 8,
            padding: 12,
            titleFont: {
                size: 14,
                weight: 'bold',
                family: 'Inter'
            },
            bodyFont: {
                size: 13,
                family: 'Inter'
            }
        }
    },
    animation: {
        duration: 1000,
        easing: 'easeOutCubic'
    }
};

// Create gradient for charts
function createChartGradient(ctx, width, colors = [CHART_COLORS.primary, CHART_COLORS.secondary, CHART_COLORS.accent]) {
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    colors.forEach((color, index) => {
        gradient.addColorStop(index / (colors.length - 1), color);
    });
    return gradient;
}

// Destroy existing chart safely
function destroyChart(chartInstance) {
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }
    return null;
}

// ===== COMMON FORMATTING UTILITIES =====

// Number formatting
function formatNumber(num, decimals = 1) {
    return parseFloat(num).toFixed(decimals);
}

function formatPercentage(num, decimals = 2) {
    return parseFloat(num).toFixed(decimals) + '%';
}

function formatDuration(microseconds, decimals = 1) {
    return parseFloat(microseconds).toFixed(decimals) + ' μs';
}

function formatThroughput(mbps, decimals = 3) {
    return parseFloat(mbps).toFixed(decimals) + ' Mbps';
}

// ===== COMMON ERROR HANDLING =====

// Error display utilities
function showError(message, containerId = 'errorContainer') {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="error-message" style="
                background-color: #fee2e2;
                border: 1px solid #fca5a5;
                color: #dc2626;
                padding: 12px;
                border-radius: 6px;
                margin-bottom: 16px;
                font-weight: 500;
            ">
                ${message}
            </div>
        `;
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        alert(message); // Fallback to alert if container not found
    }
}

function hideError(containerId = 'errorContainer') {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = '';
    }
}

// ===== COMMON TABLE UTILITIES =====

// Create responsive table
function createTable(headers, rows, className = 'table table-striped') {
    let html = `<table class="${className}">`;
    
    // Headers
    if (headers && headers.length > 0) {
        html += '<thead><tr>';
        headers.forEach(header => {
            html += `<th>${header}</th>`;
        });
        html += '</tr></thead>';
    }
    
    // Rows
    if (rows && rows.length > 0) {
        html += '<tbody>';
        rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td>${cell}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody>';
    }
    
    html += '</table>';
    return html;
}

// ===== COMMON DOM UTILITIES =====

// Element creation helpers
function createElement(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);
    
    // Set attributes
    Object.keys(attributes).forEach(key => {
        if (key === 'className') {
            element.className = attributes[key];
        } else if (key === 'innerHTML') {
            element.innerHTML = attributes[key];
        } else {
            element.setAttribute(key, attributes[key]);
        }
    });
    
    // Set content
    if (content) {
        element.textContent = content;
    }
    
    return element;
}

// Select option creation
function createSelectOption(value, text, selected = false) {
    const option = createElement('option', { value: value }, text);
    if (selected) option.selected = true;
    return option;
}

// Clear and populate select element
function populateSelect(selectId, options, selectedValue = null) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    select.innerHTML = '';
    options.forEach(option => {
        const optionElement = createSelectOption(
            option.value, 
            option.text, 
            option.value === selectedValue
        );
        select.appendChild(optionElement);
    });
}

// ===== COMMON MATH UTILITIES =====

// Mathematical helpers
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function roundToPrecision(num, precision = 2) {
    const factor = Math.pow(10, precision);
    return Math.round(num * factor) / factor;
}

function isValidNumber(value) {
    return !isNaN(value) && isFinite(value);
}

// ===== COMMON CONSTANTS =====

// Wi-Fi related constants
const WIFI_CONSTANTS = {
    BANDS: {
        '2.4': { name: '2.4 GHz', maxBandwidth: 40 },
        '5': { name: '5 GHz', maxBandwidth: 160 }
    },
    
    TIMING: {
        SLOT_TIME: 9, // μs
        SIFS_2_4: 10, // μs
        SIFS_5: 16,   // μs
        LEGACY_PREAMBLE: 20 // μs
    },
    
    FRAME_SIZES: {
        ACK: 14,         // bytes
        BLOCK_ACK: 32,   // bytes
        RTS: 20,         // bytes
        CTS: 14,         // bytes
        MAC_HEADER: 30,  // bytes (typical)
        FCS: 4           // bytes
    }
};

// Export constants for use in other modules
window.WIFI_CONSTANTS = WIFI_CONSTANTS;
window.CHART_COLORS = CHART_COLORS;
window.CHART_DEFAULTS = CHART_DEFAULTS;

// Export utility functions for global access
window.SharedUtils = {
    showModal,
    hideModal,
    setupModalCloseHandlers,
    validateRange,
    validatePositiveNumber,
    validateInteger,
    createChartGradient,
    destroyChart,
    formatNumber,
    formatPercentage,
    formatDuration,
    formatThroughput,
    showError,
    hideError,
    createTable,
    createElement,
    createSelectOption,
    populateSelect,
    clamp,
    roundToPrecision,
    isValidNumber
};
