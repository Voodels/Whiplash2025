import React, { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import ProfileModal from './ProfileModal'
import SettingsModal from './SettingsModal'

const getInitials = (name, email) => {
  if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase()
  if (email) return email[0].toUpperCase()
  return '?'
}

const colorThemes = [
  'from-blue-500 to-purple-500',
  'from-green-400 to-teal-500',
  'from-yellow-400 to-orange-500',
  'from-pink-500 to-red-500',
  'from-indigo-500 to-blue-400',
]

const GlobalUserBar = () => {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [themeIdx, setThemeIdx] = useState(() => Number(localStorage.getItem('avatarThemeIdx')) || 0)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const dropdownRef = useRef()

  React.useEffect(() => {
    const handleClick = (e) => {
      if (dropdownOpen && dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [dropdownOpen])

  if (!currentUser) return null

  // No uploads; avatar is initials + theme color

  // Theme changes are handled via the Avatar Settings modal only

  const handleLogout = () => {
    logout()
    navigate('/register')
  }

  return (
    <div className="fixed top-4 right-6 z-50 flex items-center bg-white/80 shadow-lg rounded-full px-4 py-2 gap-3 border border-gray-200 backdrop-blur-md">
      <div className="relative group" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          className={`w-10 h-10 rounded-full bg-gradient-to-br ${colorThemes[themeIdx]} flex items-center justify-center text-white font-bold text-xl overflow-hidden border-2 border-white shadow transition-all duration-200`}
          title="User menu"
        >
          {getInitials(currentUser?.name, currentUser?.email)}
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl z-50 border border-gray-100 animate-fade-in">
            <button
              className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 rounded-xl"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        )}
      </div>
      <div className="flex flex-col items-start ml-2">
        <span className="font-bold text-gray-800 text-sm">{currentUser?.name || currentUser?.email}</span>
        <span className="text-gray-400 text-xs">{currentUser.role && currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}</span>
      </div>
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-10"
          onClick={() => setShowModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="avatar-modal-title"
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-[92vw] max-w-md p-6 relative mt-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              aria-label="Close"
              className="absolute top-3 right-3 w-8 h-8 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              onClick={() => setShowModal(false)}
            >
              ×
            </button>

            <h2 id="avatar-modal-title" className="text-xl font-bold mb-1">Avatar Settings</h2>
            <p className="text-sm text-gray-500 mb-4">Use your initials with a color theme. No image upload.</p>

            <div className="flex items-center gap-4 mb-5">
              <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${colorThemes[themeIdx]} flex items-center justify-center text-white font-bold text-2xl shadow-inner border-2 border-white`}>
                {getInitials(currentUser?.name, currentUser?.email)}
              </div>
              <div className="text-sm text-gray-600">
                <p className="font-medium">Preview</p>
                <p>These initials will be shown as your avatar.</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-800 mb-2">Choose color</p>
              <div className="grid grid-cols-5 gap-3">
                {colorThemes.map((cls, idx) => (
                  <button
                    key={idx}
                    type="button"
                    aria-label={`Select theme ${idx + 1}`}
                    onClick={() => {
                      setThemeIdx(idx)
                    }}
                    className={`relative w-12 h-12 rounded-full bg-gradient-to-br ${cls} border-2 ${themeIdx === idx ? 'border-black' : 'border-transparent'} shadow hover:scale-[1.02] transition`}
                  />
                ))}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                className="flex-1 border border-gray-300 rounded-xl py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="flex-1 bg-black text-white py-2 rounded-xl hover:bg-gray-900"
                onClick={() => {
                  localStorage.setItem('avatarThemeIdx', themeIdx)
                  setShowModal(false)
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} user={currentUser} />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  )
}

export default GlobalUserBar
