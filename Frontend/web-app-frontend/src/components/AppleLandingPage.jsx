import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
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
  CheckCircle,
  Play
} from 'lucide-react';

const AppleLandingPage = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const { scrollYProgress } = useScroll();
  
  // Parallax effects
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 1.1]);

  const features = [
    {
      icon: <Key className="w-6 h-6" />,
      title: "Bring Your Own AI",
      description: "Use your own API key for complete cost control and privacy",
      gradient: "from-blue-500 to-cyan-400",
      delay: 0.1
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI-Powered Learning",
      description: "Generate personalized study materials, quizzes, and explanations",
      gradient: "from-purple-500 to-pink-400",
      delay: 0.2
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Self-Hosted Platform",
      description: "Complete control over your data and learning experience",
      gradient: "from-green-500 to-emerald-400",
      delay: 0.3
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "Transparent Costs",
      description: "No hidden fees. Pay only for what you use with your AI provider",
      gradient: "from-orange-500 to-yellow-400",
      delay: 0.4
    }
  ];

  const workflows = [
    {
      step: "01",
      title: "Register Account",
      description: "Create your Whiplash account with just a few details",
      icon: <Users className="w-8 h-8" />
    },
    {
      step: "02", 
      title: "Add API Key",
      description: "Connect your AI service (OpenAI, Anthropic, Gemini, or Ollama)",
      icon: <Key className="w-8 h-8" />
    },
    {
      step: "03",
      title: "Upload Content",
      description: "Upload your syllabus, notes, or learning materials",
      icon: <BookOpen className="w-8 h-8" />
    },
    {
      step: "04",
      title: "AI Generation",
      description: "Watch as AI creates personalized study plans and quizzes",
      icon: <Sparkles className="w-8 h-8" />
    },
    {
      step: "05",
      title: "Learn & Track",
      description: "Study with AI-generated content and track your progress",
      icon: <Trophy className="w-8 h-8" />
    }
  ];

  const stats = [
    { value: "100%", label: "Data Privacy", description: "Your data stays with your AI provider" },
    { value: "∞", label: "Usage Limits", description: "No platform-imposed restrictions" },
    { value: "4+", label: "AI Providers", description: "OpenAI, Anthropic, Gemini, Ollama" },
    { value: "0%", label: "Hidden Fees", description: "Complete cost transparency" }
  ];

  return (
    <div className="relative bg-black text-white overflow-hidden">
      {/* Hero Section */}
      <motion.section 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center"
        style={{ y: heroY, opacity: heroOpacity }}
      >
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute inset-0"
            style={{ scale: heroScale }}
          >
            {/* Gradient Orbs */}
            <motion.div
              className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"
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
              className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/20 to-pink-500/20 rounded-full blur-3xl"
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
          </motion.div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mb-8"
          >
            <motion.h1 
              className="text-4xl md:text-7xl lg:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent"
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
              Your Control.
            </motion.h1>
            
            <motion.p 
              className="text-lg md:text-2xl lg:text-3xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
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
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.button
              className="group relative px-8 py-4 bg-white text-black rounded-full font-semibold text-lg hover:bg-gray-100 transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 flex items-center">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-20"
                layoutId="buttonGlow"
              />
            </motion.button>
            
            <motion.button
              className="group flex items-center px-8 py-4 border border-white/20 rounded-full font-semibold text-lg hover:border-white/40 transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsVideoPlaying(true)}
            >
              <Play className="mr-2 w-5 h-5" />
              Watch Demo
            </motion.button>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
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
      </motion.section>

      {/* Features Section */}
      <section className="relative py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Why Choose Whiplash?
            </h2>
            <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
              Unlike traditional learning platforms, Whiplash puts you in complete control of your AI and data
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: feature.delay }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative"
              >
                <div className="relative p-8 rounded-3xl bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-500">
                  <motion.div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 text-white`}
                    whileHover={{ rotate: 5, scale: 1.1 }}
                  >
                    {feature.icon}
                  </motion.div>
                  
                  <h3 className="text-xl font-bold mb-3 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text transition-all duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                    {feature.description}
                  </p>

                  {/* Hover effect overlay */}
                  <motion.div
                    className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                    layoutId={`feature-${index}`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-20 md:py-32 bg-gradient-to-b from-transparent to-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
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

      {/* Stats Section */}
      <section className="relative py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              By the Numbers
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center group"
              >
                <motion.div
                  className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                  whileHover={{ scale: 1.1 }}
                >
                  {stat.value}
                </motion.div>
                <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-gray-300 transition-colors">
                  {stat.label}
                </h3>
                <p className="text-gray-400 text-sm">
                  {stat.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 md:py-32 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Ready to revolutionize your learning?
            </h2>
            <p className="text-lg md:text-xl text-gray-300 mb-12">
              Join the future of self-hosted AI education. Bring your API key and start learning without limits.
            </p>
            
            <motion.button
              className="group relative px-12 py-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full font-bold text-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 flex items-center">
                Start Your Journey
                <Rocket className="ml-3 w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-full opacity-0 group-hover:opacity-100"
                layoutId="ctaGlow"
              />
            </motion.button>
          </motion.div>
        </div>
      </section>

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
                className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                ×
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Workflow Step Component
const WorkflowStep = ({ workflow, index, isLast }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-20%" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.8, delay: 0.2 }}
      className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-20`}
    >
      {/* Content */}
      <div className={`flex-1 ${index % 2 === 0 ? 'lg:text-left' : 'lg:text-right'} text-center`}>
        <motion.div
          className="inline-block text-4xl md:text-6xl font-bold text-blue-500/30 mb-4"
          whileHover={{ scale: 1.1, color: "#3b82f6" }}
        >
          {workflow.step}
        </motion.div>
        
        <h3 className="text-2xl md:text-3xl font-bold mb-4 text-white">
          {workflow.title}
        </h3>
        
        <p className="text-lg text-gray-400 max-w-md mx-auto lg:mx-0">
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
          <div className="w-40 h-40 md:w-60 md:h-60 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10 flex items-center justify-center">
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
              className="absolute top-full left-1/2 transform -translate-x-1/2 w-0.5 h-20 bg-gradient-to-b from-blue-500/50 to-transparent hidden lg:block"
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

export default AppleLandingPage;
