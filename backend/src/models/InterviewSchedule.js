import mongoose from 'mongoose';

const interviewScheduleSchema = new mongoose.Schema({
  interviewerId: {
    type: String,
    required: true,
    index: true
  },
  interviewerName: {
    type: String,
    required: true
  },
  interviewerEmail: {
    type: String,
    required: true
  },
  candidateId: {
    type: String,
    default: null
  },
  candidateName: {
    type: String,
    required: true
  },
  candidateEmail: {
    type: String,
    required: true,
    index: true
  },
  candidatePhone: {
    type: String,
    default: null
  },
  scheduledTime: {
    type: Date,
    required: true,
    index: true
  },
  
  endTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    default: 60
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'no-show', 'rescheduled'],
    default: 'scheduled',
    index: true
  },
  roomId: {
    type: String,
    unique: true,
    sparse: true
  },
  interviewType: {
    type: String,
    enum: ['technical', 'system-design', 'behavioral', 'coding', 'general'],
    default: 'technical'
  },
  templateId: {
    type: String,
    default: null
  },
  remindersSent: {
    day_before: {
      type: Boolean,
      default: false
    },
    hour_before: {
      type: Boolean,
      default: false
    },
    five_min_before: {
      type: Boolean,
      default: false
    }
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  notes: {
    type: String,
    default: ''
  },
  meetingLink: {
    type: String,
    default: null
  },
  feedback: {
    type: String,
    default: null
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  }
}, {
  timestamps: true
});

interviewScheduleSchema.index({ scheduledTime: 1, status: 1 });
interviewScheduleSchema.index({ interviewerId: 1, scheduledTime: 1 });
interviewScheduleSchema.index({ candidateEmail: 1, scheduledTime: 1 });

interviewScheduleSchema.virtual('formattedDate').get(function() {
  return this.scheduledTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

interviewScheduleSchema.methods.isUpcoming = function() {
  return this.scheduledTime > new Date() && this.status === 'scheduled';
};

interviewScheduleSchema.methods.isPast = function() {
  return this.scheduledTime < new Date();
};

export default mongoose.model('InterviewSchedule', interviewScheduleSchema);