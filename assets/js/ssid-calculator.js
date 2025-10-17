// SSID Overhead Calculator Functions

function openSSIDCalculator() {
    const modal = document.getElementById('ssidCalculatorModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Update URL to show SSID calculator section
    history.pushState(null, null, '#ssidoverheadcalculator');
    
    // Initialize beacon data rates based on default preamble selection
    setTimeout(() => {
        updateSSIDBeaconRates();
    }, 100);
}

function closeSSIDCalculator() {
    const modal = document.getElementById('ssidCalculatorModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    
    // Return to tools section URL
    history.pushState(null, null, '#tools');
}

function updateSSIDBeaconRates() {
    const preambleType = parseInt(document.getElementById('ssid-preambleType').value);
    const beaconDataRate = document.getElementById('ssid-beaconDataRate');
    
    // Clear existing options
    beaconDataRate.innerHTML = '';
    
    if (preambleType === 20) {
        // 802.11a/g OFDM rates: 6, 9, 12, 18, 24, 36, 48, 54 Mbps (default: 6)
        const ofdmRates = [
            {value: 6, text: '6 Mbps'},
            {value: 9, text: '9 Mbps'},
            {value: 12, text: '12 Mbps'},
            {value: 18, text: '18 Mbps'},
            {value: 24, text: '24 Mbps'},
            {value: 36, text: '36 Mbps'},
            {value: 48, text: '48 Mbps'},
            {value: 54, text: '54 Mbps'}
        ];
        
        ofdmRates.forEach((rate, index) => {
            const option = document.createElement('option');
            option.value = rate.value;
            option.text = rate.text;
            if (rate.value === 6) option.selected = true; // Default to 6 Mbps
            beaconDataRate.appendChild(option);
        });
        
    } else if (preambleType === 96 || preambleType === 192) {
        // 802.11b DSSS rates: 1, 2, 5.5, 11 Mbps (default: 1)
        const dsssRates = [
            {value: 1, text: '1 Mbps'},
            {value: 2, text: '2 Mbps'},
            {value: 5.5, text: '5.5 Mbps'},
            {value: 11, text: '11 Mbps'}
        ];
        
        dsssRates.forEach((rate, index) => {
            const option = document.createElement('option');
            option.value = rate.value;
            option.text = rate.text;
            if (rate.value === 1) option.selected = true; // Default to 1 Mbps
            beaconDataRate.appendChild(option);
        });
    }
}

function validateSSIDInputs() {
    const numAPs = parseInt(document.getElementById('ssid-numAPs').value) || 0;
    const numSSIDs = parseInt(document.getElementById('ssid-numSSIDs').value) || 0;
    const beaconInterval = parseInt(document.getElementById('ssid-beaconInterval').value) || 0;
    const beaconFrameSize = parseInt(document.getElementById('ssid-beaconFrameSize').value) || 0;
    const beaconDataRate = parseFloat(document.getElementById('ssid-beaconDataRate').value) || 0;
    const preambleType = parseInt(document.getElementById('ssid-preambleType').value) || 0;

    if (numAPs < 1 || numAPs > 1000) {
        showSSIDError('Number of APs must be between 1 and 1000.');
        return false;
    }
    if (numSSIDs < 1 || numSSIDs > 1000) {
        showSSIDError('SSIDs per AP must be between 1 and 1000.');
        return false;
    }
    if (beaconInterval < 1 || beaconInterval > 10000) {
        showSSIDError('Beacon interval must be between 1 and 10000 ms.');
        return false;
    }
    if (beaconFrameSize < 1 || beaconFrameSize > 10000) {
        showSSIDError('Beacon frame size must be between 1 and 10000 bytes.');
        return false;
    }
    if (beaconDataRate <= 0) {
        showSSIDError('Please select a valid beacon data rate.');
        return false;
    }
    // Validate correct preamble values: 20μs (802.11a/g), 96μs (802.11b Short), 192μs (802.11b Long)
    if (![20, 96, 192].includes(preambleType)) {
        showSSIDError('Please select a valid preamble type.');
        return false;
    }

    return true;
}

function showSSIDError(message) {
    const banner = document.querySelector('#ssidCalculatorModal #errorBanner');
    if (banner) {
        banner.textContent = message;
        banner.style.display = 'block';
        banner.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function hideSSIDError() {
    const banner = document.querySelector('#ssidCalculatorModal #errorBanner');
    if (banner) {
        banner.style.display = 'none';
        banner.textContent = '';
    }
}

function calculateSSIDOverhead() {
    hideSSIDError();
    
    if (!validateSSIDInputs()) {
        return;
    }

    // Get input values
    const numAPs = parseInt(document.getElementById('ssid-numAPs').value);
    const numSSIDs = parseInt(document.getElementById('ssid-numSSIDs').value);
    const beaconInterval = parseInt(document.getElementById('ssid-beaconInterval').value);
    const beaconFrameSize = parseInt(document.getElementById('ssid-beaconFrameSize').value);
    const beaconDataRate = parseFloat(document.getElementById('ssid-beaconDataRate').value);
    const preambleType = parseInt(document.getElementById('ssid-preambleType').value);

    try {
        // Calculate beacon airtime
        const dataTransmissionTime = (beaconFrameSize * 8) / (beaconDataRate * 1000000); // Convert to seconds
        const preambleTime = preambleType / 1000000; // Convert microseconds to seconds
        const beaconAirtime = (preambleTime + dataTransmissionTime) * 1000000; // Convert back to microseconds

        // Calculate total beacons per second
        const totalSSIDs = numAPs * numSSIDs;
        const beaconsPerSecond = totalSSIDs / (beaconInterval / 1000);
        
        // Calculate total overhead
        const totalOverheadPerSecond = beaconsPerSecond * beaconAirtime; // microseconds
        const overheadPercentage = (totalOverheadPerSecond / 1000000) * 100; // Convert to percentage

        // Generate results table
        let resultsHTML = '<table class="table table-striped"><thead><tr><th>Metric</th><th>Value</th></tr></thead><tbody>';
        resultsHTML += `<tr><td>Total SSIDs</td><td>${totalSSIDs}</td></tr>`;
        resultsHTML += `<tr><td>Beacon Airtime</td><td>${beaconAirtime.toFixed(1)} μs</td></tr>`;
        resultsHTML += `<tr><td>Beacons per Second</td><td>${beaconsPerSecond.toFixed(1)}</td></tr>`;
        resultsHTML += `<tr><td>Total Overhead per Second</td><td>${totalOverheadPerSecond.toFixed(0)} μs</td></tr>`;
        resultsHTML += `<tr><td><strong>Overhead Percentage</strong></td><td><strong>${overheadPercentage.toFixed(2)}%</strong></td></tr>`;
        resultsHTML += '</tbody></table>';

        document.getElementById('ssidOutput').innerHTML = resultsHTML;
        document.getElementById('ssidOutput').style.display = 'block';

        // Create visualization chart
        createSSIDChart(overheadPercentage, totalSSIDs, beaconsPerSecond);

    } catch (error) {
        showSSIDError('Calculation error: ' + error.message);
    }
}

function createSSIDChart(overheadPercentage, totalSSIDs, beaconsPerSecond) {
    const canvas = document.getElementById('ssidOverheadChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Destroy existing chart
    if (window.ssidChart) {
        window.ssidChart.destroy();
        window.ssidChart = null;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = 400;

    try {
        const availableAirtime = 100 - overheadPercentage;

        window.ssidChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['SSID Overhead', 'Available Airtime'],
                datasets: [{
                    data: [overheadPercentage, availableAirtime],
                    backgroundColor: [
                        '#dc2626', // Red for overhead
                        '#059669'  // Green for available
                    ],
                    borderColor: [
                        '#b91c1c',
                        '#047857'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
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
                        borderColor: '#1e3a8a',
                        borderWidth: 2,
                        cornerRadius: 8,
                        displayColors: true,
                        padding: 12,
                        titleFont: {
                            size: 14,
                            weight: 'bold',
                            family: 'Inter'
                        },
                        bodyFont: {
                            size: 13,
                            family: 'Inter'
                        },
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                return `${label}: ${value.toFixed(2)}%`;
                            },
                            afterLabel: function(context) {
                                if (context.label === 'SSID Overhead') {
                                    return `${totalSSIDs} SSIDs, ${beaconsPerSecond.toFixed(1)} beacons/sec`;
                                }
                                return '';
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Chart creation failed:', error);
        const chartContainer = document.querySelector('#ssidCalculatorModal .chart-container');
        if (chartContainer) {
            chartContainer.innerHTML = '<p style="padding: 2rem; text-align: center; color: #64748b;">Chart temporarily unavailable. Results shown in table above.</p>';
        }
    }
}
