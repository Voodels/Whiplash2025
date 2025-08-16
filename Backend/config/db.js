import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { colors } from '../constants/colors.js';
import { seedDatabase } from './seedData.js';

// Load environment variables from .env file
dotenv.config();

export const connectDB = async () => {
    console.log(`${colors.yellow}[DATABASE]${colors.reset} Connecting to MongoDB...`);
    console.log(`${colors.cyan}[DATABASE]${colors.reset} MongoDB URI: ${process.env.MONGO_URI}`);
    
    try {
        // Connect to MongoDB with better error handling and options
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            heartbeatFrequencyMS: 2000,     // Send a ping every 2 seconds
            maxPoolSize: 10,                // Maintain up to 10 socket connections
            bufferCommands: false,          // Disable mongoose buffering
        });
        
        console.log(`${colors.green}[DATABASE]${colors.reset} MongoDB Connected: ${colors.cyan}${conn.connection.host}${colors.reset}`);
        console.log(`${colors.green}[DATABASE]${colors.reset} Database: ${colors.cyan}${conn.connection.name}${colors.reset}`);
        
        // Seed database with default data in development
        if (process.env.NODE_ENV !== 'production') {
            try {
                const seedResult = await seedDatabase();
                if (seedResult.success) {
                    console.log(`${colors.green}[DATABASE]${colors.reset} Seed data summary:`, seedResult.summary);
                }
            } catch (seedError) {
                console.warn(`${colors.yellow}[DATABASE]${colors.reset} Seeding failed (this is normal if data already exists):`, seedError.message);
            }
        }
        
        // Handle connection events
        mongoose.connection.on('connected', () => {
            console.log(`${colors.green}[DATABASE]${colors.reset} MongoDB connection established`);
        });
        
        // Return the connection object to indicate successful connection
        return conn;
        
        mongoose.connection.on('error', (err) => {
            console.error(`${colors.red}[DATABASE ERROR]${colors.reset} MongoDB connection error:`, err.message);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.warn(`${colors.yellow}[DATABASE]${colors.reset} MongoDB disconnected. Attempting to reconnect...`);
        });
        
        mongoose.connection.on('reconnected', () => {
            console.log(`${colors.green}[DATABASE]${colors.reset} MongoDB reconnected successfully`);
        });
        
        // Handle application termination
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log(`${colors.yellow}[DATABASE]${colors.reset} MongoDB connection closed through app termination`);
        });
        
    } catch (error) {
        console.error(`${colors.red}[DATABASE ERROR]${colors.reset} Connection failed:`, error.message);
        
        // More specific error messages
        if (error.message.includes('ECONNREFUSED')) {
            console.error(`${colors.red}[DATABASE ERROR]${colors.reset} MongoDB server is not running or not accessible`);
            console.error(`${colors.yellow}[DATABASE HELP]${colors.reset} Try starting MongoDB with: docker run -d --name mongodb -p 27017:27017 mongo:5.0`);
        } else if (error.message.includes('authentication failed')) {
            console.error(`${colors.red}[DATABASE ERROR]${colors.reset} MongoDB authentication failed. Check your credentials.`);
        } else if (error.message.includes('getaddrinfo ENOTFOUND')) {
            console.error(`${colors.red}[DATABASE ERROR]${colors.reset} MongoDB host not found. Check your connection string.`);
        }
        
        // Don't exit the process immediately, allow for retry
        console.log(`${colors.yellow}[DATABASE]${colors.reset} Will attempt to reconnect when MongoDB becomes available...`);
        
        // Throw the error so it can be caught by the caller
        throw error;
    }
};
