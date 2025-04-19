const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const axios = require('axios');
const API_KEY = process.env.YOUTUBE_API_KEY;
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/check-auth', authController.checkAuth);

// Example protected route
router.get('/protected', authMiddleware, (req, res) => {
  res.json({ message: 'This is protected data!' });
});

//



router.get('/youtube-search', async (req, res) => {
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        q: req.query.q,
        part: 'snippet',
        type: 'video',
        maxResults: 3,
        key: API_KEY
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


//
router.post('/generate-quiz', async (req, res) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const prompt = `Generate 3 quiz questions about "${req.body.topic}" based on the video titled "${req.body.videoTitle}". 
      For each question, provide 4 options and indicate the correct answer. Return in JSON format:
      {
        "questions": [
          {
            "question": "question text",
            "options": ["option1", "option2", "option3", "option4"],
            "answer": "correct option"
          }
        ]
      }`;
  
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse the JSON response from Gemini
      const quizData = JSON.parse(text);
      res.json(quizData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
//
router.post('/learning-plan', async (req, res) => {
    try {
      // Save to database
      const plan = new LearningPlan(req.body);
      await plan.save();
      res.status(201).json(plan);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
});

module.exports = router;