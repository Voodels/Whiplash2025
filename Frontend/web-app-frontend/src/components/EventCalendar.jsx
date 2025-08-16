// src/components/EventCalendar.jsx
// Interactive calendar component with real events

import React, { useState, useEffect, useCallback } from 'react'
import { eventAPI, formatEventForDisplay } from '../api/events'
import EventModal from './EventModal'

const EventCalendar = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showEventModal, setShowEventModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [view, setView] = useState('month') // 'month', 'week', 'list'

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      
      // Get events for the current month
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      
      const response = await eventAPI.getEventsByDateRange(startOfMonth, endOfMonth)
      
      if (response.success) {
        setEvents(response.events.map(formatEventForDisplay))
      } else {
        setError(response.message || 'Failed to fetch events')
      }
    } catch (err) {
      console.error('Error fetching events:', err)
      setError('Failed to load events')
    } finally {
      setLoading(false)
    }
  }, [currentDate])

  useEffect(() => {
    fetchEvents()
  }, [currentDate, fetchEvents])

  const handleCreateEvent = () => {
    setEditingEvent(null)
    setShowEventModal(true)
  }

  const handleEditEvent = (event) => {
    setEditingEvent(event)
    setShowEventModal(true)
  }

  const handleDeleteEvent = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event?')) return
    
    try {
      const response = await eventAPI.deleteEvent(eventId)
      if (response.success) {
        setEvents(prev => prev.filter(event => event._id !== eventId))
      } else {
        alert('Failed to delete event: ' + response.message)
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      alert('Failed to delete event')
    }
  }

  const handleEventSaved = (savedEvent) => {
    const formattedEvent = formatEventForDisplay(savedEvent)
    
    if (editingEvent) {
      // Update existing event
      setEvents(prev => prev.map(event => 
        event._id === savedEvent._id ? formattedEvent : event
      ))
    } else {
      // Add new event
      setEvents(prev => [...prev, formattedEvent])
    }
    
    setShowEventModal(false)
    setEditingEvent(null)
  }

  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + direction)
      return newDate
    })
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white'
      case 'high': return 'bg-orange-500 text-white'
      case 'medium': return 'bg-blue-500 text-white'
      case 'low': return 'bg-green-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getEventTypeIcon = (eventType) => {
    switch (eventType) {
      case 'exam': return '📝'
      case 'assignment': return '📋'
      case 'project': return '🚀'
      case 'hackathon': return '💻'
      case 'meeting': return '👥'
      case 'deadline': return '⏰'
      case 'personal': return '👤'
      default: return '📅'
    }
  }

  // Generate calendar days
  const generateCalendarDays = () => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const startOfCalendar = new Date(startOfMonth)
    startOfCalendar.setDate(startOfCalendar.getDate() - startOfMonth.getDay())
    
    const days = []
    const currentCalendarDate = new Date(startOfCalendar)
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentCalendarDate))
      currentCalendarDate.setDate(currentCalendarDate.getDate() + 1)
    }
    
    return days
  }

  const renderMonthView = () => {
    const days = generateCalendarDays()
    const today = new Date()
    
    return (
      <div className="bg-white rounded-lg shadow">
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                ←
              </button>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                →
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1 rounded ${view === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              List
            </button>
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1 rounded ${view === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Month
            </button>
            <button
              onClick={handleCreateEvent}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              + Add Event
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-center font-medium text-gray-600 border-r last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const dayEvents = getEventsForDate(day)
            const isCurrentMonth = day.getMonth() === currentDate.getMonth()
            const isToday = day.toDateString() === today.toDateString()
            
            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 border-r border-b last:border-r-0 ${
                  !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                } ${isToday ? 'bg-blue-50' : ''}`}
              >
                <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : ''}`}>
                  {day.getDate()}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map(event => (
                    <div
                      key={event._id}
                      onClick={() => handleEditEvent(event)}
                      className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 ${getPriorityColor(event.priority)}`}
                      title={`${event.title} - ${event.formattedStartTime}`}
                    >
                      <div className="flex items-center gap-1">
                        <span>{getEventTypeIcon(event.eventType)}</span>
                        <span className="truncate">{event.title}</span>
                      </div>
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderListView = () => {
    const sortedEvents = [...events].sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Upcoming Events</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1 rounded ${view === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Month
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1 rounded ${view === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              List
            </button>
            <button
              onClick={handleCreateEvent}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              + Add Event
            </button>
          </div>
        </div>

        <div className="divide-y">
          {sortedEvents.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No events found. Create your first event!
            </div>
          ) : (
            sortedEvents.map(event => (
              <div key={event._id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg">{getEventTypeIcon(event.eventType)}</span>
                      <h3 className="font-medium text-lg">{event.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(event.priority)}`}>
                        {event.priority}
                      </span>
                    </div>
                    
                    {event.description && (
                      <p className="text-gray-600 mb-2">{event.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>📅 {event.formattedStartDate}</span>
                      {!event.isAllDay && <span>🕐 {event.formattedStartTime}</span>}
                      {event.location && <span>📍 {event.location}</span>}
                    </div>
                    
                    {event.tags && event.tags.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {event.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEditEvent(event)}
                      className="px-3 py-1 text-blue-600 hover:bg-blue-100 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event._id)}
                      className="px-3 py-1 text-red-600 hover:bg-red-100 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading events...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong>Error:</strong> {error}
        <button
          onClick={fetchEvents}
          className="ml-4 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div>
      {view === 'month' ? renderMonthView() : renderListView()}
      
      <EventModal
        isOpen={showEventModal}
        onClose={() => {
          setShowEventModal(false)
          setEditingEvent(null)
        }}
        onEventCreated={handleEventSaved}
        editEvent={editingEvent}
      />
    </div>
  )
}

export default EventCalendar
