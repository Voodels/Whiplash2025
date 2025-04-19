const mongoose = require('mongoose');

const LectureSchema = new mongoose.Schema({
  title: String,
  videoUrl: String,
  duration: Number, // in minutes
  description: String,
  resources: [{
    title: String,
    url: String
  }],
  isFreePreview: Boolean
}, { timestamps: true });

const StudentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  studentName: String,
  studentEmail: String,
  paidAmount: Number,
  enrollmentDate: { type: Date, default: Date.now },
  progress: {
    completedLectures: [{ type: mongoose.Schema.Types.ObjectId }],
    lastAccessed: Date,
    completionPercentage: Number
  }
});

const CourseSchema = new mongoose.Schema({
  playlistLink: String,
  date: { type: Date, default: Date.now },
  title: { type: String, required: true },
  category: { type: String, required: true },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  primaryLanguage: { type: String, default: 'English' },
  subtitle: String,
  description: { type: String, required: true },
  image: { type: String, required: true },
  syllabusGraph: String, // Could be JSON string or reference to a file
  welcomeMessage: String,
  pricing: { type: Number, default: 0 },
  objectives: [String], // Array of learning objectives
  students: [StudentSchema],
  curriculum: [LectureSchema],
  isPublished: { type: Boolean, default: false },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ratings: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    review: String,
    date: { type: Date, default: Date.now }
  }],
  averageRating: { type: Number, default: 0 },
  totalHours: Number,
  tags: [String]
}, { timestamps: true });

// Calculate average rating whenever a new rating is added
CourseSchema.methods.updateAverageRating = function() {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
    return;
  }
  const sum = this.ratings.reduce((acc, rating) => acc + rating.rating, 0);
  this.averageRating = sum / this.ratings.length;
};

module.exports = mongoose.model('Course', CourseSchema);