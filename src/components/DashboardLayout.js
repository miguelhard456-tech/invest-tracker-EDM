import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { TrendingUp, Calculator, Activity, User, LogOut, Moon, Sun, Languages, Menu, Home, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui/button';

export const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { t, toggleLanguage, language } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { path: '/dashboard', icon: Calculator, label: t('calculator') },
    { path: '/live-tracker', icon: Activity, label: 'Live Tracker' },
    { path: '/recommendations', icon: Sparkles, label: language === 'en' ? 'Recommendations' : 'Recomendações' },
    { path: '/profile', icon: User, label: t('profile') }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Layout */}
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Sidebar - Hidden on mobile, shown as bottom nav or toggle */}
        <motion.aside
          initial={false}
          animate={{ 
            width: sidebarOpen ? 256 : 64,
            x: 0
          }}
          className="bg-card border-r border-border flex-col hidden md:flex"
        >
          <div className="p-6 flex items-center gap-2 border-b border-border">
            <TrendingUp className="w-6 h-6 text-primary" />
            {sidebarOpen && <span className="font-heading font-bold text-lg">EDM Invest</span>}
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={() => navigate('/')}
              data-testid="sidebar-home-btn"
            >
              <Home className="w-5 h-5" />
              {sidebarOpen && <span>Home</span>}
            </Button>
            
            {menuItems.map((item) => (
              <Button
                key={item.path}
                variant={location.pathname === item.path ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2"
                onClick={() => navigate(item.path)}
                data-testid={`sidebar-${item.path.replace('/', '')}-btn`}
              >
                <item.icon className="w-5 h-5" />
                {sidebarOpen && <span>{item.label}</span>}
              </Button>
            ))}
          </nav>

          <div className="p-4 border-t border-border space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={logout}
              data-testid="sidebar-logout-btn"
            >
              <LogOut className="w-5 h-5" />
              {sidebarOpen && <span>{t('logout')}</span>}
            </Button>
          </div>
        </motion.aside>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
          <nav className="flex justify-around items-center py-2 px-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="flex flex-col items-center gap-1 h-auto py-2"
              data-testid="mobile-nav-home"
            >
              <Home className="w-5 h-5" />
              <span className="text-xs">Home</span>
            </Button>
            {menuItems.map((item) => (
              <Button
                key={item.path}
                variant={location.pathname === item.path ? 'default' : 'ghost'}
                size="icon"
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-1 h-auto py-2"
                data-testid={`mobile-nav-${item.path.replace('/', '')}`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs">{item.label.split(' ')[0]}</span>
              </Button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-card/60 backdrop-blur-xl border-b border-border px-4 md:px-6 py-3 md:py-4 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-2 md:gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden md:flex"
                data-testid="sidebar-toggle-btn"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div className="md:hidden">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3">
              <span className="text-xs md:text-sm text-muted-foreground hidden sm:inline">
                {user?.name}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                data-testid="header-theme-toggle"
              >
                {theme === 'light' ? <Moon className="w-4 h-4 md:w-5 md:h-5" /> : <Sun className="w-4 h-4 md:w-5 md:h-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleLanguage}
                data-testid="header-language-toggle"
              >
                <Languages className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto pb-20 md:pb-0">
            {children}
          </main>
        </div>
      </div>

      {/* Footer - Hidden on mobile */}
      <footer className="bg-card border-t border-border py-3 md:py-4 px-4 md:px-6 hidden md:block">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs md:text-sm text-muted-foreground gap-2">
          <div>
            © 2025 EDM Invest. All rights reserved.
          </div>
          <div className="flex items-center gap-2">
            <span>Created by</span>
            <span className="font-semibold text-foreground">Miguel Marques Cavalcante</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;
