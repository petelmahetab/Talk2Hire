// frontend/src/components/scheduling/TimeSlotPicker.jsx
import React from 'react';
import { format } from 'date-fns';

const TimeSlotPicker = ({ slots, selectedSlot, onSelectSlot, loading }) => {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading available slots...</p>
      </div>
    );
  }

  if (!slots || slots.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-xl text-gray-500">No available slots on this date</p>
        <p className="text-sm text-gray-400 mt-2">Try selecting another day</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {slots.map((slot, index) => (
        <button
          key={index}
          onClick={() => onSelectSlot(slot)}
          className={`p-4 rounded-xl border-2 transition-all ${
            selectedSlot?.start === slot.start
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg'
              : 'bg-white border-gray-300 hover:border-indigo-400 hover:shadow-md'
          }`}
        >
          <p className="font-semibold">
            {format(new Date(slot.start), 'h:mm a')}
          </p>
          <p className={`text-sm ${selectedSlot?.start === slot.start ? 'text-white/80' : 'text-gray-500'}`}>
            {slot.duration} min
          </p>
        </button>
      ))}
    </div>
  );
};

export default TimeSlotPicker;