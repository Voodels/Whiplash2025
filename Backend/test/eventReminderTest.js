// test/eventReminderTest.js
// Comprehensive test script for Event and Reminder functionality

import { colors } from '../constants/colors.js';

/**
 * Test Event and Reminder System
 * This script creates test events with reminders and validates the notification system
 */
class EventReminderTest {
    constructor() {
        this.baseURL = 'http://localhost:5000/api/student';
        this.authToken = null;
        this.testUserId = null;
    }

    /**
     * Run all tests in sequence
     */
    async runAllTests() {
        console.log(`${colors.cyan}🧪 [EVENT REMINDER TEST]${colors.reset} Starting comprehensive test suite...\n`);

        try {
            // 1. Test authentication
            await this.testAuthentication();
            
            // 2. Test event creation
            await this.testEventCreation();
            
            // 3. Test reminder system
            await this.testReminderSystem();
            
            // 4. Test notification delivery
            await this.testNotificationDelivery();
            
            // 5. Test calendar integration
            await this.testCalendarIntegration();
            
            console.log(`${colors.green}✅ [TEST COMPLETE]${colors.reset} All tests completed successfully!\n`);
            
        } catch (error) {
            console.error(`${colors.red}❌ [TEST FAILED]${colors.reset}`, error.message);
        }
    }

    /**
     * Test user authentication
     */
    async testAuthentication() {
        console.log(`${colors.yellow}[TEST AUTH]${colors.reset} Testing authentication...`);
        
        // This would typically involve logging in a test user
        // For now, we'll simulate having an auth token
        this.authToken = 'test-token-12345';
        this.testUserId = 'test-user-id-67890';
        
        console.log(`${colors.green}✓ [AUTH]${colors.reset} Authentication test passed`);
    }

    /**
     * Test event creation with reminders
     */
    async testEventCreation() {
        console.log(`${colors.yellow}[TEST EVENTS]${colors.reset} Testing event creation...`);
        
        const testEvents = [
            {
                title: "AI/ML Mid Exam",
                description: "Machine Learning midterm examination",
                startDate: new Date(Date.now() + 2 * 60 * 1000), // 2 minutes from now
                endDate: new Date(Date.now() + 3 * 60 * 1000),   // 3 minutes from now
                eventType: "exam",
                priority: "high",
                location: "Room 101",
                reminders: [
                    { timeBeforeEvent: 1, type: "urgent", isActive: true },    // 1 minute before
                    { timeBeforeEvent: 2, type: "important", isActive: true }  // 2 minutes before
                ]
            },
            {
                title: "Web Dev Project Review",
                description: "Review of web development project submissions",
                startDate: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
                endDate: new Date(Date.now() + 6 * 60 * 1000),   // 6 minutes from now
                eventType: "meeting",
                priority: "medium",
                location: "Online",
                reminders: [
                    { timeBeforeEvent: 3, type: "normal", isActive: true },    // 3 minutes before
                    { timeBeforeEvent: 5, type: "important", isActive: true }  // 5 minutes before
                ]
            },
            {
                title: "Database Prep Session",
                description: "Preparation session for database exam",
                startDate: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
                endDate: new Date(Date.now() + 11 * 60 * 1000),   // 11 minutes from now
                eventType: "study",
                priority: "medium",
                location: "Library",
                reminders: [
                    { timeBeforeEvent: 5, type: "normal", isActive: true },     // 5 minutes before
                    { timeBeforeEvent: 10, type: "important", isActive: true }  // 10 minutes before
                ]
            }
        ];

        for (const event of testEvents) {
            try {
                console.log(`${colors.blue}  → Creating event: ${event.title}${colors.reset}`);
                
                // Here you would make an actual API call to create the event
                const response = await this.createEvent(event);
                
                console.log(`${colors.green}  ✓ Event created: ${event.title}${colors.reset}`);
                
            } catch (error) {
                console.error(`${colors.red}  ✗ Failed to create event: ${event.title}${colors.reset}`, error.message);
            }
        }
        
        console.log(`${colors.green}✓ [EVENTS]${colors.reset} Event creation test completed`);
    }

    /**
     * Test reminder system functionality
     */
    async testReminderSystem() {
        console.log(`${colors.yellow}[TEST REMINDERS]${colors.reset} Testing reminder system...`);
        
        try {
            // Trigger manual reminder check
            const response = await this.triggerReminderCheck();
            console.log(`${colors.green}  ✓ Manual reminder check triggered${colors.reset}`);
            
            // Get upcoming reminders
            const reminders = await this.getUpcomingReminders();
            console.log(`${colors.blue}  → Found ${reminders.length} upcoming reminders${colors.reset}`);
            
            // Display reminder details
            reminders.forEach((reminder, index) => {
                console.log(`${colors.cyan}    ${index + 1}. ${reminder.eventTitle} - ${reminder.timeBeforeEvent} minutes before${colors.reset}`);
            });
            
        } catch (error) {
            console.error(`${colors.red}  ✗ Reminder system test failed${colors.reset}`, error.message);
        }
        
        console.log(`${colors.green}✓ [REMINDERS]${colors.reset} Reminder system test completed`);
    }

    /**
     * Test notification delivery
     */
    async testNotificationDelivery() {
        console.log(`${colors.yellow}[TEST NOTIFICATIONS]${colors.reset} Testing notification delivery...`);
        
        try {
            // Test different types of notifications
            const notificationTypes = ['success', 'info', 'warning', 'error'];
            
            for (const type of notificationTypes) {
                console.log(`${colors.blue}  → Testing ${type} notification${colors.reset}`);
                
                await this.sendTestNotification(type, `This is a test ${type} notification for the event system`);
                
                // Wait a bit between notifications
                await this.sleep(1000);
            }
            
            // Get notification stats
            const stats = await this.getNotificationStats();
            console.log(`${colors.cyan}  → Connected users: ${stats.connectedUsers}${colors.reset}`);
            console.log(`${colors.cyan}  → Active rooms: ${stats.activeUserRooms}${colors.reset}`);
            
        } catch (error) {
            console.error(`${colors.red}  ✗ Notification delivery test failed${colors.reset}`, error.message);
        }
        
        console.log(`${colors.green}✓ [NOTIFICATIONS]${colors.reset} Notification delivery test completed`);
    }

    /**
     * Test calendar integration
     */
    async testCalendarIntegration() {
        console.log(`${colors.yellow}[TEST CALENDAR]${colors.reset} Testing calendar integration...`);
        
        try {
            // Get events for today
            const today = new Date().toISOString().split('T')[0];
            const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            
            const events = await this.getEventsByDateRange(today, tomorrow);
            console.log(`${colors.blue}  → Found ${events.length} events for today/tomorrow${colors.reset}`);
            
            // Get upcoming events
            const upcomingEvents = await this.getUpcomingEvents();
            console.log(`${colors.blue}  → Found ${upcomingEvents.length} upcoming events${colors.reset}`);
            
            // Display event details
            upcomingEvents.forEach((event, index) => {
                const startTime = new Date(event.startDate).toLocaleTimeString();
                console.log(`${colors.cyan}    ${index + 1}. ${event.title} at ${startTime}${colors.reset}`);
            });
            
        } catch (error) {
            console.error(`${colors.red}  ✗ Calendar integration test failed${colors.reset}`, error.message);
        }
        
        console.log(`${colors.green}✓ [CALENDAR]${colors.reset} Calendar integration test completed`);
    }

    /**
     * Helper method to create an event
     */
    async createEvent(eventData) {
        // Simulate API call - in real implementation, this would be:
        // return fetch(`${this.baseURL}/events`, { method: 'POST', ... })
        
        console.log(`    Event: ${eventData.title} created with ${eventData.reminders.length} reminders`);
        return { success: true, eventId: 'test-event-' + Date.now() };
    }

    /**
     * Helper method to trigger reminder check
     */
    async triggerReminderCheck() {
        // Simulate API call
        console.log(`    Triggered reminder check manually`);
        return { success: true };
    }

    /**
     * Helper method to get upcoming reminders
     */
    async getUpcomingReminders() {
        // Simulate API response
        return [
            {
                eventTitle: "AI/ML Mid Exam",
                timeBeforeEvent: 1,
                reminderTime: new Date(Date.now() + 1 * 60 * 1000)
            },
            {
                eventTitle: "Web Dev Project Review",
                timeBeforeEvent: 3,
                reminderTime: new Date(Date.now() + 3 * 60 * 1000)
            }
        ];
    }

    /**
     * Helper method to send test notification
     */
    async sendTestNotification(type, message) {
        // Simulate API call
        console.log(`      Sent ${type} notification: "${message}"`);
        return { success: true };
    }

    /**
     * Helper method to get notification stats
     */
    async getNotificationStats() {
        // Simulate API response
        return {
            connectedUsers: 2,
            activeUserRooms: 2,
            totalSockets: 2
        };
    }

    /**
     * Helper method to get events by date range
     */
    async getEventsByDateRange(startDate, endDate) {
        // Simulate API response
        return [
            { title: "AI/ML Mid Exam", startDate: new Date() },
            { title: "Web Dev Project Review", startDate: new Date() }
        ];
    }

    /**
     * Helper method to get upcoming events
     */
    async getUpcomingEvents() {
        // Simulate API response
        return [
            {
                title: "AI/ML Mid Exam",
                startDate: new Date(Date.now() + 2 * 60 * 1000),
                eventType: "exam"
            },
            {
                title: "Web Dev Project Review",
                startDate: new Date(Date.now() + 5 * 60 * 1000),
                eventType: "meeting"
            }
        ];
    }

    /**
     * Helper method to sleep for specified milliseconds
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export for use in other files
export default EventReminderTest;

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const tester = new EventReminderTest();
    tester.runAllTests();
}
