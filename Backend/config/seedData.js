// config/seedData.js
// Comprehensive seed data for courses, quizzes, assignments, and events

import Course from '../models/Course.js';
import User from '../models/User.js';
import Quiz from '../models/general/Quiz.js';
import Assignment from '../models/general/Assignment.js';
import Event from '../models/general/Events.js';
import UserProgress from '../models/UserProgress.js';
import { colors } from '../constants/colors.js';

// Default courses data
const defaultCourses = [
  {
    courseId: 'CS101',
    title: 'Operating Systems',
    subject: 'Computer Science',
    description: 'Learn the fundamentals of operating systems including process management, memory management, file systems, and concurrency.',
    isPrivate: false,
    topics: [
      {
        topicId: 'os-intro',
        name: 'Introduction to OS',
        description: 'Basic concepts and overview of operating systems',
        order: 1,
        resources: [
          {
            resourceId: 'os-intro-video',
            type: 'video',
            title: 'What is an Operating System?',
            description: 'Introduction to operating system concepts',
            url: 'https://youtube.com/watch?v=vBURTt97EkA',
            duration: 15
          },
          {
            resourceId: 'os-intro-article',
            type: 'article',
            title: 'OS Fundamentals Reading',
            description: 'Essential reading on OS basics',
            content: 'Operating systems manage computer hardware and software resources...'
          }
        ]
      },
      {
        topicId: 'process-management',
        name: 'Process Management',
        description: 'Understanding processes, threads, and scheduling',
        order: 2,
        resources: [
          {
            resourceId: 'process-video',
            type: 'video',
            title: 'Process Management in OS',
            description: 'Deep dive into process scheduling and management',
            url: 'https://youtube.com/watch?v=OrM7nZcxXZU',
            duration: 25
          }
        ]
      },
      {
        topicId: 'memory-management',
        name: 'Memory Management',
        description: 'Virtual memory, paging, and memory allocation',
        order: 3,
        resources: [
          {
            resourceId: 'memory-video',
            type: 'video',
            title: 'Memory Management Techniques',
            description: 'Understanding virtual memory and paging',
            url: 'https://youtube.com/watch?v=p9yZNLeOj4s',
            duration: 30
          }
        ]
      }
    ]
  },
  {
    courseId: 'CS102',
    title: 'Database Management Systems',
    subject: 'Computer Science',
    description: 'Comprehensive study of database design, SQL, normalization, transactions, and modern database technologies.',
    isPrivate: false,
    topics: [
      {
        topicId: 'db-intro',
        name: 'Introduction to Databases',
        description: 'Database concepts and DBMS overview',
        order: 1,
        resources: [
          {
            resourceId: 'db-intro-video',
            type: 'video',
            title: 'Database Fundamentals',
            description: 'Introduction to databases and DBMS',
            url: 'https://youtube.com/watch?v=wR0jg0eQsZA',
            duration: 20
          }
        ]
      },
      {
        topicId: 'sql-basics',
        name: 'SQL Fundamentals',
        description: 'Basic SQL queries and operations',
        order: 2,
        resources: [
          {
            resourceId: 'sql-video',
            type: 'video',
            title: 'SQL Tutorial for Beginners',
            description: 'Learn basic SQL operations',
            url: 'https://youtube.com/watch?v=HXV3zeQKqGY',
            duration: 45
          }
        ]
      },
      {
        topicId: 'normalization',
        name: 'Database Normalization',
        description: 'Understanding normal forms and database design',
        order: 3,
        resources: [
          {
            resourceId: 'normalization-video',
            type: 'video',
            title: 'Database Normalization Explained',
            description: 'Learn about 1NF, 2NF, 3NF, and BCNF',
            url: 'https://youtube.com/watch?v=GFQaEYEc8_8',
            duration: 35
          }
        ]
      }
    ]
  },
  {
    courseId: 'CS103',
    title: 'Data Structures and Algorithms',
    subject: 'Computer Science',
    description: 'Essential data structures and algorithmic techniques including arrays, linked lists, trees, graphs, and sorting algorithms.',
    isPrivate: false,
    topics: [
      {
        topicId: 'arrays-lists',
        name: 'Arrays and Linked Lists',
        description: 'Linear data structures fundamentals',
        order: 1,
        resources: [
          {
            resourceId: 'arrays-video',
            type: 'video',
            title: 'Arrays vs Linked Lists',
            description: 'Understanding linear data structures',
            url: 'https://youtube.com/watch?v=DyG9S9nAlUM',
            duration: 25
          }
        ]
      },
      {
        topicId: 'trees-graphs',
        name: 'Trees and Graphs',
        description: 'Non-linear data structures and algorithms',
        order: 2,
        resources: [
          {
            resourceId: 'trees-video',
            type: 'video',
            title: 'Tree Data Structures',
            description: 'Binary trees, BST, and tree traversals',
            url: 'https://youtube.com/watch?v=oSWTXtMglKE',
            duration: 40
          }
        ]
      }
    ]
  },
  {
    courseId: 'CS104',
    title: 'Computer Networks',
    subject: 'Computer Science',
    description: 'Study of network protocols, architecture, security, and modern networking technologies.',
    isPrivate: false,
    topics: [
      {
        topicId: 'network-basics',
        name: 'Network Fundamentals',
        description: 'OSI model, TCP/IP, and basic networking concepts',
        order: 1,
        resources: [
          {
            resourceId: 'network-intro-video',
            type: 'video',
            title: 'Computer Networks Introduction',
            description: 'Understanding how networks work',
            url: 'https://youtube.com/watch?v=3QhU9jd03a0',
            duration: 30
          }
        ]
      }
    ]
  },
  {
    courseId: 'CS105',
    title: 'Software Engineering',
    subject: 'Computer Science',
    description: 'Software development methodologies, design patterns, testing, and project management.',
    isPrivate: false,
    topics: [
      {
        topicId: 'sdlc',
        name: 'Software Development Life Cycle',
        description: 'Understanding SDLC phases and methodologies',
        order: 1,
        resources: [
          {
            resourceId: 'sdlc-video',
            type: 'video',
            title: 'SDLC Overview',
            description: 'Learn about different SDLC models',
            url: 'https://youtube.com/watch?v=Fi3_BjVzpqk',
            duration: 20
          }
        ]
      }
    ]
  },
  {
    courseId: 'CS106',
    title: 'Artificial Intelligence',
    subject: 'Computer Science',
    description: 'Introduction to AI concepts, machine learning, neural networks, and AI applications.',
    isPrivate: false,
    topics: [
      {
        topicId: 'ai-intro',
        name: 'Introduction to AI',
        description: 'Basic AI concepts and history',
        order: 1,
        resources: [
          {
            resourceId: 'ai-intro-video',
            type: 'video',
            title: 'What is Artificial Intelligence?',
            description: 'AI fundamentals and applications',
            url: 'https://youtube.com/watch?v=ad79nYk2keg',
            duration: 25
          }
        ]
      }
    ]
  },
  {
    courseId: 'CS107',
    title: 'Machine Learning',
    subject: 'Computer Science',
    description: 'Supervised and unsupervised learning, neural networks, and practical ML applications.',
    isPrivate: false,
    topics: [
      {
        topicId: 'ml-basics',
        name: 'Machine Learning Basics',
        description: 'Introduction to ML concepts and types',
        order: 1,
        resources: [
          {
            resourceId: 'ml-intro-video',
            type: 'video',
            title: 'Machine Learning Explained',
            description: 'Understanding ML fundamentals',
            url: 'https://youtube.com/watch?v=ukzFI9rgwfU',
            duration: 35
          }
        ]
      }
    ]
  },
  {
    courseId: 'CS108',
    title: 'Web Development',
    subject: 'Computer Science',
    description: 'Full-stack web development including HTML, CSS, JavaScript, React, Node.js, and databases.',
    isPrivate: false,
    topics: [
      {
        topicId: 'frontend-basics',
        name: 'Frontend Fundamentals',
        description: 'HTML, CSS, and JavaScript basics',
        order: 1,
        resources: [
          {
            resourceId: 'html-video',
            type: 'video',
            title: 'HTML & CSS Crash Course',
            description: 'Learn web development basics',
            url: 'https://youtube.com/watch?v=UB1O30fR-EE',
            duration: 60
          }
        ]
      },
      {
        topicId: 'react-basics',
        name: 'React Fundamentals',
        description: 'Modern React development',
        order: 2,
        resources: [
          {
            resourceId: 'react-video',
            type: 'video',
            title: 'React Tutorial for Beginners',
            description: 'Learn React from scratch',
            url: 'https://youtube.com/watch?v=Ke90Tje7VS0',
            duration: 90
          }
        ]
      }
    ]
  },
  {
    courseId: 'CS109',
    title: 'Cybersecurity',
    subject: 'Computer Science',
    description: 'Network security, cryptography, ethical hacking, and security best practices.',
    isPrivate: false,
    topics: [
      {
        topicId: 'security-basics',
        name: 'Cybersecurity Fundamentals',
        description: 'Basic security concepts and threats',
        order: 1,
        resources: [
          {
            resourceId: 'security-video',
            type: 'video',
            title: 'Cybersecurity Overview',
            description: 'Understanding cybersecurity basics',
            url: 'https://youtube.com/watch?v=inWWhr5tnEA',
            duration: 30
          }
        ]
      }
    ]
  },
  {
    courseId: 'CS110',
    title: 'Cloud Computing',
    subject: 'Computer Science',
    description: 'Cloud platforms, services, deployment models, and modern cloud architectures.',
    isPrivate: false,
    topics: [
      {
        topicId: 'cloud-intro',
        name: 'Introduction to Cloud',
        description: 'Cloud computing concepts and services',
        order: 1,
        resources: [
          {
            resourceId: 'cloud-video',
            type: 'video',
            title: 'Cloud Computing Explained',
            description: 'Understanding cloud fundamentals',
            url: 'https://youtube.com/watch?v=M988_fsOSWo',
            duration: 25
          }
        ]
      }
    ]
  }
];

// Default quiz data
const defaultQuizzes = [
  {
    title: 'Operating Systems Basics',
    description: 'Test your knowledge of OS fundamentals',
    courseId: null, // Will be set to actual Course._id
    questions: [
      {
        questionText: 'What is the primary function of an operating system?',
        questionType: 'multiple-choice',
        options: [
          { text: 'To manage hardware and software resources', isCorrect: true },
          { text: 'To browse the internet', isCorrect: false },
          { text: 'To write programs', isCorrect: false },
          { text: 'To store data permanently', isCorrect: false }
        ],
        points: 10,
        explanation: 'The OS manages all hardware and software resources of a computer system.'
      },
      {
        questionText: 'Which of these is NOT a type of operating system?',
        questionType: 'multiple-choice',
        options: [
          { text: 'Batch OS', isCorrect: false },
          { text: 'Real-time OS', isCorrect: false },
          { text: 'Distributed OS', isCorrect: false },
          { text: 'Database OS', isCorrect: true }
        ],
        points: 10,
        explanation: 'Database OS is not a type of operating system. DBMS is database management software.'
      }
    ],
    timeLimit: 30,
    passingScore: 70,
    maxAttempts: 3
  },
  {
    title: 'Database Fundamentals Quiz',
    description: 'Test your understanding of database concepts',
    courseId: null, // Will be set to actual Course._id
    questions: [
      {
        questionText: 'What does ACID stand for in database transactions?',
        questionType: 'multiple-choice',
        options: [
          { text: 'Atomicity, Consistency, Isolation, Durability', isCorrect: true },
          { text: 'Access, Control, Integration, Data', isCorrect: false },
          { text: 'Automatic, Continuous, Independent, Distributed', isCorrect: false },
          { text: 'Application, Computer, Interface, Database', isCorrect: false }
        ],
        points: 15,
        explanation: 'ACID properties ensure reliable database transactions.'
      }
    ],
    timeLimit: 20,
    passingScore: 80,
    maxAttempts: 2
  }
];

// Default assignment data
const defaultAssignments = [
  {
    title: 'OS Process Scheduling Assignment',
    description: 'Implement different CPU scheduling algorithms and compare their performance.',
    courseId: null, // Will be set to actual Course._id
    instructions: `
    1. Implement FCFS (First Come First Serve) scheduling
    2. Implement SJF (Shortest Job First) scheduling  
    3. Implement Round Robin scheduling
    4. Compare the average waiting time for each algorithm
    5. Submit your code and analysis report
    `,
    maxPoints: 100,
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
    allowLateSubmission: true,
    lateSubmissionPenalty: 10,
    submissionFormat: ['code', 'report'],
    rubric: [
      { criteria: 'Code Quality', points: 30, description: 'Clean, well-commented code' },
      { criteria: 'Algorithm Implementation', points: 40, description: 'Correct implementation of all algorithms' },
      { criteria: 'Analysis', points: 30, description: 'Thorough comparison and analysis' }
    ]
  },
  {
    title: 'Database Design Project',
    description: 'Design and implement a database for a library management system.',
    courseId: null, // Will be set to actual Course._id
    instructions: `
    1. Create an ER diagram for a library management system
    2. Convert to relational schema with proper normalization
    3. Implement the database using SQL
    4. Write queries for common operations
    5. Submit ER diagram, schema, and SQL files
    `,
    maxPoints: 150,
    dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
    allowLateSubmission: true,
    lateSubmissionPenalty: 15,
    submissionFormat: ['database', 'document'],
    rubric: [
      { criteria: 'ER Diagram', points: 40, description: 'Complete and accurate ER diagram' },
      { criteria: 'Normalization', points: 40, description: 'Proper normalization to 3NF' },
      { criteria: 'SQL Implementation', points: 40, description: 'Working database with all features' },
      { criteria: 'Queries', points: 30, description: 'Efficient and correct SQL queries' }
    ]
  }
];

// Default events data
const defaultEvents = [
  {
    title: 'OS Midterm Exam',
    description: 'Midterm examination covering process management and memory management',
    eventType: 'exam',
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours duration
    priority: 'high',
    location: 'Exam Hall A',
    isAllDay: false,
    reminders: [
      { timeBeforeEvent: 1440, type: 'notification', isActive: true }, // 1 day before
      { timeBeforeEvent: 60, type: 'notification', isActive: true }    // 1 hour before
    ],
    tags: ['exam', 'operating-systems']
  },
  {
    title: 'Database Project Deadline',
    description: 'Final submission deadline for database design project',
    eventType: 'deadline',
    startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
    priority: 'urgent',
    isAllDay: true,
    reminders: [
      { timeBeforeEvent: 2880, type: 'notification', isActive: true }, // 2 days before
      { timeBeforeEvent: 360, type: 'notification', isActive: true }   // 6 hours before
    ],
    tags: ['deadline', 'database', 'project']
  },
  {
    title: 'ML Workshop: Neural Networks',
    description: 'Hands-on workshop on implementing neural networks from scratch',
    eventType: 'meeting',
    startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours duration
    priority: 'medium',
    location: 'Computer Lab 2',
    isAllDay: false,
    reminders: [
      { timeBeforeEvent: 1440, type: 'notification', isActive: true }, // 1 day before
      { timeBeforeEvent: 30, type: 'notification', isActive: true }    // 30 minutes before
    ],
    tags: ['workshop', 'machine-learning', 'neural-networks']
  },
  {
    title: 'Hackathon 2025',
    description: '48-hour coding competition focusing on AI and sustainability solutions',
    eventType: 'hackathon',
    startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month from now
    endDate: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000), // 2 days duration
    priority: 'high',
    location: 'Tech Innovation Center',
    isAllDay: true,
    reminders: [
      { timeBeforeEvent: 10080, type: 'notification', isActive: true }, // 1 week before
      { timeBeforeEvent: 1440, type: 'notification', isActive: true }   // 1 day before
    ],
    tags: ['hackathon', 'competition', 'ai', 'sustainability']
  }
];

// Seed function
export const seedDatabase = async () => {
  try {
    console.log(`${colors.yellow}[SEED]${colors.reset} Starting database seeding...`);

    // Create a default admin user if none exists
    let adminUser = await User.findOne({ email: 'admin@whiplash.edu' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'WhipLash Admin',
        email: 'admin@whiplash.edu',
        password: 'admin123', // This will be hashed by the pre-save middleware
        role: 'admin'
      });
      console.log(`${colors.green}[SEED]${colors.reset} Created admin user`);
    }

    // Check if courses already exist
    const existingCourses = await Course.countDocuments();
    if (existingCourses > 0) {
      console.log(`${colors.yellow}[SEED]${colors.reset} Courses already exist (${existingCourses} found), skipping course seeding`);
    } else {
      // Seed courses
      console.log(`${colors.cyan}[SEED]${colors.reset} Creating default courses...`);
      const createdCourses = [];
      
      for (const courseData of defaultCourses) {
        const course = await Course.create({
          ...courseData,
          owner: adminUser._id
        });
        createdCourses.push(course);
        console.log(`${colors.green}[SEED]${colors.reset} Created course: ${course.title}`);
      }

      // Seed quizzes
      console.log(`${colors.cyan}[SEED]${colors.reset} Creating default quizzes...`);
      for (let i = 0; i < defaultQuizzes.length && i < createdCourses.length; i++) {
        const quiz = await Quiz.create({
          ...defaultQuizzes[i],
          courseId: createdCourses[i]._id
        });
        console.log(`${colors.green}[SEED]${colors.reset} Created quiz: ${quiz.title}`);
      }

      // Seed assignments
      console.log(`${colors.cyan}[SEED]${colors.reset} Creating default assignments...`);
      for (let i = 0; i < defaultAssignments.length && i < createdCourses.length; i++) {
        const assignment = await Assignment.create({
          ...defaultAssignments[i],
          courseId: createdCourses[i]._id
        });
        console.log(`${colors.green}[SEED]${colors.reset} Created assignment: ${assignment.title}`);
      }

      console.log(`${colors.green}[SEED]${colors.reset} Successfully seeded ${createdCourses.length} courses with content`);
    }

    // Seed events for existing users
    const users = await User.find({ role: 'student' }).limit(5); // Get first 5 students
    if (users.length > 0) {
      console.log(`${colors.cyan}[SEED]${colors.reset} Creating sample events for ${users.length} users...`);
      
      for (const user of users) {
        // Check if user already has events
        const existingEvents = await Event.countDocuments({ userId: user._id });
        if (existingEvents === 0) {
          // Create sample events for this user
          for (const eventData of defaultEvents) {
            await Event.create({
              ...eventData,
              userId: user._id
            });
          }
          console.log(`${colors.green}[SEED]${colors.reset} Created ${defaultEvents.length} sample events for ${user.name}`);
        }
      }
    }

    console.log(`${colors.green}[SEED]${colors.reset} Database seeding completed successfully!`);
    
    // Return summary
    const courseCount = await Course.countDocuments();
    const quizCount = await Quiz.countDocuments();
    const assignmentCount = await Assignment.countDocuments();
    const eventCount = await Event.countDocuments();
    
    return {
      success: true,
      summary: {
        courses: courseCount,
        quizzes: quizCount,
        assignments: assignmentCount,
        events: eventCount
      }
    };

  } catch (error) {
    console.error(`${colors.red}[SEED ERROR]${colors.reset} Failed to seed database:`, error);
    throw error;
  }
};

// Function to clear all data (for development/testing)
export const clearDatabase = async () => {
  try {
    console.log(`${colors.yellow}[SEED]${colors.reset} Clearing database...`);
    
    await Course.deleteMany({});
    await Quiz.deleteMany({});
    await Assignment.deleteMany({});
    await Event.deleteMany({});
    await UserProgress.deleteMany({});
    
    console.log(`${colors.green}[SEED]${colors.reset} Database cleared successfully`);
    return { success: true };
  } catch (error) {
    console.error(`${colors.red}[SEED ERROR]${colors.reset} Failed to clear database:`, error);
    throw error;
  }
};

export { defaultCourses, defaultQuizzes, defaultAssignments, defaultEvents };
