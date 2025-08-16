// src/components/ToastContainer.jsx
// Container for managing multiple toast notifications (no sockets)

import React, { useState, useEffect, useCallback } from 'react'
import Toast from './Toast'

const ToastContainer = () => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random()
    const newToast = {
      id,
      message,
      type,
      timestamp: new Date()
    }
    
    setToasts(prev => [...prev, newToast])
    
    // Auto-remove after 10 seconds as backup
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, 10000)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  useEffect(() => {
    // Listen to global toast events dispatched from anywhere in the app
    const handler = (e) => {
      const { message, type } = e.detail || {};
      if (message) addToast(message, type);
    };
    window.addEventListener('toast:show', handler);
    return () => window.removeEventListener('toast:show', handler);
  }, [addToast])

  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
          duration={5000}
        />
      ))}
    </div>
  )
}

export default ToastContainer
