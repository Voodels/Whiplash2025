import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Key, 
  DollarSign, 
  Activity, 
  Clock, 
  Shield, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Zap
} from 'lucide-react';
import { validateApiKey, updateApiConfig, getApiConfig } from '../../api/auth';
import { mcpService } from '../../api/microservices';

const ApiKeyManager = ({ user, onApiConfigUpdate }) => {
  const [apiConfig, setApiConfig] = useState(null);
  const [usageStats, setUsageStats] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [newApiKey, setNewApiKey] = useState('');
  const [validationStatus, setValidationStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApiConfig();
    loadUsageStats();
  }, []);

  const loadApiConfig = async () => {
    try {
      const config = await getApiConfig();
      setApiConfig(config);
    } catch (error) {
      console.error('Error loading API config:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsageStats = async () => {
    try {
      const stats = await mcpService.getUsageStats();
      setUsageStats(stats.usage);
    } catch (error) {
      console.error('Error loading usage stats:', error);
    }
  };

  const handleValidateApiKey = async () => {
    setIsValidating(true);
    setValidationStatus(null);
    
    try {
      const result = await validateApiKey();
      setValidationStatus({
        type: 'success',
        message: result.message
      });
      
      // Refresh config after validation
      await loadApiConfig();
      onApiConfigUpdate && onApiConfigUpdate();
      
    } catch (error) {
      setValidationStatus({
        type: 'error',
        message: error.message || 'Validation failed'
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleUpdateApiKey = async () => {
    if (!newApiKey.trim()) return;
    
    setIsUpdating(true);
    
    try {
      await updateApiConfig({ apiKey: newApiKey });
      setNewApiKey('');
      setValidationStatus({
        type: 'success',
        message: 'API key updated successfully. Please validate it.'
      });
      
      await loadApiConfig();
      onApiConfigUpdate && onApiConfigUpdate();
      
    } catch (error) {
      setValidationStatus({
        type: 'error',
        message: error.message || 'Failed to update API key'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const formatCost = (cost) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4
    }).format(cost || 0);
  };

  const formatTokens = (tokens) => {
    if (!tokens) return '0';
    if (tokens > 1000) {
      return `${(tokens / 1000).toFixed(1)}K`;
    }
    return tokens.toString();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 px-4 md:px-0">
      {/* API Configuration Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Key className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900">API Configuration</h3>
              <p className="text-xs md:text-sm text-gray-600">Manage your AI service settings</p>
            </div>
          </div>
          
          {apiConfig?.isValidated ? (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Validated</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-orange-600">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Needs Validation</span>
            </div>
          )}
        </div>

        {apiConfig && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Provider</label>
              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-sm md:text-lg capitalize">{apiConfig.provider}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Model</label>
              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-sm md:text-lg">{apiConfig.model}</span>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">API Key</label>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <div className="flex-1 bg-gray-50 rounded-lg p-3 min-w-0">
                  {showApiKey ? (
                    <span className="font-mono text-xs md:text-sm break-all">{apiConfig.apiKey}</span>
                  ) : (
                    <span className="text-gray-500 text-xs md:text-sm">••••••••••••••••••••••••••••••••</span>
                  )}
                </div>
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="px-3 py-2 md:px-4 text-sm text-gray-600 hover:text-gray-800 transition-colors whitespace-nowrap"
                >
                  {showApiKey ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Update API Key */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Update API Key</h4>
          <div className="flex space-x-3">
            <input
              type="password"
              value={newApiKey}
              onChange={(e) => setNewApiKey(e.target.value)}
              placeholder="Enter new API key"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleUpdateApiKey}
              disabled={!newApiKey.trim() || isUpdating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isUpdating ? 'Updating...' : 'Update'}
            </button>
          </div>
        </div>

        {/* Validation */}
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={handleValidateApiKey}
            disabled={isValidating || !apiConfig?.apiKey}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isValidating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Shield className="w-4 h-4" />
            )}
            <span>{isValidating ? 'Validating...' : 'Validate API Key'}</span>
          </button>

          {apiConfig?.lastValidated && (
            <span className="text-sm text-gray-500">
              Last validated: {new Date(apiConfig.lastValidated).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Validation Status */}
        {validationStatus && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-3 rounded-lg ${
              validationStatus.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              {validationStatus.type === 'success' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span className="text-sm">{validationStatus.message}</span>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Usage Statistics */}
      {usageStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Usage Statistics</h3>
              <p className="text-sm text-gray-600">Track your AI service consumption</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Total Tokens */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {formatTokens(usageStats.totalTokens)}
              </div>
              <div className="text-sm text-gray-600">Total Tokens</div>
            </div>

            {/* Total Cost */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {formatCost(usageStats.totalCost)}
              </div>
              <div className="text-sm text-gray-600">Total Cost</div>
            </div>

            {/* Last Used */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="text-lg font-bold text-gray-900 mb-1">
                {usageStats.lastUsed 
                  ? new Date(usageStats.lastUsed).toLocaleDateString()
                  : 'Never'
                }
              </div>
              <div className="text-sm text-gray-600">Last Used</div>
            </div>
          </div>

          <button
            onClick={loadUsageStats}
            className="mt-6 flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Statistics</span>
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default ApiKeyManager;
