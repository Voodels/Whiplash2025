import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './customCalendar.css';
import { ChevronDown, ChevronRight } from 'lucide-react';

import useCourseStore from '../../store/courseStore';
import { generateLearningPath } from '../../api/mcp';

const StudentDashboard = () => {
  const [open, setOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [date, setDate] = useState(new Date());
  const [courseModal, setCourseModal] = useState({ open: false, selectedCourse: null });
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [expandedCourses, setExpandedCourses] = useState({});
  const [navOpen, setNavOpen] = useState(true);
  const [calendarOpen, setCalendarOpen] = useState(true);
  const [upcomingOpen, setUpcomingOpen] = useState(true);
  const [uploadMode, setUploadMode] = useState('upload');
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState(null);
  const [ocrTopics, setOcrTopics] = useState([]);
  const [manualTopics, setManualTopics] = useState('');
  const [targetDays, setTargetDays] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dailyHours, setDailyHours] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [learningPath, setLearningPath] = useState(null);
  const [lpLoading, setLpLoading] = useState(false);
  const [lpError, setLpError] = useState(null);

  const navigate = useNavigate();
  const { courses, fetchCourses, fetchCourseDetails, setCurrentCourse, setCurrentTopic, currentCourse } = useCourseStore();

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const closeSidebarIfMobile = () => {
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const handleImageUpload = (e) => {
    setOcrLoading(true);
    setOcrError(null);
    setOcrTopics([]);
    setTimeout(() => {
      setOcrLoading(false);
      setOcrTopics(['Topic 1', 'Topic 2', 'Topic 3']);
    }, 2000);
  };

  const handleSaveSyllabus = async () => {
  console.log('[handleSaveSyllabus] called');
  setLpLoading(true);
  setLpError(null);
  
  try {
    // Validate inputs
    if (!manualTopics || !targetDays || !dailyHours || !startDate) {
      throw new Error('Please fill in all the fields');
    }

    // Prepare payload
    const payload = {
      manualTopics: manualTopics.split(',').map(t => t.trim()),
      targetDays: Number(targetDays),
      dailyHours: Number(dailyHours),
      startDate: startDate
    };

    console.log('[handleSaveSyllabus] Sending data:', payload);
    const data = await generateLearningPath(payload);
    
    console.log('[handleSaveSyllabus] Received response:', data);
    setLearningPath(data);
    handleClose();
  } catch (err) {
    console.error('[handleSaveSyllabus] Error:', err);
    
    // User-friendly error messages
    let displayError = err.message;
    if (err.message.includes('Network Error')) {
      displayError = 'Unable to connect to the server. Please check your connection.';
    } else if (err.message.includes('timeout')) {
      displayError = 'Request timed out. Please try again.';
    } else if (err.message.includes('500')) {
      displayError = 'Server error. Please try again later.';
    }
    
    setLpError(displayError);
  } finally {
    setLpLoading(false);
  }
};

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const isEvent = importantEvents.some(ev =>
        ev.date.toDateString() === date.toDateString()
      );
      if (isEvent) return 'highlight';
    }
    return null;
  };

  const navLinkStyle = ({ isActive }) => {
    return isActive 
      ? "bg-black text-white p-3 rounded-xl font-medium flex items-center transition-all"
      : "text-gray-700 hover:bg-gray-100 p-3 rounded-xl flex items-center transition-all";
  };

  const toggleCourseTopics = (courseId) => {
    setExpandedCourses((prev) => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

  const closeAllDropdowns = () => {
    setNavOpen(false);
    setCalendarOpen(false);
    setUpcomingOpen(false);
  };

  const importantEvents = [
    { date: new Date(2025, 3, 15), label: 'AI/ML Mid Exam' },
    { date: new Date(2025, 3, 18), label: 'Web Dev Project Review' },
    { date: new Date(2025, 3, 20), label: 'Hackathon' },
    { date: new Date(), label: 'Today: Prep for DBMS' }
  ];

  const handleGoToSyllabus = async (courseId) => {
    await fetchCourseDetails(courseId);
    navigate('/syllabus');
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Hamburger Button */}
      <button 
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-30 bg-black text-white p-3 rounded-full shadow-lg"
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>

      {/* Left Sidebar - Hidden on mobile unless toggled */}
      <div 
        className={`fixed md:static inset-0 z-20 bg-white md:bg-transparent transition-transform duration-300 ease-in-out transform md:transform-none p-4 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:w-1/3 lg:w-1/4 overflow-y-auto md:border-r border-gray-200 pt-14 md:pt-4`}
      >
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Whiplash</h2>
            <div className="h-10 w-10 rounded-full bg-black text-white flex items-center justify-center">
              <span>JD</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-3">
            <div className="flex justify-between items-center cursor-pointer" onClick={() => { closeAllDropdowns(); setCalendarOpen(v => !v); }}>
              <h2 className="text-lg font-bold mb-2 flex items-center">
                <span className="mr-2">📅</span> Calendar
              </h2>
              {calendarOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </div>
            {calendarOpen && (
              <Calendar
                onChange={setDate}
                value={date}
                tileClassName={tileClassName}
                className="rounded-xl"
              />
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-md p-4">
            <div className="flex justify-between items-center cursor-pointer" onClick={() => { closeAllDropdowns(); setUpcomingOpen(v => !v); }}>
              <h3 className="text-md font-semibold mb-3 flex items-center">
                <span className="mr-2">📌</span> Upcoming
              </h3>
              {upcomingOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </div>
            {upcomingOpen && (
              <ul className="space-y-2">
                {importantEvents.map((event, idx) => (
                  <li key={idx} className="p-2 rounded-xl bg-gray-50 text-sm hover:bg-gray-100 transition-all">
                    <div className="font-medium">{event.label}</div>
                    <div className="text-xs text-gray-500">{event.date.toDateString()}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="bg-white rounded-2xl shadow-md p-4">
            <div className="flex justify-between items-center cursor-pointer" onClick={() => { closeAllDropdowns(); setNavOpen(v => !v); }}>
              <h2 className="text-lg font-semibold mb-3 flex items-center">
                <span className="mr-2">🧭</span> Navigation
              </h2>
              {navOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </div>
            {navOpen && (
              <nav className="space-y-2">
                <NavLink to="/dashboard" end className={navLinkStyle} onClick={closeSidebarIfMobile}>
                  🏠 Dashboard
                </NavLink>
                <NavLink to="/dashboard/assignments" className={navLinkStyle} onClick={closeSidebarIfMobile}>
                  📝 Assignments
                </NavLink>
                <NavLink to="/dashboard/learning" className={navLinkStyle} onClick={closeSidebarIfMobile}>
                  🧠 Learning
                </NavLink>
                <NavLink to="/dashboard/notes" className={navLinkStyle} onClick={closeSidebarIfMobile}>
                  📓 Notes
                </NavLink>
                <NavLink to="/dashboard/quizzes" className={navLinkStyle} onClick={closeSidebarIfMobile}>
                  ✅ Quizzes
                </NavLink>
                <NavLink to="/dashboard/syllabus" className={navLinkStyle} onClick={closeSidebarIfMobile}>
                  📑 Syllabus
                </NavLink>
              </nav>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-md p-4">
            <h2 className="text-lg font-semibold mb-3 flex items-center">
              <span className="mr-2">📚</span> My Courses
            </h2>
            <ul className="space-y-2">
              {courses && courses.length > 0 ? (
                courses.map((course) => (
                  <li
                    key={course._id}
                    className={`p-3 rounded-xl cursor-pointer font-medium flex items-center justify-between ${
                      currentCourse && currentCourse._id === course._id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-50 text-gray-700 hover:bg-blue-100'
                    }`}
                    onClick={() => { closeSidebarIfMobile(); setCourseModal({ open: true, selectedCourse: course }); }}
                  >
                    <span>{course.title}</span>
                    <button
                      className="ml-2 focus:outline-none"
                      onClick={e => { e.stopPropagation(); toggleCourseTopics(course._id); }}
                    >
                      {expandedCourses[course._id] ? (
                        <ChevronDown className="h-5 w-5 inline" />
                      ) : (
                        <ChevronRight className="h-5 w-5 inline" />
                      )}
                    </button>
                    <button
                      className="ml-2 px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-xs"
                      onClick={() => { closeSidebarIfMobile(); handleGoToSyllabus(course._id); }}
                    >
                      Syllabus
                    </button>
                  </li>
                ))
              ) : (
                <li className="text-gray-400">No courses found.</li>
              )}
            </ul>
            {courses && courses.map(course => (
              expandedCourses[course._id] && course.topics && course.topics.length > 0 && (
                <ul key={course._id + '-topics'} className="ml-6 mb-2">
                  {course.topics.map(topic => (
                    <li
                      key={topic.topicId}
                      className={`p-2 rounded cursor-pointer text-sm ${
                        currentCourse && currentCourse._id === course._id && currentCourse.currentTopic && currentCourse.currentTopic.topicId === topic.topicId
                          ? 'bg-blue-200 text-blue-900'
                          : 'bg-gray-100 text-gray-700 hover:bg-blue-50'
                      }`}
                      onClick={() => { closeSidebarIfMobile(); setCurrentCourse(course); setCurrentTopic(topic); }}
                    >
                      {topic.name}
                    </li>
                  ))}
                </ul>
              )
            ))}
          </div>
        </div>
      </div>

      {/* Right Content */}
      <div className="flex-1 p-4 md:p-6 pt-16 md:pt-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl m-7 font-bold mb-6">What do you want to learn today? 🤔</h1>
          
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              placeholder="Search or Add a New Topic..."
              className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleOpen(); }}
            />
            <button
              className="bg-black text-white py-2 px-6 rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
              onClick={handleOpen}
            >
              Search
            </button>
            <button
              className="bg-gray-200 text-black py-2 px-4 rounded-xl hover:bg-gray-300 transition-colors shadow-sm"
              onClick={() => setCourseModal({ open: true, selectedCourse: currentCourse })}
            >
              Change Course
            </button>
          </div>

          {/* Content area */}
          <div className="mt-4 bg-white rounded-2xl shadow-md p-6">
            {/* Learning Path Generation Status */}
            {lpLoading && (
              <div className="text-blue-600 font-semibold mb-4">Generating your personalized learning path...</div>
            )}
            {lpError && (
              <div className="text-red-600 font-semibold mb-4">Error: {lpError}</div>
            )}
            {/* Display Generated Learning Path */}
            {learningPath && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4">Your Personalized Learning Path</h2>
                {learningPath.plan && Object.keys(learningPath.plan).length > 0 ? (
                  <div className="space-y-6">
                    {Object.entries(learningPath.plan).map(([date, value], idx) => (
                      <div key={idx} className="border rounded-xl p-4 bg-gray-50">
                        <h3 className="text-xl font-semibold mb-2">Day {idx + 1}: {date}</h3>
                        <ul className="mb-2 list-disc list-inside">
                          <li className="mb-1">
                            <span className="font-medium">{value.subtopic || ''}</span>
                          </li>
                          {value.youtube_link && (
                            <li>
                              <a href={value.youtube_link} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">
                                Watch Video
                              </a>
                              {value.timestamp && (
                                <span className="ml-2 text-xs text-gray-500">[{value.timestamp}]</span>
                              )}
                            </li>
                          )}
                          {value.notes && (
                            <li>
                              <span className="font-semibold">Notes:</span> {value.notes}
                            </li>
                          )}
                          {value.quizzes && value.quizzes.length > 0 && (
                            <li>
                              <span className="font-semibold">Quizzes:</span>
                              <ul className="ml-4 list-decimal">
                                {value.quizzes.map((quiz, quizIdx) => (
                                  <li key={quizIdx}>{quiz.questionText}</li>
                                ))}
                              </ul>
                            </li>
                          )}
                          {value.assignments && value.assignments.length > 0 && (
                            <li>
                              <span className="font-semibold">Assignments:</span>
                              <ul className="ml-4 list-decimal">
                                {value.assignments.map((assn, assnIdx) => (
                                  <li key={assnIdx}>{assn.questionText}</li>
                                ))}
                              </ul>
                            </li>
                          )}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>No modules found in the generated learning path.</div>
                )}
              </div>
            )}

            <Outlet />
          </div>
        </div>
      </div>

      {/* Course Selection Modal */}
      {courseModal.open && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60 backdrop-blur-sm" onClick={() => setCourseModal({ open: false, selectedCourse: null })}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Change Course & Topic</h2>
              <button onClick={() => setCourseModal({ open: false, selectedCourse: null })} className="text-gray-400 hover:text-black transition-colors">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 font-medium text-sm">Select Course</label>
                <select
                  value={courseModal.selectedCourse?._id || ''}
                  onChange={e => {
                    const course = courses.find(c => c._id === e.target.value);
                    setCourseModal({ ...courseModal, selectedCourse: course });
                    setSelectedTopic(null);
                  }}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="" disabled>Select Course</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>{course.title}</option>
                  ))}
                </select>
              </div>
              {courseModal.selectedCourse && courseModal.selectedCourse.topics && (
                <div>
                  <label className="block mb-2 font-medium text-sm">Select Topic</label>
                  <select
                    value={selectedTopic?.topicId || ''}
                    onChange={e => {
                      const topic = courseModal.selectedCourse.topics.find(t => t.topicId === e.target.value);
                      setSelectedTopic(topic);
                    }}
                    className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="" disabled>Select Topic</option>
                    {courseModal.selectedCourse.topics.map(topic => (
                      <option key={topic.topicId} value={topic.topicId}>{topic.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <button
                className="bg-black hover:bg-gray-800 text-white py-3 px-4 rounded-xl w-full mt-4 transition-colors shadow-sm"
                onClick={() => {
                  if (courseModal.selectedCourse) {
                    setCurrentCourse(courseModal.selectedCourse);
                    if (selectedTopic) {
                      setCurrentTopic(selectedTopic);
                    }
                  }
                  setCourseModal({ open: false, selectedCourse: null });
                  setSelectedTopic(null);
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Syllabus Modal */}
      {open && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60 backdrop-blur-sm" onClick={handleClose}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add Course Syllabus</h2>
              <button 
                onClick={handleClose}
                className="text-gray-400 hover:text-black transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Toggle between Upload or Manual Entry */}
              <div className="flex space-x-4 justify-center mb-2">
                <button
                  className={`px-4 py-2 rounded-xl border transition-colors ${uploadMode === 'upload' ? 'bg-black text-white' : 'bg-gray-100 text-black'}`}
                  onClick={() => setUploadMode('upload')}
                >
                  Upload Syllabus Pic (OCR)
                </button>
                <button
                  className={`px-4 py-2 rounded-xl border transition-colors ${uploadMode === 'manual' ? 'bg-black text-white' : 'bg-gray-100 text-black'}`}
                  onClick={() => setUploadMode('manual')}
                >
                  Enter Topics Manually
                </button>
              </div>

              {/* Upload Syllabus Pic */}
              {uploadMode === 'upload' && (
                <div>
                  <label className="block mb-2 font-medium text-sm">Upload Syllabus Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  {ocrLoading && <div className="text-sm text-gray-500 mt-2">Processing image...</div>}
                  {ocrError && <div className="text-sm text-red-500 mt-2">{ocrError}</div>}
                  {ocrTopics.length > 0 && (
                    <div className="mt-2">
                      <label className="block mb-1 text-xs font-medium">Extracted Topics:</label>
                      <ul className="list-disc pl-5 text-sm">
                        {ocrTopics.map((topic, idx) => (
                          <li key={idx}>{topic}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Manual Topic Entry */}
              {uploadMode === 'manual' && (
                <div>
                  <label className="block mb-2 font-medium text-sm">Enter Topic Names (comma separated)</label>
                  <input
                    type="text"
                    value={manualTopics}
                    onChange={e => setManualTopics(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="e.g. Algebra, Calculus, Geometry"
                  />
                </div>
              )}

              {/* Target Days to Complete */}
              <div>
                <label className="block mb-2 font-medium text-sm">Target Days to Complete</label>
                <input
                  type="number"
                  min="1"
                  value={targetDays}
                  onChange={e => setTargetDays(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Enter number of days"
                />
              </div>

              {/* Start Date */}
              <div>
                <label className="block mb-2 font-medium text-sm">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* Daily Hours */}
              <div>
                <label className="block mb-2 font-medium text-sm">Daily Hours</label>
                <input
                  type="number"
                  min="1"
                  value={dailyHours}
                  onChange={e => setDailyHours(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Enter daily study hours"
                />
              </div>

              <button
                className="bg-black hover:bg-gray-800 text-white py-3 px-4 rounded-xl w-full mt-4 transition-colors shadow-sm"
                onClick={handleSaveSyllabus}
              >
                Save Syllabus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;