const express = require('express');
const router = express.Router();
const LearningPlan = require('../models/LearningPlan');
const authMiddleware = require('../middleware/authMiddleware');

// Create a new learning plan
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { topic, frequency, targetDays, dailyTime, startDate } = req.body;
    
    const learningPlan = new LearningPlan({
      studentId: req.user.id,
      topic,
      frequency,
      targetDays,
      dailyTime,
      startDate
    });

    await learningPlan.save();
    
    res.status(201).json(learningPlan);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all learning plans for a student
// In your backend route (learningPlanRoutes.js)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const plans = await LearningPlan.find({  studentId: req.user.id });
    // res.setHeader('Content-Type', 'application/json');
    res.status(200).json(plans);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
module.exports = router;