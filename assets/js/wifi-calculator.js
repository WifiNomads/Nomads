// Wi-Fi Airtime Calculator - Complete Module
// IEEE 802.11 Standards Compliant Implementation
// Consolidated: UI Logic + Calculation Engine

// ===== CONSTANTS AND CONFIGURATION =====

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
        1: {data_sub:234, ru_type:'RU242'},
        2: {data_sub:102, ru_type:'RU106'},
        4: {data_sub:48, ru_type:'RU52'},
        9: {data_sub:24, ru_type:'RU26'}
    },
    40: {
        1: {data_sub:468, ru_type:'RU484'},
        2: {data_sub:234, ru_type:'RU242'},
        4: {data_sub:102, ru_type:'RU106'},
        8: {data_sub:48, ru_type:'RU52'},
        18: {data_sub:24, ru_type:'RU26'}
    },
    80: {
        1: {data_sub:980, ru_type:'RU996'}, // Note: RU996 contains 980 data subcarriers
        2: {data_sub:468, ru_type:'RU484'},
        4: {data_sub:234, ru_type:'RU242'},
        8: {data_sub:102, ru_type:'RU106'},
        16: {data_sub:48, ru_type:'RU52'},
        37: {data_sub:24, ru_type:'RU26'}
    },
    160: {
        1: {data_sub:1960, ru_type:'RU996x2'}, // Two RU996
        2: {data_sub:980, ru_type:'RU996'},
        4: {data_sub:468, ru_type:'RU484'},
        8: {data_sub:234, ru_type:'RU242'},
        16: {data_sub:102, ru_type:'RU106'},
        32: {data_sub:48, ru_type:'RU52'},
        74: {data_sub:24, ru_type:'RU26'}
    }
};

// Safety Limits
const MAX_AMPDU_BYTES = 4194303;   // IEEE 802.11 A-MPDU max size per AX standard
const MAX_MPDU_COUNT = 1000;      // Prevent extreme loops
const MAX_USERS = 74;             // Max OFDMA RU allocation in your map
const MAX_BAR_POINTS = 50;        // Chart.js safe render limit
const MAX_CW = 1023;              // Contention window upper bound
const MAX_SPATIAL_STREAMS = 8;    // 8x8 MIMO max
const MAX_GI = 3.2;               // HE max GI in µs

// ===== MODAL MANAGEMENT =====

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

// ===== FORM MANAGEMENT =====

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

function updateUsersOptions(preserveSelection = true) {
    const bandwidth = document.getElementById('bandwidth').value;
    const users = document.getElementById('users');
    
    // Store current selection to preserve it
    const currentValue = preserveSelection ? users.value : null;
    
    users.innerHTML = '';
    const options = Object.keys(ofdma_map[bandwidth]).sort((a,b) => a-b);
    options.forEach(u => {
        const option = document.createElement('option');
        option.value = u;
        option.text = `${u} (${ofdma_map[bandwidth][u].ru_type})`;
        users.appendChild(option);
    });
    
    // Try to preserve the previous selection if valid, otherwise use default
    if (preserveSelection && currentValue && options.includes(currentValue)) {
        users.value = currentValue;
    } else {
        const defaultIndex = Math.max(0, Math.floor(options.length / 2));
        users.value = options[defaultIndex] || options[0] || 1;
    }
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
    const ackType = document.getElementById('ackType');
    const heLtfSize = document.getElementById('heLtfSize');

    // Show/hide HE-LTF Size based on scenario (only for HE scenarios 3 and 4)
    if (scenario === '3' || scenario === '4') {
        heLtfSize.parentElement.style.display = 'flex';
    } else {
        heLtfSize.parentElement.style.display = 'none';
    }

    // Show/hide elements based on scenario
    if (scenario === '4') {
        usersLabel.style.display = 'block';
        users.style.display = 'block';
        usersLabel.parentElement.style.display = 'flex';
        updateUsersOptions();
        
        // Scenario 4: OFDMA - show only 0.8, 1.6, 3.2 (same as HE)
        gi.innerHTML = `
            <option value="0.8" selected>0.8 μs (HE GI)</option>
            <option value="1.6">1.6 μs (HE GI)</option>
            <option value="3.2">3.2 μs (HE Long GI)</option>
        `;
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
        
        // Scenario 3: HE - show only 0.8, 1.6, 3.2
        gi.innerHTML = `
            <option value="0.8" selected>0.8 μs (HE GI)</option>
            <option value="1.6">1.6 μs (HE GI)</option>
            <option value="3.2">3.2 μs (HE Long GI)</option>
        `;
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
        // Legacy scenario: Fix GI to 0.8 and disable
        gi.innerHTML = '<option value="0.8" selected>0.8 μs (Legacy)</option>';
        gi.value = '0.8';
        gi.disabled = true;
        
        ss.value = 1;
        ss.disabled = true;
        bandwidth.value = 20;
        bandwidth.disabled = true;
        
        // Force DIFS for legacy scenario and disable Access Category
        ac.value = 'DIFS';
        ac.disabled = true;
        
        // Force ACK for legacy scenario (Block ACK not supported in 802.11a/g)
        ackType.value = 'ack';
        ackType.disabled = true;
        
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
        
        // Scenario 2: HT/VHT - show only 0.4 and 0.8
        gi.innerHTML = `
            <option value="0.4">0.4 μs (Short GI)</option>
            <option value="0.8" selected>0.8 μs (Long GI)</option>
        `;
        gi.disabled = false;
        
        ss.disabled = false;
        bandwidth.disabled = false;
        
        // Re-enable Access Category for non-legacy scenarios
        ac.disabled = false;
        
        // Enable ACK type selection for modern scenarios (Block ACK supported)
        ackType.disabled = false;
        
        // Set Block ACK as default for modern scenarios
        ackType.value = 'blockack';
        
        mcsLabel.style.display = 'block';
        mcs.style.display = 'block';
        mcsLabel.parentElement.style.display = 'flex';
        legacyRateLabel.style.display = 'none';
        legacyRate.style.display = 'none';
        legacyRateLabel.parentElement.style.display = 'none';
    }
    
    // Enable ACK type selection for HE scenarios as well
    if (scenario === '3' || scenario === '4') {
        ackType.disabled = false;
        // Set Block ACK as default for HE scenarios
        ackType.value = 'blockack';
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
}

// ===== CALCULATION UTILITIES =====

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
    if (typeof mcs !== 'number' || isNaN(mcs)) mcs = 0;
    if (mcs < 0) mcs = 0;
    if (mcs >= params.length) mcs = params.length - 1;
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
    const params = controlRateMap[selectedRate] || controlRateMap[6]; // fallback to 6 Mbps
    const bits_per_symbol = 48 * params.bits * params.coding; // legacy: 48 data subcarriers
    const symbol_time = 4;
    return {bits_per_symbol: bits_per_symbol, symbol_time: symbol_time};
}

function validateInputs() {
    const ampduInput = parseInt(document.getElementById('ampdu').value, 10) || 0;
    const cwInput = parseFloat(document.getElementById('cw').value) || 0;
    const ssInput = parseInt(document.getElementById('ss').value) || 0;
    const giInput = parseFloat(document.getElementById('gi').value) || 0;
    const usersInput = parseInt(document.getElementById('users').value) || 1;

    if (ampduInput < 1 || ampduInput > MAX_AMPDU_BYTES) {
        alert(`AMPDU size must be between 1 and ${MAX_AMPDU_BYTES} bytes.`);
        return false;
    }
    if (cwInput < 0 || cwInput > MAX_CW) {
        alert(`CW must be between 0 and ${MAX_CW}.`);
        return false;
    }
    if (ssInput < 1 || ssInput > MAX_SPATIAL_STREAMS) {
        alert(`Spatial streams must be between 1 and ${MAX_SPATIAL_STREAMS}.`);
        return false;
    }
    if (giInput < 0.4 || giInput > MAX_GI) {
        alert(`GI must be between 0.4 and ${MAX_GI} µs.`);
        return false;
    }
    if (usersInput < 1 || usersInput > MAX_USERS) {
        alert(`Number of users must be between 1 and ${MAX_USERS}.`);
        return false;
    }

    return true; // All good
}

// ===== MAIN CALCULATION ENGINE =====

function calculate() {
    if (!validateInputs()) {
        return; // Stop if invalid
    }
    
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
    const ackType = document.getElementById('ackType').value;

    let bits_pr_sub, coding;
    if (scenario === '1') {
        const legacyIndex = parseInt(document.getElementById('legacyRate').value);
        const legacyParams = legacyOptions[legacyIndex];
        bits_pr_sub = legacyParams.bits;
        coding = legacyParams.coding;
    } else {
        const mcs = parseInt(document.getElementById('mcs').value);
        const mcsParams = getMcsParams(mcs);
        if (!mcsParams) {
            alert('Invalid MCS selected — please choose a valid MCS.');
            return;
        }
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

    // ACK/Block ACK frame sizes based on user selection
    const ack_length = 14; // Standard ACK frame size
    const b_ack_length = 32; // Block ACK frame size (compressed)
    
    // Select appropriate ACK frame size based on user choice
    const selected_ack_length = (ackType === 'ack') ? ack_length : b_ack_length;
    let databits_ack = selected_ack_length * 8 + 16 + 6; // SERVICE(16) + DATA + TAIL(6)

    // Preamble calculations
    let preamble_duration;
    let he_su_preamble_duration; // Declare in broader scope for control frames
    
    if (scenario === '1') {
        preamble_duration = lp; // Legacy only
    } else if (scenario === '2') {
        // HT/VHT preamble
        const vht_sig_a = 8; 
        const vht_stf = 4;
        const vht_ltf = 4 * ss;
        const vht_sig_b = 4; // VHT-SIG-B field is always 4µs

        // Base preamble is Legacy + VHT-SIG-A + VHT-STF + VHT-LTFs
        preamble_duration = lp + vht_sig_a + vht_stf + vht_ltf;

        // VHT adds the VHT-SIG-B field. A good proxy for VHT is BW > 40MHz or MCS 8/9.
        const mcs = parseInt(document.getElementById('mcs').value);
        if (bandwidth > 40 || mcs > 7) {
            preamble_duration += vht_sig_b;
        }
    } else {
        // HE preamble calculation
        const rl_sig = 4; // RL-SIG
        const he_sig_a = 8; // HE-SIG-A (2 symbols)
        const he_stf = 4; // For non-TB PPDUs
        
        // Read the new HE-LTF Size input
        const heLtfSize = parseInt(document.getElementById('heLtfSize').value);
        
        let n_he_ltf;
        if (heLtfSize === 2) {
            n_he_ltf = Math.ceil(ss / 2);
        } else if (heLtfSize === 4) {
            n_he_ltf = Math.ceil(ss / 4);
        } else {
            n_he_ltf = ss; // Default to 1x
        }
        
        const single_he_ltf_duration = 3.2 + gi;
        const he_ltf = n_he_ltf * single_he_ltf_duration;
        
        // STEP 1: Calculate the simpler HE SU preamble duration separately (it has no HE-SIG-B)
        he_su_preamble_duration = lp + rl_sig + he_sig_a + he_stf + he_ltf;
        
        let he_sig_b = 0;
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
        
        // The main data preamble still includes the HE-SIG-B
        preamble_duration = he_su_preamble_duration + he_sig_b;
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
        
        // STEP 2: Assign the CORRECT (HE SU) preamble duration
        rts_preamble_duration = he_su_preamble_duration;
        
        const cts_length = 14;
        let databits_cts = cts_length * 8 + 16 + 6;
        let symbols_cts = Math.ceil(databits_cts / control_bits_per_symbol_he);
        duration_cts = symbols_cts * (12.8 + gi);
        
        // STEP 2: Assign the CORRECT (HE SU) preamble duration
        cts_preamble_duration = he_su_preamble_duration;
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
    const subcarriers_he = {20: 234, 40: 468, 80: 980, 160: 1960};

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
    
    if (!data_bits_per_symbol || data_bits_per_symbol <= 0) {
        alert('Invalid PHY configuration: data bits per symbol = 0. Check bandwidth, RU and spatial streams.');
        return;
    }
    
    // --- START: Improved DATA payload + MPDU overhead calculation ---
    const MAC_HEADER_BYTES = 30;    // typical MAC header + LLC/QoS (approx)
    const FCS_BYTES = 4;
    const MPDU_DELIMITER_BYTES = 4; // A-MPDU delimiter (if multiple MPDUs)
    const SERVICE_BITS = 16;
    const TAIL_BITS = 6;

    // ampdu (from UI) is treated as total application payload bytes
    const ampduBytesTotal = (typeof ampdu !== 'undefined' && !isNaN(ampdu)) ? ampdu : 0;

    // Heuristic: split total payload into MPDUs of assumed size (expose as 'Advanced' input later if needed)
    // Use adaptive MPDU size for larger A-MPDUs to keep MPDU count reasonable
    let assumedMpduPayload = 1500; // bytes per MPDU (default)
    
    let mpduCount = Math.max(1, Math.ceil(ampduBytesTotal / assumedMpduPayload));
    let remainingPayload = ampduBytesTotal;
    let totalDataBytes = 0;

    for (let i = 0; i < mpduCount; i++) {
        const payloadForThis = (i === mpduCount - 1) ? remainingPayload : assumedMpduPayload;
        remainingPayload -= payloadForThis;
        const delimiter = (mpduCount > 1) ? MPDU_DELIMITER_BYTES : 0;
        totalDataBytes += (MAC_HEADER_BYTES + payloadForThis + FCS_BYTES + delimiter);
    }

    // Convert to bits and add SERVICE + TAIL
    databits_data = SERVICE_BITS + (totalDataBytes * 8) + TAIL_BITS;
    // --- END ---
    symbols_data = Math.ceil(databits_data / data_bits_per_symbol);
    duration_data = symbols_data * symbol_time;

    // ACK calculation based on selected type
    let symbols_ack, duration_ack;
    if (scenario === '3' || scenario === '4') {
        // HE ACK/Block ACK
        const ack_subcarriers = subcarriers_he[bandwidth];
        let control_bits_per_symbol_he = ack_subcarriers * 1 * 0.5; // MCS0
        symbols_ack = Math.ceil(databits_ack / control_bits_per_symbol_he);
        duration_ack = symbols_ack * (12.8 + gi);
    } else {
        // Legacy ACK/Block ACK
        symbols_ack = Math.ceil(databits_ack / controlRate.bits_per_symbol);
        duration_ack = symbols_ack * controlRate.symbol_time;
    }

    // Build timing breakdown
    let barLabels = [];
    let barData = [];
    let total_inc = 0;
    let total_exc = 0;

    // Dynamic Access Category label for output
    let acLabel;
    if (ac_type === 'DIFS') acLabel = 'DIFS';
    else if (ac_type === 'BK') acLabel = 'BK';
    else if (ac_type === 'BE') acLabel = 'BE';
    else if (ac_type === 'VI') acLabel = 'VI';
    else if (ac_type === 'VO') acLabel = 'VO';

    // AIFS and backoff with dynamic AC label
    barLabels.push(`${acLabel}/AIFS`);
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

    barLabels.push('MPDU/A-MPDU');
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

    // Dynamic ACK label based on selected type
    const ackLabel = (ackType === 'ack') ? 'ACK' : 'Block ACK';
    barLabels.push(ackLabel);
    barData.push(duration_ack);
    total_inc += duration_ack;
    total_exc += duration_ack;

    // throughput in Mbps (explicit steps)
    // total_inc and total_exc are in microseconds (µs)
    const bitsTransmitted = ampduBytesTotal * 8; // application payload bits
    const throughput_inc = (bitsTransmitted / (total_inc * 1e-6)) / 1e6; // bits/sec -> Mbps
    const throughput_exc = (bitsTransmitted / (total_exc * 1e-6)) / 1e6;

    // Output results with dynamic AC labels
    let table = '<table class="table table-striped"><thead><tr><th>Component</th><th>Duration (μs)</th><th>Ideal Throughput (Mbps) <span class="info-icon" onclick="showThroughputFormula()" title="Click to see throughput calculation formula">(i)</span></th></tr></thead><tbody>';
    table += `<tr><td>Duration including IFS ${acLabel} & CW</td><td>${total_inc.toFixed(1)}</td><td>${throughput_inc.toFixed(3)}</td></tr>`;
    table += `<tr><td>Duration excluding IFS ${acLabel} & CW</td><td>${total_exc.toFixed(1)}</td><td>${throughput_exc.toFixed(3)}</td></tr>`;
    table += '</tbody></table>';
    document.getElementById('output').innerHTML = table;

    // Create chart
    createWiFiChart(barLabels, barData);
}

// ===== CHART CREATION =====

function createWiFiChart(barLabels, barData) {
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
        
        if (barData.length > MAX_BAR_POINTS) {
            alert(`Too many chart points (${barData.length}). Please reduce complexity of the scenario.`);
            return;
        }
        
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
                plugins: [ChartDataLabels],
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
                        },
                        datalabels: {
                            anchor: 'end',
                            align: 'right',
                            offset: 4,
                            color: '#1e3a8a',
                            font: {
                                size: 11,
                                weight: 'bold',
                                family: 'Inter'
                            },
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            borderColor: '#e2e8f0',
                            borderWidth: 1,
                            borderRadius: 4,
                            padding: {
                                top: 2,
                                bottom: 2,
                                left: 6,
                                right: 6
                            },
                            formatter: function(value, context) {
                                return value.toFixed(1) + 'μs';
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

// ===== UTILITY FUNCTIONS =====

// Throughput formula explanation function
function showThroughputFormula() {
    const formulaText = `
**Ideal Throughput Calculation Formula:**

**Throughput (Mbps) = (Application Data Bits) / (Total Duration × 10⁻⁶)**

**Where:**
• **Application Data Bits** = AMPDU payload × 8 bits
• **Total Duration** = Sum of all timing components (μs)

**Components Include:**
• **AIFS/DIFS** - Arbitration Inter Frame Space
• **Backoff** - Random backoff slots for collision avoidance  
• **RTS/CTS** - Optional protection frames (if enabled)
• **Data Preamble** - PHY layer synchronization
• **MPDU/A-MPDU** - Actual data transmission
• **SIFS** - Short Inter Frame Space
• **ACK/Block ACK** - Acknowledgment frames

**Note:** This is the "ideal" throughput as it represents the theoretical maximum based on the PHY layer parameters and doesn't account for real-world factors like:
- Retry transmissions due to errors
- Additional MAC layer overhead
- Channel contention from other devices  
- Variable channel conditions
- Processing delays

**Two calculations are shown:**
1. **Including AIFS & Backoff** - Complete transmission cycle
2. **Excluding AIFS & Backoff** - Pure data transmission efficiency

This helps analyze both the overall channel efficiency and the raw data transfer capability.
    `;
    
    alert(formulaText);
}

// Release Notes Toggle Function
function toggleReleaseNotes() {
    const content = document.getElementById('releaseNotesContent');
    const icon = document.getElementById('releaseNotesIcon');
    
    if (content.style.display === 'none' || content.style.display === '') {
        content.style.display = 'block';
        icon.style.transform = 'rotate(90deg)';
        icon.textContent = '▼';
        
        // Smooth animation
        content.style.opacity = '0';
        content.style.maxHeight = '0';
        content.style.overflow = 'hidden';
        content.style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
            content.style.opacity = '1';
            content.style.maxHeight = '200px';
        }, 10);
    } else {
        content.style.opacity = '0';
        content.style.maxHeight = '0';
        
        setTimeout(() => {
            content.style.display = 'none';
            icon.style.transform = 'rotate(0deg)';
            icon.textContent = '▶';
        }, 300);
    }
}
