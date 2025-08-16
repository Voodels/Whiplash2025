// src/api/events.js
// Event management API calls

import axiosInstance from './axiosConfig'

export const eventAPI = {
  // Get all events for the current user
  getAllEvents: async () => {
    try {
      const response = await axiosInstance.get('/student/events')
      return response.data
    } catch (error) {
      console.error('Error fetching events:', error)
      throw error
    }
  },

  // Get upcoming events (next 7 days)
  getUpcomingEvents: async (limit = 10) => {
    try {
      const response = await axiosInstance.get(`/student/events/upcoming?limit=${limit}`)
      return response.data
    } catch (error) {
      console.error('Error fetching upcoming events:', error)
      throw error
    }
  },

  // Get events by date range
  getEventsByDateRange: async (startDate, endDate) => {
    try {
      const response = await axiosInstance.get('/student/events/range', {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching events by date range:', error)
      throw error
    }
  },

  // Create a new event
  createEvent: async (eventData) => {
    try {
      const response = await axiosInstance.post('/student/events', eventData)
      return response.data
    } catch (error) {
      console.error('Error creating event:', error)
      throw error
    }
  },

  // Update an existing event
  updateEvent: async (eventId, eventData) => {
    try {
      const response = await axiosInstance.put(`/student/events/${eventId}`, eventData)
      return response.data
    } catch (error) {
      console.error('Error updating event:', error)
      throw error
    }
  },

  // Delete an event
  deleteEvent: async (eventId) => {
    try {
      const response = await axiosInstance.delete(`/student/events/${eventId}`)
      return response.data
    } catch (error) {
      console.error('Error deleting event:', error)
      throw error
    }
  },

  // Get event by ID
  getEventById: async (eventId) => {
    try {
      const response = await axiosInstance.get(`/student/events/${eventId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching event:', error)
      throw error
    }
  },

  // Get upcoming reminders
  getUpcomingReminders: async (limit = 5) => {
    try {
      const response = await axiosInstance.get(`/student/reminders/upcoming?limit=${limit}`)
      return response.data
    } catch (error) {
      console.error('Error fetching upcoming reminders:', error)
      throw error
    }
  },

  // Test notification system
  testNotification: async (type = 'info', message = 'Test notification') => {
    try {
      const response = await axiosInstance.post('/student/notifications/test', {
        type,
        message
      })
      return response.data
    } catch (error) {
      console.error('Error sending test notification:', error)
      throw error
    }
  }
}

// Event validation helper
export const validateEventData = (eventData) => {
  const errors = []

  if (!eventData.title || eventData.title.trim() === '') {
    errors.push('Event title is required')
  }

  if (!eventData.startDate) {
    errors.push('Start date is required')
  }

  if (eventData.startDate && new Date(eventData.startDate) < new Date()) {
    errors.push('Start date cannot be in the past')
  }

  if (eventData.endDate && eventData.startDate) {
    if (new Date(eventData.endDate) <= new Date(eventData.startDate)) {
      errors.push('End date must be after start date')
    }
  }

  const validEventTypes = ['exam', 'assignment', 'project', 'hackathon', 'meeting', 'deadline', 'personal', 'other']
  if (eventData.eventType && !validEventTypes.includes(eventData.eventType)) {
    errors.push('Invalid event type')
  }

  const validPriorities = ['low', 'medium', 'high', 'urgent']
  if (eventData.priority && !validPriorities.includes(eventData.priority)) {
    errors.push('Invalid priority level')
  }

  return errors
}

// Event formatting helpers
export const formatEventForCalendar = (event) => {
  return {
    id: event._id,
    title: event.title,
    description: event.description,
    start: new Date(event.startDate),
    end: event.endDate ? new Date(event.endDate) : null,
    type: event.eventType,
    priority: event.priority,
    location: event.location,
    isAllDay: event.isAllDay,
    reminders: event.reminders || [],
    tags: event.tags || []
  }
}

export const formatEventForDisplay = (event) => {
  const startDate = new Date(event.startDate)
  const endDate = event.endDate ? new Date(event.endDate) : null
  
  return {
    ...event,
    formattedStartDate: startDate.toLocaleDateString(),
    formattedStartTime: startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    formattedEndDate: endDate ? endDate.toLocaleDateString() : null,
    formattedEndTime: endDate ? endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
    isToday: startDate.toDateString() === new Date().toDateString(),
    isUpcoming: startDate > new Date(),
    isPast: startDate < new Date()
  }
}
