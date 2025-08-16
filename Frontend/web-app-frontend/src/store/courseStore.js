// src/store/courseStore.js
import { create } from 'zustand';
import axiosInstance from '../api/axiosConfig';

const useCourseStore = create((set, get) => ({
  // State
  courses: [],
  currentCourse: null,
  currentTopic: null,
  currentTopicResources: [],
  isLoading: false,
  error: null,
  
  // Actions
  fetchCourses: async () => {
    set({ isLoading: true, error: null });
    try {
  const response = await axiosInstance.get(`/student/courses`);
      set({ courses: response.data.courses, isLoading: false });
      localStorage.setItem('courses', JSON.stringify(response.data.courses));
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch courses', 
        isLoading: false 
      });
    }
  },
  
  setCurrentCourse: (course) => {
    set({ 
      currentCourse: course,
      currentTopic: course?.topics?.length > 0 ? course.topics[0] : null
    });
  },
  
  // Set the current topic globally
  setCurrentTopic: (topic) => {
    set({ currentTopic: topic });
  },
  
  // Fetch course details including all topics and resources
  fetchCourseDetails: async (courseId) => {
    set({ isLoading: true, error: null });
    try {
  const response = await axiosInstance.get(`/student/courses/${courseId}`);
      // Only update if response is valid
      if (response.data && response.data.topics) {
        set({ 
          currentCourse: response.data,
          currentTopic: response.data.topics.length > 0 ? response.data.topics[0] : null,
          isLoading: false 
        });
      } else {
        set({ error: 'Invalid course data', isLoading: false });
      }
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch course details', 
        isLoading: false 
      });
    }
  },
  // Get resources of specific type for current topic (e.g., assignments)
  getResourcesByType: (type) => {
    const { currentTopic } = get();
    if (!currentTopic) return [];
    
    return currentTopic.resources.filter(resource => resource.type === type);
  },
  
  // Course assignments across all topics
  getCourseAssignments: () => {
    const { currentCourse } = get();
    if (!currentCourse?.topics) return [];
    
    let assignments = [];
    currentCourse.topics.forEach(topic => {
      const topicAssignments = topic.resources
        .filter(resource => resource.type === 'assignment')
        .map(assignment => ({
          ...assignment,
          topicName: topic.name,
          topicId: topic.topicId
        }));
      
      assignments = [...assignments, ...topicAssignments];
    });
    
    return assignments;
  },

  notes: [],
  fetchNotes: async (courseId, topicId) => {
    set({ isLoading: true, error: null });
    try {
  const response = await axiosInstance.get(`/student/courses/${courseId}/topics/${topicId}/notes`);
      set({ notes: response.data.notes, isLoading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch notes', 
        isLoading: false 
      });
    }
  },
  // Add note with title fallback
  addNote: async (courseId, topicId, content, title = 'Note') => {
    set({ isLoading: true, error: null });
    try {
  await axiosInstance.post(`/student/courses/${courseId}/topics/${topicId}/notes`, { title, content });
      // Refetch notes after adding
      await get().fetchNotes(courseId, topicId);
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to add note',
        isLoading: false,
      });
    }
  },
  // Assignments fetched from backend
  assignments: [],
  fetchAssignments: async (courseId) => {
    set({ isLoading: true, error: null });
    try {
  const response = await axiosInstance.get(`/student/courses/${courseId}/assignments`);
      set({ assignments: response.data.assignments, isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch assignments',
        isLoading: false
      });
    }
  },

  // Enroll user in all available courses
  enrollInAllCourses: async () => {
    set({ isLoading: true, error: null });
    try {
  const response = await axiosInstance.post(`/student/enroll-all-courses`, {});
      
      // After successful enrollment, fetch updated course list
      await get().fetchCourses();
      
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to enroll in courses', 
        isLoading: false 
      });
      throw error;
    }
  },
}));

export default useCourseStore;