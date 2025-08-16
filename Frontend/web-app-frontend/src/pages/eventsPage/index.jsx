// src/pages/eventsPage/index.jsx
// Full Events and Calendar Management Page

import React from 'react';
import EventCalendar from '../../components/EventCalendar';

const EventsPage = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Events & Calendar</h1>
        <p className="text-gray-600">
          Manage your events, deadlines, and important dates all in one place.
        </p>
      </div>
      
      <EventCalendar />
    </div>
  );
};

export default EventsPage;
