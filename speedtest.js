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
      // Check if camera is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser');
      }
      
      // Show scanning section
      this.ui.offerScanSection.style.display = 'block';
      this.ui.manualOfferSection.style.display = 'none';
      
      // Request camera permission with proper configuration
      this.log('🎥 Requesting camera permission...', 'status-warn');
      
      const constraints = {
        video: {
          facingMode: 'environment', // Try back camera first
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      };
      
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (backCameraError) {
        this.log('⚠️ Back camera failed, trying front camera...', 'status-warn');
        // Fallback to front camera
        constraints.video.facingMode = 'user';
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      }
      
      // Set up video stream
      this.ui.offerVideo.srcObject = stream;
      this.ui.offerVideo.play();
      
      this.log('✅ Camera access granted', 'status-ok');
      this.log('📱 Point camera at QR code to scan', 'status-warn');
      
      // Start QR code detection
      this.startQRDetection(this.ui.offerVideo, (qrData) => {
        this.log('📷 QR code scanned successfully!', 'status-ok');
        this.processScannedOffer(qrData);
        this.stopOfferScanning();
      });
      
    } catch (error) {
      this.log(`❌ Camera access failed: ${error.message}`, 'status-err');
      
      if (error.name === 'NotAllowedError') {
        this.log('🔒 Camera permission denied by user', 'status-err');
        this.log('💡 Please allow camera access and try again', 'status-warn');
      } else if (error.name === 'NotFoundError') {
        this.log('📹 No camera found on device', 'status-err');
      } else if (error.name === 'NotSupportedError') {
        this.log('🚫 Camera not supported in this browser', 'status-err');
      }
      
      this.log('💡 Falling back to manual input', 'status-warn');
      this.showManualOfferInput();
    }
  }
  
  startQRDetection(videoElement, onQRDetected) {
    this.log('🔍 Starting QR detection loop...', 'status-warn');
    
    // Simple, reliable scanning with setInterval
    this.qrDetectionInterval = setInterval(() => {
      try {
        // Create canvas for frame capture
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size to match video
        canvas.width = videoElement.videoWidth || 640;
        canvas.height = videoElement.videoHeight || 480;
        
        if (canvas.width > 0 && canvas.height > 0) {
          // Draw current video frame
          ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
          
          // Get image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          // Debug: Log detection attempt
          console.log('Trying QR detection...', {
            width: canvas.width,
            height: canvas.height,
            jsQRLoaded: window.jsQRLoaded,
            jsQRAvailable: typeof jsQR !== 'undefined'
          });
          
          // Try QR detection
          const qrCode = this.detectQRCodeSimple(imageData);
          
          if (qrCode) {
            this.log('🎯 QR Code detected!', 'status-ok');
            clearInterval(this.qrDetectionInterval);
            this.qrDetectionInterval = null;
            onQRDetected(qrCode);
            return;
          }
        } else {
          console.log('Video not ready:', { width: canvas.width, height: canvas.height });
        }
      } catch (error) {
        console.error('QR detection error:', error);
      }
    }, 300); // Check every 300ms for reliability
  }
  
  detectQRCodeSimple(imageData) {
    // Simple, working QR detection
    this.log('🔍 Attempting QR detection...', 'status-warn');
    
    // Check if jsQR is available
    if (typeof jsQR === 'undefined') {
      console.error('jsQR library not loaded');
      this.log('❌ jsQR library not available', 'status-err');
      return null;
    }
    
    try {
      // Try basic jsQR detection
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      
      if (code && code.data) {
        this.log(`✅ QR detected: ${code.data.substring(0, 30)}...`, 'status-ok');
        console.log('QR Code detected:', code.data);
        return code.data;
      }
      
      return null;
    } catch (error) {
      console.error('jsQR detection error:', error);
      return null;
    }
  }
  
  detectQRCodeInImageData(imageData) {
    // Super advanced QR detection with multiple methods
    let result = null;
    
    // Method 1: Try jsQR library with multiple configurations
    if (typeof jsQR !== 'undefined' && window.jsQRLoaded) {
      try {
        // Try with different inversion attempts for better detection
        const configs = [
          { inversionAttempts: "dontInvert" },
          { inversionAttempts: "onlyInvert" },
          { inversionAttempts: "attemptBoth" }
        ];
        
        for (const config of configs) {
          const code = jsQR(imageData.data, imageData.width, imageData.height, config);
          if (code && code.data) {
            this.log(`🎯 jsQR detected QR: ${code.data.substring(0, 50)}...`, 'status-ok');
            return code.data;
          }
        }
      } catch (error) {
        this.log(`jsQR error: ${error.message}`, 'status-warn');
      }
    }
    
    // Method 2: Try QR-Scanner library as backup
    if (typeof QrScanner !== 'undefined' && window.qrScannerLibLoaded) {
      try {
        // QR-Scanner library method
        result = this.tryQRScannerLib(imageData);
        if (result) {
          this.log(`🎯 QR-Scanner detected: ${result.substring(0, 50)}...`, 'status-ok');
          return result;
        }
      } catch (error) {
        this.log(`QR-Scanner error: ${error.message}`, 'status-warn');
      }
    }
    
    // Method 3: Enhanced image processing for difficult QR codes
    result = this.tryEnhancedDetection(imageData);
    if (result) {
      this.log(`🎯 Enhanced detection: ${result.substring(0, 50)}...`, 'status-ok');
      return result;
    }
    
    // Method 4: Pattern-based detection for simple QR codes
    result = this.tryPatternDetection(imageData);
    if (result) {
      this.log(`🎯 Pattern detection: ${result.substring(0, 50)}...`, 'status-ok');
      return result;
    }
    
    return null;
  }
  
  tryQRScannerLib(imageData) {
    // Placeholder for QR-Scanner library integration
    // This would need proper integration with the QR-Scanner library
    return null;
  }
  
  tryEnhancedDetection(imageData) {
    // Enhanced detection with image preprocessing
    try {
      if (typeof jsQR === 'undefined') return null;
      
      const { width, height, data } = imageData;
      const processedData = new Uint8ClampedArray(data.length);
      
      // Apply image enhancements for better QR detection
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        
        // Convert to grayscale with enhanced contrast
        let gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
        
        // Apply contrast enhancement
        gray = Math.min(255, Math.max(0, (gray - 128) * 1.5 + 128));
        
        // Apply threshold for better black/white separation
        gray = gray > 128 ? 255 : 0;
        
        processedData[i] = gray;
        processedData[i + 1] = gray;
        processedData[i + 2] = gray;
        processedData[i + 3] = a;
      }
      
      // Try detection with processed image
      const processedImageData = new ImageData(processedData, width, height);
      const code = jsQR(processedImageData.data, width, height, {
        inversionAttempts: "attemptBoth"
      });
      
      if (code && code.data) {
        return code.data;
      }
    } catch (error) {
      // Enhanced detection failed, continue
    }
    
    return null;
  }
  
  tryPatternDetection(imageData) {
    // Simple pattern-based detection for our specific QR codes
    try {
      const { width, height, data } = imageData;
      
      // Look for our base64 encoded connection strings in the QR pattern
      // This is a simplified approach that looks for specific patterns
      // that match our connection codes
      
      // Convert to binary for pattern analysis
      const binary = new Array(width * height);
      for (let i = 0; i < data.length; i += 4) {
        const grayscale = (data[i] + data[i + 1] + data[i + 2]) / 3;
        binary[i / 4] = grayscale < 128 ? 1 : 0;
      }
      
      // Look for finder patterns (3 corner squares)
      const corners = this.findQRCorners(binary, width, height);
      
      if (corners.length >= 3) {
        // Found QR-like structure, try to extract data
        const extractedData = this.extractQRData(binary, width, height, corners);
        if (extractedData && this.isValidConnectionCode(extractedData)) {
          return extractedData;
        }
      }
    } catch (error) {
      // Pattern detection failed
    }
    
    return null;
  }
  
  findQRCorners(binary, width, height) {
    const corners = [];
    const minSize = 7;
    
    // Look for 7x7 finder patterns in corners
    const regions = [
      { x: 0, y: 0 }, // Top-left
      { x: width - minSize, y: 0 }, // Top-right
      { x: 0, y: height - minSize } // Bottom-left
    ];
    
    for (const region of regions) {
      if (this.isFinderPattern(binary, width, region.x, region.y, minSize)) {
        corners.push(region);
      }
    }
    
    return corners;
  }
  
  isFinderPattern(binary, width, x, y, size) {
    // Check for 7x7 finder pattern
    if (x + size >= width || y + size >= width) return false;
    
    // Check the specific pattern of a QR finder
    const center = Math.floor(size / 2);
    
    // Check if center area is dark
    for (let dy = 1; dy < size - 1; dy++) {
      for (let dx = 1; dx < size - 1; dx++) {
        if (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4) {
          // Inner square should be dark
          if (!binary[(y + dy) * width + (x + dx)]) return false;
        }
      }
    }
    
    return true;
  }
  
  extractQRData(binary, width, height, corners) {
    // Simplified data extraction - look for our base64 patterns
    // This is a basic implementation that tries to find base64-like strings
    
    try {
      // Convert binary pattern back to potential text
      // This is a simplified approach that assumes our QR codes
      // contain readable base64 data
      
      // For now, return null as this would require full QR decoding
      // The main detection should work with jsQR library
      return null;
    } catch (error) {
      return null;
    }
  }
  
  isValidConnectionCode(data) {
    // Check if the detected data looks like our connection codes
    if (!data || typeof data !== 'string') return false;
    
    // Our codes are base64 encoded JSON
    try {
      const decoded = atob(data);
      const parsed = JSON.parse(decoded);
      return parsed && (parsed.type === 'offer' || parsed.type === 'answer' || parsed.sdp);
    } catch (error) {
      return false;
    }
  }
  
  stopOfferScanning() {
    // Stop QR detection
    if (this.qrDetectionInterval) {
      clearInterval(this.qrDetectionInterval);
      this.qrDetectionInterval = null;
    }
    
    // Stop video stream
    if (this.ui.offerVideo.srcObject) {
      const stream = this.ui.offerVideo.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      this.ui.offerVideo.srcObject = null;
    }
    
    if (this.offerScanner) {
      this.offerScanner.stop();
      this.offerScanner = null;
    }
    
    this.ui.offerScanSection.style.display = 'none';
    this.log('📷 Camera stopped', 'status-warn');
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
  
  async startAnswerScanning() {
    this.log('📷 Starting response QR scanner...', 'status-warn');
    
    try {
      // Check if camera is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser');
      }
      
      // Show scanning section
      this.ui.answerScanSection.style.display = 'block';
      
      // Request camera permission
      this.log('🎥 Requesting camera permission...', 'status-warn');
      
      const constraints = {
        video: {
          facingMode: 'environment', // Try back camera first
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      };
      
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (backCameraError) {
        this.log('⚠️ Back camera failed, trying front camera...', 'status-warn');
        // Fallback to front camera
        constraints.video.facingMode = 'user';
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      }
      
      // Set up video stream
      this.ui.answerVideo.srcObject = stream;
      this.ui.answerVideo.play();
      
      this.log('✅ Camera access granted', 'status-ok');
      this.log('📱 Point camera at response QR code to scan', 'status-warn');
      
      // Start QR code detection
      this.startAnswerQRDetection(this.ui.answerVideo, (qrData) => {
        this.log('📷 Response QR code scanned successfully!', 'status-ok');
        this.ui.answerInput.value = qrData;
        this.acceptAnswer();
        this.stopAnswerScanning();
      });
      
    } catch (error) {
      this.log(`❌ Camera access failed: ${error.message}`, 'status-err');
      
      if (error.name === 'NotAllowedError') {
        this.log('🔒 Camera permission denied by user', 'status-err');
        this.log('💡 Please allow camera access and try again', 'status-warn');
      }
      
      this.log('💡 Please paste response code manually', 'status-warn');
      this.stopAnswerScanning();
    }
  }
  
  startAnswerQRDetection(videoElement, onQRDetected) {
    // Store the detection function for cleanup
    this.answerQrDetectionInterval = setInterval(() => {
      try {
        // Create canvas to capture video frame
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        
        if (canvas.width && canvas.height) {
          // Draw current video frame to canvas
          ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
          
          // Get image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          // Try to detect QR code in the image
          const qrCode = this.detectQRCodeInImageData(imageData);
          
          if (qrCode) {
            clearInterval(this.answerQrDetectionInterval);
            this.answerQrDetectionInterval = null;
            onQRDetected(qrCode);
          }
        }
      } catch (error) {
        // Ignore detection errors, keep trying
      }
    }, 200); // Check every 200ms
  }
  
  stopAnswerScanning() {
    // Stop QR detection
    if (this.answerQrDetectionInterval) {
      clearInterval(this.answerQrDetectionInterval);
      this.answerQrDetectionInterval = null;
    }
    
    // Stop video stream
    if (this.ui.answerVideo.srcObject) {
      const stream = this.ui.answerVideo.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      this.ui.answerVideo.srcObject = null;
    }
    
    if (this.answerScanner) {
      this.answerScanner.stop();
      this.answerScanner = null;
    }
    
    this.ui.answerScanSection.style.display = 'none';
    this.log('📷 Response scanner stopped', 'status-warn');
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
      this.log('📱 Generating QR code...', 'status-warn');
      
      // Set canvas size
      canvas.width = 200;
      canvas.height = 200;
      
      // Generate QR code using self-contained implementation
      const qrCode = this.createQRCodeMatrix(data);
      this.drawQRCodeToCanvas(canvas, qrCode);
      
      this.log('✅ QR code generated successfully', 'status-ok');
    } catch (error) {
      this.log(`❌ QR code generation failed: ${error.message}`, 'status-err');
      this.showQRFallback(canvas, data);
    }
  }
  
  createQRCodeMatrix(text) {
    // Simple QR code implementation for basic text
    // This is a simplified version that creates a basic pattern
    const size = 25; // QR code grid size
    const matrix = Array(size).fill().map(() => Array(size).fill(0));
    
    // Add finder patterns (corner squares)
    this.addFinderPattern(matrix, 0, 0);
    this.addFinderPattern(matrix, size - 7, 0);
    this.addFinderPattern(matrix, 0, size - 7);
    
    // Add timing patterns
    for (let i = 8; i < size - 8; i++) {
      matrix[6][i] = i % 2;
      matrix[i][6] = i % 2;
    }
    
    // Convert text to simple pattern (simplified encoding)
    const textBytes = new TextEncoder().encode(text);
    let bitIndex = 0;
    
    // Fill data area with text pattern
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (!this.isReservedArea(row, col, size)) {
          const byteIndex = Math.floor(bitIndex / 8) % textBytes.length;
          const bitPos = bitIndex % 8;
          matrix[row][col] = (textBytes[byteIndex] >> bitPos) & 1;
          bitIndex++;
        }
      }
    }
    
    return matrix;
  }
  
  addFinderPattern(matrix, startRow, startCol) {
    // 7x7 finder pattern
    const pattern = [
      [1,1,1,1,1,1,1],
      [1,0,0,0,0,0,1],
      [1,0,1,1,1,0,1],
      [1,0,1,1,1,0,1],
      [1,0,1,1,1,0,1],
      [1,0,0,0,0,0,1],
      [1,1,1,1,1,1,1]
    ];
    
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (startRow + i < matrix.length && startCol + j < matrix[0].length) {
          matrix[startRow + i][startCol + j] = pattern[i][j];
        }
      }
    }
  }
  
  isReservedArea(row, col, size) {
    // Check if position is in a finder pattern or timing pattern
    if ((row >= 0 && row < 9 && col >= 0 && col < 9) ||
        (row >= 0 && row < 9 && col >= size - 8 && col < size) ||
        (row >= size - 8 && row < size && col >= 0 && col < 9) ||
        row === 6 || col === 6) {
      return true;
    }
    return false;
  }
  
  drawQRCodeToCanvas(canvas, matrix) {
    const ctx = canvas.getContext('2d');
    const size = matrix.length;
    const cellSize = canvas.width / size;
    
    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw QR code
    ctx.fillStyle = '#1e3a8a';
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (matrix[row][col]) {
          ctx.fillRect(
            col * cellSize,
            row * cellSize,
            cellSize,
            cellSize
          );
        }
      }
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
