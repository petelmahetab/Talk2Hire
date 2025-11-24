// frontend/src/components/scheduling/CalendarView.jsx
import React from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const CalendarView = ({ events = [], onSelectSlot }) => {
  return (
    <div style={{ height: 500 }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        selectable
        onSelectSlot={onSelectSlot}
        views={[Views.MONTH, Views.WEEK, Views.DAY]}
        defaultView={Views.WEEK}
        min={new Date(2025, 0, 1, 8, 0)} // 8 AM
        max={new Date(2025, 0, 1, 20, 0)} // 8 PM
      />
    </div>
  );
};

export default CalendarView;