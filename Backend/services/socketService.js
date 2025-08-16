// services/socketService.js
// Centralized Socket.IO service for managing WebSocket connections and real-time communication

import { Server } from 'socket.io';
import { colors } from '../constants/colors.js';

class SocketService {
    constructor() {
        this.io = null;                    // Socket.IO server instance
        this.connectedUsers = new Map();   // Track connected users and their socket IDs
        this.userRooms = new Set();        // Track active user rooms
    }

    /**
     * Initialize Socket.IO server with the HTTP server
     * @param {http.Server} server - HTTP server instance
     * @param {Object} corsOptions - CORS configuration for Socket.IO
     */
    initialize(server, corsOptions) {
        this.io = new Server(server, {
            cors: corsOptions
        });

        // Make io available globally for other modules to access
        global.io = this.io;

        this.setupEventHandlers();
        
        const originsDisplay = Array.isArray(corsOptions.origin) ? corsOptions.origin.join(', ') : corsOptions.origin;
        console.log(`${colors.cyan}[SOCKET SERVICE]${colors.reset} Initialized with CORS origins: ${originsDisplay}`);
        
        return this.io;
    }

    /**
     * Set up Socket.IO event handlers for connection management
     */
    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`${colors.green}[SOCKET CONNECTED]${colors.reset} User connected: ${colors.yellow}${socket.id}${colors.reset}`);
            
            // Handle user joining their personal room for targeted notifications
            socket.on('join-user-room', (userId) => {
                this.joinUserRoom(socket, userId);
            });
            
            // Handle user authentication and room setup
            socket.on('authenticate', (userData) => {
                this.authenticateUser(socket, userData);
            });
            
            // Handle disconnection cleanup
            socket.on('disconnect', () => {
                this.handleDisconnection(socket);
            });

            // Handle ping/pong for connection health
            socket.on('ping', () => {
                socket.emit('pong');
            });
        });
    }

    /**
     * Add user to their personal room for targeted notifications
     * @param {Socket} socket - Socket instance
     * @param {string} userId - User ID
     */
    joinUserRoom(socket, userId) {
        const roomName = `user-${userId}`;
        socket.join(roomName);
        
        // Track the user connection
        this.connectedUsers.set(socket.id, {
            userId,
            roomName,
            connectedAt: new Date()
        });
        
        this.userRooms.add(roomName);
        
        console.log(`${colors.blue}[USER ROOM]${colors.reset} User ${colors.magenta}${userId}${colors.reset} joined room ${colors.cyan}${roomName}${colors.reset}`);
        
        // Send welcome message
        socket.emit('room-joined', {
            message: 'Successfully connected to notification service',
            userId,
            roomName,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Authenticate user and set up their connection
     * @param {Socket} socket - Socket instance
     * @param {Object} userData - User authentication data
     */
    authenticateUser(socket, userData) {
        const { userId, token } = userData;
        
        // Here you would validate the token with your auth system
        // For now, we'll just log and proceed
        console.log(`${colors.yellow}[USER AUTH]${colors.reset} User ${colors.magenta}${userId}${colors.reset} authenticated`);
        
        // Automatically join user room after authentication
        this.joinUserRoom(socket, userId);
    }

    /**
     * Handle socket disconnection and cleanup
     * @param {Socket} socket - Socket instance
     */
    handleDisconnection(socket) {
        const userInfo = this.connectedUsers.get(socket.id);
        
        if (userInfo) {
            console.log(`${colors.yellow}[SOCKET DISCONNECTED]${colors.reset} User ${colors.magenta}${userInfo.userId}${colors.reset} disconnected from ${colors.cyan}${userInfo.roomName}${colors.reset}`);
            this.connectedUsers.delete(socket.id);
        } else {
            console.log(`${colors.yellow}[SOCKET DISCONNECTED]${colors.reset} Unknown user: ${colors.yellow}${socket.id}${colors.reset}`);
        }
    }

    /**
     * Send notification to a specific user
     * @param {string} userId - Target user ID
     * @param {string} event - Event name
     * @param {Object} data - Data to send
     */
    sendToUser(userId, event, data) {
        if (!this.io) {
            console.error(`${colors.red}[SOCKET ERROR]${colors.reset} Socket.IO not initialized`);
            return false;
        }

        const roomName = `user-${userId}`;
        this.io.to(roomName).emit(event, data);
        
        console.log(`${colors.cyan}[SOCKET SEND]${colors.reset} Event ${colors.magenta}${event}${colors.reset} sent to user ${colors.yellow}${userId}${colors.reset}`);
        return true;
    }

    /**
     * Broadcast notification to all connected users
     * @param {string} event - Event name
     * @param {Object} data - Data to broadcast
     */
    broadcast(event, data) {
        if (!this.io) {
            console.error(`${colors.red}[SOCKET ERROR]${colors.reset} Socket.IO not initialized`);
            return false;
        }

        this.io.emit(event, data);
        
        console.log(`${colors.cyan}[SOCKET BROADCAST]${colors.reset} Event ${colors.magenta}${event}${colors.reset} broadcasted to all users`);
        return true;
    }

    /**
     * Get connection statistics
     * @returns {Object} Connection statistics
     */
    getStats() {
        if (!this.io) {
            return { error: 'Socket.IO not initialized' };
        }

        return {
            connectedSockets: this.io.sockets.sockets.size,
            connectedUsers: this.connectedUsers.size,
            activeUserRooms: this.userRooms.size,
            userConnections: Array.from(this.connectedUsers.values()).map(user => ({
                userId: user.userId,
                roomName: user.roomName,
                connectedAt: user.connectedAt
            }))
        };
    }

    /**
     * Check if a user is connected
     * @param {string} userId - User ID to check
     * @returns {boolean} Whether user is connected
     */
    isUserConnected(userId) {
        const roomName = `user-${userId}`;
        return this.userRooms.has(roomName);
    }

    /**
     * Get Socket.IO instance (for advanced usage)
     * @returns {Server} Socket.IO server instance
     */
    getIO() {
        return this.io;
    }

    /**
     * Shutdown the socket service
     */
    shutdown() {
        if (this.io) {
            console.log(`${colors.yellow}[SOCKET SERVICE]${colors.reset} Shutting down...`);
            this.io.close();
            this.connectedUsers.clear();
            this.userRooms.clear();
            global.io = null;
        }
    }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
