import InterviewerAvailability from '../models/InterviewerAvailability.js';
import InterviewSchedule from '../models/InterviewSchedule.js';
import moment from 'moment-timezone';

export const getAvailableSlots = async (interviewerId, date, timezone = 'UTC') => {
  console.log('🔍 Getting slots for:', { interviewerId, date, timezone });
  
  // Use the INTERVIEWER'S timezone, not UTC
  // First, get the interviewer's availability to know their timezone
  const sampleAvailability = await InterviewerAvailability.findOne({
    interviewerId,
    isActive: true
  });

  if (!sampleAvailability) {
    console.log('❌ No availability found for this interviewer');
    return [];
  }

  // Use interviewer's timezone for date calculations
  const interviewerTimezone = sampleAvailability.timezone || 'Asia/Kolkata';
  console.log('📍 Interviewer timezone:', interviewerTimezone);

  // Parse the date in the INTERVIEWER'S timezone
  const targetDate = moment.tz(date, interviewerTimezone).startOf('day');
  const dayOfWeek = targetDate.day(); // 0=Sun, 6=Sat
  
  console.log('📅 Target date:', targetDate.format('YYYY-MM-DD'), 'Day:', dayOfWeek);

  // Find availability for this day
  const availabilities = await InterviewerAvailability.find({
    interviewerId,
    dayOfWeek,
    isActive: true
  });

  if (availabilities.length === 0) {
    console.log('❌ No availability found for day', dayOfWeek);
    return [];
  }

  console.log('✅ Found', availabilities.length, 'availability records');

  // Find booked interviews on this date (in interviewer's timezone)
  const dayStart = targetDate.clone().startOf('day').toDate();
  const dayEnd = targetDate.clone().endOf('day').toDate();

  console.log('🔍 Checking booked interviews between:', dayStart, 'and', dayEnd);

  const bookedInterviews = await InterviewSchedule.find({
    interviewerId,
    status: 'scheduled',
    scheduledTime: {
      $gte: dayStart,
      $lte: dayEnd
    }
  });

  console.log('📋 Found', bookedInterviews.length, 'booked interviews');

  const bookedTimes = bookedInterviews.map(i => ({
    start: moment(i.scheduledTime).tz(interviewerTimezone),
    end: moment(i.endTime).tz(interviewerTimezone)
  }));

  const slots = [];

  for (const avail of availabilities) {
    console.log('⏰ Processing availability:', {
      dayOfWeek: avail.dayOfWeek,
      startTime: avail.startTime,
      endTime: avail.endTime,
      duration: avail.interviewDuration,
      buffer: avail.bufferMinutes
    });

    // Parse times in interviewer's timezone
    const [startHour, startMin] = avail.startTime.split(':').map(Number);
    const [endHour, endMin] = avail.endTime.split(':').map(Number);

    let current = targetDate.clone()
      .hour(startHour)
      .minute(startMin)
      .second(0)
      .millisecond(0);

    const endOfDay = targetDate.clone()
      .hour(endHour)
      .minute(endMin)
      .second(0)
      .millisecond(0);

    console.log('⏰ Slot window:', current.format('HH:mm'), 'to', endOfDay.format('HH:mm'));

    while (current.clone().add(avail.interviewDuration, 'minutes').isSameOrBefore(endOfDay)) {
      const slotEnd = current.clone().add(avail.interviewDuration, 'minutes');

      // Skip if slot is in the past
      if (current.isBefore(moment().tz(interviewerTimezone))) {
        current = current.clone().add(avail.interviewDuration + avail.bufferMinutes, 'minutes');
        continue;
      }

      // Skip break time
      if (avail.breakTime?.start && avail.breakTime?.end) {
        const [bStartH, bStartM] = avail.breakTime.start.split(':').map(Number);
        const [bEndH, bEndM] = avail.breakTime.end.split(':').map(Number);
        
        const breakStart = targetDate.clone().hour(bStartH).minute(bStartM).second(0);
        const breakEnd = targetDate.clone().hour(bEndH).minute(bEndM).second(0);

        if (current.isSameOrAfter(breakStart) && current.isBefore(breakEnd)) {
          current = breakEnd;
          continue;
        }
      }

      // Check for conflicts with booked interviews
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

  console.log('✅ Generated', slots.length, 'available slots');
  return slots;
};
