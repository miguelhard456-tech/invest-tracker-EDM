import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Calculator, Sparkles, Globe, Moon, Sun, Languages, LogOut } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import ModernAuth from '../components/ModernAuth';

export const LandingPage = () => {
  const { t, toggleLanguage, language } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const features = [
    {
      icon: <Calculator className="w-6 h-6" />,
      title: language === 'en' ? 'Smart Calculator' : 'Calculadora Inteligente',
      description: language === 'en' 
        ? 'Calculate returns across multiple investment types and banks'
        : 'Calcule retornos em vários tipos de investimentos e bancos',
      path: '/dashboard',
      action: () => user ? navigate('/dashboard') : setShowAuth(true)
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: language === 'en' ? 'Live Tracker' : 'Rastreador ao Vivo',
      description: language === 'en'
        ? 'Real-time cryptocurrency prices and bank rates'
        : 'Preços de criptomoedas e taxas bancárias em tempo real',
      path: '/live-tracker',
      action: () => user ? navigate('/live-tracker') : setShowAuth(true)
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: language === 'en' ? 'AI Recommendations' : 'Recomendações IA',
      description: language === 'en'
        ? 'Get personalized suggestions to maximize your returns'
        : 'Obtenha sugestões personalizadas para maximizar seus retornos',
      path: '/recommendations',
      action: () => user ? navigate('/recommendations') : setShowAuth(true)
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: language === 'en' ? 'Multi-Currency' : 'Multi-Moeda',
      description: language === 'en'
        ? 'Support for USD, EUR, and BRL investments'
        : 'Suporte para investimentos em USD, EUR e BRL',
      path: '/dashboard',
      action: () => user ? navigate('/dashboard') : setShowAuth(true)
    }
  ];

  if (showAuth) {
    return (
      <div className="min-h-screen bg-background">
        <ModernAuth onSuccess={() => window.location.href = '/dashboard'} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-primary" />
            <span className="text-2xl font-heading font-bold">EDM Invest</span>
          </div>
          
          <div className="flex items-center gap-3">
            {user && (
              <span className="text-sm text-muted-foreground mr-2">
                {user.name}
              </span>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              data-testid="header-theme-toggle"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              data-testid="header-language-toggle"
            >
              <Languages className="w-5 h-5" />
            </Button>
            {user ? (
              <Button 
                onClick={logout}
                variant="outline"
                className="gap-2"
                data-testid="logout-btn"
              >
                <LogOut className="w-4 h-4" />
                {t('logout')}
              </Button>
            ) : (
              <Button 
                onClick={() => {
                  setAuthMode('login');
                  setShowAuth(true);
                }}
                className="btn-primary"
                data-testid="get-started-btn"
              >
                {t('getStarted')}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 md:pt-32 pb-12 md:pb-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold mb-4 md:mb-6">
              {t('heroTitle')}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 px-4">
              {t('heroSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
              <Button 
                onClick={() => {
                  setAuthMode('register');
                  setShowAuth(true);
                }}
                className="btn-primary text-base md:text-lg px-6 md:px-8 py-4 md:py-6 w-full sm:w-auto"
                data-testid="hero-get-started-btn"
              >
                {t('getStarted')}
              </Button>
            </div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 md:mt-16 rounded-xl md:rounded-2xl overflow-hidden shadow-2xl"
          >
            <img 
              src="https://images.unsplash.com/photo-1662979464913-08a173fdc4cd?q=85" 
              alt="Investment Growth Visualization"
              className="w-full h-64 sm:h-80 md:h-96 lg:h-[500px] object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-3 md:mb-4">
              {language === 'en' ? 'Everything You Need' : 'Tudo que Você Precisa'}
            </h2>
            <p className="text-muted-foreground text-base md:text-lg px-4">
              {language === 'en' 
                ? 'Powerful tools to make informed investment decisions'
                : 'Ferramentas poderosas para tomar decisões de investimento informadas'}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="p-4 md:p-6 h-full hover:border-primary/50 transition-all duration-300 cursor-pointer hover:shadow-lg active:scale-95"
                  onClick={feature.action}
                  data-testid={`feature-card-${index}`}
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3 md:mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="font-heading font-semibold text-base md:text-lg mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-3 md:mb-0">
                    {feature.description}
                  </p>
                  <div className="mt-3 md:mt-4 text-primary text-sm font-semibold flex items-center gap-1">
                    {user ? (language === 'en' ? 'Go →' : 'Ir →') : (language === 'en' ? 'Start →' : 'Começar →')}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-heading font-bold mb-4">
              {language === 'en' ? 'Ready to Start?' : 'Pronto para Começar?'}
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              {language === 'en'
                ? 'Join thousands of smart investors optimizing their portfolios'
                : 'Junte-se a milhares de investidores inteligentes otimizando seus portfólios'}
            </p>
            <Button 
              onClick={() => {
                setAuthMode('register');
                setShowAuth(true);
              }}
              className="btn-primary text-lg px-8 py-6"
              data-testid="cta-get-started-btn"
            >
              {t('getStarted')}
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-muted-foreground">
          <p>© 2025 EDM Invest. {language === 'en' ? 'All rights reserved.' : 'Todos os direitos reservados.'}</p>
          <p className="mt-2 md:mt-0">
            {language === 'en' ? 'Created by' : 'Criado por'}{' '}
            <span className="font-semibold text-foreground">Miguel Marques Cavalcante</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
