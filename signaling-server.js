// Simple WebRTC signaling server with room-based routing
// Wi-Fi Nomads - LAN Speed Test Signaling Server
// Deploy this on your server (e.g., signal.wifinomads.net)

const express = require("express");
const http = require("http");
const { WebSocketServer } = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const rooms = new Map(); // roomId -> Set<WebSocket>

// CORS headers for web requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Join a WebSocket to a room
function joinRoom(ws, room) {
  if (!rooms.has(room)) {
    rooms.set(room, new Set());
  }
  
  const peers = rooms.get(room);
  peers.add(ws);
  ws.roomId = room;
  
  console.log(`Peer joined room ${room}, total peers in room: ${peers.size}`);
  
  // Notify the joining peer
  ws.send(JSON.stringify({ 
    type: "room-joined", 
    peers: peers.size,
    roomId: room
  }));
  
  // Limit to 2 peers per room for speed testing
  if (peers.size > 2) {
    ws.send(JSON.stringify({ 
      type: "error", 
      message: "Room full (2 peers maximum for speed testing)" 
    }));
    console.log(`Room ${room} is full, rejecting additional peer`);
    return false;
  }
  
  // Notify other peers in the room
  peers.forEach(peer => {
    if (peer !== ws && peer.readyState === peer.OPEN) {
      peer.send(JSON.stringify({
        type: "peer-joined",
        peers: peers.size
      }));
    }
  });
  
  return true;
}

// Remove a WebSocket from its room
function leaveRoom(ws) {
  const room = ws.roomId;
  if (!room || !rooms.has(room)) return;
  
  const peers = rooms.get(room);
  peers.delete(ws);
  
  console.log(`Peer left room ${room}, remaining peers: ${peers.size}`);
  
  // Notify remaining peers
  peers.forEach(peer => {
    if (peer.readyState === peer.OPEN) {
      peer.send(JSON.stringify({
        type: "peer-left",
        peers: peers.size
      }));
    }
  });
  
  // Clean up empty rooms
  if (peers.size === 0) {
    rooms.delete(room);
    console.log(`Room ${room} deleted (empty)`);
  }
}

// WebSocket connection handler
wss.on("connection", (ws, req) => {
  const clientIP = req.socket.remoteAddress;
  console.log(`New WebSocket connection from ${clientIP}`);
  
  ws.on("message", (msg) => {
    let data;
    try {
      data = JSON.parse(msg);
    } catch (error) {
      console.error(`Invalid JSON from ${clientIP}:`, error.message);
      ws.send(JSON.stringify({
        type: "error",
        message: "Invalid JSON format"
      }));
      return;
    }
    
    console.log(`Message from ${clientIP}:`, data.type, data.room || '');
    
    // Handle room join requests
    if (data.type === "join") {
      if (!data.room || typeof data.room !== 'string') {
        ws.send(JSON.stringify({
          type: "error",
          message: "Room ID is required and must be a string"
        }));
        return;
      }
      
      // Sanitize room ID (uppercase, alphanumeric only)
      const sanitizedRoom = data.room.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (sanitizedRoom.length < 3 || sanitizedRoom.length > 20) {
        ws.send(JSON.stringify({
          type: "error",
          message: "Room ID must be 3-20 alphanumeric characters"
        }));
        return;
      }
      
      joinRoom(ws, sanitizedRoom);
      return;
    }
    
    // Relay all other messages to peers in the same room
    const room = ws.roomId;
    if (!room) {
      ws.send(JSON.stringify({
        type: "error",
        message: "Not in a room. Join a room first."
      }));
      return;
    }
    
    const peers = rooms.get(room);
    if (!peers) {
      ws.send(JSON.stringify({
        type: "error",
        message: "Room no longer exists"
      }));
      return;
    }
    
    // Forward message to other peers in the room
    let forwardedCount = 0;
    peers.forEach((peer) => {
      if (peer !== ws && peer.readyState === peer.OPEN) {
        try {
          peer.send(JSON.stringify(data));
          forwardedCount++;
        } catch (error) {
          console.error(`Error forwarding message to peer:`, error.message);
        }
      }
    });
    
    console.log(`Forwarded ${data.type} message to ${forwardedCount} peer(s) in room ${room}`);
  });
  
  // Handle WebSocket close
  ws.on("close", (code, reason) => {
    console.log(`WebSocket closed from ${clientIP}, code: ${code}, reason: ${reason}`);
    leaveRoom(ws);
  });
  
  // Handle WebSocket errors
  ws.on("error", (error) => {
    console.error(`WebSocket error from ${clientIP}:`, error.message);
    leaveRoom(ws);
  });
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: "welcome",
    message: "Connected to Wi-Fi Nomads Speed Test signaling server"
  }));
});

// HTTP health check endpoint
app.get("/health", (req, res) => {
  const stats = {
    status: "ok",
    timestamp: new Date().toISOString(),
    activeRooms: rooms.size,
    totalPeers: Array.from(rooms.values()).reduce((sum, peers) => sum + peers.size, 0),
    uptime: process.uptime()
  };
  
  res.json(stats);
});

// HTTP status endpoint with more details
app.get("/status", (req, res) => {
  const roomStats = Array.from(rooms.entries()).map(([roomId, peers]) => ({
    roomId,
    peerCount: peers.size,
    peers: Array.from(peers).map(ws => ({
      readyState: ws.readyState,
      ip: ws._socket?.remoteAddress || 'unknown'
    }))
  }));
  
  const stats = {
    status: "ok",
    timestamp: new Date().toISOString(),
    server: "Wi-Fi Nomads Speed Test Signaling Server",
    version: "1.0.0",
    activeRooms: rooms.size,
    totalPeers: Array.from(rooms.values()).reduce((sum, peers) => sum + peers.size, 0),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    rooms: roomStats
  };
  
  res.json(stats);
});

// Root endpoint
app.get("/", (req, res) => {
  res.send(`
    <h1>Wi-Fi Nomads Speed Test Signaling Server</h1>
    <p>WebRTC signaling server for LAN speed testing</p>
    <ul>
      <li><a href="/health">Health Check</a></li>
      <li><a href="/status">Detailed Status</a></li>
    </ul>
    <p>Active rooms: ${rooms.size}</p>
    <p>Total peers: ${Array.from(rooms.values()).reduce((sum, peers) => sum + peers.size, 0)}</p>
  `);
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Start the server
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`Wi-Fi Nomads Speed Test signaling server running on ${HOST}:${PORT}`);
  console.log(`Health check: http://${HOST}:${PORT}/health`);
  console.log(`Status: http://${HOST}:${PORT}/status`);
});

// Export for testing
module.exports = { app, server, wss };
