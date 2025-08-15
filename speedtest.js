// Local LAN Speed Test Implementation - Fixed WebRTC Version
// Wi-Fi Nomads - Browser-based iperf replacement

// --- Minimal helper: log -------------------------------------------------
const logEl = document.getElementById('log');
function log(msg, cls) {
  const t = new Date().toLocaleTimeString();
  const line = document.createElement('div');
  if (cls) line.className = cls;
  line.textContent = `[${t}] ${msg}`;
  logEl.appendChild(line);
  logEl.scrollTop = logEl.scrollHeight;
  console.log(msg);
}

// --- Basic UI handles ----------------------------------------------------
const ui = {
  // host side
  btnHostCreate: document.getElementById('btnHostCreate'),
  hostOffer: document.getElementById('hostOffer'),
  copyOffer: document.getElementById('copyOffer'),
  clientAnswer: document.getElementById('clientAnswer'),
  btnHostAccept: document.getElementById('btnHostAccept'),
  hostStatus: document.getElementById('hostStatus'),

  // client side
  hostCode: document.getElementById('hostCode'),
  btnClientRespond: document.getElementById('btnClientRespond'),
  clientCode: document.getElementById('clientCode'),
  copyAnswer: document.getElementById('copyAnswer'),
  clientStatus: document.getElementById('clientStatus'),

  // test
  duration: document.getElementById('duration'),
  direction: document.getElementById('direction'),
  reliability: document.getElementById('reliability'),
  btnStart: document.getElementById('btnStart'),

  // kpis
  kStatus: document.getElementById('kpiStatus'),
  kThr: document.getElementById('kpiThroughput'),
  kLat: document.getElementById('kpiLatency'),
  kLoss: document.getElementById('kpiLoss'),
};

// --- WebRTC state --------------------------------------------------------
let isHost = false;
let pc, dc; // RTCPeerConnection + DataChannel
let connected = false;

function pcConfig() {
  return {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };
}

function createPC() {
  pc = new RTCPeerConnection(pcConfig());
  
  pc.onicecandidate = (e) => {
    if (e.candidate) {
      log('ICE candidate: ' + e.candidate.candidate);
    }
  };
  
  pc.onicegatheringstatechange = () => {
    log('ICE gathering state: ' + pc.iceGatheringState);
  };
  
  pc.onconnectionstatechange = () => {
    log('WebRTC connection state: ' + pc.connectionState);
    if (pc.connectionState === 'connected') {
      onConnected();
    } else if (pc.connectionState === 'failed') {
      log('WebRTC connection failed', 'status-err');
      ui.kStatus.textContent = 'Connection Failed';
    } else if (pc.connectionState === 'disconnected') {
      log('WebRTC connection disconnected', 'status-warn');
      connected = false;
      ui.btnStart.disabled = true;
      ui.kStatus.textContent = 'Disconnected';
    }
  };
  
  pc.oniceconnectionstatechange = () => {
    log('ICE connection state: ' + pc.iceConnectionState);
  };
  
  pc.ondatachannel = (ev) => {
    log('Received data channel from host', 'status-ok');
    dc = ev.channel;
    setupDC();
  };
}

function setupDC() {
  dc.onopen = () => {
    log('Data channel opened', 'status-ok');
    connected = true;
    ui.btnStart.disabled = false;
    ui.kStatus.textContent = 'Connected';
    log('🚀 Ready to start speed test!', 'status-ok');
  };
  
  dc.onclose = () => {
    log('Data channel closed', 'status-warn');
    connected = false;
    ui.btnStart.disabled = true;
    ui.kStatus.textContent = 'Disconnected';
  };
  
  dc.onerror = (e) => {
    log('Data channel error: ' + e, 'status-err');
  };
  
  dc.onmessage = onData;
  
  // Backpressure management - critical for high-speed testing
  dc.bufferedAmountLowThreshold = 1 << 20; // 1MB threshold
  
  dc.addEventListener('bufferedamountlow', () => {
    log('Buffer cleared, ready for more data');
  });
}

function reliableOpts() {
  const rel = ui.reliability.value === 'reliable';
  return rel ? { ordered: true } : { ordered: false, maxRetransmits: 0 };
}

async function waitIceComplete(conn) {
  if (conn.iceGatheringState === 'complete') return;
  
  log('Waiting for ICE candidate gathering...');
  
  await new Promise(resolve => {
    const checkComplete = () => {
      if (conn.iceGatheringState === 'complete') {
        conn.removeEventListener('icegatheringstatechange', checkComplete);
        resolve();
      }
    };
    conn.addEventListener('icegatheringstatechange', checkComplete);
    
    // Safety timeout - don't wait forever
    setTimeout(() => {
      log('ICE gathering timeout, proceeding anyway', 'status-warn');
      resolve();
    }, 5000);
  });
  
  log('ICE candidate gathering complete');
}

// --- Pairing flow (copy/paste codes) ------------------------------------
ui.btnHostCreate.onclick = async () => {
  try {
    log('Creating host connection...', 'status-ok');
    isHost = true;
    createPC();
    
    // Host creates data channel proactively
    dc = pc.createDataChannel('speedtest', reliableOpts());
    setupDC();
    
    // Create offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    
    // Wait for ICE gathering to complete
    await waitIceComplete(pc);
    
    // Encode offer as base64 for easy copy/paste
    const offerCode = btoa(JSON.stringify(pc.localDescription));
    ui.hostOffer.value = offerCode;
    ui.copyOffer.disabled = false;
    ui.btnHostAccept.disabled = false;
    
    ui.hostStatus.textContent = 'Send Host Code to Client and wait for response code.';
    ui.hostStatus.className = 'speedtest-muted status-warn';
    
    log('Host code created successfully', 'status-ok');
    log('Share the Host Code with the client device', 'status-warn');
  } catch (error) {
    log('Failed to create host code: ' + error.message, 'status-err');
    ui.hostStatus.textContent = 'Failed to create host code';
    ui.hostStatus.className = 'speedtest-muted status-err';
  }
};

ui.copyOffer.onclick = () => {
  navigator.clipboard.writeText(ui.hostOffer.value).then(() => {
    log('Host code copied to clipboard', 'status-ok');
  }).catch(() => {
    log('Failed to copy to clipboard', 'status-err');
  });
};

ui.btnHostAccept.onclick = async () => {
  const responseCode = ui.clientAnswer.value.trim();
  if (!responseCode) {
    ui.hostStatus.textContent = 'Please paste the Client Response Code first';
    ui.hostStatus.className = 'speedtest-muted status-err';
    return;
  }
  
  try {
    log('Processing client response...', 'status-warn');
    const answer = JSON.parse(atob(responseCode));
    await pc.setRemoteDescription(answer);
    
    ui.hostStatus.textContent = 'Client response accepted - establishing connection...';
    ui.hostStatus.className = 'speedtest-muted status-ok';
    
    log('Client response accepted, waiting for connection...', 'status-ok');
  } catch (error) {
    log('Invalid Client Response Code: ' + error.message, 'status-err');
    ui.hostStatus.textContent = 'Invalid Client Response Code';
    ui.hostStatus.className = 'speedtest-muted status-err';
  }
};

ui.btnClientRespond.onclick = async () => {
  const hostCode = ui.hostCode.value.trim();
  if (!hostCode) {
    ui.clientStatus.textContent = 'Please paste Host Code first';
    ui.clientStatus.className = 'speedtest-muted status-err';
    return;
  }
  
  try {
    log('Processing host code...', 'status-warn');
    isHost = false;
    createPC();
    
    // Decode and process host offer
    const offer = JSON.parse(atob(hostCode));
    await pc.setRemoteDescription(offer);
    
    // Create answer
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    
    // Wait for ICE gathering
    await waitIceComplete(pc);
    
    // Encode answer for host
    const answerCode = btoa(JSON.stringify(pc.localDescription));
    ui.clientCode.value = answerCode;
    ui.copyAnswer.disabled = false;
    
    ui.clientStatus.textContent = 'Send Client Response Code back to Host';
    ui.clientStatus.className = 'speedtest-muted status-warn';
    
    log('Client response created successfully', 'status-ok');
    log('Send the Client Response Code back to the host', 'status-warn');
  } catch (error) {
    log('Invalid Host Code: ' + error.message, 'status-err');
    ui.clientStatus.textContent = 'Invalid Host Code';
    ui.clientStatus.className = 'speedtest-muted status-err';
  }
};

ui.copyAnswer.onclick = () => {
  navigator.clipboard.writeText(ui.clientCode.value).then(() => {
    log('Client response code copied to clipboard', 'status-ok');
  }).catch(() => {
    log('Failed to copy to clipboard', 'status-err');
  });
};

function onConnected() {
  connected = true;
  ui.btnStart.disabled = false;
  ui.kStatus.textContent = 'Connected';
  
  if (isHost) {
    ui.hostStatus.textContent = 'Connected to client - Ready to test!';
    ui.hostStatus.className = 'speedtest-muted status-ok';
  } else {
    ui.clientStatus.textContent = 'Connected to host - Ready to test!';
    ui.clientStatus.className = 'speedtest-muted status-ok';
  }
  
  log('🎉 Devices connected successfully!', 'status-ok');
  log('Configure test settings and click "Start Test"', 'status-warn');
}

// --- Test logic ----------------------------------------------------------
const test = {
  running: false,
  start: 0,
  durMs: 0,
  sentBytes: 0,
  recvBytes: 0,
  sentPkts: 0,
  recvPkts: 0,
  rtts: [],
};

function resetKpis() {
  ui.kThr.textContent = '–';
  ui.kLat.textContent = '–';
  ui.kLoss.textContent = '–';
}

ui.btnStart.onclick = () => {
  if (!connected || !dc || dc.readyState !== 'open') {
    log('Cannot start test - not connected', 'status-err');
    return;
  }
  
  log('Starting speed test...', 'status-ok');
  resetKpis();
  
  test.running = true;
  test.start = performance.now();
  test.durMs = (+ui.duration.value || 10) * 1000;
  test.sentBytes = test.recvBytes = test.sentPkts = test.recvPkts = 0;
  test.rtts.length = 0;
  
  ui.kStatus.textContent = 'Testing…';
  ui.btnStart.disabled = true;
  
  const dir = ui.direction.value;
  const transportMode = ui.reliability.value;
  
  log(`Test config: ${dir}, ${transportMode}, ${ui.duration.value}s`, 'status-warn');
  
  if (dir === 'host-to-client') {
    runRole(isHost ? 'sender' : 'receiver');
  } else if (dir === 'client-to-host') {
    runRole(isHost ? 'receiver' : 'sender');
  } else {
    // bidirectional
    runRole('sender');
  }
};

function pktHeader(ts, seq, payloadLen) {
  // 16 bytes header: [seq:uint32][ts:float64][len:uint32]
  const buf = new ArrayBuffer(16 + payloadLen);
  const view = new DataView(buf);
  view.setUint32(0, seq, true);
  view.setFloat64(4, ts, true);
  view.setUint32(12, payloadLen, true);
  return { buf, view, off: 16 };
}

function makePayload(len) {
  const buf = new Uint8Array(len);
  // Simple test pattern
  for (let i = 0; i < len; i += 4) {
    buf[i] = i & 255;
    buf[i + 1] = (i >> 8) & 255;
    buf[i + 2] = (i >> 16) & 255;
    buf[i + 3] = (i >> 24) & 255;
  }
  return buf;
}

let seqTx = 0;

async function runRole(role) {
  if (role === 'sender') {
    log('Running as sender...', 'status-ok');
    const chunkSize = 16384; // 16 KB chunks for good performance
    const chunk = makePayload(chunkSize);
    const endAt = test.start + test.durMs;
    
    seqTx = 0;
    
    while (performance.now() < endAt && test.running) {
      // Critical: Check buffer status to prevent overflow
      while (dc.bufferedAmount > dc.bufferedAmountLowThreshold) {
        await new Promise(resolve => {
          dc.addEventListener('bufferedamountlow', resolve, { once: true });
        });
      }
      
      const now = performance.now();
      const { buf, off } = pktHeader(now, seqTx++, chunk.byteLength);
      new Uint8Array(buf, off).set(chunk);
      
      try {
        dc.send(buf);
        test.sentPkts++;
        test.sentBytes += buf.byteLength;
      } catch (e) {
        log('Send error: ' + e, 'status-err');
        break;
      }
      
      // Yield to event loop periodically
      if (seqTx % 64 === 0) {
        await new Promise(r => setTimeout(r, 0));
      }
      
      updateKpis();
    }
    
    log('Sender finished', 'status-ok');
    finish();
  } else {
    log('Running as receiver...', 'status-ok');
    // Receiver just waits and measures incoming data
    setTimeout(() => {
      if (test.running) finish();
    }, test.durMs + 200); // Safety stop
  }
}

function onData(ev) {
  const data = ev.data;
  if (!(data instanceof ArrayBuffer)) return; // ignore non-binary data
  
  const view = new DataView(data);
  const seq = view.getUint32(0, true);
  const ts = view.getFloat64(4, true);
  const len = view.getUint32(12, true);
  
  test.recvPkts++;
  test.recvBytes += data.byteLength;
  
  // Calculate round-trip time
  const rtt = performance.now() - ts;
  if (rtt > 0 && rtt < 20000) { // reasonable RTT range
    test.rtts.push(rtt);
  }
  
  updateKpis();
}

function updateKpis() {
  const elapsed = (performance.now() - test.start) / 1000;
  if (elapsed <= 0) return;
  
  // Calculate throughput in Mbps
  const bits = 8 * Math.max(test.recvBytes, test.sentBytes);
  const mbps = bits / elapsed / 1e6;
  ui.kThr.textContent = mbps.toFixed(2) + ' Mbps';
  
  // Calculate average latency
  if (test.rtts.length) {
    const avg = test.rtts.reduce((a, b) => a + b, 0) / test.rtts.length;
    ui.kLat.textContent = avg.toFixed(1) + ' ms';
  }
  
  // Calculate packet loss for unreliable mode
  if (ui.reliability.value === 'unreliable' && test.sentPkts) {
    const loss = (1 - (test.recvPkts / test.sentPkts)) * 100;
    ui.kLoss.textContent = loss < 0 ? '0%' : loss.toFixed(2) + '%';
  } else {
    ui.kLoss.textContent = 'N/A';
  }
}

function finish() {
  if (!test.running) return;
  test.running = false;
  ui.btnStart.disabled = false;
  ui.kStatus.textContent = 'Complete';
  
  updateKpis();
  
  const finalThroughput = ui.kThr.textContent;
  const finalLatency = ui.kLat.textContent;
  const finalLoss = ui.kLoss.textContent;
  
  log('═══════════════════════════════════', 'status-ok');
  log(`🏁 Test completed: ${finalThroughput}`, 'status-ok');
  log(`📊 Latency: ${finalLatency}`, 'status-ok');
  log(`📉 Loss: ${finalLoss}`, 'status-ok');
  log(`📦 Sent: ${(test.sentBytes / 1e6).toFixed(2)} MB`, 'status-ok');
  log(`📥 Received: ${(test.recvBytes / 1e6).toFixed(2)} MB`, 'status-ok');
  log(`📨 Packets sent: ${test.sentPkts.toLocaleString()}`, 'status-ok');
  log(`📬 Packets received: ${test.recvPkts.toLocaleString()}`, 'status-ok');
  log('═══════════════════════════════════', 'status-ok');
  
  if (test.rtts.length > 5) {
    const minRtt = Math.min(...test.rtts);
    const maxRtt = Math.max(...test.rtts);
    const avgRtt = test.rtts.reduce((a, b) => a + b, 0) / test.rtts.length;
    log(`RTT - Min: ${minRtt.toFixed(1)}ms, Avg: ${avgRtt.toFixed(1)}ms, Max: ${maxRtt.toFixed(1)}ms`, 'status-ok');
  }
}

// Initialize mobile menu functionality
function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
    
    document.querySelectorAll('.nav-menu a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
    
    document.addEventListener('click', (event) => {
      if (!hamburger.contains(event.target) && !navMenu.contains(event.target)) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
      }
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  
  // Check for WebRTC support
  if (!window.RTCPeerConnection) {
    log('❌ WebRTC not supported in this browser', 'status-err');
    log('Please use Chrome, Firefox, Safari, or Edge', 'status-err');
    return;
  }
  
  if (!navigator.clipboard) {
    log('⚠️  Clipboard API not available - manual copy required', 'status-warn');
  }
  
  log('✅ WebRTC LAN Speed Test ready', 'status-ok');
  log('👆 Create Host Code or paste Host Code to begin', 'status-warn');
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { log, ui, test };
}
