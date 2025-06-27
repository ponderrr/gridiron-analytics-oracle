
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trophy, User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  isAuthenticated?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, isAuthenticated }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isLoggedIn = isAuthenticated || !!user;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800/80 backdrop-blur-lg border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="bg-emerald-500 p-2 rounded-lg group-hover:bg-emerald-400 transition-colors">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Fantasy Football Guru</h1>
                <p className="text-xs text-emerald-400 -mt-1">Advanced Analytics</p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center space-x-4">
              {isLoggedIn ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                  
                  {/* User Menu */}
                  <div className="flex items-center space-x-2 bg-slate-700 px-3 py-2 rounded-lg">
                    <User className="h-4 w-4 text-slate-300" />
                    <span className="text-sm text-slate-300">
                      {user?.email?.split('@')[0] || 'User'}
                    </span>
                  </div>
                  
                  <button 
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-slate-300 hover:text-red-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/signup" 
                    className="btn-primary"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-800/50 border-t border-slate-700/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-slate-400 text-sm">
              © 2024 Fantasy Football Guru. Advanced analytics for serious fantasy players.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
