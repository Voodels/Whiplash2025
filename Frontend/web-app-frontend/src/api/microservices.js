// src/api/microservices.js

import axios from 'axios';

// Microservices base URLs
const MICROSERVICES_BASE = 'http://localhost:8000'; // Adjust based on your setup

// Create axios instance with auth
const createAuthenticatedRequest = () => {
  const token = localStorage.getItem('token');
  return axios.create({
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

/**
 * Material Generator Service
 * Generates learning materials using user's API key
 */
export const materialGeneratorService = {
  async generateMaterial(topic, preferences = {}) {
    try {
      const api = createAuthenticatedRequest();
      const response = await api.post(`${MICROSERVICES_BASE}/material-generator/generate`, {
        topic,
        preferences,
        // User's API key will be retrieved from backend using auth token
      });
      return response.data;
    } catch (error) {
      console.error('Material generation error:', error);
      throw error.response?.data?.message || 'Failed to generate material';
    }
  },

  async generateQuiz(topic, difficulty = 'medium', questionsCount = 5) {
    try {
      const api = createAuthenticatedRequest();
      const response = await api.post(`${MICROSERVICES_BASE}/quiz-generator/generate`, {
        topic,
        difficulty,
        questionsCount
      });
      return response.data;
    } catch (error) {
      console.error('Quiz generation error:', error);
      throw error.response?.data?.message || 'Failed to generate quiz';
    }
  }
};

/**
 * Video Fetcher Service
 * Finds relevant educational videos
 */
export const videoFetcherService = {
  async findVideos(topic, maxResults = 5) {
    try {
      const api = createAuthenticatedRequest();
      const response = await api.post(`${MICROSERVICES_BASE}/video-fetcher/search`, {
        topic,
        maxResults
      });
      return response.data;
    } catch (error) {
      console.error('Video fetch error:', error);
      throw error.response?.data?.message || 'Failed to fetch videos';
    }
  }
};

/**
 * Study Material Generator Service
 * Creates comprehensive study guides
 */
export const studyMaterialService = {
  async generateStudyGuide(syllabus, preferences = {}) {
    try {
      const api = createAuthenticatedRequest();
      const response = await api.post(`${MICROSERVICES_BASE}/study-material-generator/generate`, {
        syllabus,
        preferences
      });
      return response.data;
    } catch (error) {
      console.error('Study guide generation error:', error);
      throw error.response?.data?.message || 'Failed to generate study guide';
    }
  },

  async generateFlashcards(topic, count = 10) {
    try {
      const api = createAuthenticatedRequest();
      const response = await api.post(`${MICROSERVICES_BASE}/study-material-generator/flashcards`, {
        topic,
        count
      });
      return response.data;
    } catch (error) {
      console.error('Flashcard generation error:', error);
      throw error.response?.data?.message || 'Failed to generate flashcards';
    }
  }
};

/**
 * MCP Server Service
 * Model Context Protocol server for advanced AI interactions
 */
export const mcpService = {
  async processWithContext(prompt, context = {}) {
    try {
      const api = createAuthenticatedRequest();
      const response = await api.post(`${MICROSERVICES_BASE}/mcp-server/process`, {
        prompt,
        context
      });
      return response.data;
    } catch (error) {
      console.error('MCP processing error:', error);
      throw error.response?.data?.message || 'Failed to process with MCP';
    }
  },

  async getUsageStats() {
    try {
      const api = createAuthenticatedRequest();
      const response = await api.get(`${MICROSERVICES_BASE}/mcp-server/usage`);
      return response.data;
    } catch (error) {
      console.error('Usage stats error:', error);
      throw error.response?.data?.message || 'Failed to get usage stats';
    }
  }
};

/**
 * Combined service for common learning workflows
 */
export const learningWorkflowService = {
  async createCompleteLearningPath(topic, userPreferences = {}) {
    try {
      const [studyGuide, quiz, videos] = await Promise.all([
        studyMaterialService.generateStudyGuide(topic, userPreferences),
        materialGeneratorService.generateQuiz(topic, userPreferences.difficulty || 'medium'),
        videoFetcherService.findVideos(topic, 3)
      ]);

      return {
        studyGuide,
        quiz,
        videos,
        topic,
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Learning path creation error:', error);
      throw error.response?.data?.message || 'Failed to create learning path';
    }
  },

  async generatePersonalizedContent(userProfile, topics) {
    try {
      const preferences = {
        learningStyle: userProfile.learningStyle || 'visual',
        difficulty: userProfile.difficulty || 'medium',
        interests: userProfile.interests || [],
        language: userProfile.language || 'en'
      };

      const contentPromises = topics.map(topic => 
        this.createCompleteLearningPath(topic, preferences)
      );

      const results = await Promise.all(contentPromises);
      return results;
    } catch (error) {
      console.error('Personalized content generation error:', error);
      throw error.response?.data?.message || 'Failed to generate personalized content';
    }
  }
};

// Export all services
export default {
  materialGenerator: materialGeneratorService,
  videoFetcher: videoFetcherService,
  studyMaterial: studyMaterialService,
  mcp: mcpService,
  learningWorkflow: learningWorkflowService
};
