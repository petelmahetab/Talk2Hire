import mongoose from 'mongoose';

const interviewerAvailabilitySchema = new mongoose.Schema({
  interviewerId: {
    type: String,
    required: true,
    index: true
  },
  interviewerName: {
    type: String,
    required: true
  },
  dayOfWeek: {
    type: Number,
    required: true,
    min: 0,
    max: 6
  },
  startTime: {
    type: String, // "09:00"
    required: true
  },
  endTime: {
    type: String, // "17:00"
    required: true
  },
  breakTime: {
    start: { type: String, default: null },
    end: { type: String, default: null }
  },
  interviewDuration: {
    type: Number,
    default: 60
  },
  bufferMinutes: {
    type: Number,
    default: 15
  },
  timezone: {
    type: String,
    required: true,
    default: 'UTC'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

interviewerAvailabilitySchema.index({ interviewerId: 1, dayOfWeek: 1 });

export default mongoose.model('InterviewerAvailability', interviewerAvailabilitySchema);