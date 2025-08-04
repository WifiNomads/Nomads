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

// Navigation functions
function goToHome() {
    // Close calculator if it's open
    const modal = document.getElementById('calculatorModal');
    if (modal && modal.classList.contains('active')) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    // Navigate to home section
    history.pushState(null, null, '#home');
    
    // Scroll to top smoothly
    document.getElementById('home').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// Modal functions
function openCalculator() {
    const modal = document.getElementById('calculatorModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Update URL to show calculator section
    history.pushState(null, null, '#wifiairtimecalculator');
    
    // Initialize calculator form
    setTimeout(() => {
        updateForm();
    }, 100);
}

function closeCalculator() {
    const modal = document.getElementById('calculatorModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    
    // Return to tools section URL
    history.pushState(null, null, '#tools');
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const modal = document.getElementById('calculatorModal');
    if (event.target === modal) {
        closeCalculator();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeCalculator();
    }
});

// Wi-Fi Airtime Calculator Logic
// IEEE 802.11 Standards Compliant Implementation

const mcsOptions = [
    {value: 0, text: 'mcs0 (BPSK 1/2)'},
    {value: 1, text: 'mcs1 (QPSK 1/2)'},
    {value: 2, text: 'mcs2 (QPSK 3/4)'},
    {value: 3, text: 'mcs3 (16-QAM 1/2)'},
    {value: 4, text: 'mcs4 (16-QAM 3/4)'},
    {value: 5, text: 'mcs5 (64-QAM 2/3)'},
    {value: 6, text: 'mcs6 (64-QAM 3/4)'},
    {value: 7, text: 'mcs7 (64-QAM 5/6)'},
    {value: 8, text: 'mcs8 (256-QAM 3/4)'},
    {value: 9, text: 'mcs9 (256-QAM 5/6)'},
    {value: 10, text: 'mcs10 (1024-QAM 3/4)'},
    {value: 11, text: 'mcs11 (1024-QAM 5/6)'}
];

const legacyOptions = [
    {text: '6 Mbps (BPSK 1/2)', bits:1, coding:0.5},
    {text: '9 Mbps (BPSK 3/4)', bits:1, coding:0.75},
    {text: '12 Mbps (QPSK 1/2)', bits:2, coding:0.5},
    {text: '18 Mbps (QPSK 3/4)', bits:2, coding:0.75},
    {text: '24 Mbps (16-QAM 1/2)', bits:4, coding:0.5},
    {text: '36 Mbps (16-QAM 3/4)', bits:4, coding:0.75},
    {text: '48 Mbps (64-QAM 2/3)', bits:6, coding:2/3},
    {text: '54 Mbps (64-QAM 3/4)', bits:6, coding:0.75}
];

// Corrected OFDMA Resource Units per IEEE 802.11ax
const ofdma_map = {
    20: {
        1: {data_sub:242, ru_type:'RU242'},
        2: {data_sub:106, ru_type:'RU106'},
        4: {data_sub:52, ru_type:'RU52'},
        9: {data_sub:26, ru_type:'RU26'}
    },
    40: {
        1: {data_sub:484, ru_type:'RU484'},
        2: {data_sub:242, ru_type:'RU242'},
        4: {data_sub:106, ru_type:'RU106'},
        8: {data_sub:52, ru_type:'RU52'},
        18: {data_sub:26, ru_type:'RU26'}
    },
    80: {
        1: {data_sub:980, ru_type:'RU980'},
        2: {data_sub:484, ru_type:'RU484'},
        4: {data_sub:242, ru_type:'RU242'},
        8: {data_sub:106, ru_type:'RU106'},
        16: {data_sub:52, ru_type:'RU52'},
        37: {data_sub:26, ru_type:'RU26'}
    },
    160: {
        1: {data_sub:1960, ru_type:'RU1960'},
        2: {data_sub:980, ru_type:'RU980'},
        4: {data_sub:484, ru_type:'RU484'},
        8: {data_sub:242, ru_type:'RU242'},
        16: {data_sub:106, ru_type:'RU106'},
        32: {data_sub:52, ru_type:'RU52'},
        74: {data_sub:26, ru_type:'RU26'}
    }
};

function updateMCSOptions(maxMcs, selected) {
    const mcsSelect = document.getElementById('mcs');
    mcsSelect.innerHTML = '';
    for (let i = 0; i <= maxMcs; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.text = mcsOptions[i].text;
        if (i === selected) option.selected = true;
        mcsSelect.appendChild(option);
    }
}

function updateLegacyOptions(selected) {
    const legacyRate = document.getElementById('legacyRate');
    legacyRate.innerHTML = '';
    legacyOptions.forEach((opt, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.text = opt.text;
        if (index === selected) option.selected = true;
        legacyRate.appendChild(option);
    });
}

function updateUsersOptions() {
    const bandwidth = document.getElementById('bandwidth').value;
    const users = document.getElementById('users');
    users.innerHTML = '';
    const options = Object.keys(ofdma_map[bandwidth]).sort((a,b) => a-b);
    options.forEach(u => {
        const option = document.createElement('option');
        option.value = u;
        option.text = `${u} (${ofdma_map[bandwidth][u].ru_type})`;
        users.appendChild(option);
    });
    users.value = options[1] || 1;
}

function updateCWRange() {
    const ac = document.getElementById('ac').value;
    const cw = document.getElementById('cw');
    let minAvg, maxAvg, defaultVal;
    if (ac === 'VO') {
        minAvg = 1; maxAvg = 3; defaultVal = 2;
    } else if (ac === 'VI') {
        minAvg = 3; maxAvg = 7; defaultVal = 5;
    } else if (ac === 'BE' || ac === 'BK' || ac === 'DIFS') {
        minAvg = 7; maxAvg = 511; defaultVal = 15;
    }
    cw.min = minAvg;
    cw.max = maxAvg;
    cw.value = defaultVal;
}

function updateForm() {
    const scenario = document.getElementById('scenario').value;
    const band = document.getElementById('band').value;
    const gi = document.getElementById('gi');
    const ss = document.getElementById('ss');
    const usersLabel = document.getElementById('usersLabel');
    const users = document.getElementById('users');
    const ac = document.getElementById('ac');
    const bandwidth = document.getElementById('bandwidth');
    const mcsLabel = document.getElementById('mcsLabel');
    const mcs = document.getElementById('mcs');
    const legacyRateLabel = document.getElementById('legacyRateLabel');
    const legacyRate = document.getElementById('legacyRate');

    // Show/hide elements based on scenario
    if (scenario === '4') {
        usersLabel.style.display = 'block';
        users.style.display = 'block';
        usersLabel.parentElement.style.display = 'flex';
        updateUsersOptions();
        gi.value = 0.8;
        gi.min = 0.8;
        gi.max = 3.2;
        gi.step = 0.8;
        gi.disabled = false;
        ss.disabled = false;
        bandwidth.disabled = false;
        
        // Enable Access Category for OFDMA scenario
        ac.disabled = false;
        
        mcsLabel.style.display = 'block';
        mcs.style.display = 'block';
        mcsLabel.parentElement.style.display = 'flex';
        legacyRateLabel.style.display = 'none';
        legacyRate.style.display = 'none';
        legacyRateLabel.parentElement.style.display = 'none';
    } else if (scenario === '3') {
        usersLabel.style.display = 'none';
        users.style.display = 'none';
        usersLabel.parentElement.style.display = 'none';
        gi.value = 0.8;
        gi.min = 0.8;
        gi.max = 3.2;
        gi.step = 0.8;
        gi.disabled = false;
        ss.disabled = false;
        bandwidth.disabled = false;
        
        // Enable Access Category for HE scenario
        ac.disabled = false;
        
        mcsLabel.style.display = 'block';
        mcs.style.display = 'block';
        mcsLabel.parentElement.style.display = 'flex';
        legacyRateLabel.style.display = 'none';
        legacyRate.style.display = 'none';
        legacyRateLabel.parentElement.style.display = 'none';
    } else if (scenario === '1') {
        usersLabel.style.display = 'none';
        users.style.display = 'none';
        usersLabel.parentElement.style.display = 'none';
        gi.value = 0.8;
        gi.disabled = true;
        ss.value = 1;
        ss.disabled = true;
        bandwidth.value = 20;
        bandwidth.disabled = true;
        
        // Force DIFS for legacy scenario and disable Access Category
        ac.value = 'DIFS';
        ac.disabled = true;
        
        mcsLabel.style.display = 'none';
        mcs.style.display = 'none';
        mcsLabel.parentElement.style.display = 'none';
        legacyRateLabel.style.display = 'block';
        legacyRate.style.display = 'block';
        legacyRateLabel.parentElement.style.display = 'flex';
    } else {
        usersLabel.style.display = 'none';
        users.style.display = 'none';
        usersLabel.parentElement.style.display = 'none';
        gi.min = 0.4;
        gi.max = 0.8;
        gi.step = 0.4;
        gi.disabled = false;
        ss.disabled = false;
        bandwidth.disabled = false;
        
        // Re-enable Access Category for non-legacy scenarios
        ac.disabled = false;
        
        mcsLabel.style.display = 'block';
        mcs.style.display = 'block';
        mcsLabel.parentElement.style.display = 'flex';
        legacyRateLabel.style.display = 'none';
        legacyRate.style.display = 'none';
        legacyRateLabel.parentElement.style.display = 'none';
    }

    // Band-specific bandwidth limitations
    if (band === '2.4') {
        const bwOptions = ['20', '40'];
        bandwidth.innerHTML = '';
        bwOptions.forEach(bw => {
            const option = document.createElement('option');
            option.value = bw;
            option.text = bw;
            bandwidth.appendChild(option);
        });
        if (parseInt(bandwidth.value) > 40) bandwidth.value = '40';
    } else {
        const bwOptions = ['20', '40', '80', '160'];
        bandwidth.innerHTML = '';
        bwOptions.forEach(bw => {
            const option = document.createElement('option');
            option.value = bw;
            option.text = bw;
            bandwidth.appendChild(option);
        });
    }

    updateCWRange();
    
    // MCS availability per scenario and bandwidth
    let maxMcs;
    if (scenario === '1') {
        updateLegacyOptions(7); // Default to 54 Mbps (highest rate)
    } else if (scenario === '2') {
        // HT/VHT: VHT supports MCS 0-9 for all bandwidths
        maxMcs = 9; // VHT supports MCS 0-9 for 20/40/80/160 MHz
    } else if (scenario === '3' || scenario === '4') {
        maxMcs = 11; // HE supports MCS 0-11
    }
    let defaultMcs = Math.min(7, maxMcs);
    if (scenario !== '1') updateMCSOptions(maxMcs, defaultMcs);
    if (scenario === '4') updateUsersOptions();
}

function getMcsParams(mcs) {
    const params = [
        {bits: 1, coding: 0.5},    // mcs0
        {bits: 2, coding: 0.5},    // mcs1
        {bits: 2, coding: 0.75},   // mcs2
        {bits: 4, coding: 0.5},    // mcs3
        {bits: 4, coding: 0.75},   // mcs4
        {bits: 6, coding: 2/3},    // mcs5
        {bits: 6, coding: 0.75},   // mcs6
        {bits: 6, coding: 5/6},    // mcs7
        {bits: 8, coding: 0.75},   // mcs8
        {bits: 8, coding: 5/6},    // mcs9
        {bits: 10, coding: 0.75},  // mcs10
        {bits: 10, coding: 5/6}    // mcs11
    ];
    return params[mcs];
}

function getControlRate(selectedRate) {
    const controlRateMap = {
        6: {bits: 1, coding: 0.5},     // BPSK 1/2
        9: {bits: 1, coding: 0.75},    // BPSK 3/4
        12: {bits: 2, coding: 0.5},    // QPSK 1/2
        18: {bits: 2, coding: 0.75},   // QPSK 3/4
        24: {bits: 4, coding: 0.5},    // 16-QAM 1/2
        36: {bits: 4, coding: 0.75},   // 16-QAM 3/4
        48: {bits: 6, coding: 2/3},    // 64-QAM 2/3
        54: {bits: 6, coding: 0.75}    // 64-QAM 3/4
    };
    
    const params = controlRateMap[selectedRate];
    const bits_per_symbol = 48 * params.bits * params.coding; // 48 subcarriers for legacy
    const symbol_time = 4; // Legacy OFDM symbol time
    
    return {bits_per_symbol: bits_per_symbol, symbol_time: symbol_time};
}

function calculate() {
    const scenario = document.getElementById('scenario').value;
    const band = document.getElementById('band').value;
    const ac_type = document.getElementById('ac').value;
    
    let aifsn;
    if (ac_type === 'DIFS') aifsn = 2;
    else if (ac_type === 'BK') aifsn = 7;
    else if (ac_type === 'BE') aifsn = 3;
    else if (ac_type === 'VI') aifsn = 2;
    else if (ac_type === 'VO') aifsn = 2;
    
    const cw = parseFloat(document.getElementById('cw').value);
    const ss = parseInt(document.getElementById('ss').value);
    const gi = parseFloat(document.getElementById('gi').value);
    const ampdu = parseFloat(document.getElementById('ampdu').value);
    const protection = document.getElementById('protection').checked;
    const users = parseInt(document.getElementById('users').value) || 1;
    const bandwidth = parseInt(document.getElementById('bandwidth').value);
    const controlFrameRate = parseInt(document.getElementById('controlFrameRate').value);

    let bits_pr_sub, coding;
    if (scenario === '1') {
        const legacyIndex = parseInt(document.getElementById('legacyRate').value);
        const legacyParams = legacyOptions[legacyIndex];
        bits_pr_sub = legacyParams.bits;
        coding = legacyParams.coding;
    } else {
        const mcs = parseInt(document.getElementById('mcs').value);
        const mcsParams = getMcsParams(mcs);
        bits_pr_sub = mcsParams.bits;
        coding = mcsParams.coding;
    }

    // IEEE timing parameters
    const sifs = (band === '2.4') ? 10 : 16;
    const slot = 9;
    const lp = 20; // L-STF(8) + L-LTF(8) + L-SIG(4)
    const legacy_symbol = 4;
    
    // Control frame calculations
    const controlRate = getControlRate(controlFrameRate);

    let aifs = sifs + aifsn * slot;
    let backoff = cw * slot;

    const b_ack_length = 32; // CORRECTED: Block ACK frame is 32 bytes per IEEE 802.11
    let databits_b_ack = b_ack_length * 8 + 16 + 6; // SERVICE(16) + DATA + TAIL(6)

    // Preamble calculations
    let preamble_duration;
    if (scenario === '1') {
        preamble_duration = lp; // Legacy only
    } else if (scenario === '2') {
        // HT/VHT preamble
        const ht_sig = 8; // HT-SIG or VHT-SIG-A
        const ht_stf = 4; // HT-STF
        const ht_ltf = 4 * ss; // HT-LTF per spatial stream
        preamble_duration = lp + ht_sig + ht_stf + ht_ltf;
    } else {
        // HE preamble calculation
        const rl_sig = 4; // RL-SIG
        const he_sig_a = 8; // HE-SIG-A (2 symbols)
        let he_sig_b = 0;
        let he_stf = 4; // HE-STF
        let he_ltf = 6.4 * ss; // HE-LTF per spatial stream
        
        if (scenario === '4') {
            // HE-SIG-B calculation for OFDMA
            const common_bits = 8 * (bandwidth / 20);
            const user_bits = 24 * users;
            const total_bits = common_bits + user_bits;
            const sigb_subcarriers = {20: 242, 40: 484, 80: 980, 160: 1960}[bandwidth];
            const bits_per_symbol = sigb_subcarriers * 1 * 0.5; // MCS0 for HE-SIG-B
            const symbols_sigb = Math.ceil(total_bits / bits_per_symbol);
            he_sig_b = symbols_sigb * (12.8 + gi);
        }
        
        preamble_duration = lp + rl_sig + he_sig_a + he_sig_b + he_stf + he_ltf;
    }

    // Control frames
    let duration_rts, duration_cts, rts_preamble_duration, cts_preamble_duration;
    
    if (scenario === '4' && users > 1) {
        // MU-RTS for OFDMA
        const mu_rts_length = 20 + (4 * users); // CORRECTED frame length
        let databits_mu_rts = mu_rts_length * 8 + 16 + 6;
        const mu_rts_subcarriers = {20: 242, 40: 484, 80: 980, 160: 1960}[bandwidth];
        let control_bits_per_symbol_he = mu_rts_subcarriers * 1 * 0.5; // MCS0
        let symbols_mu_rts = Math.ceil(databits_mu_rts / control_bits_per_symbol_he);
        duration_rts = symbols_mu_rts * (12.8 + gi);
        rts_preamble_duration = preamble_duration;
        
        const cts_length = 14;
        let databits_cts = cts_length * 8 + 16 + 6;
        let symbols_cts = Math.ceil(databits_cts / control_bits_per_symbol_he);
        duration_cts = symbols_cts * (12.8 + gi);
        cts_preamble_duration = preamble_duration;
    } else {
        // Legacy RTS/CTS
        const rts_length = 20;
        let databits_rts = rts_length * 8 + 16 + 6;
        let symbols_rts = Math.ceil(databits_rts / controlRate.bits_per_symbol);
        duration_rts = symbols_rts * controlRate.symbol_time;
        rts_preamble_duration = lp;
        
        const cts_length = 14;
        let databits_cts = cts_length * 8 + 16 + 6;
        let symbols_cts = Math.ceil(databits_cts / controlRate.bits_per_symbol);
        duration_cts = symbols_cts * controlRate.symbol_time;
        cts_preamble_duration = lp;
    }

    // Data transmission calculation
    let data_sub, symbol_time, data_bits_per_symbol, databits_data, symbols_data, duration_data;

    // Subcarrier counts per standard
    const subcarriers_legacy = {20: 48, 40: 0, 80: 0, 160: 0};
    const subcarriers_ht_vht = {20: 52, 40: 108, 80: 234, 160: 468};
    const subcarriers_he = {20: 242, 40: 484, 80: 980, 160: 1960};

    if (scenario === '1') {
        data_sub = subcarriers_legacy[bandwidth];
        symbol_time = 4; // Legacy symbol time
    } else if (scenario === '2') {
        data_sub = subcarriers_ht_vht[bandwidth];
        symbol_time = 3.2 + gi; // HT/VHT symbol time
    } else {
        if (scenario === '4') {
            data_sub = ofdma_map[bandwidth][users].data_sub;
        } else {
            data_sub = subcarriers_he[bandwidth];
        }
        symbol_time = 12.8 + gi; // HE symbol time
    }

    // Data bits per symbol calculation
    if (scenario === '1') {
        data_bits_per_symbol = data_sub * bits_pr_sub * coding; // Legacy: no spatial streams
    } else {
        data_bits_per_symbol = data_sub * bits_pr_sub * coding * ss;
    }
    
    databits_data = 16 + ampdu * 8 + 6; // SERVICE(16) + DATA + TAIL(6)
    symbols_data = Math.ceil(databits_data / data_bits_per_symbol);
    duration_data = symbols_data * symbol_time;

    // ACK calculation
    let symbols_b_ack, duration_b_ack;
    if (scenario === '3' || scenario === '4') {
        // HE Block ACK
        const ack_subcarriers = subcarriers_he[bandwidth];
        let control_bits_per_symbol_he = ack_subcarriers * 1 * 0.5; // MCS0
        symbols_b_ack = Math.ceil(databits_b_ack / control_bits_per_symbol_he);
        duration_b_ack = symbols_b_ack * (12.8 + gi);
    } else {
        // Legacy ACK
        symbols_b_ack = Math.ceil(databits_b_ack / controlRate.bits_per_symbol);
        duration_b_ack = symbols_b_ack * controlRate.symbol_time;
    }

    // Build timing breakdown
    let barLabels = [];
    let barData = [];
    let total_inc = 0;
    let total_exc = 0;

    // AIFS and backoff
    barLabels.push('DIFS/AIFS');
    barData.push(aifs);
    total_inc += aifs;

    barLabels.push('Backoff');
    barData.push(backoff);
    total_inc += backoff;

    // Protection - IEEE 802.11 compliant RTS/CTS sequence
    if (protection) {
        // RTS Preamble
        if (scenario === '4' && users > 1) {
            barLabels.push('MU-RTS Preamble');
        } else {
            barLabels.push('RTS Preamble');
        }
        barData.push(rts_preamble_duration);
        total_inc += rts_preamble_duration;
        total_exc += rts_preamble_duration;

        // RTS Frame
        if (scenario === '4' && users > 1) {
            barLabels.push('MU-RTS');
        } else {
            barLabels.push('RTS');
        }
        barData.push(duration_rts);
        total_inc += duration_rts;
        total_exc += duration_rts;

        // SIFS after RTS
        barLabels.push('SIFS');
        barData.push(sifs);
        total_inc += sifs;
        total_exc += sifs;

        // CTS Preamble
        if (scenario === '4' && users > 1) {
            barLabels.push('CTS Preamble (HE)');
        } else {
            barLabels.push('CTS Preamble');
        }
        barData.push(cts_preamble_duration);
        total_inc += cts_preamble_duration;
        total_exc += cts_preamble_duration;

        // CTS Frame
        barLabels.push('CTS');
        barData.push(duration_cts);
        total_inc += duration_cts;
        total_exc += duration_cts;

        // SIFS after CTS
        barLabels.push('SIFS');
        barData.push(sifs);
        total_inc += sifs;
        total_exc += sifs;
    }

    // Data transmission
    barLabels.push('Data Preamble');
    barData.push(preamble_duration);
    total_inc += preamble_duration;
    total_exc += preamble_duration;

    barLabels.push('A-MPDU');
    barData.push(duration_data);
    total_inc += duration_data;
    total_exc += duration_data;

    barLabels.push('SIFS');
    barData.push(sifs);
    total_inc += sifs;
    total_exc += sifs;

    // ACK
    let ack_preamble_duration;
    if (scenario === '3' || scenario === '4') {
        ack_preamble_duration = preamble_duration;
    } else {
        ack_preamble_duration = lp;
    }
    
    barLabels.push('ACK Preamble');
    barData.push(ack_preamble_duration);
    total_inc += ack_preamble_duration;
    total_exc += ack_preamble_duration;

    barLabels.push('ACK/B-ACK');
    barData.push(duration_b_ack);
    total_inc += duration_b_ack;
    total_exc += duration_b_ack;

    // Throughput calculation
    const throughput_inc = (ampdu * 8 / (total_inc * 1e-6)) / 1e6;
    const throughput_exc = (ampdu * 8 / (total_exc * 1e-6)) / 1e6;

    // Output results
    let table = '<table class="table table-striped"><thead><tr><th>Component</th><th>Duration (us)</th><th>Throughput (Mbps)</th></tr></thead><tbody>';
    table += `<tr><td>Duration including DIFS & CW</td><td>${total_inc.toFixed(1)}</td><td>${throughput_inc.toFixed(3)}</td></tr>`;
    table += `<tr><td>Duration excluding DIFS & CW</td><td>${total_exc.toFixed(1)}</td><td>${throughput_exc.toFixed(3)}</td></tr>`;
    table += '</tbody></table>';
    document.getElementById('output').innerHTML = table;

    // Bar chart - Stable responsive version
    try {
        const canvas = document.getElementById('barChart');
        if (!canvas) {
            console.error('Chart canvas not found');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
        // Destroy existing chart
        if (window.myChart) {
            window.myChart.destroy();
            window.myChart = null;
        }
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Set canvas size explicitly
        canvas.width = canvas.offsetWidth;
        canvas.height = 400;
        
        // Create new chart with delay to ensure DOM is ready
        setTimeout(() => {
            // Create gradient for bars
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
            gradient.addColorStop(0, '#1e3a8a');
            gradient.addColorStop(0.5, '#0891b2');
            gradient.addColorStop(1, '#059669');
            
            // Create hover gradient
            const hoverGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
            hoverGradient.addColorStop(0, '#1e40af');
            hoverGradient.addColorStop(0.5, '#0e7490');
            hoverGradient.addColorStop(1, '#047857');
            
            window.myChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: barLabels,
                    datasets: [{
                        label: 'Duration (μs)',
                        data: barData,
                        backgroundColor: gradient,
                        borderColor: '#1e3a8a',
                        borderWidth: 2,
                        borderRadius: 6,
                        borderSkipped: false,
                        hoverBackgroundColor: hoverGradient,
                        hoverBorderColor: '#0891b2',
                        hoverBorderWidth: 3
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    devicePixelRatio: window.devicePixelRatio || 1,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            enabled: true,
                            backgroundColor: 'rgba(15, 23, 42, 0.95)',
                            titleColor: '#ffffff',
                            bodyColor: '#ffffff',
                            borderColor: '#1e3a8a',
                            borderWidth: 2,
                            cornerRadius: 8,
                            displayColors: false,
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
                                title: function(context) {
                                    return context[0].label;
                                },
                                label: function(context) {
                                    return `${context.parsed.x.toFixed(1)} μs`;
                                },
                                afterLabel: function(context) {
                                    const percentage = ((context.parsed.x / barData.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
                                    return `${percentage}% of total time`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            beginAtZero: true,
                            grid: {
                                display: true,
                                color: 'rgba(226, 232, 240, 0.6)',
                                lineWidth: 1
                            },
                            ticks: {
                                maxTicksLimit: 6,
                                color: '#64748b',
                                font: {
                                    size: 11,
                                    family: 'Inter',
                                    weight: '500'
                                },
                                callback: function(value) {
                                    return value.toFixed(0) + 'μs';
                                }
                            },
                            title: {
                                display: true,
                                text: 'Duration (microseconds)',
                                color: '#475569',
                                font: {
                                    size: 12,
                                    family: 'Inter',
                                    weight: '600'
                                }
                            }
                        },
                        y: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                color: '#475569',
                                font: {
                                    size: 11,
                                    family: 'Inter',
                                    weight: '500'
                                },
                                padding: 8
                            }
                        }
                    },
                    animation: {
                        duration: 1500,
                        easing: 'easeOutCubic',
                        animateRotate: true,
                        animateScale: true,
                        onProgress: function(animation) {
                            // Add shimmer effect during animation
                            const progress = animation.currentStep / animation.numSteps;
                            this.canvas.style.filter = `brightness(${1 + (progress * 0.1)})`;
                        },
                        onComplete: function() {
                            // Reset filter after animation
                            this.canvas.style.filter = 'brightness(1)';
                        }
                    },
                    interaction: {
                        intersect: true,
                        mode: 'nearest'
                    },
                    onHover: function(event, elements) {
                        event.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'default';
                    }
                }
            });
        }, 100);
        
    } catch (error) {
        console.error('Chart creation failed:', error);
        // Fallback: show results in text format
        const chartContainer = document.querySelector('.chart-container');
        if (chartContainer) {
            chartContainer.innerHTML = '<p style="padding: 2rem; text-align: center; color: #64748b;">Chart temporarily unavailable. Results shown in table above.</p>';
        }
    }
}

// Mobile menu toggle functionality
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
    }
}

// Initialize the application on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    init3DRotation();
    initMobileMenu();
    
    // Check URL hash and open calculator if needed
    if (window.location.hash === '#wifiairtimecalculator') {
        openCalculator();
    }
});

// Handle browser back/forward buttons
window.addEventListener('popstate', () => {
    if (window.location.hash === '#wifiairtimecalculator') {
        openCalculator();
    } else {
        const modal = document.getElementById('calculatorModal');
        if (modal && modal.classList.contains('active')) {
            closeCalculator();
        }
    }
});
