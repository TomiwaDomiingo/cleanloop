import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { WelcomePage } from './components/WelcomePage';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { Dashboard } from './components/Dashboard';
import { RequestPickup } from './components/RequestPickup';
import { TrackPickup } from './components/TrackPickup';
import { ReportDumpsite } from './components/ReportDumpsite';
import { Wallet } from './components/Wallet';
import { Profile } from './components/Profile';
import { History } from './components/History';
import { DriverPortal } from './components/DriverPortal';
import { AdminPortal } from './components/AdminPortal';
import {
  User,
  loginUser,
  registerUser,
  saveUser,
  getSession,
  setSession,
  clearSession,
  seedInitialData,
  requestBrowserNotificationPermission,
} from './types';

export default function App() {
  const [currentPage, setCurrentPage] = useState('welcome');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // On mount: seed initial data (drivers) + restore session
  useEffect(() => {
    seedInitialData();
    const session = getSession();
    if (session) {
      setCurrentUser(session);
      setCurrentPage('dashboard');
    }
    // Request notification permission politely
    const timer = setTimeout(requestBrowserNotificationPermission, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (email: string, password: string): string | null => {
    const user = loginUser(email, password);
    if (!user) return 'Incorrect email or password. Please try again.';
    setCurrentUser(user);
    setSession(user);
    setCurrentPage('dashboard');
    return null;
  };

  const handleRegister = (data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
  }): string | null => {
    const { user, error } = registerUser(data);
    if (error || !user) return error;
    setCurrentUser(user);
    setSession(user);
    setCurrentPage('dashboard');
    return null;
  };

  const handleLogout = () => {
    clearSession();
    setCurrentUser(null);
    setCurrentPage('welcome');
  };

  const updateUser = (updated: User) => {
    saveUser(updated);
    setSession(updated);
    setCurrentUser(updated);
  };

  // Demo mode login — called from WelcomePage
  const handleDemoLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentPage('dashboard');
  };

  const handleNavigate = (page: string) => {
    // Portal pages don't require user auth
    const portalPages = ['driver-portal', 'admin-portal'];
    if (portalPages.includes(page)) {
      setCurrentPage(page);
      return;
    }

    // Guard authenticated pages
    const protectedPages = [
      'dashboard', 'request-pickup', 'track-pickup', 'report-dumpsite',
      'wallet', 'profile', 'history',
    ];
    if (protectedPages.includes(page) && !currentUser) {
      setCurrentPage('login');
      return;
    }
    setCurrentPage(page);
  };

  const renderPage = () => {
    // ── Portal routes (no user auth required) ─────────────────
    if (currentPage === 'driver-portal') {
      return <DriverPortal onNavigate={handleNavigate} />;
    }
    if (currentPage === 'admin-portal') {
      return <AdminPortal onNavigate={handleNavigate} />;
    }

    // ── Unauthenticated user routes ────────────────────────────
    if (!currentUser) {
      switch (currentPage) {
        case 'login':
          return <LoginPage onNavigate={handleNavigate} onLogin={handleLogin} />;
        case 'register':
          return <RegisterPage onNavigate={handleNavigate} onRegister={handleRegister} />;
        default:
          return <WelcomePage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />;
      }
    }

    // ── Authenticated user routes ──────────────────────────────
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            user={currentUser}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        );
      case 'history':
        return (
          <History
            user={currentUser}
            onNavigate={handleNavigate}
          />
        );
      case 'request-pickup':
        return (
          <RequestPickup
            user={currentUser}
            onNavigate={handleNavigate}
            onUpdateUser={updateUser}
          />
        );
      case 'track-pickup':
        return (
          <TrackPickup
            user={currentUser}
            onNavigate={handleNavigate}
            onUpdateUser={updateUser}
          />
        );
      case 'report-dumpsite':
        return (
          <ReportDumpsite
            user={currentUser}
            onNavigate={handleNavigate}
            onUpdateUser={updateUser}
          />
        );
      case 'wallet':
        return (
          <Wallet
            user={currentUser}
            onNavigate={handleNavigate}
            onUpdateUser={updateUser}
          />
        );
      case 'profile':
        return (
          <Profile
            user={currentUser}
            onNavigate={handleNavigate}
            onUpdateUser={updateUser}
            onLogout={handleLogout}
          />
        );
      default:
        return (
          <Dashboard
            user={currentUser}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        );
    }
  };

  return (
    <>
      <div className="size-full">{renderPage()}</div>
      <Toaster position="top-center" richColors />
    </>
  );
}
