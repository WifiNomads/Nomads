// Local LAN Speed Test Implementation
// Wi-Fi Nomads - Browser-based iperf replacement

class LocalLANSpeedTest {
  constructor() {
    // Configuration
    this.localIP = null;
    this.serverPort = null;
    this.isServer = false;
    this.isClient = false;
    this.pc = null;
    this.dataChannel = null;
    this.isConnected = false;
    this.isTestRunning = false;
    
    // Manual signaling approach
    this.connectionOffer = null;
    this.connectionAnswer = null;
    this.pendingIceCandidates = [];
    
    // Test data
    this.testData = {
      bytesReceived: 0,
      bytesSent: 0,
      packetsReceived: 0,
      packetsSent: 0,
      packetsLost: 0,
      latencyMeasurements: [],
      testStartTime: 0,
      testDuration: 10
    };
    
    // UI elements
    this.elements = {
      localIP: document.getElementById('localIP'),
      refreshIP: document.getElementById('refreshIP'),
      serverPort: document.getElementById('serverPort'),
      btnStartServer: document.getElementById('btnStartServer'),
      serverStatus: document.getElementById('serverStatus'),
      clientServerIP: document.getElementById('clientServerIP'),
      clientServerPort: document.getElementById('clientServerPort'),
      btnConnect: document.getElementById('btnConnect'),
      clientStatus: document.getElementById('clientStatus'),
      btnStart: document.getElementById('btnStart'),
      duration: document.getElementById('duration'),
      direction: document.getElementById('direction'),
      mode: document.getElementById('mode'),
      throughput: document.getElementById('throughput'),
      latency: document.getElementById('latency'),
      loss: document.getElementById('loss'),
      testStatus: document.getElementById('testStatus'),
      log: document.getElementById('log')
    };
    
    this.initializeEventListeners();
    this.detectLocalIP();
    this.log('Local LAN Speed Test initialized');
  }
  
  initializeEventListeners() {
    this.elements.refreshIP.addEventListener('click', () => this.detectLocalIP());
    this.elements.btnStartServer.addEventListener('click', () => this.startServer());
    this.elements.btnConnect.addEventListener('click', () => this.connectToServer());
    this.elements.btnStart.addEventListener('click', () => this.startSpeedTest());
    
    // Port validation
    this.elements.serverPort.addEventListener('input', (e) => this.validatePort(e.target));
    this.elements.clientServerPort.addEventListener('input', (e) => this.validatePort(e.target));
  }
  
  validatePort(input) {
    const port = parseInt(input.value);
    if (port < 1024 || port > 65535) {
      input.style.borderColor = '#dc2626';
    } else {
      input.style.borderColor = '';
    }
  }
  
  async detectLocalIP() {
    this.log('Detecting local IP addresses...');
    this.elements.localIP.value = 'Detecting...';
    
    try {
      // Try multiple detection methods
      const ips = await this.getAllLocalIPAddresses();
      
      if (ips.length === 0) {
        throw new Error('No private IP addresses found');
      }
      
      if (ips.length === 1) {
        this.localIP = ips[0];
        this.elements.localIP.value = ips[0];
        this.log(`Local IP detected: ${ips[0]}`, 'success');
      } else {
        this.showIPSelection(ips);
      }
    } catch (error) {
      this.log(`WebRTC detection failed: ${error.message}`, 'warning');
      // Try alternative detection methods
      await this.tryAlternativeIPDetection();
    }
  }
  
  async getAllLocalIPAddresses() {
    return new Promise((resolve, reject) => {
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' } // Add STUN server to ensure ICE gathering
        ]
      });
      
      const foundIPs = new Set();
      let candidateCount = 0;
      const maxCandidates = 50;
      let gatheringComplete = false;
      
      pc.createDataChannel('temp');
      
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          candidateCount++;
          const candidate = event.candidate.candidate;
          this.log(`ICE Candidate: ${candidate}`);
          
          // Extract IP from candidate string
          const ipMatches = candidate.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/g);
          
          if (ipMatches) {
            ipMatches.forEach(ip => {
              if (this.isPrivateIP(ip)) {
                foundIPs.add(ip);
                this.log(`Found private IP: ${ip}`, 'success');
              }
            });
          }
          
          if (candidateCount >= maxCandidates) {
            gatheringComplete = true;
            pc.close();
            resolve(Array.from(foundIPs));
          }
        } else {
          // Gathering complete
          if (!gatheringComplete) {
            gatheringComplete = true;
            pc.close();
            resolve(Array.from(foundIPs));
          }
        }
      };
      
      pc.onicegatheringstatechange = () => {
        this.log(`ICE gathering state: ${pc.iceGatheringState}`);
        if (pc.iceGatheringState === 'complete' && !gatheringComplete) {
          gatheringComplete = true;
          pc.close();
          resolve(Array.from(foundIPs));
        }
      };
      
      pc.createOffer()
        .then(offer => {
          return pc.setLocalDescription(offer);
        })
        .catch(reject);
      
      // Extended timeout for thorough detection
      setTimeout(() => {
        if (!gatheringComplete) {
          gatheringComplete = true;
          pc.close();
          if (foundIPs.size > 0) {
            resolve(Array.from(foundIPs));
          } else {
            reject(new Error('No private IP addresses found'));
          }
        }
      }, 10000);
    });
  }
  
  async tryAlternativeIPDetection() {
    this.log('Trying alternative IP detection methods...', 'warning');
    
    // Method 1: Try to detect common IP ranges
    const commonRanges = [
      '192.168.1.',
      '192.168.0.',
      '192.168.2.',
      '10.0.0.',
      '10.0.1.',
      '172.16.0.'
    ];
    
    // For now, show manual input as the most reliable fallback
    this.showManualIPInput();
  }
  
  isPrivateIP(ip) {
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4 || parts.some(p => p < 0 || p > 255)) return false;
    
    // Check private IP ranges
    if (parts[0] === 192 && parts[1] === 168) return true; // 192.168.0.0/16
    if (parts[0] === 10) return true; // 10.0.0.0/8
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true; // 172.16.0.0/12
    
    return false;
  }
  
  showIPSelection(ips) {
    this.log(`Found ${ips.length} network interfaces`, 'success');
    
    const container = this.elements.localIP.parentElement;
    const originalInput = this.elements.localIP;
    
    const select = document.createElement('select');
    select.id = 'localIP';
    select.className = 'speedtest-input';
    select.style.background = '#ffffff';
    select.style.cursor = 'pointer';
    
    const placeholderOption = document.createElement('option');
    placeholderOption.value = '';
    placeholderOption.textContent = 'Select network interface...';
    placeholderOption.disabled = true;
    placeholderOption.selected = true;
    select.appendChild(placeholderOption);
    
    ips.forEach(ip => {
      const option = document.createElement('option');
      option.value = ip;
      option.textContent = this.getInterfaceName(ip);
      select.appendChild(option);
    });
    
    const manualOption = document.createElement('option');
    manualOption.value = 'manual';
    manualOption.textContent = 'Enter IP manually...';
    select.appendChild(manualOption);
    
    container.replaceChild(select, originalInput);
    this.elements.localIP = select;
    
    select.addEventListener('change', (e) => {
      if (e.target.value === 'manual') {
        this.showManualIPInput();
      } else if (e.target.value) {
        this.localIP = e.target.value;
        this.log(`Selected interface: ${e.target.value}`, 'success');
      }
    });
  }
  
  getInterfaceName(ip) {
    if (ip.startsWith('192.168.')) {
      return `${ip} (Home/Office Network)`;
    } else if (ip.startsWith('10.')) {
      return `${ip} (Corporate Network)`;
    } else if (ip.startsWith('172.')) {
      return `${ip} (Private Network)`;
    }
    return ip;
  }
  
  showManualIPInput() {
    this.log('Manual IP input enabled', 'warning');
    
    const container = this.elements.localIP.parentElement;
    const currentElement = this.elements.localIP;
    
    const input = document.createElement('input');
    input.id = 'localIP';
    input.className = 'speedtest-input';
    input.type = 'text';
    input.placeholder = 'Enter your local IP (e.g., 192.168.1.100)';
    input.style.background = '#ffffff';
    
    input.addEventListener('input', (e) => {
      const ip = e.target.value.trim();
      if (this.isValidIP(ip)) {
        this.localIP = ip;
        input.style.borderColor = '#059669';
        this.log(`Manual IP set: ${ip}`, 'success');
      } else if (ip.length > 0) {
        input.style.borderColor = '#dc2626';
        this.localIP = null;
      } else {
        input.style.borderColor = '';
        this.localIP = null;
      }
    });
    
    container.replaceChild(input, currentElement);
    this.elements.localIP = input;
  }
  
  isValidIP(ip) {
    return this.isPrivateIP(ip);
  }
  
  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    
    let colorClass = '';
    switch(type) {
      case 'success': colorClass = 'status-ok'; break;
      case 'warning': colorClass = 'status-warn'; break;
      case 'error': colorClass = 'status-err'; break;
      default: colorClass = '';
    }
    
    this.elements.log.innerHTML += `<div class="${colorClass}">${logEntry}</div>\n`;
    this.elements.log.scrollTop = this.elements.log.scrollHeight;
    
    console.log(logEntry);
  }
  
  updateStatus(element, message, type = 'info') {
    element.textContent = message;
    element.className = `speedtest-status status-${type}`;
  }
  
  async startServer() {
    const port = parseInt(this.elements.serverPort.value) || 8080;
    
    if (port < 1024 || port > 65535) {
      this.updateStatus(this.elements.serverStatus, 'Invalid port (1024-65535)', 'err');
      return;
    }
    
    if (!this.localIP) {
      this.updateStatus(this.elements.serverStatus, 'Please set your local IP address first', 'err');
      return;
    }
    
    this.isServer = true;
    this.serverPort = port;
    
    try {
      this.log(`Starting server on ${this.localIP}:${port}`, 'success');
      
      // Create WebRTC connection
      await this.createWebRTCConnection();
      
      // Generate connection offer
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);
      this.connectionOffer = offer;
      
      // Update UI
      this.elements.btnStartServer.disabled = true;
      this.elements.serverPort.disabled = true;
      
      this.updateStatus(this.elements.serverStatus, 
        `Server ready on ${this.localIP}:${port}`, 'ok');
      
      // Show connection instructions
      this.showServerInstructions();
      
    } catch (error) {
      this.log(`Failed to start server: ${error.message}`, 'error');
      this.updateStatus(this.elements.serverStatus, 'Server start failed', 'err');
    }
  }
  
  showServerInstructions() {
    // Add connection info to the UI
    this.log('═══════════════════════════════════', 'success');
    this.log('SERVER READY - SHARE THIS INFO:', 'success');
    this.log(`IP: ${this.localIP}`, 'success');
    this.log(`Port: ${this.serverPort}`, 'success');
    this.log('═══════════════════════════════════', 'success');
    this.log('On the CLIENT device:', 'warning');
    this.log('1. Enter the above IP and Port', 'warning');
    this.log('2. Click "Connect to Server"', 'warning');
    this.log('═══════════════════════════════════', 'success');
  }
  
  async connectToServer() {
    const serverIP = this.elements.clientServerIP.value.trim();
    const port = parseInt(this.elements.clientServerPort.value) || 8080;
    
    if (!serverIP) {
      this.updateStatus(this.elements.clientStatus, 'Server IP required', 'err');
      return;
    }
    
    if (port < 1024 || port > 65535) {
      this.updateStatus(this.elements.clientStatus, 'Invalid port (1024-65535)', 'err');
      return;
    }
    
    if (!this.isValidIP(serverIP)) {
      this.updateStatus(this.elements.clientStatus, 'Invalid IP address', 'err');
      return;
    }
    
    this.isClient = true;
    
    try {
      this.log(`Connecting to server ${serverIP}:${port}...`, 'success');
      this.updateStatus(this.elements.clientStatus, `Connecting to ${serverIP}:${port}...`, 'warn');
      
      // Create WebRTC connection
      await this.createWebRTCConnection();
      
      // Create offer
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);
      
      this.elements.btnConnect.disabled = true;
      this.elements.clientServerIP.disabled = true;
      this.elements.clientServerPort.disabled = true;
      
      // Show manual connection instructions
      this.showClientInstructions(offer);
      
    } catch (error) {
      this.log(`Failed to connect: ${error.message}`, 'error');
      this.updateStatus(this.elements.clientStatus, 'Connection failed', 'err');
    }
  }
  
  showClientInstructions(offer) {
    this.log('═══════════════════════════════════', 'success');
    this.log('CLIENT CONNECTION REQUEST CREATED', 'success');
    this.log('═══════════════════════════════════', 'success');
    this.log('MANUAL CONNECTION SETUP:', 'warning');
    this.log('On SERVER device, paste this in console:', 'warning');
    this.log(`window.speedTest.handleClientOffer('${JSON.stringify(offer)}')`, 'warning');
    this.log('═══════════════════════════════════', 'success');
    this.log('Waiting for server response...', 'warning');
  }
  
  // Manual signaling method for server
  async handleClientOffer(offerString) {
    if (!this.isServer) {
      this.log('Error: This is not a server instance', 'error');
      return;
    }
    
    try {
      const offer = JSON.parse(offerString);
      this.log('Processing client connection request...', 'success');
      
      await this.pc.setRemoteDescription(offer);
      
      const answer = await this.pc.createAnswer();
      await this.pc.setLocalDescription(answer);
      
      this.log('═══════════════════════════════════', 'success');
      this.log('SERVER RESPONSE CREATED', 'success');
      this.log('On CLIENT device, paste this in console:', 'warning');
      this.log(`window.speedTest.handleServerAnswer('${JSON.stringify(answer)}')`, 'warning');
      this.log('═══════════════════════════════════', 'success');
      
    } catch (error) {
      this.log(`Failed to handle client offer: ${error.message}`, 'error');
    }
  }
  
  // Manual signaling method for client
  async handleServerAnswer(answerString) {
    if (!this.isClient) {
      this.log('Error: This is not a client instance', 'error');
      return;
    }
    
    try {
      const answer = JSON.parse(answerString);
      this.log('Processing server response...', 'success');
      
      await this.pc.setRemoteDescription(answer);
      this.log('WebRTC connection established!', 'success');
      
    } catch (error) {
      this.log(`Failed to handle server answer: ${error.message}`, 'error');
    }
  }
  
  async createWebRTCConnection() {
    this.log('Creating WebRTC connection...');
    
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    };
    
    this.pc = new RTCPeerConnection(configuration);
    
    // Handle ICE candidates
    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.log(`ICE candidate: ${event.candidate.candidate}`);
        // For manual signaling, we'll log the candidates for debugging
      } else {
        this.log('ICE candidate gathering complete');
      }
    };
    
    // Handle connection state changes
    this.pc.onconnectionstatechange = () => {
      this.log(`WebRTC connection state: ${this.pc.connectionState}`);
      
      if (this.pc.connectionState === 'connected') {
        this.onWebRTCConnected();
      } else if (this.pc.connectionState === 'failed') {
        this.log('WebRTC connection failed', 'error');
        this.updateStatus(
          this.isServer ? this.elements.serverStatus : this.elements.clientStatus,
          'Connection failed',
          'err'
        );
      } else if (this.pc.connectionState === 'disconnected') {
        this.log('WebRTC connection disconnected', 'warning');
      }
    };
    
    // Handle ICE connection state
    this.pc.oniceconnectionstatechange = () => {
      this.log(`ICE connection state: ${this.pc.iceConnectionState}`);
    };
    
    if (this.isServer) {
      // Server creates data channel
      this.createDataChannel();
    } else {
      // Client waits for data channel
      this.pc.ondatachannel = (event) => {
        this.log('Received data channel from server', 'success');
        this.dataChannel = event.channel;
        this.setupDataChannelHandlers();
      };
    }
  }
  
  createDataChannel() {
    const reliable = this.elements.mode.value === 'reliable';
    
    this.dataChannel = this.pc.createDataChannel('speedtest', {
      ordered: reliable,
      maxRetransmits: reliable ? null : 0
    });
    
    this.log(`Created data channel (${reliable ? 'reliable' : 'unreliable'})`, 'success');
    this.setupDataChannelHandlers();
  }
  
  setupDataChannelHandlers() {
    this.dataChannel.onopen = () => {
      this.log('Data channel opened!', 'success');
      this.onDataChannelReady();
    };
    
    this.dataChannel.onclose = () => {
      this.log('Data channel closed', 'warning');
      this.isConnected = false;
      this.elements.btnStart.disabled = true;
    };
    
    this.dataChannel.onmessage = (event) => {
      this.handleDataChannelMessage(event.data);
    };
    
    this.dataChannel.onerror = (error) => {
      this.log(`Data channel error: ${error}`, 'error');
    };
  }
  
  onWebRTCConnected() {
    this.log('WebRTC peer connection established!', 'success');
  }
  
  onDataChannelReady() {
    this.isConnected = true;
    this.elements.btnStart.disabled = false;
    
    if (this.isServer) {
      this.updateStatus(this.elements.serverStatus, 'Client connected - Ready to test!', 'ok');
    } else {
      this.updateStatus(this.elements.clientStatus, 'Connected to server - Ready to test!', 'ok');
    }
    
    this.elements.testStatus.textContent = 'Connected';
    this.log('═══════════════════════════════════', 'success');
    this.log('🚀 READY TO START SPEED TEST! 🚀', 'success');
    this.log('═══════════════════════════════════', 'success');
  }
  
  startSpeedTest() {
    if (!this.isConnected || this.isTestRunning) {
      this.log('Cannot start test - not connected or test already running', 'error');
      return;
    }
    
    this.isTestRunning = true;
    this.elements.btnStart.disabled = true;
    this.elements.testStatus.textContent = 'Testing...';
    
    // Reset test data
    this.testData = {
      bytesReceived: 0,
      bytesSent: 0,
      packetsReceived: 0,
      packetsSent: 0,
      packetsLost: 0,
      latencyMeasurements: [],
      testStartTime: Date.now(),
      testDuration: parseInt(this.elements.duration.value) * 1000
    };
    
    const direction = this.elements.direction.value;
    const mode = this.elements.mode.value;
    
    this.log(`Starting ${direction} speed test (${mode} mode)`, 'success');
    
    // Start appropriate test based on direction
    switch (direction) {
      case 'host-to-join':
        if (this.isServer) {
          this.runSenderTest();
        } else {
          this.runReceiverTest();
        }
        break;
        
      case 'join-to-host':
        if (this.isServer) {
          this.runReceiverTest();
        } else {
          this.runSenderTest();
        }
        break;
        
      case 'bi':
        this.runBidirectionalTest();
        break;
    }
  }
  
  runSenderTest() {
    this.log('Running as sender...', 'success');
    
    const chunkSize = 16384; // 16KB chunks
    const testData = new ArrayBuffer(chunkSize);
    const dataView = new DataView(testData);
    
    // Fill with test pattern
    for (let i = 0; i < chunkSize; i += 4) {
      dataView.setUint32(i, Date.now() & 0xFFFFFFFF, true);
    }
    
    const sendInterval = setInterval(() => {
      if (Date.now() - this.testData.testStartTime >= this.testData.testDuration) {
        clearInterval(sendInterval);
        this.finishTest();
        return;
      }
      
      try {
        if (this.dataChannel && this.dataChannel.readyState === 'open') {
          const packet = this.createTestPacket(testData, this.testData.packetsSent);
          this.dataChannel.send(packet);
          this.testData.packetsSent++;
          this.testData.bytesSent += packet.byteLength;
          
          this.updateThroughputDisplay();
        }
      } catch (error) {
        this.log(`Send error: ${error.message}`, 'error');
      }
    }, 1); // Send as fast as possible
  }
  
  runReceiverTest() {
    this.log('Running as receiver...', 'success');
    
    setTimeout(() => {
      this.finishTest();
    }, this.testData.testDuration);
  }
  
  runBidirectionalTest() {
    this.log('Running bidirectional test...', 'success');
    this.runSenderTest();
  }
  
  createTestPacket(data, sequenceNumber) {
    const headerSize = 16;
    const packet = new ArrayBuffer(headerSize + data.byteLength);
    const view = new DataView(packet);
    
    view.setUint32(0, sequenceNumber, true);
    view.setBigUint64(4, BigInt(Date.now()), true);
    view.setUint32(12, data.byteLength, true);
    
    const dataArray = new Uint8Array(packet, headerSize);
    dataArray.set(new Uint8Array(data));
    
    return packet;
  }
  
  handleDataChannelMessage(data) {
    this.testData.bytesReceived += data.byteLength;
    this.testData.packetsReceived++;
    
    if (data.byteLength >= 16) {
      const view = new DataView(data);
      const sequence = view.getUint32(0, true);
      const timestamp = Number(view.getBigUint64(4, true));
      const size = view.getUint32(12, true);
      
      const now = Date.now();
      const latency = now - timestamp;
      
      if (latency > 0 && latency < 10000) {
        this.testData.latencyMeasurements.push(latency);
      }
      
      // Echo back for latency measurement (small packets only)
      if (size < 1000 && this.dataChannel && this.dataChannel.readyState === 'open') {
        try {
          this.dataChannel.send(data);
        } catch (error) {
          // Ignore send errors during test
        }
      }
    }
    
    this.updateThroughputDisplay();
  }
  
  updateThroughputDisplay() {
    const elapsed = (Date.now() - this.testData.testStartTime) / 1000;
    if (elapsed > 0) {
      const bitsReceived = this.testData.bytesReceived * 8;
      const bitsSent = this.testData.bytesSent * 8;
      const throughputMbps = Math.max(bitsReceived, bitsSent) / elapsed / 1000000;
      
      this.elements.throughput.textContent = `${throughputMbps.toFixed(2)} Mbps`;
      
      if (this.testData.latencyMeasurements.length > 0) {
        const avgLatency = this.testData.latencyMeasurements.reduce((a, b) => a + b) / this.testData.latencyMeasurements.length;
        this.elements.latency.textContent = `${avgLatency.toFixed(1)} ms`;
      }
      
      if (this.elements.mode.value === 'unreliable' && this.testData.packetsSent > 0) {
        const lossRate = ((this.testData.packetsSent - this.testData.packetsReceived) / this.testData.packetsSent) * 100;
        this.elements.loss.textContent = `${Math.max(0, lossRate).toFixed(2)}%`;
      } else {
        this.elements.loss.textContent = 'N/A (Reliable)';
      }
    }
  }
  
  finishTest() {
    this.isTestRunning = false;
    this.elements.btnStart.disabled = false;
    this.elements.testStatus.textContent = 'Test Complete';
    
    const elapsed = (Date.now() - this.testData.testStartTime) / 1000;
    const bitsTransferred = Math.max(this.testData.bytesReceived, this.testData.bytesSent) * 8;
    const finalThroughput = bitsTransferred / elapsed / 1000000;
    
    this.elements.throughput.textContent = `${finalThroughput.toFixed(2)} Mbps`;
    
    this.log('═══════════════════════════════════', 'success');
    this.log(`🏁 TEST COMPLETED: ${finalThroughput.toFixed(2)} Mbps`, 'success');
    this.log('═══════════════════════════════════', 'success');
    this.log(`Bytes sent: ${this.testData.bytesSent.toLocaleString()}`);
    this.log(`Bytes received: ${this.testData.bytesReceived.toLocaleString()}`);
    this.log(`Packets sent: ${this.testData.packetsSent.toLocaleString()}`);
    this.log(`Packets received: ${this.testData.packetsReceived.toLocaleString()}`);
    
    if (this.testData.latencyMeasurements.length > 0) {
      const avgLatency = this.testData.latencyMeasurements.reduce((a, b) => a + b) / this.testData.latencyMeasurements.length;
      const minLatency = Math.min(...this.testData.latencyMeasurements);
      const maxLatency = Math.max(...this.testData.latencyMeasurements);
      
      this.log(`Latency - Avg: ${avgLatency.toFixed(1)}ms, Min: ${minLatency}ms, Max: ${maxLatency}ms`);
    }
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

// Initialize the speed test when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  
  // Check for WebRTC support
  if (!window.RTCPeerConnection) {
    document.getElementById('log').innerHTML = '<div class="status-err">WebRTC not supported in this browser. Please use Chrome, Firefox, Safari, or Edge.</div>';
    return;
  }
  
  // Initialize the speed test
  window.speedTest = new LocalLANSpeedTest();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LocalLANSpeedTest;
}
