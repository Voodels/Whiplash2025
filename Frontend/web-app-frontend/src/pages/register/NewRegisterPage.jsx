import React, { useState } from 'react'
import SignInForm from '../../components/forms/sign-in'
import EnhancedSignUpForm from '../../components/forms/EnhancedSignUpForm'
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { 
  ChevronDown, 
  Sparkles, 
  Zap, 
  Shield, 
  DollarSign,
  Key,
  Brain,
  Rocket,
  Users,
  BookOpen,
  Trophy,
  ArrowRight,
  Play
} from 'lucide-react'

const NewRegisterPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('signin')
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const toggleModal = () => setIsModalOpen(!isModalOpen)
  const navigate = useNavigate();
  const { isAuthenticated, login, register } = useAuth();

  // Redirect if already logged in
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSignInSubmit = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      await login(credentials);
    } catch (err) {
      setError(err.message || err || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignUpSubmit = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      await register(userData);
    } catch (err) {
      setError(err.message || err || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <Key className="w-6 h-6" />,
      title: "Bring Your Own AI",
      description: "Use your own API key for complete cost control and privacy",
      gradient: "from-blue-500 to-cyan-400",
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI-Powered Learning",
      description: "Generate personalized study materials, quizzes, and explanations",
      gradient: "from-purple-500 to-pink-400",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Self-Hosted Platform",
      description: "Complete control over your data and learning experience",
      gradient: "from-green-500 to-emerald-400",
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "Transparent Costs",
      description: "No hidden fees. Pay only for what you use with your AI provider",
      gradient: "from-orange-500 to-yellow-400",
    }
  ];

  const workflows = [
    {
      step: "01",
      title: "Register Account",
      description: "Create your Whiplash account with just a few details",
      icon: <Users className="w-12 h-12" />
    },
    {
      step: "02", 
      title: "Add API Key",
      description: "Connect your AI service (OpenAI, Anthropic, Gemini, or Ollama)",
      icon: <Key className="w-12 h-12" />
    },
    {
      step: "03",
      title: "Upload Content",
      description: "Upload your syllabus, notes, or learning materials",
      icon: <BookOpen className="w-12 h-12" />
    },
    {
      step: "04",
      title: "AI Generation",
      description: "Watch as AI creates personalized study plans and quizzes",
      icon: <Sparkles className="w-12 h-12" />
    },
    {
      step: "05",
      title: "Learn & Track",
      description: "Study with AI-generated content and track your progress",
      icon: <Trophy className="w-12 h-12" />
    }
  ];

  return (
    <>
      <div className="relative bg-black text-white overflow-hidden">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center">
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Gradient Orbs */}
            <motion.div
              className="absolute top-1/4 left-1/4 w-64 md:w-96 h-64 md:h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"
              animate={{
                x: [0, 100, 0],
                y: [0, -50, 0],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            <motion.div
              className="absolute bottom-1/4 right-1/4 w-64 md:w-96 h-64 md:h-96 bg-gradient-to-r from-cyan-500/20 to-pink-500/20 rounded-full blur-3xl"
              animate={{
                x: [0, -100, 0],
                y: [0, 50, 0],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </div>

          <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="mb-8"
            >
              <motion.h1 
                className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent leading-tight"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.2 }}
              >
                Your AI.
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Your Learning.
                </span>
                <br />
                <span className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl">Your Control.</span>
              </motion.h1>
              
              <motion.p 
                className="text-base md:text-xl lg:text-2xl text-gray-300 mb-8 md:mb-12 max-w-4xl mx-auto leading-relaxed px-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.6 }}
              >
                Whiplash is the first self-hosted learning platform where you bring your own AI API key 
                and we provide the infrastructure to create unlimited, personalized educational content.
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4"
            >
              <motion.button
                onClick={toggleModal}
                className="group relative px-6 md:px-8 py-3 md:py-4 bg-white text-black rounded-full font-semibold text-base md:text-lg hover:bg-gray-100 transition-all duration-300 w-full sm:w-auto"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10 flex items-center justify-center">
                  Get Started Free
                  <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>
              
              <motion.button
                className="group flex items-center justify-center px-6 md:px-8 py-3 md:py-4 border border-white/20 rounded-full font-semibold text-base md:text-lg hover:border-white/40 transition-all duration-300 w-full sm:w-auto"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsVideoPlaying(true)}
              >
                <Play className="mr-2 w-4 h-4 md:w-5 md:h-5" />
                Watch Demo
              </motion.button>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden md:block"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.8 }}
            >
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-white/60 cursor-pointer hover:text-white transition-colors"
              >
                <ChevronDown className="w-6 h-6" />
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative py-16 md:py-32">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12 md:mb-20"
            >
              <h2 className="text-2xl md:text-4xl lg:text-6xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Why Choose Whiplash?
              </h2>
              <p className="text-base md:text-lg lg:text-xl text-gray-400 max-w-3xl mx-auto px-4">
                Unlike traditional learning platforms, Whiplash puts you in complete control of your AI and data
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="group relative"
                >
                  <div className="relative p-6 md:p-8 rounded-2xl md:rounded-3xl bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-500">
                    <motion.div
                      className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4 md:mb-6 text-white`}
                      whileHover={{ rotate: 5, scale: 1.1 }}
                    >
                      {feature.icon}
                    </motion.div>
                    
                    <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text transition-all duration-300">
                      {feature.title}
                    </h3>
                    
                    <p className="text-sm md:text-base text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="relative py-16 md:py-32 bg-gradient-to-b from-transparent to-white/5">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12 md:mb-20"
            >
              <h2 className="text-2xl md:text-4xl lg:text-6xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                How It Works
              </h2>
              <p className="text-base md:text-lg lg:text-xl text-gray-400 max-w-3xl mx-auto px-4">
                Get started in minutes with our simple 5-step process
              </p>
            </motion.div>

            <div className="space-y-12 md:space-y-20">
              {workflows.map((workflow, index) => (
                <WorkflowStep 
                  key={index} 
                  workflow={workflow} 
                  index={index}
                  isLast={index === workflows.length - 1}
                />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-16 md:py-32 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
          <div className="max-w-4xl mx-auto text-center px-4">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-2xl md:text-3xl lg:text-5xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Ready to revolutionize your learning?
              </h2>
              <p className="text-base md:text-lg lg:text-xl text-gray-300 mb-8 md:mb-12 px-4">
                Join the future of self-hosted AI education. Bring your API key and start learning without limits.
              </p>
              
              <motion.button
                onClick={toggleModal}
                className="group relative px-8 md:px-12 py-4 md:py-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full font-bold text-lg md:text-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10 flex items-center justify-center">
                  Start Your Journey
                  <Rocket className="ml-2 md:ml-3 w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </span>
              </motion.button>
            </motion.div>
          </div>
        </section>
      </div>

      {/* Auth Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Tab Headers */}
              <div className="flex border-b bg-gray-50/50">
                <button
                  onClick={() => setActiveTab('signin')}
                  className={`flex-1 py-4 text-center font-medium transition-all duration-300 ${
                    activeTab === 'signin' 
                      ? 'border-b-2 border-black text-black bg-white' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setActiveTab('signup')}
                  className={`flex-1 py-4 text-center font-medium transition-all duration-300 ${
                    activeTab === 'signup' 
                      ? 'border-b-2 border-black text-black bg-white' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Sign Up
                </button>
              </div>
              
              {/* Error Display */}
              {error && (
                <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <div className="text-red-800 text-sm text-center">{error}</div>
                </div>
              )}
              
              {/* Forms */}
              <div className="p-6 max-h-[80vh] overflow-y-auto">
                {activeTab === 'signin' ? (
                  <SignInForm onSubmit={handleSignInSubmit} loading={loading} />
                ) : (
                  <EnhancedSignUpForm onSubmit={handleSignUpSubmit} loading={loading} error={error} />
                )}
              </div>
              
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors text-xl"
              >
                ×
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Modal */}
      <AnimatePresence>
        {isVideoPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsVideoPlaying(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative w-full max-w-4xl aspect-video bg-black rounded-3xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <div className="text-center">
                  <Play className="w-16 h-16 mx-auto mb-4 opacity-60" />
                  <p className="text-xl">Demo video coming soon...</p>
                </div>
              </div>
              <button
                onClick={() => setIsVideoPlaying(false)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors text-xl"
              >
                ×
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Workflow Step Component
const WorkflowStep = ({ workflow, index, isLast }) => {
  const [isInView, setIsInView] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
      whileInView={{ opacity: 1, x: 0 }}
      onViewportEnter={() => setIsInView(true)}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-8 lg:gap-20`}
    >
      {/* Content */}
      <div className={`flex-1 ${index % 2 === 0 ? 'lg:text-left' : 'lg:text-right'} text-center px-4`}>
        <motion.div
          className="inline-block text-3xl md:text-4xl lg:text-6xl font-bold text-blue-500/30 mb-4"
          whileHover={{ scale: 1.1, color: "#3b82f6" }}
        >
          {workflow.step}
        </motion.div>
        
        <h3 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 text-white">
          {workflow.title}
        </h3>
        
        <p className="text-base md:text-lg text-gray-400 max-w-md mx-auto lg:mx-0">
          {workflow.description}
        </p>
      </div>

      {/* Visual */}
      <div className="flex-1 flex justify-center">
        <motion.div
          className="relative"
          whileHover={{ scale: 1.05, rotate: 2 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="w-32 h-32 md:w-48 md:h-48 lg:w-60 lg:h-60 rounded-2xl md:rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10 flex items-center justify-center">
            <motion.div
              className="text-blue-400"
              whileHover={{ scale: 1.2, rotate: -5 }}
            >
              {workflow.icon}
            </motion.div>
          </div>
          
          {/* Connecting line */}
          {!isLast && (
            <motion.div
              className="absolute top-full left-1/2 transform -translate-x-1/2 w-0.5 h-16 md:h-20 bg-gradient-to-b from-blue-500/50 to-transparent hidden lg:block"
              initial={{ scaleY: 0 }}
              animate={isInView ? { scaleY: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.6 }}
            />
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default NewRegisterPage;
