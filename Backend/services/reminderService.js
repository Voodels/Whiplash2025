// services/reminderService.js
import Event from '../models/general/Events.js';
import User from '../models/User.js';
import { sendReminderToast } from '../utils/notificationUtils.js';
import { colors } from '../constants/colors.js';

class ReminderService {
    constructor() {
        this.isRunning = false;
        this.interval = null;
        this.checkInterval = 60000; // Check every minute
    }

    start() {
        if (this.isRunning) {
            console.log(`${colors.yellow}[REMINDER SERVICE]${colors.reset} Already running`);
            return;
        }

        console.log(`${colors.green}[REMINDER SERVICE]${colors.reset} Starting reminder service...`);
        this.isRunning = true;
        this.interval = setInterval(() => {
            this.checkAndSendReminders();
        }, this.checkInterval);
    }

    stop() {
        if (!this.isRunning) {
            console.log(`${colors.yellow}[REMINDER SERVICE]${colors.reset} Not running`);
            return;
        }

        console.log(`${colors.red}[REMINDER SERVICE]${colors.reset} Stopping reminder service...`);
        this.isRunning = false;
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    async checkAndSendReminders() {
        try {
            const now = new Date();
            
            // Find events that need reminders
            const events = await Event.find({
                status: 'upcoming',
                startDate: { $gte: now }, // Only future events
                'reminders.isActive': true
            }).populate('userId', 'name email');

            let remindersSent = 0;

            for (const event of events) {
                for (let i = 0; i < event.reminders.length; i++) {
                    const reminder = event.reminders[i];
                    
                    // Skip if reminder already sent or not active
                    if (!reminder.isActive || reminder.sentAt) {
                        continue;
                    }

                    // Calculate when reminder should be sent
                    const reminderTime = new Date(
                        event.startDate.getTime() - (reminder.timeBeforeEvent * 60 * 1000)
                    );

                    // Check if it's time to send this reminder
                    if (now >= reminderTime) {
                        await this.sendReminder(event, reminder, i);
                        remindersSent++;
                    }
                }
            }

            if (remindersSent > 0) {
                console.log(`${colors.blue}[REMINDER SERVICE]${colors.reset} Sent ${remindersSent} reminders`);
            }
        } catch (error) {
            console.error(`${colors.red}[REMINDER SERVICE ERROR]${colors.reset}`, error.message);
        }
    }

    async sendReminder(event, reminder, reminderIndex) {
        try {
            // Mark reminder as sent
            event.reminders[reminderIndex].sentAt = new Date();
            
            // Add notification to the event
            event.notifications.push({
                message: `Reminder: ${event.title} starts in ${reminder.timeBeforeEvent} minutes`,
                type: 'reminder',
                sentAt: new Date(),
                isRead: false
            });

            await event.save();

            // Send toast notification to user
            sendReminderToast(event.userId.toString(), event, reminder);

            // Log the reminder for server monitoring
            this.logReminder(event, reminder);

            // You can extend this to send additional notifications:
            // - Email notifications
            // - Push notifications (for mobile apps)
            // - SMS notifications
            // - Slack/Discord webhook notifications

        } catch (error) {
            console.error(`${colors.red}[REMINDER SERVICE ERROR]${colors.reset} Failed to send reminder:`, error.message);
        }
    }

    logReminder(event, reminder) {
        const timeStr = this.formatTime(reminder.timeBeforeEvent);
        console.log(`${colors.cyan}[REMINDER SENT]${colors.reset} ${colors.magenta}${event.title}${colors.reset} - ${timeStr} before event`);
    }

    formatTime(minutes) {
        if (minutes < 60) {
            return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
        }
        
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        
        if (remainingMinutes === 0) {
            return `${hours} hour${hours !== 1 ? 's' : ''}`;
        }
        
        return `${hours} hour${hours !== 1 ? 's' : ''} and ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
    }

    // Method to get upcoming reminders for a user
    async getUpcomingReminders(userId, limit = 10) {
        try {
            const now = new Date();
            const events = await Event.find({
                userId,
                status: 'upcoming',
                startDate: { $gte: now },
                'reminders.isActive': true
            }).sort({ startDate: 1 }).limit(limit);

            const upcomingReminders = [];

            events.forEach(event => {
                event.reminders.forEach((reminder, index) => {
                    if (reminder.isActive && !reminder.sentAt) {
                        const reminderTime = new Date(
                            event.startDate.getTime() - (reminder.timeBeforeEvent * 60 * 1000)
                        );

                        if (reminderTime >= now) {
                            upcomingReminders.push({
                                eventId: event._id,
                                eventTitle: event.title,
                                eventStartDate: event.startDate,
                                reminderTime,
                                timeBeforeEvent: reminder.timeBeforeEvent,
                                type: reminder.type
                            });
                        }
                    }
                });
            });

            // Sort by reminder time
            upcomingReminders.sort((a, b) => a.reminderTime - b.reminderTime);

            return upcomingReminders.slice(0, limit);
        } catch (error) {
            console.error('Error getting upcoming reminders:', error);
            throw error;
        }
    }

    // Method to manually trigger reminder check (for testing)
    async triggerManualCheck() {
        console.log(`${colors.yellow}[REMINDER SERVICE]${colors.reset} Manual reminder check triggered`);
        await this.checkAndSendReminders();
    }

    // Clean up old events and notifications
    async cleanupOldData() {
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            // Remove old completed events
            const deletedEvents = await Event.deleteMany({
                status: 'completed',
                updatedAt: { $lt: thirtyDaysAgo }
            });

            // Clean up old notifications in remaining events
            await Event.updateMany(
                {},
                {
                    $pull: {
                        notifications: {
                            sentAt: { $lt: thirtyDaysAgo }
                        }
                    }
                }
            );

            console.log(`${colors.blue}[REMINDER SERVICE]${colors.reset} Cleaned up ${deletedEvents.deletedCount} old events`);
        } catch (error) {
            console.error(`${colors.red}[REMINDER SERVICE ERROR]${colors.reset} Cleanup failed:`, error.message);
        }
    }
}

// Create and export singleton instance
const reminderService = new ReminderService();

export default reminderService;
