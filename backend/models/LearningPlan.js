const mongoose = require('mongoose');

const LearningPlanSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  topic: {
    type: String,
    required: true
  },
  frequency: {
    type: String,
    enum: ['Daily', 'Weekly', 'Monthly'],
    required: true
  },
  targetDays: {
    type: Number,
    required: true,
    min: 1
  },
  dailyTime: {
    type: Number, // in minutes
    required: true,
    min: 15
  },
  startDate: {
    type: Date,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  resources: [{
    type: { type: String, enum: ['video', 'article', 'quiz'] },
    title: String,
    url: String,
    completed: Boolean
  }]
}, { timestamps: true });

module.exports = mongoose.model('LearningPlan', LearningPlanSchema);