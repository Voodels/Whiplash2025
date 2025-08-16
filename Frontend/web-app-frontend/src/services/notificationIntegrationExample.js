// Frontend Integration Example for Toast Notifications
// This file shows how to integrate the toast notification system in your React frontend

// Note: This example previously used socket.io; sockets are disabled in this app.
// Kept for reference only. Prefer dispatching UI toasts via showToast helper.

class NotificationService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.toastCallbacks = [];
    }

    // Initialize socket connection
    connect(/* userId */) {
        if (this.socket) {
            this.disconnect();
        }

        // Sockets disabled; simulate connection for demo only
        console.log('Notifications: sockets disabled. Use showToast for UI messages.');
        this.isConnected = false;
    }

    // Disconnect from socket
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
        }
    }

    // Register callback for toast notifications
    onToastNotification(callback) {
        this.toastCallbacks.push(callback);
    }

    // Remove toast notification callback
    removeToastCallback(callback) {
        this.toastCallbacks = this.toastCallbacks.filter(cb => cb !== callback);
    }

    // Handle incoming toast notification
    handleToastNotification(data) {
        this.toastCallbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error('Error in toast callback:', error);
            }
        });
    }

    // Test notification (for development)
    testNotification(type = 'info', message = 'Test notification') {
        if (!this.isConnected) {
            console.warn('Not connected to notification service');
            return;
        }

        // You would call your API endpoint here
        fetch('/api/student/notifications/test', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token') // or however you store auth token
            },
            body: JSON.stringify({ type, message })
        }).catch(error => {
            console.error('Error sending test notification:', error);
        });
    }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;

// 3. Create a Toast component (Frontend/web-app-frontend/src/components/Toast.jsx)

/*
import React, { useState, useEffect } from 'react';
import './Toast.css'; // You'll need to create this CSS file

export const Toast = ({ notification, onClose }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (!notification.persistent && notification.duration > 0) {
            const timer = setTimeout(() => {
                handleClose();
            }, notification.duration);

            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => onClose(), 300); // Allow fade-out animation
    };

    const handleActionClick = () => {
        if (notification.action && notification.action.url) {
            // Navigate to the URL (you'll need to implement navigation)
            console.log('Navigate to:', notification.action.url);
        }
        handleClose();
    };

    const getToastIcon = () => {
        switch (notification.type) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            case 'info': default: return 'ℹ️';
        }
    };

    const getToastClass = () => {
        return `toast toast-${notification.type} ${isVisible ? 'toast-visible' : 'toast-hidden'}`;
    };

    return (
        <div className={getToastClass()}>
            <div className="toast-content">
                <div className="toast-icon">{getToastIcon()}</div>
                <div className="toast-text">
                    <div className="toast-title">{notification.title}</div>
                    <div className="toast-message">{notification.message}</div>
                </div>
                <button className="toast-close" onClick={handleClose}>×</button>
            </div>
            {notification.action && (
                <div className="toast-action">
                    <button onClick={handleActionClick}>
                        {notification.action.label}
                    </button>
                </div>
            )}
        </div>
    );
};

export const ToastContainer = () => {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        const handleToast = (notification) => {
            setToasts(prev => [...prev, notification]);
        };

        notificationService.onToastNotification(handleToast);

        return () => {
            notificationService.removeToastCallback(handleToast);
        };
    }, []);

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <Toast
                    key={toast.id}
                    notification={toast}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
};
*/

// 4. CSS for Toast component (Frontend/web-app-frontend/src/components/Toast.css)

/*
.toast-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 400px;
}

.toast {
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    transition: all 0.3s ease;
    border-left: 4px solid;
}

.toast-success { border-left-color: #10b981; }
.toast-error { border-left-color: #ef4444; }
.toast-warning { border-left-color: #f59e0b; }
.toast-info { border-left-color: #3b82f6; }

.toast-visible {
    opacity: 1;
    transform: translateX(0);
}

.toast-hidden {
    opacity: 0;
    transform: translateX(100%);
}

.toast-content {
    display: flex;
    align-items: flex-start;
    padding: 16px;
    gap: 12px;
}

.toast-icon {
    font-size: 20px;
    flex-shrink: 0;
}

.toast-text {
    flex: 1;
}

.toast-title {
    font-weight: 600;
    font-size: 14px;
    color: #374151;
    margin-bottom: 4px;
}

.toast-message {
    font-size: 13px;
    color: #6b7280;
    line-height: 1.4;
}

.toast-close {
    background: none;
    border: none;
    font-size: 18px;
    color: #9ca3af;
    cursor: pointer;
    padding: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.toast-close:hover {
    color: #374151;
}

.toast-action {
    padding: 0 16px 16px;
    border-top: 1px solid #f3f4f6;
}

.toast-action button {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
    font-weight: 500;
}

.toast-action button:hover {
    background: #2563eb;
}
*/

// 5. Initialize in your main App component or AuthContext

/*
// In your AuthContext or App.jsx
import { useEffect } from 'react';
import { notificationService } from './services/notificationService';
import { ToastContainer } from './components/Toast';

export const App = () => {
    const { user, isAuthenticated } = useAuth(); // Your auth context

    useEffect(() => {
        if (isAuthenticated && user) {
            // Connect to notification service when user logs in
            notificationService.connect(user.id);
        } else {
            // Disconnect when user logs out
            notificationService.disconnect();
        }

        return () => {
            notificationService.disconnect();
        };
    }, [isAuthenticated, user]);

    return (
        <div className="App">
            // Your app content
            <ToastContainer />
        </div>
    );
};
*/

// 6. Testing the notification system

/*
// You can test notifications by calling:
notificationService.testNotification('success', 'This is a success message!');
notificationService.testNotification('error', 'This is an error message!');
notificationService.testNotification('warning', 'This is a warning message!');
notificationService.testNotification('info', 'This is an info message!');

// Or make API calls to test:
fetch('/api/student/notifications/test', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'x-auth-token': localStorage.getItem('token')
    },
    body: JSON.stringify({
        type: 'success',
        message: 'Event reminder system is working!'
    })
});
*/
