import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun, Languages } from 'lucide-react';
import { toast } from 'sonner';
import './ModernAuth.css';

export const ModernAuth = ({ onSuccess }) => {
  const { login, register } = useAuth();
  const { t, toggleLanguage, language } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [isActive, setIsActive] = useState(false);
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  
  // Register state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    
    try {
      await login(loginEmail, loginPassword);
      toast.success(t('success'));
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterLoading(true);
    
    try {
      await register(registerName, registerEmail, registerPassword, registerPhone);
      toast.success(t('success'));
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="modern-auth-wrapper">
      <div className="modern-auth-controls">
        <button
          className="modern-auth-icon-btn"
          onClick={toggleTheme}
          data-testid="modern-auth-theme-toggle"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        <button
          className="modern-auth-icon-btn"
          onClick={toggleLanguage}
          data-testid="modern-auth-language-toggle"
        >
          <Languages size={20} />
        </button>
      </div>

      <div className={`modern-auth-container ${isActive ? 'active' : ''}`} id="modern-container">
        <div className="modern-form-container modern-sign-up">
          <form onSubmit={handleRegisterSubmit} data-testid="modern-register-form">
            <h1>{t('createAccount')}</h1>
            <span>{t('dontHaveAccount')}</span>
            <input
              type="text"
              placeholder={t('name')}
              value={registerName}
              onChange={(e) => setRegisterName(e.target.value)}
              required
              data-testid="modern-register-name-input"
            />
            <input
              type="email"
              placeholder={t('email')}
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
              required
              data-testid="modern-register-email-input"
            />
            <input
              type="tel"
              placeholder={language === 'en' ? 'Phone (optional)' : 'Telefone (opcional)'}
              value={registerPhone}
              onChange={(e) => setRegisterPhone(e.target.value)}
              data-testid="modern-register-phone-input"
            />
            <input
              type="password"
              placeholder={t('password')}
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
              required
              minLength={6}
              data-testid="modern-register-password-input"
            />
            <button type="submit" disabled={registerLoading} data-testid="modern-register-submit-btn">
              {registerLoading ? t('loading') : t('register')}
            </button>
          </form>
        </div>
        
        <div className="modern-form-container modern-sign-in">
          <form onSubmit={handleLoginSubmit} data-testid="modern-login-form">
            <h1>{t('welcomeBack')}</h1>
            <span>{t('alreadyHaveAccount')}</span>
            <input
              type="email"
              placeholder={t('email')}
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
              data-testid="modern-login-email-input"
            />
            <input
              type="password"
              placeholder={t('password')}
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
              data-testid="modern-login-password-input"
            />
            <button type="submit" disabled={loginLoading} data-testid="modern-login-submit-btn">
              {loginLoading ? t('loading') : t('login')}
            </button>
          </form>
        </div>
        
        <div className="modern-toggle-container">
          <div className="modern-toggle">
            <div className="modern-toggle-panel modern-toggle-left">
              <h1>{t('welcomeBack')}!</h1>
              <p>{t('alreadyHaveAccount')}</p>
              <button
                className="modern-hidden"
                onClick={() => setIsActive(false)}
                type="button"
                data-testid="modern-switch-to-login-btn"
              >
                {t('login')}
              </button>
            </div>
            <div className="modern-toggle-panel modern-toggle-right">
              <h1>{t('createAccount')}!</h1>
              <p>{t('dontHaveAccount')}</p>
              <button
                className="modern-hidden"
                onClick={() => setIsActive(true)}
                type="button"
                data-testid="modern-switch-to-register-btn"
              >
                {t('register')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernAuth;
