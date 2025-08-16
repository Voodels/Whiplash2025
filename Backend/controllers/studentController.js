// controllers/studentController.js
import User from '../models/User.js';
import Course from '../models/Course.js';
import Assignment from '../models/general/Assignment.js';
import Quiz from '../models/general/Quiz.js';
import Note from '../models/general/Note.js';
import UserProgress from '../models/UserProgress.js';
import Submission from '../models/general/Submission.js';
import Event from '../models/general/Events.js';
import { colors } from '../constants/colors.js';

// --- LOGGING DECORATOR ---
function logFunctionHit(filename, fnName) {
  return function (originalFn) {
    return async function (...args) {
      console.log(`${colors.blue}[CONTROLLER]${colors.reset} ${colors.yellow}${filename}${colors.reset}/${colors.magenta}${fnName}${colors.reset} ${colors.green}HIT${colors.reset}`);
      return originalFn.apply(this, args);
    };
  };
}

const studentController = {
  // Get all courses the student is enrolled in
  getEnrolledCourses: logFunctionHit('studentController.js', 'getEnrolledCourses')(async (req, res) => {
    try {
      const userId = req.user.id; // Assuming authMiddleware sets req.user
      
      // Find user and populate enrolled courses
      const user = await User.findById(userId)
        .populate({
          path: 'enrolledCourses',
          select: 'courseId title subject description topics'
        });
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      return res.status(200).json({
        success: true,
        courses: user.enrolledCourses
      });
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error while fetching enrolled courses' 
      });
    }
  }),

  // Get detailed information about a specific course
  getCourseDetails: logFunctionHit('studentController.js', 'getCourseDetails')(async (req, res) => {
    try {
      const { courseId } = req.params;
      const userId = req.user.id;
      
      // Find the course
      const course = await Course.findOne({ courseId });
      
      if (!course) {
        return res.status(404).json({ 
          success: false, 
          message: 'Course not found' 
        });
      }
      
      // Check if student is enrolled
      const user = await User.findById(userId);
      if (!user.enrolledCourses.includes(course._id)) {
        return res.status(403).json({ 
          success: false, 
          message: 'You are not enrolled in this course' 
        });
      }
      
      return res.status(200).json({
        success: true,
        course
      });
    } catch (error) {
      console.error('Error fetching course details:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error while fetching course details' 
      });
    }
  }),

  // Get assignments for a specific course
  getCourseAssignments: logFunctionHit('studentController.js', 'getCourseAssignments')(async (req, res) => {
    try {
      const { courseId } = req.params;
      const userId = req.user.id;
      
      // Find the course
      const course = await Course.findOne({ courseId });
      
      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }
      
      // Check if student is enrolled
      const user = await User.findById(userId);
      if (!user.enrolledCourses.includes(course._id)) {
        return res.status(403).json({ 
          success: false, 
          message: 'You are not enrolled in this course' 
        });
      }
      
      // Find assignments for this course
      const assignments = await Assignment.find({ courseId: course._id });
      
      // Find student's submissions for these assignments
      const submissions = await Submission.find({
        userId,
        assignmentId: { $in: assignments.map(a => a._id) }
      });
      
      // Add submission status to each assignment
      const assignmentsWithStatus = assignments.map(assignment => {
        const submission = submissions.find(
          s => s.assignmentId.toString() === assignment._id.toString()
        );
        
        return {
          ...assignment.toObject(),
          submissionStatus: submission ? submission.status : 'not_submitted',
          submissionId: submission ? submission._id : null,
          grade: submission ? submission.grade : null
        };
      });
      
      return res.status(200).json({
        success: true,
        assignments: assignmentsWithStatus
      });
    } catch (error) {
      console.error('Error fetching course assignments:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error while fetching assignments' 
      });
    }
  }),

  // Get quizzes for a specific course
  getCourseQuizzes: logFunctionHit('studentController.js', 'getCourseQuizzes')(async (req, res) => {
    try {
      const { courseId } = req.params;
      const userId = req.user.id;
      
      // Find the course
      const course = await Course.findOne({ courseId });
      
      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }
      
      // Check if student is enrolled
      const user = await User.findById(userId);
      if (!user.enrolledCourses.includes(course._id)) {
        return res.status(403).json({ 
          success: false, 
          message: 'You are not enrolled in this course' 
        });
      }
      
      // Find quizzes for this course
      const quizzes = await Quiz.find({ courseId: course._id });
      
      // Find user progress to get quiz attempts
      const userProgress = await UserProgress.findOne({ userId });
      const courseProgress = userProgress?.courseProgress?.find(
        cp => cp.courseId.toString() === course._id.toString()
      );
      
      // Add completion status to each quiz
      const quizzesWithStatus = quizzes.map(quiz => {
        const quizAttempt = courseProgress?.completedQuizzes?.find(
          q => q.quizId.toString() === quiz._id.toString()
        );
        
        return {
          ...quiz.toObject(),
          attempted: !!quizAttempt,
          score: quizAttempt?.score || null,
          attempts: quizAttempt?.attempts || 0,
          passed: quizAttempt?.score >= quiz.passingScore
        };
      });
      
      return res.status(200).json({
        success: true,
        quizzes: quizzesWithStatus
      });
    } catch (error) {
      console.error('Error fetching course quizzes:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error while fetching quizzes' 
      });
    }
  }),

  // Get student's progress for a specific course
  getCourseProgress: logFunctionHit('studentController.js', 'getCourseProgress')(async (req, res) => {
    try {
      const { courseId } = req.params;
      const userId = req.user.id;
      
      // Find the course
      const course = await Course.findOne({ courseId });
      
      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }
      
      // Check if student is enrolled
      const user = await User.findById(userId);
      if (!user.enrolledCourses.includes(course._id)) {
        return res.status(403).json({ 
          success: false, 
          message: 'You are not enrolled in this course' 
        });
      }
      
      // Find user progress
      const userProgress = await UserProgress.findOne({ userId });
      
      if (!userProgress) {
        return res.status(200).json({
          success: true,
          progress: {
            completedTopics: [],
            currentTopic: null,
            completedAssignments: [],
            completedQuizzes: [],
            startDate: new Date(),
            lastAccessed: new Date(),
            points: 0
          }
        });
      }
      
      // Find this course's progress
      const courseProgress = userProgress.courseProgress.find(
        cp => cp.courseId.toString() === course._id.toString()
      );
      
      if (!courseProgress) {
        return res.status(200).json({
          success: true,
          progress: {
            completedTopics: [],
            currentTopic: null,
            completedAssignments: [],
            completedQuizzes: [],
            startDate: new Date(),
            lastAccessed: new Date(),
            points: 0
          }
        });
      }
      
      return res.status(200).json({
        success: true,
        progress: courseProgress
      });
    } catch (error) {
      console.error('Error fetching course progress:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error while fetching progress' 
      });
    }
  }),

  // Submit an assignment
  submitAssignment: logFunctionHit('studentController.js', 'submitAssignment')(async (req, res) => {
    try {
      const { assignmentId } = req.params;
      const userId = req.user.id;
      const { content } = req.body;
      
      // Find the assignment
      const assignment = await Assignment.findById(assignmentId);
      
      if (!assignment) {
        return res.status(404).json({ success: false, message: 'Assignment not found' });
      }
      
      // Check if student is enrolled in the course
      const course = await Course.findById(assignment.courseId);
      const user = await User.findById(userId);
      
      if (!user.enrolledCourses.includes(course._id)) {
        return res.status(403).json({ 
          success: false, 
          message: 'You are not enrolled in this course' 
        });
      }
      
      // Check if assignment is already submitted
      const existingSubmission = await Submission.findOne({
        assignmentId,
        userId
      });
      
      if (existingSubmission) {
        // Update existing submission
        existingSubmission.content = content;
        existingSubmission.status = 'submitted';
        existingSubmission.submittedAt = new Date();
        existingSubmission.grade = null;
        existingSubmission.feedback = '';
        existingSubmission.gradedAt = null;
        
        await existingSubmission.save();
        
        return res.status(200).json({
          success: true,
          message: 'Assignment resubmitted successfully',
          submission: existingSubmission
        });
      }
      
      // Create new submission
      const newSubmission = await Submission.create({
        assignmentId,
        userId,
        content,
        status: 'submitted',
        submittedAt: new Date()
      });
      
      return res.status(201).json({
        success: true,
        message: 'Assignment submitted successfully',
        submission: newSubmission
      });
    } catch (error) {
      console.error('Error submitting assignment:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error while submitting assignment' 
      });
    }
  }),

  // Submit a quiz attempt
  submitQuiz: logFunctionHit('studentController.js', 'submitQuiz')(async (req, res) => {
    try {
      const { quizId } = req.params;
      const userId = req.user.id;
      const { answers } = req.body;
      
      // Find the quiz
      const quiz = await Quiz.findById(quizId);
      
      if (!quiz) {
        return res.status(404).json({ success: false, message: 'Quiz not found' });
      }
      
      // Check if student is enrolled in the course
      const course = await Course.findById(quiz.courseId);
      const user = await User.findById(userId);
      
      if (!user.enrolledCourses.includes(course._id)) {
        return res.status(403).json({ 
          success: false, 
          message: 'You are not enrolled in this course' 
        });
      }
      
      // Calculate score
      let totalPoints = 0;
      let earnedPoints = 0;
      
      // Verify answers and calculate score
      quiz.questions.forEach((question, index) => {
        totalPoints += question.points;
        
        // For multiple choice
        if (question.questionType === 'multiple-choice') {
          const selectedOption = answers[index];
          const correctOption = question.options.findIndex(opt => opt.isCorrect);
          
          if (selectedOption === correctOption) {
            earnedPoints += question.points;
          }
        }
        // Add more question types handling as needed
      });
      
      const scorePercentage = Math.round((earnedPoints / totalPoints) * 100);
      
      // Update user progress
      let userProgress = await UserProgress.findOne({ userId });
      
      if (!userProgress) {
        userProgress = new UserProgress({
          userId,
          courseProgress: [],
          achievements: [],
          totalPoints: 0
        });
      }
      
      // Find or create course progress
      let courseProgress = userProgress.courseProgress.find(
        cp => cp.courseId.toString() === course._id.toString()
      );
      
      if (!courseProgress) {
        courseProgress = {
          courseId: course._id,
          completedTopics: [],
          currentTopic: course.topics[0]?.topicId || null,
          completedAssignments: [],
          completedQuizzes: [],
          startDate: new Date(),
          lastAccessed: new Date(),
          points: 0
        };
        userProgress.courseProgress.push(courseProgress);
      }
      
      // Find or update quiz attempt
      const quizAttemptIndex = courseProgress.completedQuizzes.findIndex(
        q => q.quizId.toString() === quiz._id.toString()
      );
      
      if (quizAttemptIndex > -1) {
        // Update existing attempt if score is better
        if (scorePercentage > courseProgress.completedQuizzes[quizAttemptIndex].score) {
          courseProgress.completedQuizzes[quizAttemptIndex].score = scorePercentage;
        }
        courseProgress.completedQuizzes[quizAttemptIndex].attempts += 1;
        courseProgress.completedQuizzes[quizAttemptIndex].completedAt = new Date();
      } else {
        // Create new attempt
        courseProgress.completedQuizzes.push({
          quizId: quiz._id,
          score: scorePercentage,
          completedAt: new Date(),
          attempts: 1
        });
        
        // Add points for first completion
        const pointsEarned = Math.round(scorePercentage / 10) * 10; // Round to nearest 10
        courseProgress.points += pointsEarned;
        userProgress.totalPoints += pointsEarned;
        
        // Check for achievements
        if (scorePercentage >= quiz.passingScore) {
          userProgress.achievements.push({
            name: 'Quiz Passed',
            earnedAt: new Date(),
            description: `Passed the "${quiz.title}" quiz with a score of ${scorePercentage}%`
          });
        }
        
        if (scorePercentage >= 90) {
          userProgress.achievements.push({
            name: 'Quiz Excellence',
            earnedAt: new Date(),
            description: `Achieved over 90% on "${quiz.title}" quiz`
          });
        }
      }
      
      await userProgress.save();
      
      return res.status(200).json({
        success: true,
        message: 'Quiz submitted successfully',
        result: {
          score: scorePercentage,
          passed: scorePercentage >= quiz.passingScore,
          totalPoints,
          earnedPoints
        }
      });
    } catch (error) {
      console.error('Error submitting quiz:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error while submitting quiz' 
      });
    }
  }),

  // Create a note for a course topic
  createNote: logFunctionHit('studentController.js', 'createNote')(async (req, res) => {
    try {
      const { courseId, topicId } = req.params;
      const userId = req.user.id;
      const { title, content, tags } = req.body;
      
      // Find the course
      const course = await Course.findOne({ courseId });
      
      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }
      
      // Check if student is enrolled
      const user = await User.findById(userId);
      if (!user.enrolledCourses.includes(course._id)) {
        return res.status(403).json({ 
          success: false, 
          message: 'You are not enrolled in this course' 
        });
      }
      
      // Verify topic exists in course
      const topicExists = course.topics.some(topic => topic.topicId === topicId);
      
      if (!topicExists) {
        return res.status(404).json({ success: false, message: 'Topic not found in this course' });
      }
      
      // Create the note
      const newNote = await Note.create({
        courseId: course._id,
        topicId,
        userId,
        title,
        content,
        tags: tags || []
      });
      
      return res.status(201).json({
        success: true,
        message: 'Note created successfully',
        note: newNote
      });
    } catch (error) {
      console.error('Error creating note:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error while creating note' 
      });
    }
  }),

  // Get notes for a course topic
  getNotesByTopic: logFunctionHit('studentController.js', 'getNotesByTopic')(async (req, res) => {
    try {
      const { courseId, topicId } = req.params;
      const userId = req.user.id;
      
      // Find the course
      const course = await Course.findOne({ courseId });
      
      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }
      
      // Check if student is enrolled
      const user = await User.findById(userId);
      if (!user.enrolledCourses.includes(course._id)) {
        return res.status(403).json({ 
          success: false, 
          message: 'You are not enrolled in this course' 
        });
      }
      
      // Find notes for this topic
      const notes = await Note.find({
        courseId: course._id,
        topicId,
        userId
      }).sort({ createdAt: -1 });
      
      return res.status(200).json({
        success: true,
        notes
      });
    } catch (error) {
      console.error('Error fetching notes:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error while fetching notes' 
      });
    }
  }),

  // Get all modules (videos, quizzes, assignments) for a course
  getCourseModules: logFunctionHit('studentController.js', 'getCourseModules')(async (req, res) => {
    try {
      const { courseId } = req.params;
      const userId = req.user.id;
      const course = await Course.findOne({ courseId });
      if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
      const userProgress = await UserProgress.findOne({ userId });
      const courseProgress = userProgress?.courseProgress?.find(cp => cp.courseId.toString() === course._id.toString());
      // Collect all resources (videos, quizzes, assignments)
      let modules = [];
      course.topics.forEach(topic => {
        topic.resources.forEach(resource => {
          modules.push({
            moduleId: resource.resourceId,
            type: resource.type,
            title: resource.title,
            description: resource.description,
            url: resource.url,
            youtubeId: resource.youtubeId,
            duration: resource.duration,
            topicId: topic.topicId,
            completed: (resource.type === 'video' && courseProgress?.completedVideos?.includes(resource.resourceId)) ||
                      (resource.type === 'quiz' && courseProgress?.completedQuizzes?.some(q => q.quizId.toString() === resource.resourceId)) ||
                      (resource.type === 'assignment' && courseProgress?.completedAssignments?.some(a => a.assignmentId.toString() === resource.resourceId)),
          });
        });
      });
      return res.status(200).json({ success: true, modules });
    } catch (error) {
      console.error('Error fetching course modules:', error);
      return res.status(500).json({ success: false, message: 'Server error while fetching modules' });
    }
  }),

  // Mark a module as completed (video, quiz, assignment)
  completeModule: logFunctionHit('studentController.js', 'completeModule')(async (req, res) => {
    try {
      const { courseId, moduleId } = req.params;
      const { type } = req.body;
      const userId = req.user.id;
      const userProgress = await UserProgress.findOne({ userId });
      const course = await Course.findOne({ courseId });
      if (!userProgress || !course) return res.status(404).json({ success: false, message: 'Not found' });
      let courseProgress = userProgress.courseProgress.find(cp => cp.courseId.toString() === course._id.toString());
      if (!courseProgress) {
        courseProgress = { courseId: course._id, completedTopics: [], completedVideos: [], completedAssignments: [], completedQuizzes: [], points: 0 };
        userProgress.courseProgress.push(courseProgress);
      }
      let pointsAwarded = 0;
      // Mark as completed and award points
      if (type === 'video') {
        if (!courseProgress.completedVideos.includes(moduleId)) {
          courseProgress.completedVideos.push(moduleId);
          pointsAwarded = 5; // Example: 5 points per video
        }
      } else if (type === 'quiz') {
        if (!courseProgress.completedQuizzes.some(q => q.quizId.toString() === moduleId)) {
          courseProgress.completedQuizzes.push({ quizId: moduleId, completedAt: new Date(), score: 0, attempts: 1 });
          pointsAwarded = 10; // Example: 10 points per quiz
        }
      } else if (type === 'assignment') {
        if (!courseProgress.completedAssignments.some(a => a.assignmentId.toString() === moduleId)) {
          courseProgress.completedAssignments.push({ assignmentId: moduleId, submittedAt: new Date(), grade: 0 });
          pointsAwarded = 15; // Example: 15 points per assignment
        }
      }
      courseProgress.points = (courseProgress.points || 0) + pointsAwarded;
      userProgress.totalPoints = (userProgress.totalPoints || 0) + pointsAwarded;
      // Handle achievements/streaks (simple example)
      let achievement = null;
      if (userProgress.totalPoints >= 100) {
        achievement = { name: 'Century Club', earnedAt: new Date(), description: 'Earned 100 points!' };
        if (!userProgress.achievements.some(a => a.name === achievement.name)) {
          userProgress.achievements.push(achievement);
        }
      }
      await userProgress.save();
      return res.status(200).json({ success: true, pointsAwarded, achievement });
    } catch (error) {
      console.error('Error completing module:', error);
      return res.status(500).json({ success: false, message: 'Server error while completing module' });
    }
  }),

  // ============ DATABASE SEEDING AND SETUP ============

  // Seed database with default courses and data
  seedDatabase: logFunctionHit('studentController.js', 'seedDatabase')(async (req, res) => {
    try {
      const { seedDatabase } = await import('../config/seedData.js');
      const result = await seedDatabase();
      
      return res.status(200).json({
        success: true,
        message: 'Database seeded successfully',
        summary: result.summary
      });
    } catch (error) {
      console.error('Error seeding database:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to seed database',
        error: error.message
      });
    }
  }),

  // Enroll user in all available courses
  enrollInAllCourses: logFunctionHit('studentController.js', 'enrollInAllCourses')(async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Get all public courses
      const publicCourses = await Course.find({ isPrivate: false });
      
      if (publicCourses.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No public courses available. Try seeding the database first.'
        });
      }
      
      // Get user and their current enrollments
      const user = await User.findById(userId);
      const currentEnrollments = user.enrolledCourses || [];
      
      // Find courses user is not enrolled in
      const coursesToEnroll = publicCourses.filter(course => 
        !currentEnrollments.some(enrolled => enrolled.toString() === course._id.toString())
      );
      
      if (coursesToEnroll.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'User is already enrolled in all available courses',
          enrolledCourses: currentEnrollments.length
        });
      }
      
      // Enroll user in new courses
      const newEnrollments = coursesToEnroll.map(course => course._id);
      user.enrolledCourses = [...currentEnrollments, ...newEnrollments];
      await user.save();
      
      // Initialize user progress for new courses
      let userProgress = await UserProgress.findOne({ userId });
      if (!userProgress) {
        userProgress = new UserProgress({
          userId,
          courseProgress: [],
          achievements: [],
          totalPoints: 0
        });
      }
      
      // Add progress entries for new courses
      for (const course of coursesToEnroll) {
        const existingProgress = userProgress.courseProgress.find(
          cp => cp.courseId.toString() === course._id.toString()
        );
        
        if (!existingProgress) {
          userProgress.courseProgress.push({
            courseId: course._id,
            completedTopics: [],
            currentTopic: course.topics[0]?.topicId || null,
            completedAssignments: [],
            completedQuizzes: [],
            completedVideos: [],
            startDate: new Date(),
            lastAccessed: new Date(),
            points: 0
          });
        }
      }
      
      await userProgress.save();
      
      return res.status(200).json({
        success: true,
        message: `Successfully enrolled in ${coursesToEnroll.length} new courses`,
        enrolledCourses: {
          total: user.enrolledCourses.length,
          new: coursesToEnroll.length,
          courseList: coursesToEnroll.map(course => ({
            id: course._id,
            title: course.title,
            subject: course.subject
          }))
        }
      });
      
    } catch (error) {
      console.error('Error enrolling in courses:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to enroll in courses',
        error: error.message
      });
    }
  }),

  // ============ EVENT MANAGEMENT ============

  // Create a new event
  createEvent: logFunctionHit('studentController.js', 'createEvent')(async (req, res) => {
    try {
      const userId = req.user.id;
      const {
        title,
        description,
        eventType,
        startDate,
        endDate,
        priority,
        location,
        isAllDay,
        courseId,
        reminders,
        timer,
        tags
      } = req.body;

      // Validate required fields
      if (!title || !startDate) {
        return res.status(400).json({
          success: false,
          message: 'Title and start date are required'
        });
      }

      // Validate dates
      const start = new Date(startDate);
      const end = endDate ? new Date(endDate) : null;
      
      if (start < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Start date cannot be in the past'
        });
      }

      if (end && end <= start) {
        return res.status(400).json({
          success: false,
          message: 'End date must be after start date'
        });
      }

      // If courseId is provided, verify user is enrolled
      if (courseId) {
        const user = await User.findById(userId);
        const course = await Course.findById(courseId);
        
        if (!course || !user.enrolledCourses.includes(courseId)) {
          return res.status(403).json({
            success: false,
            message: 'You are not enrolled in this course'
          });
        }
      }

      // Create the event
      const newEvent = await Event.create({
        userId,
        courseId: courseId || undefined,
        title,
        description,
        eventType: eventType || 'other',
        startDate: start,
        endDate: end,
        priority: priority || 'medium',
        location,
        isAllDay: isAllDay || false,
        reminders: reminders || [],
        timer: timer || { isEnabled: false },
        tags: tags || []
      });

      return res.status(201).json({
        success: true,
        message: 'Event created successfully',
        event: newEvent
      });
    } catch (error) {
      console.error('Error creating event:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while creating event'
      });
    }
  }),

  // Get all events for the user
  getEvents: logFunctionHit('studentController.js', 'getEvents')(async (req, res) => {
    try {
      const userId = req.user.id;
      const { 
        status, 
        eventType, 
        startDate, 
        endDate, 
        priority,
        page = 1,
        limit = 20
      } = req.query;

      // Build query
      let query = { userId };

      if (status) query.status = status;
      if (eventType) query.eventType = eventType;
      if (priority) query.priority = priority;

      // Date range filter
      if (startDate || endDate) {
        query.startDate = {};
        if (startDate) query.startDate.$gte = new Date(startDate);
        if (endDate) query.startDate.$lte = new Date(endDate);
      }

      // Pagination
      const skip = (page - 1) * limit;

      const events = await Event.find(query)
        .populate('courseId', 'title subject')
        .sort({ startDate: 1 })
        .skip(skip)
        .limit(parseInt(limit));

      const totalEvents = await Event.countDocuments(query);

      return res.status(200).json({
        success: true,
        events,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalEvents / limit),
          totalEvents,
          hasNext: page * limit < totalEvents,
          hasPrev: page > 1
        }
      });
    } catch (error) {
      console.error('Error fetching events:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while fetching events'
      });
    }
  }),

  // Get upcoming events
  getUpcomingEvents: logFunctionHit('studentController.js', 'getUpcomingEvents')(async (req, res) => {
    try {
      const userId = req.user.id;
      const { limit = 10 } = req.query;

      const events = await Event.getUpcomingEvents(userId, parseInt(limit));

      return res.status(200).json({
        success: true,
        events
      });
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while fetching upcoming events'
      });
    }
  }),

  // Get events for calendar view (by date range)
  getEventsByDateRange: logFunctionHit('studentController.js', 'getEventsByDateRange')(async (req, res) => {
    try {
      const userId = req.user.id;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      const events = await Event.getEventsForDateRange(
        userId,
        new Date(startDate),
        new Date(endDate)
      );

      return res.status(200).json({
        success: true,
        events
      });
    } catch (error) {
      console.error('Error fetching events by date range:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while fetching events'
      });
    }
  }),

  // Update an event
  updateEvent: logFunctionHit('studentController.js', 'updateEvent')(async (req, res) => {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      // Find the event
      const event = await Event.findOne({ _id: eventId, userId });

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      // Validate dates if provided
      if (updateData.startDate) {
        const start = new Date(updateData.startDate);
        if (start < new Date() && event.status === 'upcoming') {
          return res.status(400).json({
            success: false,
            message: 'Start date cannot be in the past for upcoming events'
          });
        }
      }

      if (updateData.endDate && updateData.startDate) {
        const start = new Date(updateData.startDate);
        const end = new Date(updateData.endDate);
        if (end <= start) {
          return res.status(400).json({
            success: false,
            message: 'End date must be after start date'
          });
        }
      }

      // Update the event
      Object.assign(event, updateData);
      await event.save();

      return res.status(200).json({
        success: true,
        message: 'Event updated successfully',
        event
      });
    } catch (error) {
      console.error('Error updating event:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while updating event'
      });
    }
  }),

  // Delete an event
  deleteEvent: logFunctionHit('studentController.js', 'deleteEvent')(async (req, res) => {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;

      const event = await Event.findOneAndDelete({ _id: eventId, userId });

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Event deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while deleting event'
      });
    }
  }),

  // Mark event as completed
  completeEvent: logFunctionHit('studentController.js', 'completeEvent')(async (req, res) => {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;

      const event = await Event.findOne({ _id: eventId, userId });

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      await event.markAsCompleted();

      return res.status(200).json({
        success: true,
        message: 'Event marked as completed',
        event
      });
    } catch (error) {
      console.error('Error completing event:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while completing event'
      });
    }
  }),

  // ============ TIMER MANAGEMENT ============

  // Start timer for an event
  startEventTimer: logFunctionHit('studentController.js', 'startEventTimer')(async (req, res) => {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;

      const event = await Event.findOne({ _id: eventId, userId });

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      if (!event.timer.isEnabled) {
        return res.status(400).json({
          success: false,
          message: 'Timer is not enabled for this event'
        });
      }

      await event.startTimer();

      return res.status(200).json({
        success: true,
        message: 'Timer started successfully',
        timer: event.timer
      });
    } catch (error) {
      console.error('Error starting timer:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Server error while starting timer'
      });
    }
  }),

  // Pause timer for an event
  pauseEventTimer: logFunctionHit('studentController.js', 'pauseEventTimer')(async (req, res) => {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;

      const event = await Event.findOne({ _id: eventId, userId });

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      await event.pauseTimer();

      return res.status(200).json({
        success: true,
        message: 'Timer paused successfully',
        timer: event.timer
      });
    } catch (error) {
      console.error('Error pausing timer:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Server error while pausing timer'
      });
    }
  }),

  // Resume timer for an event
  resumeEventTimer: logFunctionHit('studentController.js', 'resumeEventTimer')(async (req, res) => {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;

      const event = await Event.findOne({ _id: eventId, userId });

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      await event.resumeTimer();

      return res.status(200).json({
        success: true,
        message: 'Timer resumed successfully',
        timer: event.timer
      });
    } catch (error) {
      console.error('Error resuming timer:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Server error while resuming timer'
      });
    }
  }),

  // Stop timer for an event
  stopEventTimer: logFunctionHit('studentController.js', 'stopEventTimer')(async (req, res) => {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;

      const event = await Event.findOne({ _id: eventId, userId });

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      await event.stopTimer();

      return res.status(200).json({
        success: true,
        message: 'Timer stopped successfully',
        timer: event.timer
      });
    } catch (error) {
      console.error('Error stopping timer:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Server error while stopping timer'
      });
    }
  }),

  // Get timer status for an event
  getEventTimerStatus: logFunctionHit('studentController.js', 'getEventTimerStatus')(async (req, res) => {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;

      const event = await Event.findOne({ _id: eventId, userId }).select('timer title');

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      // Calculate current elapsed time if timer is running
      let currentElapsedTime = event.timer.pausedTime || 0;
      if (event.timer.status === 'running' && event.timer.startTime) {
        const now = new Date();
        const sessionTime = (now - event.timer.startTime) / (1000 * 60); // in minutes
        currentElapsedTime += sessionTime;
      }

      return res.status(200).json({
        success: true,
        timer: {
          ...event.timer.toObject(),
          currentElapsedTime: Math.round(currentElapsedTime * 100) / 100 // Round to 2 decimal places
        }
      });
    } catch (error) {
      console.error('Error getting timer status:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while getting timer status'
      });
    }
  }),

  // ============ REMINDER MANAGEMENT ============

  // Add reminder to an event
  addEventReminder: logFunctionHit('studentController.js', 'addEventReminder')(async (req, res) => {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;
      const { type, timeBeforeEvent } = req.body;

      if (!type || !timeBeforeEvent) {
        return res.status(400).json({
          success: false,
          message: 'Reminder type and time before event are required'
        });
      }

      const event = await Event.findOne({ _id: eventId, userId });

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      event.reminders.push({
        type,
        timeBeforeEvent,
        isActive: true
      });

      await event.save();

      return res.status(200).json({
        success: true,
        message: 'Reminder added successfully',
        reminders: event.reminders
      });
    } catch (error) {
      console.error('Error adding reminder:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while adding reminder'
      });
    }
  }),

  // Get events that need reminders (for background job processing)
  getEventsNeedingReminders: logFunctionHit('studentController.js', 'getEventsNeedingReminders')(async (req, res) => {
    try {
      const now = new Date();
      
      const events = await Event.find({
        status: 'upcoming',
        'reminders.isActive': true,
        'reminders.sentAt': { $exists: false }
      }).populate('userId', 'name email');

      const eventsNeedingReminders = [];

      events.forEach(event => {
        event.reminders.forEach((reminder, index) => {
          if (reminder.isActive && !reminder.sentAt) {
            const reminderTime = new Date(event.startDate.getTime() - (reminder.timeBeforeEvent * 60 * 1000));
            
            if (now >= reminderTime) {
              eventsNeedingReminders.push({
                eventId: event._id,
                reminderIndex: index,
                userId: event.userId,
                title: event.title,
                startDate: event.startDate,
                reminderType: reminder.type,
                timeBeforeEvent: reminder.timeBeforeEvent
              });
            }
          }
        });
      });

      return res.status(200).json({
        success: true,
        reminders: eventsNeedingReminders
      });
    } catch (error) {
      console.error('Error getting events needing reminders:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while getting reminders'
      });
    }
  }),

  // Mark reminder as sent
  markReminderAsSent: logFunctionHit('studentController.js', 'markReminderAsSent')(async (req, res) => {
    try {
      const { eventId } = req.params;
      const { reminderIndex } = req.body;

      const event = await Event.findById(eventId);

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      if (event.reminders[reminderIndex]) {
        event.reminders[reminderIndex].sentAt = new Date();
        await event.save();
      }

      return res.status(200).json({
        success: true,
        message: 'Reminder marked as sent'
      });
    } catch (error) {
      console.error('Error marking reminder as sent:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while marking reminder as sent'
      });
    }
  }),

  // ============ DASHBOARD & ANALYTICS ============

  // Get today's events and activities
  getTodaysActivities: logFunctionHit('studentController.js', 'getTodaysActivities')(async (req, res) => {
    try {
      const userId = req.user.id;
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      // Get today's events
      const todaysEvents = await Event.find({
        userId,
        startDate: { $gte: startOfDay, $lt: endOfDay },
        status: { $in: ['upcoming', 'in-progress'] }
      }).sort({ startDate: 1 });

      // Get active timers
      const activeTimers = await Event.find({
        userId,
        'timer.status': { $in: ['running', 'paused'] }
      }).select('title timer');

      // Get overdue events
      const overdueEvents = await Event.find({
        userId,
        status: 'upcoming',
        startDate: { $lt: today }
      }).sort({ startDate: -1 }).limit(5);

      return res.status(200).json({
        success: true,
        data: {
          todaysEvents,
          activeTimers,
          overdueEvents,
          summary: {
            totalTodaysEvents: todaysEvents.length,
            activeTimersCount: activeTimers.length,
            overdueCount: overdueEvents.length
          }
        }
      });
    } catch (error) {
      console.error('Error getting today\'s activities:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while getting today\'s activities'
      });
    }
  }),

  // Get user's event statistics
  getEventStatistics: logFunctionHit('studentController.js', 'getEventStatistics')(async (req, res) => {
    try {
      const userId = req.user.id;
      const { period = '30' } = req.query; // days

      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(period));

      // Get event statistics
      const stats = await Event.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            createdAt: { $gte: daysAgo }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalTimerTime: {
              $sum: {
                $cond: [
                  { $eq: ['$timer.isEnabled', true] },
                  '$timer.pausedTime',
                  0
                ]
              }
            }
          }
        }
      ]);

      // Get events by type
      const eventsByType = await Event.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            createdAt: { $gte: daysAgo }
          }
        },
        {
          $group: {
            _id: '$eventType',
            count: { $sum: 1 }
          }
        }
      ]);

      // Get completion rate
      const totalEvents = await Event.countDocuments({
        userId,
        createdAt: { $gte: daysAgo }
      });

      const completedEvents = await Event.countDocuments({
        userId,
        status: 'completed',
        createdAt: { $gte: daysAgo }
      });

      const completionRate = totalEvents > 0 ? (completedEvents / totalEvents) * 100 : 0;

      return res.status(200).json({
        success: true,
        statistics: {
          statusBreakdown: stats,
          typeBreakdown: eventsByType,
          completionRate: Math.round(completionRate * 100) / 100,
          totalEvents,
          completedEvents,
          period: parseInt(period)
        }
      });
    } catch (error) {
      console.error('Error getting event statistics:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while getting event statistics'
      });
    }
  }),

  // Get user's notifications
  getUserNotifications: logFunctionHit('studentController.js', 'getUserNotifications')(async (req, res) => {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20, unreadOnly = false } = req.query;

      const skip = (page - 1) * limit;
      
      let matchQuery = { userId };
      if (unreadOnly === 'true') {
        matchQuery['notifications.isRead'] = false;
      }

      const events = await Event.find(
        matchQuery,
        { 
          notifications: 1, 
          title: 1, 
          startDate: 1 
        }
      ).sort({ 'notifications.sentAt': -1 });

      // Flatten notifications and add event context
      let allNotifications = [];
      events.forEach(event => {
        event.notifications.forEach(notification => {
          if (!unreadOnly || !notification.isRead) {
            allNotifications.push({
              ...notification.toObject(),
              eventId: event._id,
              eventTitle: event.title,
              eventStartDate: event.startDate
            });
          }
        });
      });

      // Sort by sentAt date
      allNotifications.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));

      // Paginate
      const paginatedNotifications = allNotifications.slice(skip, skip + parseInt(limit));

      return res.status(200).json({
        success: true,
        notifications: paginatedNotifications,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(allNotifications.length / limit),
          totalNotifications: allNotifications.length,
          hasNext: page * limit < allNotifications.length,
          hasPrev: page > 1
        }
      });
    } catch (error) {
      console.error('Error getting user notifications:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while getting notifications'
      });
    }
  }),

  // Mark notification as read
  markNotificationAsRead: logFunctionHit('studentController.js', 'markNotificationAsRead')(async (req, res) => {
    try {
      const { eventId, notificationId } = req.params;
      const userId = req.user.id;

      const event = await Event.findOne({ _id: eventId, userId });

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      const notification = event.notifications.id(notificationId);
      
      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      notification.isRead = true;
      await event.save();

      return res.status(200).json({
        success: true,
        message: 'Notification marked as read'
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while marking notification as read'
      });
    }
  }),

  // Test notification system
  testNotification: logFunctionHit('studentController.js', 'testNotification')(async (req, res) => {
    try {
      const userId = req.user.id;
      const { type = 'info', message = 'This is a test notification' } = req.body;
      
      const { sendSystemNotification, getNotificationStats } = await import('../utils/notificationUtils.js');
      
      const sent = sendSystemNotification(
        userId,
        'Test Notification',
        message,
        type
      );
      
      if (sent) {
        return res.status(200).json({
          success: true,
          message: 'Test notification sent successfully'
        });
      } else {
        return res.status(500).json({
          success: false,
          message: 'Failed to send notification'
        });
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while sending notification'
      });
    }
  }),

  // Get notification statistics
  getNotificationStats: logFunctionHit('studentController.js', 'getNotificationStats')(async (req, res) => {
    try {
      const { getNotificationStats } = await import('../utils/notificationUtils.js');
      const stats = getNotificationStats();
      
      return res.status(200).json({
        success: true,
        stats
      });
    } catch (error) {
      console.error('Error getting notification stats:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while getting stats'
      });
    }
  }),

  // Get upcoming reminders for the user
  getUpcomingReminders: logFunctionHit('studentController.js', 'getUpcomingReminders')(async (req, res) => {
    try {
      const userId = req.user.id;
      const { limit = 10 } = req.query;
      
      const reminderService = (await import('../services/reminderService.js')).default;
      const reminders = await reminderService.getUpcomingReminders(userId, parseInt(limit));
      
      return res.status(200).json({
        success: true,
        reminders
      });
    } catch (error) {
      console.error('Error getting upcoming reminders:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while getting reminders'
      });
    }
  }),

  // Manually trigger reminder check (for testing)
  triggerReminderCheck: logFunctionHit('studentController.js', 'triggerReminderCheck')(async (req, res) => {
    try {
      const reminderService = (await import('../services/reminderService.js')).default;
      await reminderService.triggerManualCheck();
      
      return res.status(200).json({
        success: true,
        message: 'Reminder check triggered successfully'
      });
    } catch (error) {
      console.error('Error triggering reminder check:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while triggering reminder check'
      });
    }
  }),

};

export default studentController;