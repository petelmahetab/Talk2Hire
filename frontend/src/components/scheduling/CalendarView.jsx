import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isBefore, startOfDay, addMonths, subMonths, getDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, Calendar, CheckCircle } from 'lucide-react';

const CalendarView = ({ events, selectedDate, onSelectSlot, availableSlots = [], interviewerSchedules = [] }) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
  
  useEffect(() => {
    if (selectedDate) {
      setCurrentMonth(selectedDate);
    }
  }, [selectedDate]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const firstDayOfWeek = monthStart.getDay();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Check if a date's day of week has availability configured
  const hasScheduleForDay = (date) => {
    const dayOfWeek = getDay(date);
    return interviewerSchedules.some(schedule => schedule.dayOfWeek === dayOfWeek);
  };

  const getSlotsForDate = (date) => {
    return availableSlots.filter(slot => 
      isSameDay(new Date(slot.start), date)
    );
  };

  const handleDateClick = (date) => {
    const today = startOfDay(new Date());
    if (!isBefore(date, today) && hasScheduleForDay(date)) {
      onSelectSlot({ start: date });
    }
  };

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  return (
    <div className="calendar-container">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6 bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-2xl border border-primary/20">
        <button
          onClick={goToPreviousMonth}
          className="btn btn-circle btn-primary btn-sm"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-primary" />
          <h3 className="text-2xl font-bold">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
        </div>
        
        <button
          onClick={goToNextMonth}
          className="btn btn-circle btn-primary btn-sm"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Weekday Headers with Availability Indicator */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {days.map((day, idx) => {
          const hasSchedule = interviewerSchedules.some(s => s.dayOfWeek === idx);
          return (
            <div key={day} className="text-center py-3">
              <div className={`font-bold ${hasSchedule ? 'text-primary' : 'text-base-content/50'}`}>
                {day}
              </div>
              {hasSchedule && (
                <CheckCircle className="w-3 h-3 text-success mx-auto mt-1" />
              )}
            </div>
          );
        })}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        
        {daysInMonth.map(date => {
          const today = startOfDay(new Date());
          const isPast = isBefore(date, today);
          const isCurrentDay = isToday(date);
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const slotsForDay = getSlotsForDate(date);
          const hasSlots = slotsForDay.length > 0;
          const hasSchedule = hasScheduleForDay(date);
          const isAvailable = !isPast && hasSchedule;

          return (
            <div
              key={date.toString()}
              onClick={() => isAvailable && handleDateClick(date)}
              className={`
                aspect-square border-2 rounded-xl p-2 transition-all relative
                ${isPast 
                  ? 'bg-base-200 opacity-40 cursor-not-allowed border-base-300' 
                  : !hasSchedule
                  ? 'bg-base-100 opacity-60 cursor-not-allowed border-base-300'
                  : 'bg-base-100 hover:shadow-lg hover:scale-105 border-base-300 cursor-pointer'
                }
                ${isSelected 
                  ? 'border-primary bg-primary/10 ring-4 ring-primary/30 shadow-xl' 
                  : ''
                }
                ${isCurrentDay && !isSelected
                  ? 'border-accent border-dashed bg-accent/5' 
                  : ''
                }
                ${hasSlots && !isPast && !isSelected
                  ? 'border-success/50 bg-success/5'
                  : hasSchedule && !isPast && !isSelected
                  ? 'border-primary/30 bg-primary/5'
                  : ''
                }
              `}
            >
              {/* Date Number */}
              <div className={`
                text-center font-bold text-lg mb-1
                ${isSelected ? 'text-primary' : ''}
                ${isCurrentDay && !isSelected ? 'text-accent' : ''}
                ${isPast || !hasSchedule ? 'text-base-content/40' : 'text-base-content'}
              `}>
                {format(date, 'd')}
              </div>

              {/* Time Slots Preview */}
              {!isPast && hasSlots ? (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-xs text-success font-semibold">
                    <Clock className="w-3 h-3" />
                    <span>{slotsForDay.length}</span>
                  </div>
                  {slotsForDay.length <= 3 && (
                    <div className="mt-1 space-y-0.5">
                      {slotsForDay.slice(0, 3).map((slot, idx) => (
                        <div
                          key={idx}
                          className="text-[10px] font-medium bg-success/20 text-success rounded px-1 py-0.5 truncate"
                        >
                          {format(new Date(slot.start), 'h:mm a')}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : !isPast && hasSchedule ? (
                <div className="text-center">
                  <div className="text-xs text-primary font-medium mt-1">
                    Available
                  </div>
                </div>
              ) : !isPast ? (
                <div className="text-center text-xs text-base-content/40 mt-2">
                  No schedule
                </div>
              ) : null}

              {/* Today indicator */}
              {isCurrentDay && (
                <div className="absolute top-1 right-1">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-accent border-dashed rounded" />
          <span>Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-primary bg-primary/10 rounded" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-success/50 bg-success/5 rounded" />
          <span>Has Slots</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-primary/30 bg-primary/5 rounded" />
          <span>Available Day</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-base-200 opacity-40 border-2 border-base-300 rounded" />
          <span>Unavailable</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;