import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Video, FileText, CheckCircle, Clock, Target } from 'lucide-react';
import axiosInstance from '../api/axiosConfig';

const CourseProgressMeter = ({ courseId, className = "" }) => {
  const [courseProgress, setCourseProgress] = useState(null);
  const [courseDetails, setCourseDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourseProgressData = async () => {
      if (!courseId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Fetch course progress and course details in parallel
        const [progressResponse, detailsResponse] = await Promise.all([
          axiosInstance.get(`/student/courses/${courseId}/progress`),
          axiosInstance.get(`/student/courses/${courseId}`)
        ]);

        setCourseProgress(progressResponse.data.progress);
        setCourseDetails(detailsResponse.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching course progress:', err);
        setError('Failed to load course progress');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseProgressData();

    // Listen for progress updates
    const handleProgressUpdate = () => {
      fetchCourseProgressData();
    };

    window.addEventListener('courseProgressUpdate', handleProgressUpdate);
    return () => {
      window.removeEventListener('courseProgressUpdate', handleProgressUpdate);
    };
  }, [courseId]);

  // Calculate overall progress statistics
  const calculateProgressStats = () => {
    if (!courseProgress || !courseDetails?.topics) {
      return { 
        overallProgress: 0, 
        videosCompleted: 0, 
        totalVideos: 0,
        quizzesCompleted: 0,
        totalQuizzes: 0,
        assignmentsCompleted: 0,
        totalAssignments: 0,
        pointsEarned: 0
      };
    }

    // Count total resources across all topics
    let totalVideos = 0;
    let totalQuizzes = 0;
    let totalAssignments = 0;

    courseDetails.topics.forEach(topic => {
      if (topic.resources) {
        topic.resources.forEach(resource => {
          if (resource.type === 'video') totalVideos++;
          else if (resource.type === 'quiz') totalQuizzes++;
          else if (resource.type === 'assignment') totalAssignments++;
        });
      }
    });

    const videosCompleted = courseProgress.completedVideos?.length || 0;
    const quizzesCompleted = courseProgress.completedQuizzes?.length || 0;
    const assignmentsCompleted = courseProgress.completedAssignments?.length || 0;
    
    const totalItems = totalVideos + totalQuizzes + totalAssignments;
    const completedItems = videosCompleted + quizzesCompleted + assignmentsCompleted;
    
    const overallProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    return {
      overallProgress,
      videosCompleted,
      totalVideos,
      quizzesCompleted,
      totalQuizzes,
      assignmentsCompleted,
      totalAssignments,
      pointsEarned: courseProgress.points || 0
    };
  };

  const stats = calculateProgressStats();

  if (loading) {
    return (
      <div className={`bg-white rounded-xl p-6 shadow-lg ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-xl p-6 ${className}`}>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (!courseDetails) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-xl p-6 ${className}`}>
        <p className="text-gray-600 text-sm">No course data available</p>
      </div>
    );
  }

  // Progress color based on completion percentage
  const getProgressColor = (progress) => {
    if (progress >= 90) return 'from-green-500 to-emerald-600';
    if (progress >= 70) return 'from-blue-500 to-indigo-600';
    if (progress >= 50) return 'from-yellow-500 to-orange-600';
    if (progress >= 25) return 'from-orange-500 to-red-600';
    return 'from-gray-400 to-gray-500';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white rounded-xl p-6 shadow-lg border border-gray-100 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{courseDetails.title}</h3>
          <p className="text-sm text-gray-600">Learning Progress</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{stats.overallProgress}%</div>
          <div className="text-xs text-gray-500">Complete</div>
        </div>
      </div>

      {/* Circular Progress Indicator */}
      <div className="flex justify-center mb-6">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#f3f4f6"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
              animate={{ 
                strokeDashoffset: 2 * Math.PI * 45 * (1 - stats.overallProgress / 100) 
              }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" className={`text-blue-500`} stopColor="currentColor" />
                <stop offset="100%" className={`text-indigo-600`} stopColor="currentColor" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-gray-900">{stats.overallProgress}%</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Overall Progress</span>
          <span>{stats.overallProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <motion.div 
            className={`h-3 rounded-full bg-gradient-to-r ${getProgressColor(stats.overallProgress)}`}
            initial={{ width: 0 }}
            animate={{ width: `${stats.overallProgress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Videos */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-blue-50 rounded-lg p-4 border border-blue-100"
        >
          <div className="flex items-center justify-between">
            <Video className="w-5 h-5 text-blue-600" />
            <div className="text-right">
              <div className="text-lg font-semibold text-blue-900">
                {stats.videosCompleted}/{stats.totalVideos}
              </div>
              <div className="text-xs text-blue-600">Videos</div>
            </div>
          </div>
        </motion.div>

        {/* Quizzes */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-green-50 rounded-lg p-4 border border-green-100"
        >
          <div className="flex items-center justify-between">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div className="text-right">
              <div className="text-lg font-semibold text-green-900">
                {stats.quizzesCompleted}/{stats.totalQuizzes}
              </div>
              <div className="text-xs text-green-600">Quizzes</div>
            </div>
          </div>
        </motion.div>

        {/* Assignments */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-purple-50 rounded-lg p-4 border border-purple-100"
        >
          <div className="flex items-center justify-between">
            <FileText className="w-5 h-5 text-purple-600" />
            <div className="text-right">
              <div className="text-lg font-semibold text-purple-900">
                {stats.assignmentsCompleted}/{stats.totalAssignments}
              </div>
              <div className="text-xs text-purple-600">Assignments</div>
            </div>
          </div>
        </motion.div>

        {/* Points */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-yellow-50 rounded-lg p-4 border border-yellow-100"
        >
          <div className="flex items-center justify-between">
            <Target className="w-5 h-5 text-yellow-600" />
            <div className="text-right">
              <div className="text-lg font-semibold text-yellow-900">
                {stats.pointsEarned}
              </div>
              <div className="text-xs text-yellow-600">Points</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      {courseProgress && (
        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Last accessed:</span>
            </div>
            <span>
              {courseProgress.lastAccessed 
                ? new Date(courseProgress.lastAccessed).toLocaleDateString()
                : 'Never'
              }
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CourseProgressMeter;
