// src/components/Toast.jsx
// Toast notification component for real-time notifications

import React, { useState, useEffect, useCallback } from 'react'

const Toast = ({ message, type, onClose, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleClose = useCallback(() => {
    setIsAnimating(false)
    setTimeout(() => {
      setIsVisible(false)
      onClose()
    }, 300)
  }, [onClose])

  useEffect(() => {
    setIsAnimating(true)
    
    const timer = setTimeout(() => {
      handleClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, handleClose])

  if (!isVisible) return null

  const getToastStyles = () => {
    const baseStyles = "fixed top-4 right-4 z-50 max-w-sm w-full bg-white rounded-lg shadow-lg border-l-4 p-4 transition-all duration-300 transform"
    
    const typeStyles = {
      success: "border-green-500 bg-green-50",
      error: "border-red-500 bg-red-50", 
      warning: "border-yellow-500 bg-yellow-50",
      info: "border-blue-500 bg-blue-50"
    }

    const animationStyles = isAnimating 
      ? "translate-x-0 opacity-100" 
      : "translate-x-full opacity-0"

    return `${baseStyles} ${typeStyles[type] || typeStyles.info} ${animationStyles}`
  }

  const getIcon = () => {
    switch (type) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'warning': return '⚠️'
      case 'info': return 'ℹ️'
      default: return '📢'
    }
  }

  const getTextColor = () => {
    switch (type) {
      case 'success': return 'text-green-800'
      case 'error': return 'text-red-800'
      case 'warning': return 'text-yellow-800'
      case 'info': return 'text-blue-800'
      default: return 'text-gray-800'
    }
  }

  return (
    <div className={getToastStyles()}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-xl">{getIcon()}</span>
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm font-medium ${getTextColor()}`}>
            {message}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={handleClose}
            className={`inline-flex ${getTextColor()} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          >
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Toast
