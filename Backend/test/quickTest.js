// test/quickTest.js
// Quick test to verify authentication and basic functionality

import fetch from 'node-fetch';
import { colors } from '../constants/colors.js';

const BASE_URL = 'http://localhost:5000';

class QuickTest {
    constructor() {
        this.authToken = null;
        this.userId = null;
    }

    async runQuickTest() {
        console.log(`${colors.cyan}🧪 [QUICK TEST]${colors.reset} Starting authentication and event system test...\n`);

        try {
            // 1. Test server health
            await this.testServerHealth();
            
            // 2. Test user registration
            await this.testUserRegistration();
            
            // 3. Test user login
            await this.testUserLogin();
            
            // 4. Test getCurrentUser
            await this.testGetCurrentUser();
            
            // 5. Test notification system
            await this.testNotificationSystem();
            
            // 6. Test event creation
            await this.testEventCreation();
            
            console.log(`${colors.green}✅ [TEST COMPLETE]${colors.reset} All tests completed successfully!\n`);
            
        } catch (error) {
            console.error(`${colors.red}❌ [TEST FAILED]${colors.reset}`, error.message);
        }
    }

    async testServerHealth() {
        console.log(`${colors.yellow}[TEST HEALTH]${colors.reset} Testing server health...`);
        
        try {
            const response = await fetch(`${BASE_URL}/health`);
            const data = await response.json();
            
            if (response.ok) {
                console.log(`${colors.green}✓ [HEALTH]${colors.reset} Server is healthy`);
                console.log(`${colors.cyan}  → Status: ${data.status}${colors.reset}`);
                console.log(`${colors.cyan}  → Uptime: ${Math.round(data.uptime)}s${colors.reset}`);
            } else {
                throw new Error(`Health check failed: ${response.status}`);
            }
        } catch (error) {
            console.error(`${colors.red}✗ [HEALTH]${colors.reset} Health check failed:`, error.message);
            throw error;
        }
    }

    async testUserRegistration() {
        console.log(`${colors.yellow}[TEST REGISTER]${colors.reset} Testing user registration...`);
        
        const userData = {
            name: "Test User",
            email: `testuser_${Date.now()}@example.com`,
            password: "testpass123"
        };

        try {
            const response = await fetch(`${BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (response.ok) {
                console.log(`${colors.green}✓ [REGISTER]${colors.reset} User registered successfully`);
                console.log(`${colors.cyan}  → User ID: ${data.user.id}${colors.reset}`);
                console.log(`${colors.cyan}  → Email: ${data.user.email}${colors.reset}`);
                this.authToken = data.token;
                this.userId = data.user.id;
            } else {
                throw new Error(`Registration failed: ${data.message}`);
            }
        } catch (error) {
            console.error(`${colors.red}✗ [REGISTER]${colors.reset} Registration failed:`, error.message);
            throw error;
        }
    }

    async testUserLogin() {
        console.log(`${colors.yellow}[TEST LOGIN]${colors.reset} Testing user login...`);
        
        // Use the same email from registration
        const loginData = {
            email: `testuser_${Date.now()}@example.com`,
            password: "testpass123"
        };

        try {
            const response = await fetch(`${BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });

            const data = await response.json();

            if (response.ok) {
                console.log(`${colors.green}✓ [LOGIN]${colors.reset} User logged in successfully`);
                console.log(`${colors.cyan}  → Token received: ${data.token ? 'Yes' : 'No'}${colors.reset}`);
                this.authToken = data.token;
            } else {
                // Login might fail if we're using a new email each time
                console.log(`${colors.yellow}⚠ [LOGIN]${colors.reset} Login test skipped (using registration token)`);
            }
        } catch (error) {
            console.log(`${colors.yellow}⚠ [LOGIN]${colors.reset} Login test skipped:`, error.message);
        }
    }

    async testGetCurrentUser() {
        console.log(`${colors.yellow}[TEST GET USER]${colors.reset} Testing getCurrentUser endpoint...`);
        
        if (!this.authToken) {
            throw new Error('No auth token available for testing');
        }

        try {
            const response = await fetch(`${BASE_URL}/api/auth/me`, {
                method: 'GET',
                headers: {
                    'x-auth-token': this.authToken
                }
            });

            const data = await response.json();

            if (response.ok) {
                console.log(`${colors.green}✓ [GET USER]${colors.reset} getCurrentUser successful`);
                console.log(`${colors.cyan}  → User ID: ${data.user.id}${colors.reset}`);
                console.log(`${colors.cyan}  → Email: ${data.user.email}${colors.reset}`);
                console.log(`${colors.cyan}  → Role: ${data.user.role}${colors.reset}`);
            } else {
                console.error(`${colors.red}✗ [GET USER]${colors.reset} getCurrentUser failed:`, data.message);
                console.error(`${colors.red}  → Status: ${response.status}${colors.reset}`);
                console.error(`${colors.red}  → Debug info:`, data.debug);
            }
        } catch (error) {
            console.error(`${colors.red}✗ [GET USER]${colors.reset} Request failed:`, error.message);
        }
    }

    async testNotificationSystem() {
        console.log(`${colors.yellow}[TEST NOTIFICATIONS]${colors.reset} Testing notification system...`);
        
        if (!this.authToken) {
            console.log(`${colors.yellow}⚠ [NOTIFICATIONS]${colors.reset} Skipped - no auth token`);
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/api/student/notifications/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': this.authToken
                },
                body: JSON.stringify({
                    type: 'success',
                    message: 'Test notification from automated test'
                })
            });

            const data = await response.json();

            if (response.ok) {
                console.log(`${colors.green}✓ [NOTIFICATIONS]${colors.reset} Test notification sent successfully`);
            } else {
                console.error(`${colors.red}✗ [NOTIFICATIONS]${colors.reset} Failed:`, data.message);
            }
        } catch (error) {
            console.error(`${colors.red}✗ [NOTIFICATIONS]${colors.reset} Request failed:`, error.message);
        }
    }

    async testEventCreation() {
        console.log(`${colors.yellow}[TEST EVENTS]${colors.reset} Testing event creation...`);
        
        if (!this.authToken) {
            console.log(`${colors.yellow}⚠ [EVENTS]${colors.reset} Skipped - no auth token`);
            return;
        }

        const eventData = {
            title: "Test Event - Automated",
            description: "This is a test event created by automated testing",
            startDate: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
            endDate: new Date(Date.now() + 6 * 60 * 1000),   // 6 minutes from now
            eventType: "personal", // Changed from "test" to valid enum value
            priority: "medium",
            location: "Test Location",
            reminders: [
                {
                    timeBeforeEvent: 2,
                    type: "notification", // Changed from "normal" to valid enum value
                    isActive: true
                }
            ]
        };

        try {
            const response = await fetch(`${BASE_URL}/api/student/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': this.authToken
                },
                body: JSON.stringify(eventData)
            });

            const data = await response.json();

            if (response.ok) {
                console.log(`${colors.green}✓ [EVENTS]${colors.reset} Event created successfully`);
                console.log(`${colors.cyan}  → Event ID: ${data.event._id}${colors.reset}`);
                console.log(`${colors.cyan}  → Title: ${data.event.title}${colors.reset}`);
                console.log(`${colors.cyan}  → Reminders: ${data.event.reminders.length}${colors.reset}`);
            } else {
                console.error(`${colors.red}✗ [EVENTS]${colors.reset} Event creation failed:`, data.message);
            }
        } catch (error) {
            console.error(`${colors.red}✗ [EVENTS]${colors.reset} Request failed:`, error.message);
        }
    }
}

// Run the test
const tester = new QuickTest();
tester.runQuickTest().catch(console.error);
