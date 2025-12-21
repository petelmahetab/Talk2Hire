import InterviewerAvailability from '../models/InterviewerAvailability.js';
import InterviewSchedule from '../models/InterviewSchedule.js';
import moment from 'moment-timezone';

export const getAvailableSlots = async (interviewerId, date, timezone = 'UTC') => {
  console.log('🔍 Getting slots for:', { interviewerId, date, timezone });
  
  // Get the interviewer's availability to know their timezone
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

  // ✅ FIXED: Better date range for finding booked interviews
  const dayStart = targetDate.clone().startOf('day').toDate();
  const dayEnd = targetDate.clone().endOf('day').toDate();

  console.log('🔍 Checking booked interviews between:', dayStart, 'and', dayEnd);

  // ✅ FIXED: Check for ALL active statuses, not just 'scheduled'
  const bookedInterviews = await InterviewSchedule.find({
    interviewerId,
    status: { $in: ['scheduled', 'confirmed', 'in-progress'] }, // Added more statuses
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
  const now = moment().tz(interviewerTimezone); // ✅ FIXED: Use current time in interviewer timezone

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

      // ✅ FIXED: Only skip if slot END time is in the past (allows booking today's future slots)
      if (slotEnd.isBefore(now)) {
        console.log('⏭️ Skipping past slot:', current.format('HH:mm'));
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
          console.log('☕ Skipping break time:', current.format('HH:mm'));
          current = breakEnd;
          continue;
        }
      }

      // ✅ FIXED: Better conflict detection
      const hasConflict = bookedTimes.some(booked => {
        const conflict = (
          (current.isSameOrAfter(booked.start) && current.isBefore(booked.end)) ||
          (slotEnd.isAfter(booked.start) && slotEnd.isSameOrBefore(booked.end)) ||
          (current.isSameOrBefore(booked.start) && slotEnd.isSameOrAfter(booked.end))
        );
        if (conflict) {
          console.log('❌ Conflict found:', {
            slotTime: current.format('HH:mm'),
            bookedTime: booked.start.format('HH:mm')
          });
        }
        return conflict;
      });

      if (!hasConflict) {
        console.log('✅ Adding available slot:', current.format('HH:mm'));
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

export const isSlotAvailable = async (interviewerId, scheduledTime, duration, timezone = 'UTC') => {
  console.log('🔍 Checking slot availability:', { interviewerId, scheduledTime, duration, timezone });
  
  const slotStart = moment.tz(scheduledTime, timezone);
  const slotEnd = slotStart.clone().add(duration, 'minutes');

  // ✅ FIXED: Check for ALL active statuses
  const overlappingBooking = await InterviewSchedule.findOne({
    interviewerId,
    status: { $in: ['scheduled', 'confirmed', 'in-progress'] },
    $or: [
      // Existing booking starts during new slot
      {
        scheduledTime: {
          $gte: slotStart.toDate(),
          $lt: slotEnd.toDate()
        }
      },
      // Existing booking ends during new slot
      {
        endTime: {
          $gt: slotStart.toDate(),
          $lte: slotEnd.toDate()
        }
      },
      // Existing booking completely covers new slot
      {
        scheduledTime: { $lte: slotStart.toDate() },
        endTime: { $gte: slotEnd.toDate() }
      }
    ]
  });

  const isAvailable = !overlappingBooking;
  
  if (overlappingBooking) {
    console.log('❌ Slot NOT available - Found overlapping booking:', {
      existingStart: overlappingBooking.scheduledTime,
      existingEnd: overlappingBooking.endTime,
      status: overlappingBooking.status
    });
  } else {
    console.log('✅ Slot available!');
  }
  
  return isAvailable;
};
