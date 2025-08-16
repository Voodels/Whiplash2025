// utils/notificationUtils.js
import { colors } from '../constants/colors.js';

/**
 * Send a toast notification to a specific user
 * @param {string} userId - The user ID to send notification to
 * @param {object} notification - Notification object
 */
export const sendToastNotification = (userId, notification) => {
    try {
        const io = global.io;
        
        if (!io) {
            console.error(`${colors.red}[NOTIFICATION ERROR]${colors.reset} Socket.IO not initialized`);
            return false;
        }

        const toastData = {
            id: Date.now().toString(), // Simple ID generation
            title: notification.title || 'Notification',
            message: notification.message,
            type: notification.type || 'info', // success, error, warning, info
            duration: notification.duration || 5000, // Auto-close duration
            timestamp: new Date().toISOString(),
            action: notification.action || null, // Optional action button
            persistent: notification.persistent || false // Whether it stays until manually closed
        };

        // Send to specific user room
        io.to(`user-${userId}`).emit('toast-notification', toastData);
        
        console.log(`${colors.cyan}[TOAST SENT]${colors.reset} ${colors.magenta}${notification.type}${colors.reset} → User ${userId}: ${notification.message}`);
        
        return true;
    } catch (error) {
        console.error(`${colors.red}[NOTIFICATION ERROR]${colors.reset}`, error.message);
        return false;
    }
};

/**
 * Send a reminder toast notification
 * @param {string} userId - The user ID
 * @param {object} event - Event object
 * @param {object} reminder - Reminder object
 */
export const sendReminderToast = (userId, event, reminder) => {
    const timeStr = formatTime(reminder.timeBeforeEvent);
    
    const notification = {
        title: `⏰ Event Reminder`,
        message: `${event.title} starts in ${timeStr}`,
        type: 'warning',
        duration: 8000,
        persistent: false,
        action: {
            label: 'View Event',
            url: `/events/${event._id}`
        }
    };
    
    return sendToastNotification(userId, notification);
};

/**
 * Send an event notification
 * @param {string} userId - The user ID
 * @param {string} message - Notification message
 * @param {string} type - Notification type
 * @param {object} eventData - Optional event data
 */
export const sendEventNotification = (userId, message, type = 'info', eventData = null) => {
    const notification = {
        title: '📅 Event Update',
        message,
        type,
        duration: 6000,
        persistent: false
    };
    
    if (eventData && eventData.eventId) {
        notification.action = {
            label: 'View Event',
            url: `/events/${eventData.eventId}`
        };
    }
    
    return sendToastNotification(userId, notification);
};

/**
 * Send a general system notification
 * @param {string} userId - The user ID
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} type - Notification type
 */
export const sendSystemNotification = (userId, title, message, type = 'info') => {
    const notification = {
        title,
        message,
        type,
        duration: 5000,
        persistent: false
    };
    
    return sendToastNotification(userId, notification);
};

/**
 * Broadcast notification to all connected users
 * @param {object} notification - Notification object
 */
export const broadcastNotification = (notification) => {
    try {
        const io = global.io;
        
        if (!io) {
            console.error(`${colors.red}[NOTIFICATION ERROR]${colors.reset} Socket.IO not initialized`);
            return false;
        }

        const toastData = {
            id: Date.now().toString(),
            title: notification.title || 'System Notification',
            message: notification.message,
            type: notification.type || 'info',
            duration: notification.duration || 6000,
            timestamp: new Date().toISOString(),
            persistent: notification.persistent || false
        };

        // Broadcast to all connected users
        io.emit('toast-notification', toastData);
        
        console.log(`${colors.cyan}[BROADCAST TOAST]${colors.reset} ${colors.magenta}${notification.type}${colors.reset}: ${notification.message}`);
        
        return true;
    } catch (error) {
        console.error(`${colors.red}[NOTIFICATION ERROR]${colors.reset}`, error.message);
        return false;
    }
};

/**
 * Format time duration for display
 * @param {number} minutes - Time in minutes
 * @returns {string} Formatted time string
 */
const formatTime = (minutes) => {
    if (minutes < 60) {
        return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
        return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    
    return `${hours} hour${hours !== 1 ? 's' : ''} and ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
};

/**
 * Get notification statistics for admin/debugging
 */
export const getNotificationStats = () => {
    try {
        const io = global.io;
        
        if (!io) {
            return { error: 'Socket.IO not initialized' };
        }

        const sockets = io.sockets.sockets;
        const connectedUsers = sockets.size;
        const rooms = Array.from(io.sockets.adapter.rooms.keys())
            .filter(room => room.startsWith('user-'));

        return {
            connectedUsers,
            activeUserRooms: rooms.length,
            totalSockets: sockets.size
        };
    } catch (error) {
        return { error: error.message };
    }
};
