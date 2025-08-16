import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Key, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ChevronRight, 
  ChevronLeft,
  AlertCircle,
  Info,
  Zap,
  Shield
} from 'lucide-react';

const EnhancedSignUpForm = ({ onSubmit, loading = false, error = null }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic info
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    
    // API Configuration
    aiConfig: {
      provider: 'openai',
      apiKey: '',
      model: 'gpt-3.5-turbo'
    },
    
    // Profile
    profile: {
      bio: '',
      learningGoals: [],
      interests: [],
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: 'en'
    }
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [stepErrors, setStepErrors] = useState({});
  // Removed goal/interest collection to streamline signup

  const aiProviders = [
    {
      id: 'openai',
      name: 'OpenAI',
      icon: '🤖',
      description: 'GPT-4, GPT-3.5-turbo',
      keyPrefix: 'sk-',
      models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo']
    },
    {
      id: 'anthropic',
      name: 'Anthropic',
      icon: '🧠',
      description: 'Claude 3, Claude 2',
      keyPrefix: 'sk-ant-',
      models: ['claude-3-opus', 'claude-3-sonnet', 'claude-2']
    },
    {
      id: 'gemini',
      name: 'Google Gemini',
      icon: '✨',
      description: 'Gemini Pro, Gemini Ultra',
      keyPrefix: 'AI',
      models: ['gemini-pro', 'gemini-pro-vision', 'gemini-ultra']
    },
    {
      id: 'ollama',
      name: 'Ollama (Local)',
      icon: '🏠',
      description: 'Self-hosted models',
      keyPrefix: 'ollama',
      models: ['llama2', 'mistral', 'codellama']
    }
  ];

  const validateStep = (step) => {
    const errors = {};

    if (step === 1) {
      if (!formData.name.trim()) errors.name = 'Name is required';
      if (!formData.email.trim()) errors.email = 'Email is required';
      if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
      if (!formData.password) errors.password = 'Password is required';
      if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
      if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    }

    if (step === 2) {
      if (!formData.aiConfig.apiKey.trim()) {
        errors.apiKey = 'API key is required to use this platform';
      } else {
        const provider = aiProviders.find(p => p.id === formData.aiConfig.provider);
        if (provider && !formData.aiConfig.apiKey.startsWith(provider.keyPrefix)) {
          errors.apiKey = `Invalid ${provider.name} API key format`;
        }
      }
    }

    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
  setCurrentStep(prev => Math.min(prev + 1, 2));
    }
  };

  const prevStep = () => {
  setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleInputChange = (field, value, nested = null) => {
    if (nested) {
      setFormData(prev => ({
        ...prev,
        [nested]: {
          ...prev[nested],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear errors when user starts typing
    if (stepErrors[field]) {
      setStepErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Removed goal/interest helper methods with the profile step

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      onSubmit(formData);
    }
  };

  const stepVariants = {
    hidden: { x: 50, opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
      {/* Progress Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Join Whiplash</h2>
          <div className="text-white/80 text-sm">Step {currentStep} of 2</div>
        </div>
        <div className="bg-white/20 rounded-full h-2 overflow-hidden">
          <motion.div
            className="bg-white h-full rounded-full"
            initial={{ width: '50%' }}
            animate={{ width: `${(currentStep / 2) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Let's get started</h3>
                <p className="text-gray-600 mt-2">Create your account to begin your learning journey</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                  {stepErrors.name && <p className="text-red-500 text-sm mt-1">{stepErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>
                  {stepErrors.email && <p className="text-red-500 text-sm mt-1">{stepErrors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {stepErrors.password && <p className="text-red-500 text-sm mt-1">{stepErrors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {stepErrors.confirmPassword && <p className="text-red-500 text-sm mt-1">{stepErrors.confirmPassword}</p>}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: API Key Configuration */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                  <Key className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Bring Your Own AI</h3>
                <p className="text-gray-600 mt-2">Connect your AI service to power your learning experience</p>
              </div>

              {/* Info Banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Why bring your own API key?</p>
                    <ul className="space-y-1 text-blue-700">
                      <li>• Complete control over your AI costs</li>
                      <li>• Direct access to latest models</li>
                      <li>• Enhanced privacy - your data stays with you</li>
                      <li>• No usage limits imposed by us</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Choose Your AI Provider</label>
                  <div className="grid grid-cols-2 gap-3">
                    {aiProviders.map((provider) => (
                      <button
                        key={provider.id}
                        type="button"
                        onClick={() => handleInputChange('provider', provider.id, 'aiConfig')}
                        className={`p-4 border-2 rounded-xl transition-all ${
                          formData.aiConfig.provider === provider.id
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-2">{provider.icon}</div>
                        <div className="text-sm font-medium text-gray-900">{provider.name}</div>
                        <div className="text-xs text-gray-600 mt-1">{provider.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key
                    <span className="text-purple-600 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={formData.aiConfig.apiKey}
                      onChange={(e) => handleInputChange('apiKey', e.target.value, 'aiConfig')}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                      placeholder={`Enter your ${aiProviders.find(p => p.id === formData.aiConfig.provider)?.name} API key`}
                    />
                  </div>
                  {stepErrors.apiKey && <p className="text-red-500 text-sm mt-1">{stepErrors.apiKey}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Model</label>
                  <select
                    value={formData.aiConfig.model}
                    onChange={(e) => handleInputChange('model', e.target.value, 'aiConfig')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  >
                    {aiProviders
                      .find(p => p.id === formData.aiConfig.provider)
                      ?.models.map(model => (
                        <option key={model} value={model}>{model}</option>
                      ))
                    }
                  </select>
                </div>

                {/* Security Notice */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-green-800">
                      <p className="font-medium">Your API key is secure</p>
                      <p className="text-green-700 mt-1">We encrypt and store your key securely. You can update or remove it anytime.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Removed Step 3 (Personalize Your Journey) for streamlined signup */}
        </AnimatePresence>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4"
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center px-6 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back
          </button>

          {currentStep < 2 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-colors"
            >
              Next
              <ChevronRight className="w-5 h-5 ml-2" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Create Account
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedSignUpForm;
