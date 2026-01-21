import React, { createContext, useContext, useState } from 'react';

const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    calculator: 'Calculator',
    scenarios: 'My Scenarios',
    recommendations: 'AI Recommendations',
    profile: 'Profile',
    logout: 'Logout',
    
    // Auth
    login: 'Login',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    name: 'Name',
    welcomeBack: 'Welcome Back',
    createAccount: 'Create Account',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    
    // Hero
    heroTitle: 'Invest in Your Future',
    heroSubtitle: 'Calculate, compare, and optimize your investments across multiple banks and currencies',
    getStarted: 'Get Started',
    learnMore: 'Learn More',
    
    // Calculator
    investmentCalculator: 'Investment Calculator',
    initialAmount: 'Initial Amount',
    monthlySalary: 'Monthly Salary',
    investmentFromSalary: 'Investment from Salary',
    percentage: 'Percentage',
    fixedAmount: 'Fixed Amount',
    investmentDuration: 'Investment Duration',
    months: 'Months',
    years: 'Years',
    selectBank: 'Select Bank',
    selectInvestmentType: 'Select Investment Type',
    currency: 'Currency',
    calculate: 'Calculate',
    
    // Results
    results: 'Investment Results',
    totalInvested: 'Total Invested',
    totalReturns: 'Total Returns',
    finalAmount: 'Final Amount',
    monthlyBreakdown: 'Monthly Breakdown',
    yearlyBreakdown: 'Yearly Breakdown',
    month: 'Month',
    year: 'Year',
    investment: 'Investment',
    returns: 'Returns',
    total: 'Total',
    endingBalance: 'Ending Balance',
    
    // Scenarios
    myScenarios: 'My Scenarios',
    saveScenario: 'Save Scenario',
    scenarioName: 'Scenario Name',
    save: 'Save',
    delete: 'Delete',
    noScenarios: 'No saved scenarios yet',
    
    // AI Recommendations
    aiRecommendations: 'AI Recommendations',
    viewDetails: 'View Details',
    
    // Common
    cancel: 'Cancel',
    close: 'Close',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
  },
  pt: {
    // Navigation
    dashboard: 'Painel',
    calculator: 'Calculadora',
    scenarios: 'Meus Cenários',
    recommendations: 'Recomendações IA',
    profile: 'Perfil',
    logout: 'Sair',
    
    // Auth
    login: 'Entrar',
    register: 'Registrar',
    email: 'Email',
    password: 'Senha',
    name: 'Nome',
    welcomeBack: 'Bem-vindo de Volta',
    createAccount: 'Criar Conta',
    alreadyHaveAccount: 'Já tem uma conta?',
    dontHaveAccount: 'Não tem uma conta?',
    
    // Hero
    heroTitle: 'Invista no Seu Futuro',
    heroSubtitle: 'Calcule, compare e otimize seus investimentos em vários bancos e moedas',
    getStarted: 'Começar',
    learnMore: 'Saiba Mais',
    
    // Calculator
    investmentCalculator: 'Calculadora de Investimentos',
    initialAmount: 'Valor Inicial',
    monthlySalary: 'Salário Mensal',
    investmentFromSalary: 'Investimento do Salário',
    percentage: 'Porcentagem',
    fixedAmount: 'Valor Fixo',
    investmentDuration: 'Duração do Investimento',
    months: 'Meses',
    years: 'Anos',
    selectBank: 'Selecione o Banco',
    selectInvestmentType: 'Selecione o Tipo de Investimento',
    currency: 'Moeda',
    calculate: 'Calcular',
    
    // Results
    results: 'Resultados do Investimento',
    totalInvested: 'Total Investido',
    totalReturns: 'Retornos Totais',
    finalAmount: 'Valor Final',
    monthlyBreakdown: 'Detalhamento Mensal',
    yearlyBreakdown: 'Detalhamento Anual',
    month: 'Mês',
    year: 'Ano',
    investment: 'Investimento',
    returns: 'Retornos',
    total: 'Total',
    endingBalance: 'Saldo Final',
    
    // Scenarios
    myScenarios: 'Meus Cenários',
    saveScenario: 'Salvar Cenário',
    scenarioName: 'Nome do Cenário',
    save: 'Salvar',
    delete: 'Excluir',
    noScenarios: 'Nenhum cenário salvo ainda',
    
    // AI Recommendations
    aiRecommendations: 'Recomendações IA',
    viewDetails: 'Ver Detalhes',
    
    // Common
    cancel: 'Cancelar',
    close: 'Fechar',
    loading: 'Carregando...',
    error: 'Erro',
    success: 'Sucesso',
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('edm-language');
    return saved || 'en';
  });

  const t = (key) => {
    return translations[language][key] || key;
  };

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'pt' : 'en';
    setLanguage(newLang);
    localStorage.setItem('edm-language', newLang);
  };

  return (
    <LanguageContext.Provider value={{ language, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
