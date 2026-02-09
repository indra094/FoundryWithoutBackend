import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { LandingPage } from './screens/LandingPage';
import { AuthService } from './services/AuthService';

const App: React.FC = () => {
  const [isInApp, setIsInApp] = useState(AuthService.isSessionValid());

  const handleLogout = useCallback(() => {
    AuthService.logout();
    setIsInApp(false);
  }, []);

  const handleActivity = useCallback(() => {
    if (isInApp) {
      AuthService.refreshSession();
    }
  }, [isInApp]);

  useEffect(() => {
    if (!isInApp) return;

    // Sync state from backend on init
    AuthService.syncState();

    // Refresh session on any interaction
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);

    // Periodic session check
    const checkInterval = setInterval(() => {
      if (!AuthService.isSessionValid()) {
        console.log("Session expired. Logging out...");
        handleLogout();
      }
    }, 10000); // Check every 10 seconds

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      clearInterval(checkInterval);
    };
  }, [isInApp, handleActivity, handleLogout]);

  if (!isInApp) {
    return <LandingPage onEnterApp={() => setIsInApp(true)} />;
  }

  return <Layout />;
};

export default App;