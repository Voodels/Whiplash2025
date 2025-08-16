import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: false // Events can be course-related or personal
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  eventType: {
    type: String,
    enum: ['exam', 'assignment', 'project', 'hackathon', 'meeting', 'deadline', 'personal', 'other'],
    default: 'other'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['upcoming', 'in-progress', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  location: {
    type: String,
    trim: true
  },
  isAllDay: {
    type: Boolean,
    default: false
  },
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'push', 'notification'],
      default: 'notification'
    },
    timeBeforeEvent: {
      type: Number, // in minutes
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    sentAt: {
      type: Date
    }
  }],
  timer: {
    isEnabled: {
      type: Boolean,
      default: false
    },
    duration: {
      type: Number // in minutes
    },
    startTime: {
      type: Date
    },
    endTime: {
      type: Date
    },
    pausedTime: {
      type: Number,
      default: 0 // accumulated paused time in minutes
    },
    status: {
      type: String,
      enum: ['not-started', 'running', 'paused', 'completed'],
      default: 'not-started'
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  notifications: [{
    message: String,
    type: {
      type: String,
      enum: ['reminder', 'timer-start', 'timer-end', 'status-change'],
      default: 'reminder'
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    isRead: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});

// Index for efficient queries
eventSchema.index({ userId: 1, startDate: 1 });
eventSchema.index({ userId: 1, status: 1 });
eventSchema.index({ startDate: 1, status: 1 });

// Virtual for checking if event is overdue
eventSchema.virtual('isOverdue').get(function() {
  return this.status === 'upcoming' && new Date() > this.startDate;
});

// Virtual for time remaining
eventSchema.virtual('timeRemaining').get(function() {
  if (this.status !== 'upcoming') return null;
  const now = new Date();
  const timeDiff = this.startDate - now;
  return timeDiff > 0 ? timeDiff : 0;
});

// Methods
eventSchema.methods.markAsCompleted = function() {
  this.status = 'completed';
  if (this.timer.isEnabled && this.timer.status === 'running') {
    this.timer.status = 'completed';
    this.timer.endTime = new Date();
  }
  return this.save();
};

eventSchema.methods.startTimer = function() {
  if (this.timer.isEnabled) {
    this.timer.status = 'running';
    this.timer.startTime = new Date();
    this.notifications.push({
      message: `Timer started for ${this.title}`,
      type: 'timer-start'
    });
    return this.save();
  }
  throw new Error('Timer is not enabled for this event');
};

eventSchema.methods.pauseTimer = function() {
  if (this.timer.status === 'running') {
    const now = new Date();
    const sessionTime = (now - this.timer.startTime) / (1000 * 60); // in minutes
    this.timer.pausedTime += sessionTime;
    this.timer.status = 'paused';
    return this.save();
  }
  throw new Error('Timer is not running');
};

eventSchema.methods.resumeTimer = function() {
  if (this.timer.status === 'paused') {
    this.timer.status = 'running';
    this.timer.startTime = new Date();
    return this.save();
  }
  throw new Error('Timer is not paused');
};

eventSchema.methods.stopTimer = function() {
  if (this.timer.status === 'running' || this.timer.status === 'paused') {
    if (this.timer.status === 'running') {
      const now = new Date();
      const sessionTime = (now - this.timer.startTime) / (1000 * 60);
      this.timer.pausedTime += sessionTime;
    }
    this.timer.status = 'completed';
    this.timer.endTime = new Date();
    this.notifications.push({
      message: `Timer completed for ${this.title}. Total time: ${this.timer.pausedTime.toFixed(1)} minutes`,
      type: 'timer-end'
    });
    return this.save();
  }
  throw new Error('Timer is not active');
};

// Static methods
eventSchema.statics.getUpcomingEvents = function(userId, limit = 10) {
  return this.find({
    userId,
    status: 'upcoming',
    startDate: { $gte: new Date() }
  })
  .sort({ startDate: 1 })
  .limit(limit);
};

eventSchema.statics.getEventsForDateRange = function(userId, startDate, endDate) {
  return this.find({
    userId,
    $or: [
      {
        startDate: { $gte: startDate, $lte: endDate }
      },
      {
        endDate: { $gte: startDate, $lte: endDate }
      },
      {
        startDate: { $lte: startDate },
        endDate: { $gte: endDate }
      }
    ]
  }).sort({ startDate: 1 });
};

export default mongoose.model('Event', eventSchema); 
