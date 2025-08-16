// routes/studentRoutes.js
import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import studentController from '../controllers/studentController.js';

const router = express.Router();

// Apply authentication middleware to all student routes
router.use(authMiddleware);

// Get all courses the student is enrolled in
router.get('/courses', studentController.getEnrolledCourses);

// Get detailed information about a specific course
router.get('/courses/:courseId', studentController.getCourseDetails);

// Get assignments for a specific course
router.get('/courses/:courseId/assignments', studentController.getCourseAssignments);

// Get quizzes for a specific course
router.get('/courses/:courseId/quizzes', studentController.getCourseQuizzes);

// Get student's progress for a specific course
router.get('/courses/:courseId/progress', studentController.getCourseProgress);

// Learning dashboard modules
router.get('/courses/:courseId/modules', studentController.getCourseModules);
router.post('/courses/:courseId/modules/:moduleId/complete', studentController.completeModule);

// Submit an assignment
router.post('/assignments/:assignmentId/submit', studentController.submitAssignment);

// Submit a quiz attempt
router.post('/quizzes/:quizId/submit', studentController.submitQuiz);

// Create a note for a course topic
router.post('/courses/:courseId/topics/:topicId/notes', studentController.createNote);

// Get notes for a course topic
router.get('/courses/:courseId/topics/:topicId/notes', studentController.getNotesByTopic);

// ============ EVENT MANAGEMENT ROUTES ============

// Event CRUD operations
router.post('/events', studentController.createEvent);
router.get('/events', studentController.getEvents);
router.get('/events/upcoming', studentController.getUpcomingEvents);
router.get('/events/calendar', studentController.getEventsByDateRange);
router.put('/events/:eventId', studentController.updateEvent);
router.delete('/events/:eventId', studentController.deleteEvent);
router.post('/events/:eventId/complete', studentController.completeEvent);

// Timer management
router.post('/events/:eventId/timer/start', studentController.startEventTimer);
router.post('/events/:eventId/timer/pause', studentController.pauseEventTimer);
router.post('/events/:eventId/timer/resume', studentController.resumeEventTimer);
router.post('/events/:eventId/timer/stop', studentController.stopEventTimer);
router.get('/events/:eventId/timer/status', studentController.getEventTimerStatus);

// Reminder management
router.post('/events/:eventId/reminders', studentController.addEventReminder);
router.get('/events/reminders/pending', studentController.getEventsNeedingReminders);
router.get('/events/reminders/upcoming', studentController.getUpcomingReminders);
router.post('/events/:eventId/reminders/mark-sent', studentController.markReminderAsSent);

// ============ NOTIFICATION SYSTEM ROUTES ============

// Test notification system
router.post('/notifications/test', studentController.testNotification);

// Get notification statistics
router.get('/notifications/stats', studentController.getNotificationStats);

// ============ DATABASE SEEDING AND SETUP ROUTES ============

// Seed database with default courses and data
router.post('/seed-database', studentController.seedDatabase);

// Enroll user in all available courses
router.post('/enroll-all-courses', studentController.enrollInAllCourses);

// Trigger manual reminder check (for testing)
router.post('/reminders/trigger-check', studentController.triggerReminderCheck);

export default router;