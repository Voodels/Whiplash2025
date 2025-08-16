import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppRoutes from './reactRouting';
import { ToastContainer } from './components/global';

const App = () => {
  useEffect(() => {
    // Set CSS custom properties for dynamic viewport height on mobile
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);

    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
    };
  }, []);

  return (
    <div className="app-container">
      <Router>
        <AppRoutes/>
        <ToastContainer />
      </Router>
    </div>
  )
}

export default App