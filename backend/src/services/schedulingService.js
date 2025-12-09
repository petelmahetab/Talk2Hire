import InterviewerAvailability from '../models/InterviewerAvailability.js';
import InterviewSchedule from '../models/InterviewSchedule.js';
import moment from 'moment-timezone';

export const getAvailableSlots = async (interviewerId, date, timezone = 'UTC') => {
 
  const targetDate = moment.utc(date).startOf('day');
  const dayOfWeek = targetDate.day(); // 0=Sun, 6=Sat

  
  // Find availability for this day
  const availabilities = await InterviewerAvailability.find({
    interviewerId,
    dayOfWeek,
    isActive: true
  });

  if (availabilities.length === 0) {
    // console.log('No availability found for this interviewer on this day');
    return [];
  }

  // Find booked interviews on this date
  const bookedInterviews = await InterviewSchedule.find({
    interviewerId,
    status: 'scheduled',
    scheduledTime: {
      $gte: targetDate.toDate(),
      $lt: targetDate.clone().add(1, 'day').toDate()
    }
  });

  const bookedTimes = bookedInterviews.map(i => ({
    start: moment.utc(i.scheduledTime),
    end: moment.utc(i.endTime)
  }));

  const slots = [];

  for (const avail of availabilities) {
    // Build times using UTC date + local time (safe!)
    const [startHour, startMin] = avail.startTime.split(':').map(Number);
    const [endHour, endMin] = avail.endTime.split(':').map(Number);

    let current = targetDate.clone()
      .add(startHour, 'hours')
      .add(startMin, 'minutes');

    const endOfDay = targetDate.clone()
      .add(endHour, 'hours')
      .add(endMin, 'minutes');

    while (current.clone().add(avail.interviewDuration + avail.bufferMinutes, 'minutes').isSameOrBefore(endOfDay)) {
      const slotEnd = current.clone().add(avail.interviewDuration, 'minutes');

      // Skip break time
      if (avail.breakTime.start && avail.breakTime.end) {
        const [bStartH, bStartM] = avail.breakTime.start.split(':').map(Number);
        const [bEndH, bEndM] = avail.breakTime.end.split(':').map(Number);
        const breakStart = targetDate.clone().add(bStartH, 'hours').add(bStartM, 'minutes');
        const breakEnd = targetDate.clone().add(bEndH, 'hours').add(bEndM, 'minutes');

        if (current.isSameOrAfter(breakStart) && current.isBefore(breakEnd)) {
          current = breakEnd;
          continue;
        }
      }

      // Check for conflicts
      const hasConflict = bookedTimes.some(booked =>
        current.isBefore(booked.end) && slotEnd.isAfter(booked.start)
      );

      if (!hasConflict) {
        slots.push({
          start: current.toDate(),
          end: slotEnd.toDate(),
          duration: avail.interviewDuration
        });
      }

      
      current = slotEnd.clone().add(avail.bufferMinutes, 'minutes');
    }
  }

  // console.log('Found', slots.length, 'available slots');
  return slots;
};