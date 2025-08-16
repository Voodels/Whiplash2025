import React from 'react';
import { motion } from 'framer-motion';
import { 
  UserPlus, 
  Key, 
  Upload, 
  Sparkles, 
  BookOpen 
} from 'lucide-react';

const ProjectFlow = () => {
  const steps = [
    {
      icon: UserPlus,
      title: "Register",
      description: "Create your account",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Key,
      title: "Add API Key",
      description: "Connect your AI service",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Upload,
      title: "Upload Syllabus",
      description: "Upload your learning material",
      color: "from-sky-500 to-sky-600"
    },
    {
      icon: Sparkles,
      title: "AI Generates",
      description: "AI creates personalized content",
      color: "from-indigo-500 to-indigo-600"
    },
    {
      icon: BookOpen,
      title: "Learn & Track",
      description: "Study and monitor progress",
      color: "from-green-500 to-green-600"
    }
  ];

  return (
    <div className="w-full bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
      <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
        {steps.map((step, index) => {
          const IconComponent = step.icon;
          return (
            <React.Fragment key={index}>
              <motion.div 
                className="flex flex-col items-center text-center space-y-3 flex-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm md:text-base">{step.title}</h3>
                  <p className="text-gray-600 text-xs md:text-sm mt-1">{step.description}</p>
                </div>
              </motion.div>
              
              {index < steps.length - 1 && (
                <motion.div 
                  className="hidden md:block w-8 h-0.5 bg-gray-300"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.4 }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectFlow;
