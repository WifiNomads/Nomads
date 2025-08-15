# Wi-Fi Nomads - Professional Wi-Fi Network Tools

## Overview

A comprehensive collection of professional Wi-Fi networking tools including:

- **Wi-Fi Airtime Calculator**: IEEE 802.11 compliant airtime calculations for OFDM, HT/VHT, HE, and OFDMA scenarios
- **SSID Overhead Calculator**: Beacon frame overhead analysis and optimization
- **LAN Speed Test (WebRTC)**: Browser-based peer-to-peer network speed testing

## 🚀 New: WebRTC LAN Speed Test

### Features

- **No Software Installation Required**: Pure browser-based testing using WebRTC
- **Peer-to-Peer**: Direct connection between devices for accurate LAN testing
- **Real-time Results**: Live throughput, latency, and packet loss measurements
- **Multiple Test Modes**:
  - Reliable (TCP-like) and Unreliable (UDP-like) transport
  - Bidirectional, upload, and download testing
  - Configurable test duration (1-60 seconds)
- **Professional UI**: Clean, responsive interface matching Wi-Fi Nomads design

### How It Works

1. **Host** creates a room with a code (e.g., "NOM123")
2. **Joiner** enters the same code on another device
3. WebRTC establishes a direct peer-to-peer connection
4. Data flows directly between devices (no server in the middle)
5. Real-time measurement of throughput, latency, and packet loss

## 🛠 Deployment Instructions

### Static Site Files

The main website files can be deployed to any static hosting service:

- `index.html` - Main homepage with tools
- `speedtest.html` - WebRTC speed test page
- `speedtest.js` - Speed test implementation
- `style.css` - Styling
- `script.js` - Main site functionality
- Other calculator files and assets

### Signaling Server Setup

The WebRTC speed test requires a small signaling server to help devices find each other.

#### 1. Server Requirements

- Node.js 16+ 
- Small VPS/server (512MB RAM sufficient)
- Domain pointing to server (e.g., `signal.wifinomads.net`)
- SSL certificate for WebSocket Secure (WSS)

#### 2. Install Dependencies

```bash
# On your server
mkdir webrtc-signaling && cd webrtc-signaling
npm init -y
npm install express ws

# Copy signaling-server.js to this directory
# Or use the provided package.json
npm install
```

#### 3. Run the Signaling Server

```bash
# Development
npm run dev

# Production
npm start

# With PM2 (recommended for production)
npm install -g pm2
pm2 start signaling-server.js --name "speedtest-signaling"
pm2 save
pm2 startup
```

#### 4. Nginx Configuration

Set up SSL termination and WebSocket proxying:

```nginx
server {
    server_name signal.wifinomads.net;
    listen 443 ssl http2;
    
    # SSL configuration
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # WebSocket proxy
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket timeout settings
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }
}

# HTTP redirect
server {
    listen 80;
    server_name signal.wifinomads.net;
    return 301 https://$server_name$request_uri;
}
```

#### 5. Update Signaling Server URL

In `speedtest.js`, update the signaling server URL:

```javascript
this.signalingServer = 'wss://signal.wifinomads.net'; // Your domain here
```

### Health Monitoring

The signaling server provides monitoring endpoints:

- `https://signal.wifinomads.net/health` - Basic health check
- `https://signal.wifinomads.net/status` - Detailed status with room information
- `https://signal.wifinomads.net/` - Human-readable status page

## 🎯 Usage

### Wi-Fi Airtime Calculator

1. Open the main site
2. Click "Wi-Fi Airtime Calculator"
3. Select scenario (Legacy, HT/VHT, HE, OFDMA)
4. Configure parameters (bandwidth, MCS, spatial streams, etc.)
5. Click "Calculate Airtime"
6. View results and timing breakdown chart

### SSID Overhead Calculator

1. Click "SSID Overhead Calculator"
2. Enter network parameters (APs, SSIDs, beacon interval, etc.)
3. Select preamble type (affects available data rates)
4. Click "Calculate SSID Overhead"
5. View overhead percentage and optimization recommendations

### LAN Speed Test

1. Open `speedtest.html` on both devices
2. **Device 1 (Host)**: Enter room code → "Create Room"
3. **Device 2 (Join)**: Enter same code → "Join Room"
4. Wait for "Connected - Ready to test" status
5. Configure test (duration, direction, transport mode)
6. Click "Start Speed Test"
7. View real-time results: throughput, latency, packet loss

## 🔧 Technical Details

### WebRTC Implementation

- **ICE**: Uses Google STUN servers for NAT traversal
- **Data Channels**: Configurable reliable/unreliable transport
- **Packet Structure**: Custom headers for sequence numbers and timestamps
- **Throughput Calculation**: Real-time bits/second measurement
- **Latency Measurement**: Round-trip time calculation with packet timestamps

### Signaling Protocol

- **Room-based**: Each speed test uses a unique room code
- **Peer Limit**: Maximum 2 peers per room for speed testing
- **Message Relay**: Server only relays WebRTC signaling (offer/answer/ICE)
- **Auto-cleanup**: Empty rooms are automatically deleted

### Browser Compatibility

- **Chrome**: Full support
- **Firefox**: Full support  
- **Safari**: Full support (iOS 11+)
- **Edge**: Full support
- **Mobile**: iOS Safari, Chrome Mobile, Firefox Mobile

## 📊 Use Cases

### Network Engineers

- **LAN Performance Testing**: Quick Wi-Fi speed tests without iperf3
- **Airtime Analysis**: Optimize 802.11ax OFDMA configurations
- **Beacon Overhead**: Analyze SSID impact on network efficiency

### Wi-Fi Professionals

- **Site Surveys**: On-site speed testing between devices
- **Throughput Validation**: Verify Wi-Fi 6/6E performance
- **Network Optimization**: Fine-tune parameters for maximum efficiency

### Educational

- **Wi-Fi Training**: Interactive tools for learning 802.11 concepts
- **Performance Analysis**: Understand airtime calculations and overhead
- **Real-world Testing**: Hands-on experience with network measurement

## 🚀 Features

### Professional Grade

- **IEEE 802.11 Compliant**: Accurate calculations following wireless standards
- **Real-world Testing**: WebRTC provides actual network performance data
- **Mobile Responsive**: Works on phones, tablets, laptops, desktops
- **No Installation**: Pure browser-based tools

### Enterprise Ready

- **Scalable**: Signaling server handles multiple concurrent tests
- **Monitoring**: Built-in health checks and status endpoints
- **Secure**: WSS encryption for signaling, direct P2P for data
- **Reliable**: Error handling and automatic reconnection

## 📈 Performance

### Speed Test Accuracy

- **Direct P2P**: No server bottleneck, measures actual device-to-device speed
- **Real-time Updates**: Live throughput display during testing
- **Multiple Metrics**: Throughput, latency, packet loss measurement
- **Configurable**: Test duration, packet size, transport reliability

### Calculator Precision

- **Microsecond Accuracy**: Precise airtime calculations for all 802.11 standards
- **Standards Compliant**: Follows IEEE specifications for all PHY modes
- **Comprehensive**: Supports Legacy, HT, VHT, HE, and OFDMA scenarios

## 🔒 Security

- **HTTPS Only**: All web traffic encrypted
- **WSS Signaling**: WebSocket Secure for signaling
- **No Data Storage**: No user data stored on signaling server
- **P2P Direct**: Speed test data flows directly between devices
- **Room Isolation**: Each test uses isolated room codes

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines.

## 📞 Support

- **Website**: https://wifinomads.net
- **LinkedIn**: https://www.linkedin.com/company/wi-fi-nomads/
- **Issues**: GitHub Issues for bug reports and feature requests

---

Built with ❤️ by the Wi-Fi Nomads community for wireless networking professionals worldwide.
