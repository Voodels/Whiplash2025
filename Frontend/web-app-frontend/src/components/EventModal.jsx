// src/components/EventModal.jsx
// Event creation and editing modal

import React, { useState, useEffect } from 'react'
import { eventAPI, validateEventData } from '../api/events'

const EventModal = ({ isOpen, onClose, onEventCreated, editEvent = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: 'personal',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    priority: 'medium',
    location: '',
    isAllDay: false,
    reminders: [
      {
        timeBeforeEvent: 15,
        type: 'notification',
        isActive: true
      }
    ],
    tags: []
  })

  const [errors, setErrors] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newTag, setNewTag] = useState('')

  useEffect(() => {
    if (editEvent) {
      const start = new Date(editEvent.startDate)
      const end = editEvent.endDate ? new Date(editEvent.endDate) : null
      
      setFormData({
        title: editEvent.title || '',
        description: editEvent.description || '',
        eventType: editEvent.eventType || 'personal',
        startDate: start.toISOString().split('T')[0],
        startTime: start.toTimeString().slice(0, 5),
        endDate: end ? end.toISOString().split('T')[0] : '',
        endTime: end ? end.toTimeString().slice(0, 5) : '',
        priority: editEvent.priority || 'medium',
        location: editEvent.location || '',
        isAllDay: editEvent.isAllDay || false,
        reminders: editEvent.reminders || [{ timeBeforeEvent: 15, type: 'notification', isActive: true }],
        tags: editEvent.tags || []
      })
    } else {
      // Reset form for new event
      const now = new Date()
      const nextHour = new Date(now.getTime() + 60 * 60 * 1000)
      
      setFormData({
        title: '',
        description: '',
        eventType: 'personal',
        startDate: now.toISOString().split('T')[0],
        startTime: nextHour.toTimeString().slice(0, 5),
        endDate: '',
        endTime: '',
        priority: 'medium',
        location: '',
        isAllDay: false,
        reminders: [{ timeBeforeEvent: 15, type: 'notification', isActive: true }],
        tags: []
      })
    }
  }, [editEvent])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleReminderChange = (index, field, value) => {
    const newReminders = [...formData.reminders]
    newReminders[index] = { ...newReminders[index], [field]: value }
    setFormData(prev => ({ ...prev, reminders: newReminders }))
  }

  const addReminder = () => {
    setFormData(prev => ({
      ...prev,
      reminders: [...prev.reminders, { timeBeforeEvent: 15, type: 'notification', isActive: true }]
    }))
  }

  const removeReminder = (index) => {
    setFormData(prev => ({
      ...prev,
      reminders: prev.reminders.filter((_, i) => i !== index)
    }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors([])

    try {
      // Combine date and time for start/end dates
      const startDateTime = formData.isAllDay 
        ? new Date(formData.startDate + 'T00:00:00')
        : new Date(formData.startDate + 'T' + formData.startTime)

      const endDateTime = formData.endDate 
        ? (formData.isAllDay 
            ? new Date(formData.endDate + 'T23:59:59')
            : new Date(formData.endDate + 'T' + (formData.endTime || formData.startTime)))
        : null

      const eventData = {
        title: formData.title,
        description: formData.description,
        eventType: formData.eventType,
        startDate: startDateTime,
        endDate: endDateTime,
        priority: formData.priority,
        location: formData.location,
        isAllDay: formData.isAllDay,
        reminders: formData.reminders.filter(r => r.isActive),
        tags: formData.tags
      }

      // Validate the data
      const validationErrors = validateEventData(eventData)
      if (validationErrors.length > 0) {
        setErrors(validationErrors)
        return
      }

      // Submit the event
      let result
      if (editEvent) {
        result = await eventAPI.updateEvent(editEvent._id, eventData)
      } else {
        result = await eventAPI.createEvent(eventData)
      }

      if (result.success) {
        onEventCreated(result.event)
        onClose()
      } else {
        setErrors([result.message || 'Failed to save event'])
      }
    } catch (error) {
      console.error('Error saving event:', error)
      setErrors([error.response?.data?.message || 'Failed to save event'])
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {editEvent ? 'Edit Event' : 'Create New Event'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {errors.length > 0 && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              <ul className="list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter event title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Type
              </label>
              <select
                name="eventType"
                value={formData.eventType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="exam">Exam</option>
                <option value="assignment">Assignment</option>
                <option value="project">Project</option>
                <option value="hackathon">Hackathon</option>
                <option value="meeting">Meeting</option>
                <option value="deadline">Deadline</option>
                <option value="personal">Personal</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter event description"
            />
          </div>

          {/* Date and Time */}
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                name="isAllDay"
                checked={formData.isAllDay}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label className="text-sm font-medium text-gray-700">All Day Event</label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {!formData.isAllDay && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {!formData.isAllDay && formData.endDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter event location"
            />
          </div>

          {/* Reminders */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Reminders
              </label>
              <button
                type="button"
                onClick={addReminder}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                + Add Reminder
              </button>
            </div>
            
            {formData.reminders.map((reminder, index) => (
              <div key={index} className="flex items-center gap-3 mb-3 p-3 border border-gray-200 rounded">
                <div className="flex-1">
                  <select
                    value={reminder.timeBeforeEvent}
                    onChange={(e) => handleReminderChange(index, 'timeBeforeEvent', parseInt(e.target.value))}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value={5}>5 minutes before</option>
                    <option value={15}>15 minutes before</option>
                    <option value={30}>30 minutes before</option>
                    <option value={60}>1 hour before</option>
                    <option value={1440}>1 day before</option>
                  </select>
                </div>
                <div className="flex-1">
                  <select
                    value={reminder.type}
                    onChange={(e) => handleReminderChange(index, 'type', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="notification">Notification</option>
                    <option value="email">Email</option>
                    <option value="push">Push</option>
                  </select>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={reminder.isActive}
                    onChange={(e) => handleReminderChange(index, 'isActive', e.target.checked)}
                    className="mr-1"
                  />
                  <span className="text-sm">Active</span>
                </label>
                <button
                  type="button"
                  onClick={() => removeReminder(index)}
                  className="text-red-600 hover:text-red-800 text-sm font-bold"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Tags */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a tag"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Add
              </button>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : (editEvent ? 'Update Event' : 'Create Event')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EventModal
