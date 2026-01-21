import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Target, Zap, CheckCircle, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Recommendations = () => {
  const { getAuthHeaders, user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [scenarios, setScenarios] = useState([]);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [scenariosRes, banksRes] = await Promise.all([
        axios.get(`${API}/scenarios`, { headers: getAuthHeaders() }),
        axios.get(`${API}/banks`)
      ]);
      
      setScenarios(scenariosRes.data);
      setBanks(banksRes.data);
      
      // Generate smart recommendations based on user data
      generateRecommendations(scenariosRes.data, banksRes.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = (userScenarios, allBanks) => {
    const recs = [];

    // 1. Best Rate Recommendation
    const topBanks = allBanks
      .flatMap(bank => 
        bank.investment_types.map(type => ({
          bank: bank.name,
          bankId: bank.id,
          type: type.name,
          typePt: type.name_pt,
          rate: type.annual_rate,
          currency: bank.currency,
          minInvestment: type.min_investment,
          investmentTypeId: type.id
        }))
      )
      .sort((a, b) => b.rate - a.rate);

    if (topBanks.length > 0) {
      const best = topBanks[0];
      recs.push({
        id: 'best-rate',
        icon: <TrendingUp className="w-6 h-6" />,
        title: language === 'en' ? 'Highest Return Available' : 'Maior Retorno Disponível',
        description: language === 'en'
          ? `${best.bank} offers ${best.rate}% annual return on ${best.type}. This is the best rate across all banks.`
          : `${best.bank} oferece ${best.rate}% de retorno anual em ${best.typePt}. Esta é a melhor taxa entre todos os bancos.`,
        actionText: language === 'en' ? 'Calculate Returns' : 'Calcular Retornos',
        action: () => navigate('/dashboard', { state: { bankId: best.bankId, investmentTypeId: best.investmentTypeId } }),
        color: 'primary',
        priority: 1
      });
    }

    // 2. Diversification Recommendation
    const currencies = [...new Set(allBanks.map(b => b.currency))];
    if (currencies.length >= 2) {
      recs.push({
        id: 'diversify',
        icon: <Target className="w-6 h-6" />,
        title: language === 'en' ? 'Diversify Your Portfolio' : 'Diversifique Seu Portfólio',
        description: language === 'en'
          ? `Consider spreading investments across ${currencies.join(', ')} to reduce currency risk and maximize opportunities.`
          : `Considere distribuir investimentos em ${currencies.join(', ')} para reduzir risco cambial e maximizar oportunidades.`,
        actionText: language === 'en' ? 'View Live Rates' : 'Ver Taxas ao Vivo',
        action: () => navigate('/live-tracker'),
        color: 'accent',
        priority: 2
      });
    }

    // 3. Long-term Investment
    if (userScenarios.length === 0 || userScenarios.every(s => s.input_data.duration_months < 60)) {
      recs.push({
        id: 'long-term',
        icon: <Zap className="w-6 h-6" />,
        title: language === 'en' ? 'Think Long-Term' : 'Pense a Longo Prazo',
        description: language === 'en'
          ? 'Compound interest works best over 5+ years. Extend your investment horizon to see exponential growth.'
          : 'Juros compostos funcionam melhor em 5+ anos. Estenda seu horizonte de investimento para ver crescimento exponencial.',
        actionText: language === 'en' ? 'Calculate 5-Year Plan' : 'Calcular Plano de 5 Anos',
        action: () => navigate('/dashboard'),
        color: 'secondary',
        priority: 3
      });
    }

    // 4. Brazilian Market Opportunity
    const brazilBanks = allBanks.filter(b => b.country === 'Brazil');
    if (brazilBanks.length > 0) {
      const avgBrazilRate = brazilBanks.reduce((sum, bank) => {
        const rates = bank.investment_types.map(t => t.annual_rate);
        return sum + (rates.reduce((a, b) => a + b, 0) / rates.length);
      }, 0) / brazilBanks.length;

      recs.push({
        id: 'brazil-opportunity',
        icon: <Sparkles className="w-6 h-6" />,
        title: language === 'en' ? 'Brazilian Market Opportunity' : 'Oportunidade no Mercado Brasileiro',
        description: language === 'en'
          ? `Brazilian banks average ${avgBrazilRate.toFixed(1)}% returns. Higher rates available with Nubank, XP, and BTG Pactual.`
          : `Bancos brasileiros oferecem média de ${avgBrazilRate.toFixed(1)}% de retorno. Taxas maiores disponíveis com Nubank, XP e BTG Pactual.`,
        actionText: language === 'en' ? 'Explore Options' : 'Explorar Opções',
        action: () => navigate('/dashboard'),
        color: 'primary',
        priority: 4
      });
    }

    // 5. Start Small Recommendation
    const lowMinInvestment = topBanks.filter(b => b.minInvestment <= 100).slice(0, 3);
    if (lowMinInvestment.length > 0) {
      recs.push({
        id: 'start-small',
        icon: <CheckCircle className="w-6 h-6" />,
        title: language === 'en' ? 'Start with Small Investments' : 'Comece com Pequenos Investimentos',
        description: language === 'en'
          ? `${lowMinInvestment.map(b => b.bank).join(', ')} allow investments starting from $${Math.min(...lowMinInvestment.map(b => b.minInvestment))}.`
          : `${lowMinInvestment.map(b => b.bank).join(', ')} permitem investimentos a partir de $${Math.min(...lowMinInvestment.map(b => b.minInvestment))}.`,
        actionText: language === 'en' ? 'Get Started' : 'Começar',
        action: () => navigate('/dashboard'),
        color: 'accent',
        priority: 5
      });
    }

    setRecommendations(recs.sort((a, b) => a.priority - b.priority));
  };

  const getColorClasses = (color) => {
    switch(color) {
      case 'primary':
        return 'border-primary/30 bg-primary/5';
      case 'accent':
        return 'border-accent/30 bg-accent/5';
      default:
        return 'border-secondary/30 bg-secondary/5';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">
          {language === 'en' ? 'Loading...' : 'Carregando...'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-8">
            <h1 className="text-4xl font-heading font-bold mb-2 flex items-center gap-3">
              <Sparkles className="w-10 h-10 text-primary" />
              {language === 'en' ? 'AI-Powered Recommendations' : 'Recomendações Inteligentes'}
            </h1>
            <p className="text-muted-foreground text-lg">
              {language === 'en'
                ? 'Personalized investment suggestions based on current market data and your profile'
                : 'Sugestões personalizadas de investimento baseadas em dados de mercado e seu perfil'}
            </p>
          </div>

          {/* Welcome Section */}
          <Card className="p-6 mb-8 border-2 border-primary/20">
            <h2 className="text-xl font-heading font-semibold mb-2">
              {language === 'en' ? `Welcome, ${user?.name || 'Investor'}!` : `Bem-vindo, ${user?.name || 'Investidor'}!`}
            </h2>
            <p className="text-muted-foreground">
              {language === 'en'
                ? 'Based on analysis of 15 banks across USD, EUR, and BRL markets, here are your top opportunities:'
                : 'Com base na análise de 15 bancos nos mercados USD, EUR e BRL, aqui estão suas principais oportunidades:'}
            </p>
          </Card>

          {/* Recommendations Grid */}
          <div className="space-y-6">
            {recommendations.map((rec, index) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`p-6 border-2 ${getColorClasses(rec.color)} hover:shadow-lg transition-all duration-300`}
                  data-testid={`recommendation-${rec.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-3 rounded-xl bg-${rec.color}/10 text-${rec.color}`}>
                          {rec.icon}
                        </div>
                        <h3 className="text-2xl font-heading font-bold">
                          {rec.title}
                        </h3>
                      </div>
                      <p className="text-muted-foreground text-lg mb-4">
                        {rec.description}
                      </p>
                      <Button
                        onClick={rec.action}
                        className="btn-primary gap-2"
                        data-testid={`rec-action-${rec.id}`}
                      >
                        {rec.actionText}
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="text-4xl font-bold text-primary/20">
                      #{index + 1}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* CTA Section */}
          <Card className="p-8 mt-8 text-center bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/30">
            <h2 className="text-2xl font-heading font-bold mb-4">
              {language === 'en' ? 'Ready to Start Investing?' : 'Pronto para Começar a Investir?'}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              {language === 'en'
                ? 'Use our investment calculator to see exactly how your money can grow with any of these recommendations.'
                : 'Use nossa calculadora de investimentos para ver exatamente como seu dinheiro pode crescer com qualquer uma dessas recomendações.'}
            </p>
            <Button
              onClick={() => navigate('/dashboard')}
              className="btn-primary text-lg px-8 py-6"
              data-testid="go-to-calculator-btn"
            >
              {language === 'en' ? 'Open Calculator' : 'Abrir Calculadora'}
            </Button>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Recommendations;
