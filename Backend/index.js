// ====================================================================
// MAIN SERVER FILE - WhipLash Learning Platform Backend
// ====================================================================
// This file sets up the Express server with Socket.IO for real-time notifications,
// MongoDB connection, middleware configuration, and route handling.

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { connectDB } from './config/db.js';
import dotenv from 'dotenv';

// Import centralized services and constants
import { colors, colorSchemes } from './constants/colors.js';
import socketService from './services/socketService.js';
import reminderService from './services/reminderService.js';

// Load environment variables from .env file
dotenv.config();

// Store server start time for uptime calculation
const serverStartTime = Date.now();

// ====================================================================
// MIDDLEWARE SETUP
// ====================================================================

/**
 * Custom API logging middleware for request/response tracking
 * Provides colored console output for better development experience
 */
const apiLogger = (req, res, next) => {
    const timestamp = new Date().toLocaleTimeString();
    const method = req.method;
    const url = req.originalUrl;
    
    // Get color based on HTTP method using centralized color scheme
    const methodColor = colorSchemes.http[method] || colors.white;
    
    // Log incoming request with timestamp and colored method
    console.log(`${colors.dim}[${timestamp}]${colors.reset} ${colors.cyan}[API HIT]${colors.reset} → ${methodColor}${colors.bright}${method}${colors.reset} ${colors.magenta}${url}${colors.reset}`);
    
    // Override res.send to log response status when request completes
    const originalSend = res.send;
    res.send = function(data) {
        const statusColor = res.statusCode >= 400 ? colors.red : colors.green;
        console.log(`${colors.dim}[${timestamp}]${colors.reset} ${colors.cyan}[RESPONSE]${colors.reset} → ${statusColor}${res.statusCode}${colors.reset} ${colors.magenta}${url}${colors.reset}`);
        originalSend.call(this, data);
    };
    
    next();
};

// ====================================================================
// ====================================================================
// ROUTE IMPORTS
// ====================================================================
import authRoutes from './routes/auth.js'
import studentRoutes from './routes/studentRoutes.js'
import microservicesRoutes from './routes/microservices.js'

// ====================================================================
// SERVER INITIALIZATION
// ====================================================================

// Initialize Express application
const app = express();

// Create HTTP server (required for Socket.IO integration)
const server = createServer(app);

// CORS configuration for both Express and Socket.IO - Allow all origins for development
const corsOptions = {
    origin: "*", // Allow all origins - will be restricted in production
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: false, // Set to false when using wildcard origin
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
};

// Initialize Socket.IO service with centralized management
// This creates a global.io instance accessible throughout the application
socketService.initialize(server, {
    origin: "*", // Allow all origins for development
    methods: ['GET', 'POST'],
    credentials: false
});

console.log(`${colors.green}[SERVER INIT]${colors.reset} Express server and Socket.IO initialized`);

// ====================================================================
// MIDDLEWARE CONFIGURATION
// ====================================================================

// Enable CORS for cross-origin requests from frontend
app.use(cors(corsOptions));

// Handle preflight requests for all routes
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-auth-token');
    res.sendStatus(200);
});

// Parse JSON request bodies (limit can be configured)
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded request bodies (for form submissions)
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add custom API logging middleware for request/response tracking
app.use(apiLogger);

console.log(`${colors.blue}[MIDDLEWARE]${colors.reset} CORS, JSON parsing, and logging middleware configured`);

// ====================================================================
// DATABASE CONNECTION
// ====================================================================

// Connect to MongoDB database and wait for it to be ready before starting server
async function initializeDatabase() {
    try {
        await connectDB();
        console.log(`${colors.green}[DATABASE]${colors.reset} MongoDB connection established and ready`);
        return true;
    } catch (error) {
        console.error(`${colors.red}[DATABASE ERROR]${colors.reset} Failed to connect to MongoDB:`, error.message);
        return false;
    }
}

// ====================================================================
// HEALTH CHECK ENDPOINT
// ====================================================================

/**
 * Simple health check endpoint for monitoring server status
 * Returns server status, uptime, and basic system information
 */
app.get('/health', (req, res) => {
    const uptime = (Date.now() - serverStartTime) / 1000; // Uptime in seconds
    
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: uptime,
        environment: process.env.NODE_ENV || 'development',
        memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100
        }
    });
});

// ====================================================================
// ROUTE CONFIGURATION
// ====================================================================

// Authentication routes - handles user login, registration, password reset
app.use('/api/auth', authRoutes);

// Student-specific routes - handles courses, assignments, events, notifications
app.use('/api/student', studentRoutes);

// Microservices routes - handles communication with backend microservices
app.use('/api/microservices', microservicesRoutes);

console.log(`${colors.magenta}[ROUTES]${colors.reset} API routes configured: /api/auth, /api/student, /api/microservices, /health`);

// ====================================================================
// SERVER STARTUP AND SERVICE INITIALIZATION
// ====================================================================

const PORT = process.env.PORT || 5000;

/**
 * Start the server only after database connection is established
 */
async function startServer() {
    try {
        // Wait for database connection
        console.log(`${colors.yellow}[STARTUP]${colors.reset} Waiting for database connection...`);
        const dbConnected = await initializeDatabase();
        
        if (!dbConnected) {
            console.error(`${colors.red}[STARTUP ERROR]${colors.reset} Cannot start server without database connection`);
            process.exit(1);
        }
        
        // Start the HTTP server
        server.listen(PORT, () => {
            console.log(`${colors.green}${colors.bright}🚀 WhipLash Server Started Successfully!${colors.reset}`);
            console.log(`${colors.cyan}   Server URL: http://localhost:${PORT}${colors.reset}`);
            console.log(`${colors.cyan}   Environment: ${process.env.NODE_ENV || 'development'}${colors.reset}`);
            console.log(`${colors.cyan}   Socket.IO: Ready for real-time notifications${colors.reset}`);
            
            // Start the reminder service for event notifications
            reminderService.start();
            console.log(`${colors.magenta}[REMINDER SERVICE]${colors.reset} Started and monitoring events`);
            
            // Set up automated cleanup job (runs every 24 hours)
            setInterval(() => {
                console.log(`${colors.yellow}[CLEANUP JOB]${colors.reset} Running automated data cleanup...`);
                reminderService.cleanupOldData();
            }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
            
            console.log(`${colors.green}[SYSTEM READY]${colors.reset} All services initialized and running`);
        });
        
    } catch (error) {
        console.error(`${colors.red}[STARTUP ERROR]${colors.reset} Failed to start server:`, error.message);
        process.exit(1);
    }
}

// Start the server
startServer();

// ====================================================================
// GRACEFUL SHUTDOWN HANDLERS
// ====================================================================

/**
 * Handle SIGINT signal (Ctrl+C)
 * Ensures proper cleanup of services before shutting down
 */
process.on('SIGINT', () => {
    console.log(`\n${colors.yellow}[SHUTDOWN]${colors.reset} Received SIGINT signal, shutting down gracefully...`);
    
    // Stop reminder service
    reminderService.stop();
    console.log(`${colors.yellow}[SHUTDOWN]${colors.reset} Reminder service stopped`);
    
    // Shutdown socket service
    socketService.shutdown();
    console.log(`${colors.yellow}[SHUTDOWN]${colors.reset} Socket service stopped`);
    
    console.log(`${colors.green}[SHUTDOWN]${colors.reset} Server shutdown complete`);
    process.exit(0);
});

/**
 * Handle SIGTERM signal (deployment/container shutdown)
 * Ensures proper cleanup of services before shutting down
 */
process.on('SIGTERM', () => {
    console.log(`\n${colors.yellow}[SHUTDOWN]${colors.reset} Received SIGTERM signal, shutting down gracefully...`);
    
    // Stop reminder service
    reminderService.stop();
    console.log(`${colors.yellow}[SHUTDOWN]${colors.reset} Reminder service stopped`);
    
    // Shutdown socket service
    socketService.shutdown();
    console.log(`${colors.yellow}[SHUTDOWN]${colors.reset} Socket service stopped`);
    
    console.log(`${colors.green}[SHUTDOWN]${colors.reset} Server shutdown complete`);
    process.exit(0);
});