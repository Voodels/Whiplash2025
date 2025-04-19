import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SignInForm = ({ onSwitchToSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store user data in localStorage if needed
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
      <h2 className="text-2xl font-bold text-center text-gray-800">Welcome Back 👋</h2>

      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex flex-col">
        <label htmlFor="email" className="text-sm font-medium text-gray-600 mb-1">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition"
          placeholder="you@example.com"
          required
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="password" className="text-sm font-medium text-gray-600 mb-1">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition"
          placeholder="••••••••"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`bg-black text-white py-2 rounded-xl hover:bg-neutral-800 transition-all font-medium ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {isLoading ? 'Signing In...' : 'Sign In'}
      </button>

      <div className="text-sm text-center text-gray-500">
        <p className="mb-1">
          <a href="#" className="hover:underline">Forgot your password?</a>
        </p>
        <p>
          Don't have an account? 
          <button
            onClick={onSwitchToSignUp}
            className="text-black font-semibold hover:underline transition-all duration-200 ml-1"
            type="button"
            disabled={isLoading}
          >
            Sign Up
          </button>
        </p>
      </div>
    </form>
  );
};

export default SignInForm;