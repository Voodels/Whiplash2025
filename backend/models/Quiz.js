const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  explanation: String,
  points: { type: Number, default: 1 }
});

const QuizSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  lectureId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecture' }, // Optional if quiz is for specific lecture
  title: { type: String, required: true },
  description: String,
  questions: [QuestionSchema],
  passingScore: { type: Number, default: 70 }, // Percentage
  timeLimit: Number, // in minutes
  maxAttempts: { type: Number, default: 3 },
  isPublished: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Virtual for total quiz points
QuizSchema.virtual('totalPoints').get(function() {
  return this.questions.reduce((sum, question) => sum + question.points, 0);
});

module.exports = mongoose.model('Quiz', QuizSchema);