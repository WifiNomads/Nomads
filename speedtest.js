// WebRTC LAN Speed Test Implementation
// Wi-Fi Nomads - Pure WebRTC, no servers required
// Following comprehensive specifications for local network testing

class WebRTCLANSpeedTest {
  constructor() {
    // WebRTC components
    this.pc = null;
    this.dataChannel = null;
    this.isHost = false;
    this.connected = false;
    
    // QR Scanner instances
    this.offerScanner = null;
    this.answerScanner = null;
    
    // Test state
    this.testRunning = false;
    this.testStartTime = 0;
    this.testData = {
      bytesSent: 0,
      bytesReceived: 0,
      packetsSent: 0,
      packetsReceived: 0,
      latencies: []
    };
    
    // UI elements
    this.ui = {
      // Security
      securityWarning: document.getElementById('securityWarning'),
      
      // Step indicator
      stepIndicator: document.getElementById('stepIndicator'),
      
      // Host elements
      btnCreateOffer: document.getElementById('btnCreateOffer'),
      offerSection: document.getElementById('offerSection'),
      qrCanvas: document.getElementById('qrCanvas'),
      btnCopyOffer: document.getElementById('btnCopyOffer'),
      btnShowOfferText: document.getElementById('btnShowOfferText'),
      offerTextSection: document.getElementById('offerTextSection'),
      offerText: document.getElementById('offerText'),
      answerInput: document.getElementById('answerInput'),
      btnAcceptAnswer: document.getElementById('btnAcceptAnswer'),
      btnScanAnswer: document.getElementById('btnScanAnswer'),
      answerScanSection: document.getElementById('answerScanSection'),
      answerVideo: document.getElementById('answerVideo'),
      btnStopAnswerScan: document.getElementById('btnStopAnswerScan'),
      hostStatus: document.getElementById('hostStatus'),
      
      // Client elements
      btnScanOffer: document.getElementById('btnScanOffer'),
      btnManualOffer: document.getElementById('btnManualOffer'),
      offerScanSection: document.getElementById('offerScanSection'),
      offerVideo: document.getElementById('offerVideo'),
      btnStopOfferScan: document.getElementById('btnStopOfferScan'),
      manualOfferSection: document.getElementById('manualOfferSection'),
      offerInput: document.getElementById('offerInput'),
      btnProcessOffer: document.getElementById('btnProcessOffer'),
      responseSection: document.getElementById('responseSection'),
      responseQR: document.getElementById('responseQR'),
      btnCopyResponse: document.getElementById('btnCopyResponse'),
      btnShowResponseText: document.getElementById('btnShowResponseText'),
      responseTextSection: document.getElementById('responseTextSection'),
      responseText: document.getElementById('responseText'),
      clientStatus: document.getElementById('clientStatus'),
      
      // Test configuration
      testConfigCard: document.getElementById('testConfigCard'),
      testDuration: document.getElementById('testDuration'),
      testDirection: document.getElementById('testDirection'),
      transportMode: document.getElementById('transportMode'),
      btnStartTest: document.getElementById('btnStartTest'),
      
      // Test progress and results
      testProgress: document.getElementById('testProgress'),
      progressFill: document.getElementById('progressFill'),
      progressText: document.getElementById('progressText'),
      throughputResult: document.getElementById('throughputResult'),
      latencyResult: document.getElementById('latencyResult'),
      dataResult: document.getElementById('dataResult'),
      statusResult: document.getElementById('statusResult'),
      
      // Debug log
      debugLog: document.getElementById('debugLog')
    };
    
    this.initializeEventListeners();
    this.checkSecureContext();
    this.log('✅ WebRTC LAN Speed Test initialized');
    this.log('📋 Requirements: Both devices on same Wi-Fi/LAN network');
  }
  
  initializeEventListeners() {
    // Host controls
    this.ui.btnCreateOffer.addEventListener('click', () => this.createOffer());
    this.ui.btnCopyOffer.addEventListener('click', () => this.copyToClipboard(this.ui.offerText.value));
    this.ui.btnShowOfferText.addEventListener('click', () => this.toggleElement(this.ui.offerTextSection));
    this.ui.btnAcceptAnswer.addEventListener('click', () => this.acceptAnswer());
    this.ui.btnScanAnswer.addEventListener('click', () => this.startAnswerScanning());
    this.ui.btnStopAnswerScan.addEventListener('click', () => this.stopAnswerScanning());
    
    // Client controls
    this.ui.btnScanOffer.addEventListener('click', () => this.startOfferScanning());
    this.ui.btnManualOffer.addEventListener('click', () => this.showManualOfferInput());
    this.ui.btnStopOfferScan.addEventListener('click', () => this.stopOfferScanning());
    this.ui.btnProcessOffer.addEventListener('click', () => this.processOffer());
    this.ui.btnCopyResponse.addEventListener('click', () => this.copyToClipboard(this.ui.responseText.value));
    this.ui.btnShowResponseText.addEventListener('click', () => this.toggleElement(this.ui.responseTextSection));
    
    // Test controls
    this.ui.btnStartTest.addEventListener('click', () => this.startSpeedTest());
  }
  
  checkSecureContext() {
    if (!window.isSecureContext) {
      this.ui.securityWarning.style.display = 'block';
      this.log('❌ Insecure context detected', 'status-err');
      this.log('💡 Serve from HTTPS or localhost for WebRTC access', 'status-warn');
      return false;
    }
    
    if (!window.RTCPeerConnection) {
      this.log('❌ WebRTC not supported in this browser', 'status-err');
      this.log('💡 Please use Chrome 24+, Firefox 22+, Safari 11+, or Edge', 'status-warn');
      return false;
    }
    
    return true;
  }
  
  log(message, className = '') {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    
    const logElement = document.createElement('div');
    if (className) logElement.className = className;
    logElement.textContent = logEntry;
    
    this.ui.debugLog.appendChild(logElement);
    this.ui.debugLog.scrollTop = this.ui.debugLog.scrollHeight;
    
    console.log(logEntry);
  }
  
  updateStatus(element, message, className = '') {
    element.textContent = message;
    element.className = `speedtest-muted ${className}`;
  }
  
  toggleElement(element) {
    element.style.display = element.style.display === 'none' ? 'block' : 'none';
  }
  
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.log('📋 Code copied to clipboard', 'status-ok');
    } catch (error) {
      this.log('❌ Failed to copy to clipboard', 'status-err');
      // Fallback: select text for manual copy
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.body.removeChild(textArea);
    }
  }
  
  createPeerConnection() {
    // Pure LAN configuration - no STUN/TURN servers needed
    const config = { iceServers: [] };
    
    this.pc = new RTCPeerConnection(config);
    
    // Connection state monitoring
    this.pc.onconnectionstatechange = () => {
      this.log(`🔗 WebRTC connection state: ${this.pc.connectionState}`);
      
      if (this.pc.connectionState === 'connected') {
        this.onConnectionEstablished();
      } else if (this.pc.connectionState === 'failed') {
        this.log('❌ WebRTC connection failed', 'status-err');
        this.log('💡 Check if both devices are on the same network', 'status-warn');
        this.ui.statusResult.textContent = 'Connection Failed';
      } else if (this.pc.connectionState === 'disconnected') {
        this.log('⚠️ WebRTC connection disconnected', 'status-warn');
        this.connected = false;
        this.ui.btnStartTest.disabled = true;
        this.ui.statusResult.textContent = 'Disconnected';
      }
    };
    
    this.pc.oniceconnectionstatechange = () => {
      this.log(`🧊 ICE connection state: ${this.pc.iceConnectionState}`);
    };
    
    this.pc.onicegatheringstatechange = () => {
      this.log(`🔍 ICE gathering state: ${this.pc.iceGatheringState}`);
    };
    
    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.log(`🎯 ICE candidate: ${event.candidate.candidate}`);
      } else {
        this.log('✅ ICE candidate gathering complete');
      }
    };
    
    // Data channel handling for client
    this.pc.ondatachannel = (event) => {
      this.log('📨 Received data channel from host', 'status-ok');
      this.dataChannel = event.channel;
      this.setupDataChannel();
    };
  }
  
  async waitForICEGathering() {
    if (this.pc.iceGatheringState === 'complete') {
      return;
    }
    
    this.log('⏳ Waiting for ICE candidate gathering...');
    
    return new Promise((resolve) => {
      const checkGathering = () => {
        if (this.pc.iceGatheringState === 'complete') {
          this.pc.removeEventListener('icegatheringstatechange', checkGathering);
          resolve();
        }
      };
      
      this.pc.addEventListener('icegatheringstatechange', checkGathering);
      
      // Safety timeout
      setTimeout(() => {
        this.log('⏰ ICE gathering timeout, proceeding anyway', 'status-warn');
        resolve();
      }, 5000);
    });
  }
  
  async createOffer() {
    try {
      this.log('🏗️ Creating connection offer...', 'status-warn');
      this.isHost = true;
      
      this.createPeerConnection();
      
      // Host creates data channel proactively
      const transportReliable = this.ui.transportMode.value === 'reliable';
      const channelOptions = transportReliable ? 
        { ordered: true } : 
        { ordered: false, maxRetransmits: 0 };
      
      this.dataChannel = this.pc.createDataChannel('speedtest', channelOptions);
      this.dataChannel.binaryType = 'arraybuffer';
      this.setupDataChannel();
      
      // Create offer
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);
      
      // Wait for ICE gathering to complete
      await this.waitForICEGathering();
      
      // Create shareable code
      const offerCode = this.encodeSDPCode(this.pc.localDescription);
      this.ui.offerText.value = offerCode;
      
      // Generate QR code
      await this.generateQRCode(this.ui.qrCanvas, offerCode);
      
      // Show offer section
      this.ui.offerSection.style.display = 'block';
      this.ui.btnCreateOffer.disabled = true;
      
      this.updateStatus(this.ui.hostStatus, 'Share QR code or text with client device', 'status-warn');
      this.ui.stepIndicator.textContent = 'Step 1: Share offer with client device';
      
      this.log('✅ Connection offer created successfully', 'status-ok');
      this.log('📤 Share the QR code or text with the client device');
      
    } catch (error) {
      this.log(`❌ Failed to create offer: ${error.message}`, 'status-err');
      this.updateStatus(this.ui.hostStatus, 'Failed to create offer', 'status-err');
    }
  }
  
  async acceptAnswer() {
    const answerCode = this.ui.answerInput.value.trim();
    if (!answerCode) {
      this.updateStatus(this.ui.hostStatus, 'Please paste client response code', 'status-err');
      return;
    }
    
    try {
      this.log('🔄 Processing client response...', 'status-warn');
      
      const answerSDP = this.decodeSDPCode(answerCode);
      await this.pc.setRemoteDescription(new RTCSessionDescription(answerSDP));
      
      this.updateStatus(this.ui.hostStatus, 'Client response accepted - establishing connection...', 'status-ok');
      this.log('✅ Client response processed successfully', 'status-ok');
      
    } catch (error) {
      this.log(`❌ Invalid client response: ${error.message}`, 'status-err');
      this.updateStatus(this.ui.hostStatus, 'Invalid client response code', 'status-err');
    }
  }
  
  async startOfferScanning() {
    this.log('📷 Starting QR code scanner...', 'status-warn');
    
    try {
      // Check if QR scanner library is available
      await this.waitForQRLibraries();
      
      if (!window.QrScanner || !window.qrScannerReady) {
        throw new Error('QR Scanner library not available');
      }
      
      this.ui.offerScanSection.style.display = 'block';
      this.ui.manualOfferSection.style.display = 'none';
      
      // Request camera permissions first
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      this.ui.offerVideo.srcObject = stream;
      
      this.offerScanner = new QrScanner(
        this.ui.offerVideo,
        result => {
          this.log('📷 QR code scanned successfully', 'status-ok');
          const data = typeof result === 'string' ? result : result.data;
          this.processScannedOffer(data);
          this.stopOfferScanning();
        },
        {
          returnDetailedScanResult: false,
          highlightScanRegion: true,
          highlightCodeOutline: true
        }
      );
      
      await this.offerScanner.start();
      this.log('✅ QR scanner started successfully', 'status-ok');
      
    } catch (error) {
      this.log(`❌ QR scanner failed: ${error.message}`, 'status-err');
      this.log('💡 Falling back to manual input', 'status-warn');
      this.showManualOfferInput();
    }
  }
  
  stopOfferScanning() {
    if (this.offerScanner) {
      this.offerScanner.stop();
      this.offerScanner = null;
    }
    this.ui.offerScanSection.style.display = 'none';
  }
  
  showManualOfferInput() {
    this.ui.manualOfferSection.style.display = 'block';
    this.ui.offerScanSection.style.display = 'none';
    this.stopOfferScanning();
  }
  
  async processOffer() {
    const offerCode = this.ui.offerInput.value.trim();
    if (!offerCode) {
      this.updateStatus(this.ui.clientStatus, 'Please paste host connection code', 'status-err');
      return;
    }
    
    await this.processScannedOffer(offerCode);
  }
  
  async processScannedOffer(offerCode) {
    try {
      this.log('🔄 Processing host offer...', 'status-warn');
      this.isHost = false;
      
      this.createPeerConnection();
      
      // Decode and set remote description
      const offerSDP = this.decodeSDPCode(offerCode);
      await this.pc.setRemoteDescription(new RTCSessionDescription(offerSDP));
      
      // Create answer
      const answer = await this.pc.createAnswer();
      await this.pc.setLocalDescription(answer);
      
      // Wait for ICE gathering
      await this.waitForICEGathering();
      
      // Create response code
      const responseCode = this.encodeSDPCode(this.pc.localDescription);
      this.ui.responseText.value = responseCode;
      
      // Generate response QR code
      await this.generateQRCode(this.ui.responseQR, responseCode);
      
      // Show response section
      this.ui.responseSection.style.display = 'block';
      this.ui.manualOfferSection.style.display = 'none';
      
      this.updateStatus(this.ui.clientStatus, 'Share response code with host device', 'status-warn');
      this.log('✅ Response created - share with host device', 'status-ok');
      
    } catch (error) {
      this.log(`❌ Failed to process offer: ${error.message}`, 'status-err');
      this.updateStatus(this.ui.clientStatus, 'Invalid host connection code', 'status-err');
    }
  }
  
  startAnswerScanning() {
    this.ui.answerScanSection.style.display = 'block';
    
    QrScanner.createQrEngine().then(qrEngine => {
      this.answerScanner = new QrScanner(
        this.ui.answerVideo,
        result => {
          this.log('📷 Response QR code scanned', 'status-ok');
          this.ui.answerInput.value = result.data;
          this.acceptAnswer();
          this.stopAnswerScanning();
        },
        {
          returnDetailedScanResult: true,
          highlightScanRegion: true
        }
      );
      
      this.answerScanner.start().catch(error => {
        this.log(`❌ Camera access failed: ${error.message}`, 'status-err');
        this.stopAnswerScanning();
      });
    });
  }
  
  stopAnswerScanning() {
    if (this.answerScanner) {
      this.answerScanner.stop();
      this.answerScanner = null;
    }
    this.ui.answerScanSection.style.display = 'none';
  }
  
  setupDataChannel() {
    this.dataChannel.onopen = () => {
      this.log('🚀 Data channel opened successfully!', 'status-ok');
      this.onConnectionEstablished();
    };
    
    this.dataChannel.onclose = () => {
      this.log('🔌 Data channel closed', 'status-warn');
      this.connected = false;
      this.ui.btnStartTest.disabled = true;
      this.ui.statusResult.textContent = 'Disconnected';
    };
    
    this.dataChannel.onerror = (error) => {
      this.log(`❌ Data channel error: ${error}`, 'status-err');
    };
    
    this.dataChannel.onmessage = (event) => {
      this.handleIncomingData(event.data);
    };
    
    // Critical: Set buffer management for high-speed testing
    this.dataChannel.bufferedAmountLowThreshold = 32 * 1024; // 32KB threshold
    
    this.dataChannel.addEventListener('bufferedamountlow', () => {
      // Buffer is cleared, ready for more data
      if (this.testRunning) {
        this.continueDataTransmission();
      }
    });
  }
  
  onConnectionEstablished() {
    this.connected = true;
    this.ui.btnStartTest.disabled = false;
    this.ui.statusResult.textContent = 'Connected';
    
    // Show test configuration
    this.ui.testConfigCard.style.display = 'block';
    this.ui.stepIndicator.textContent = 'Step 2: Devices connected successfully!';
    
    if (this.isHost) {
      this.updateStatus(this.ui.hostStatus, 'Connected to client - Ready to test!', 'status-ok');
    } else {
      this.updateStatus(this.ui.clientStatus, 'Connected to host - Ready to test!', 'status-ok');
    }
    
    this.log('🎉 Peer-to-peer connection established!', 'status-ok');
    this.log('⚡ Ready to start speed test');
  }
  
  async generateQRCode(canvas, data) {
    try {
      // Wait for library to load if needed
      await this.waitForQRLibraries();
      
      if (window.QRCode && window.qrCodeReady) {
        this.log('📱 Generating QR code...', 'status-warn');
        await QRCode.toCanvas(canvas, data, {
          width: 200,
          margin: 1,
          color: {
            dark: '#1e3a8a',
            light: '#ffffff'
          }
        });
        this.log('✅ QR code generated successfully', 'status-ok');
      } else {
        throw new Error('QRCode library not available');
      }
    } catch (error) {
      this.log(`❌ QR code generation failed: ${error.message}`, 'status-err');
      this.showQRFallback(canvas, data);
    }
  }
  
  async waitForQRLibraries() {
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds
    
    while (attempts < maxAttempts) {
      if (window.qrCodeReady && window.qrScannerReady) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    if (!window.qrCodeReady) {
      this.log('⚠️ QR code generation library not loaded', 'status-warn');
    }
    if (!window.qrScannerReady) {
      this.log('⚠️ QR scanner library not loaded', 'status-warn');
    }
  }
  
  showQRFallback(canvas, data) {
    // Set canvas dimensions if not set
    if (!canvas.width || !canvas.height) {
      canvas.width = 200;
      canvas.height = 200;
    }
    
    // Show fallback message and text code
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#666';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('QR Code', canvas.width/2, canvas.height/2 - 10);
    ctx.fillText('Generation Failed', canvas.width/2, canvas.height/2 + 10);
    
    this.log('💡 Use "Show Text" button to copy connection code manually', 'status-warn');
    
    // Auto-show text section as fallback
    setTimeout(() => {
      if (canvas.id === 'qrCanvas') {
        this.ui.offerTextSection.style.display = 'block';
      } else if (canvas.id === 'responseQR') {
        this.ui.responseTextSection.style.display = 'block';
      }
    }, 1000);
  }
  
  encodeSDPCode(sdp) {
    // Create compact, shareable code
    return btoa(JSON.stringify(sdp));
  }
  
  decodeSDPCode(code) {
    try {
      return JSON.parse(atob(code));
    } catch (error) {
      throw new Error('Invalid connection code format');
    }
  }
  
  async startSpeedTest() {
    if (!this.connected || !this.dataChannel || this.dataChannel.readyState !== 'open') {
      this.log('❌ Cannot start test - not connected', 'status-err');
      return;
    }
    
    this.testRunning = true;
    this.ui.btnStartTest.disabled = true;
    this.ui.testProgress.style.display = 'block';
    
    // Reset test data
    this.testData = {
      bytesSent: 0,
      bytesReceived: 0,
      packetsSent: 0,
      packetsReceived: 0,
      latencies: []
    };
    
    const duration = parseInt(this.ui.testDuration.value) * 1000;
    const direction = this.ui.testDirection.value;
    const transport = this.ui.transportMode.value;
    
    this.log(`🚀 Starting speed test...`, 'status-ok');
    this.log(`📊 Config: ${direction}, ${transport}, ${duration/1000}s`);
    
    this.testStartTime = performance.now();
    
    // Start appropriate test based on direction
    if (direction === 'host-to-client') {
      this.runSpeedTest(this.isHost ? 'sender' : 'receiver', duration);
    } else if (direction === 'client-to-host') {
      this.runSpeedTest(this.isHost ? 'receiver' : 'sender', duration);
    } else {
      // Bidirectional - both devices send
      this.runSpeedTest('sender', duration);
    }
  }
  
  async runSpeedTest(role, duration) {
    if (role === 'sender') {
      await this.runSenderTest(duration);
    } else {
      await this.runReceiverTest(duration);
    }
  }
  
  async runSenderTest(duration) {
    this.log('📤 Running as sender...', 'status-ok');
    
    const totalBytes = 10 * 1024 * 1024; // 10MB test
    const chunkSize = 64 * 1024; // 64KB chunks (WebRTC message size limit)
    let bytesSent = 0;
    
    const endTime = this.testStartTime + duration;
    
    const sendChunks = async () => {
      while (bytesSent < totalBytes && performance.now() < endTime && this.testRunning) {
        // Buffer management - wait if buffer is full
        if (this.dataChannel.bufferedAmount >= this.dataChannel.bufferedAmountLowThreshold) {
          await new Promise(resolve => {
            this.dataChannel.addEventListener('bufferedamountlow', resolve, { once: true });
          });
        }
        
        // Create test packet with header
        const packet = this.createTestPacket(chunkSize, this.testData.packetsSent);
        
        try {
          this.dataChannel.send(packet);
          this.testData.packetsSent++;
          this.testData.bytesSent += packet.byteLength;
          bytesSent += packet.byteLength;
          
          // Update progress
          this.updateTestProgress();
          
        } catch (error) {
          this.log(`❌ Send error: ${error.message}`, 'status-err');
          break;
        }
      }
      
      // Send completion signal
      this.dataChannel.send('TEST_COMPLETE');
      this.log('📤 Sender test completed', 'status-ok');
    };
    
    await sendChunks();
    
    // Auto-finish after duration
    setTimeout(() => {
      if (this.testRunning) {
        this.finishSpeedTest();
      }
    }, duration + 1000);
  }
  
  async runReceiverTest(duration) {
    this.log('📥 Running as receiver...', 'status-ok');
    
    // Receiver just waits and measures incoming data
    setTimeout(() => {
      if (this.testRunning) {
        this.finishSpeedTest();
      }
    }, duration + 2000); // Extra time for completion
  }
  
  createTestPacket(payloadSize, sequenceNumber) {
    // Create packet with header: [seq:4bytes][timestamp:8bytes][size:4bytes][payload]
    const headerSize = 16;
    const totalSize = headerSize + payloadSize;
    const buffer = new ArrayBuffer(totalSize);
    const view = new DataView(buffer);
    
    // Write header
    view.setUint32(0, sequenceNumber, true); // Sequence number
    view.setFloat64(4, performance.now(), true); // Timestamp
    view.setUint32(12, payloadSize, true); // Payload size
    
    // Fill payload with test pattern
    const payload = new Uint8Array(buffer, headerSize);
    for (let i = 0; i < payloadSize; i += 4) {
      payload[i] = i & 0xFF;
      payload[i + 1] = (i >> 8) & 0xFF;
      payload[i + 2] = (i >> 16) & 0xFF;
      payload[i + 3] = (i >> 24) & 0xFF;
    }
    
    return buffer;
  }
  
  handleIncomingData(data) {
    if (typeof data === 'string' && data === 'TEST_COMPLETE') {
      this.log('📥 Received test completion signal', 'status-ok');
      this.finishSpeedTest();
      return;
    }
    
    if (!(data instanceof ArrayBuffer)) return;
    
    this.testData.packetsReceived++;
    this.testData.bytesReceived += data.byteLength;
    
    // Parse packet header for latency calculation
    if (data.byteLength >= 16) {
      const view = new DataView(data);
      const sequenceNumber = view.getUint32(0, true);
      const timestamp = view.getFloat64(4, true);
      const payloadSize = view.getUint32(12, true);
      
      // Calculate round-trip time
      const now = performance.now();
      const rtt = now - timestamp;
      
      if (rtt > 0 && rtt < 10000) { // Reasonable RTT range
        this.testData.latencies.push(rtt);
      }
    }
    
    this.updateTestProgress();
  }
  
  updateTestProgress() {
    if (!this.testRunning) return;
    
    const elapsed = (performance.now() - this.testStartTime) / 1000;
    const duration = parseInt(this.ui.testDuration.value);
    
    // Update progress bar
    const progress = Math.min((elapsed / duration) * 100, 100);
    this.ui.progressFill.style.width = `${progress}%`;
    
    // Calculate current throughput
    const totalBytes = Math.max(this.testData.bytesSent, this.testData.bytesReceived);
    const totalMB = totalBytes / (1024 * 1024);
    const throughputMbps = elapsed > 0 ? (totalBytes * 8) / (elapsed * 1000000) : 0;
    
    // Update UI
    this.ui.progressText.textContent = `${elapsed.toFixed(1)}s - ${throughputMbps.toFixed(2)} Mbps - ${totalMB.toFixed(2)} MB transferred`;
    this.ui.throughputResult.textContent = `${throughputMbps.toFixed(2)} Mbps`;
    this.ui.dataResult.textContent = `${totalMB.toFixed(2)} MB`;
    
    // Update latency if available
    if (this.testData.latencies.length > 0) {
      const avgLatency = this.testData.latencies.reduce((a, b) => a + b) / this.testData.latencies.length;
      this.ui.latencyResult.textContent = `${avgLatency.toFixed(1)} ms`;
    }
  }
  
  finishSpeedTest() {
    if (!this.testRunning) return;
    
    this.testRunning = false;
    this.ui.btnStartTest.disabled = false;
    this.ui.testProgress.style.display = 'none';
    
    const elapsed = (performance.now() - this.testStartTime) / 1000;
    const totalBytes = Math.max(this.testData.bytesSent, this.testData.bytesReceived);
    const totalMB = totalBytes / (1024 * 1024);
    const finalThroughput = (totalBytes * 8) / (elapsed * 1000000);
    
    // Final results
    this.ui.throughputResult.textContent = `${finalThroughput.toFixed(2)} Mbps`;
    this.ui.dataResult.textContent = `${totalMB.toFixed(2)} MB`;
    this.ui.statusResult.textContent = 'Test Complete';
    
    // Calculate latency statistics
    if (this.testData.latencies.length > 0) {
      const avgLatency = this.testData.latencies.reduce((a, b) => a + b) / this.testData.latencies.length;
      const minLatency = Math.min(...this.testData.latencies);
      const maxLatency = Math.max(...this.testData.latencies);
      
      this.ui.latencyResult.textContent = `${avgLatency.toFixed(1)} ms`;
      
      this.log(`📊 Latency stats - Min: ${minLatency.toFixed(1)}ms, Avg: ${avgLatency.toFixed(1)}ms, Max: ${maxLatency.toFixed(1)}ms`, 'status-ok');
    }
    
    // Complete test summary
    this.log('═══════════════════════════════════', 'status-ok');
    this.log(`🏁 Speed test completed: ${finalThroughput.toFixed(2)} Mbps`, 'status-ok');
    this.log(`📊 Data transferred: ${totalMB.toFixed(2)} MB in ${elapsed.toFixed(1)}s`, 'status-ok');
    this.log(`📦 Packets sent: ${this.testData.packetsSent}, received: ${this.testData.packetsReceived}`, 'status-ok');
    
    if (this.testData.packetsSent > 0 && this.ui.transportMode.value === 'unreliable') {
      const packetLoss = ((this.testData.packetsSent - this.testData.packetsReceived) / this.testData.packetsSent) * 100;
      this.log(`📉 Packet loss: ${Math.max(0, packetLoss).toFixed(2)}%`, packetLoss > 1 ? 'status-warn' : 'status-ok');
    }
    
    this.log('═══════════════════════════════════', 'status-ok');
  }
  
  continueDataTransmission() {
    // This method is called when buffer is ready for more data
    // Implementation would depend on the specific test running
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
  
  // Check for required APIs
  if (!window.RTCPeerConnection) {
    document.getElementById('debugLog').innerHTML = 
      '<div class="status-err">❌ WebRTC not supported in this browser</div>' +
      '<div class="status-warn">💡 Please use Chrome 24+, Firefox 22+, Safari 11+, or Edge</div>';
    return;
  }
  
  if (!window.isSecureContext) {
    document.getElementById('debugLog').innerHTML = 
      '<div class="status-err">❌ Secure context required for WebRTC</div>' +
      '<div class="status-warn">💡 Please serve from HTTPS or localhost</div>';
    return;
  }
  
  // Initialize the speed test
  window.speedTest = new WebRTCLANSpeedTest();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WebRTCLANSpeedTest;
}
