import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, RefreshCw, Building2, Bitcoin } from 'lucide-react';
import axios from 'axios';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const LiveTracker = () => {
  const { t, language } = useLanguage();
  const [banks, setBanks] = useState([]);
  const [cryptos, setCryptos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isLive, setIsLive] = useState(true);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 10 seconds for continuous updates
    const interval = setInterval(() => {
      if (isLive) {
        fetchData(true);
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [isLive]);

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) return 10;
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    setRefreshing(true);

    try {
      const [banksRes, cryptoRes] = await Promise.all([
        axios.get(`${API}/banks`),
        axios.get(`${API}/crypto/live`)
      ]);

      setBanks(banksRes.data);
      setCryptos(cryptoRes.data);
      setLastUpdate(new Date());
      setCountdown(10); // Reset countdown

      if (!silent) {
        toast.success(language === 'en' ? 'Data updated!' : 'Dados atualizados!');
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
      if (!silent) {
        toast.error(language === 'en' ? 'Failed to fetch data' : 'Falha ao buscar dados');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const currencySymbols = { USD: '$', EUR: '€', BRL: 'R$' };

  const formatNumber = (num) => {
    if (num >= 1000000000) return `$${(num / 1000000000).toFixed(2)}B`;
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  if (loading && banks.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-heading font-bold mb-2 flex items-center gap-3">
              {language === 'en' ? 'Live Investment Tracker' : 'Rastreador de Investimentos ao Vivo'}
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            </h1>
            <p className="text-muted-foreground">
              {language === 'en' 
                ? `Last updated: ${lastUpdate.toLocaleTimeString()} • Next update in ${countdown}s`
                : `Última atualização: ${lastUpdate.toLocaleTimeString()} • Próxima atualização em ${countdown}s`}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setIsLive(!isLive)}
              variant={isLive ? "default" : "outline"}
              className="gap-2"
              data-testid="toggle-live-btn"
            >
              {isLive ? '⏸' : '▶'} {language === 'en' ? (isLive ? 'Pause' : 'Resume') : (isLive ? 'Pausar' : 'Retomar')}
            </Button>
            <Button
              onClick={() => fetchData()}
              disabled={refreshing}
              className="btn-primary gap-2"
              data-testid="refresh-data-btn"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {language === 'en' ? 'Refresh' : 'Atualizar'}
            </Button>
          </div>
        </div>

        {/* Cryptocurrency Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-heading font-bold mb-6 flex items-center gap-2">
            <Bitcoin className="w-6 h-6 text-primary" />
            {language === 'en' ? 'Cryptocurrencies' : 'Criptomoedas'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {cryptos.map((crypto, index) => (
              <motion.div
                key={crypto.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-4 hover:border-primary/50 transition-all" data-testid={`crypto-card-${crypto.symbol}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-bold text-lg">{crypto.symbol}</div>
                      <div className="text-xs text-muted-foreground">{crypto.name}</div>
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-semibold ${
                      crypto.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {crypto.price_change_percentage_24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
                    </div>
                  </div>
                  
                  <div className="text-2xl font-mono font-bold mb-2">
                    ${crypto.current_price.toLocaleString()}
                  </div>
                  
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>{language === 'en' ? 'Market Cap' : 'Cap. Mercado'}:</span>
                      <span className="font-mono">{formatNumber(crypto.market_cap)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{language === 'en' ? 'Volume 24h' : 'Volume 24h'}:</span>
                      <span className="font-mono">{formatNumber(crypto.volume_24h)}</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Banks Section */}
        <div>
          <h2 className="text-2xl font-heading font-bold mb-6 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" />
            {language === 'en' ? 'Bank Investment Rates' : 'Taxas de Investimento Bancário'}
          </h2>

          <div className="space-y-4">
            {banks.map((bank, index) => (
              <motion.div
                key={bank.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-6" data-testid={`bank-card-${bank.id}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-heading font-bold">{bank.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {bank.country} • {bank.currency}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bank.investment_types.map((type) => (
                      <div
                        key={type.id}
                        className="p-4 bg-muted/30 rounded-lg border border-border"
                      >
                        <div className="font-semibold mb-1">
                          {language === 'en' ? type.name : type.name_pt}
                        </div>
                        <div className="text-2xl font-mono font-bold text-primary mb-2">
                          {type.annual_rate}%
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>{language === 'en' ? 'Monthly' : 'Mensal'}: {type.monthly_rate}%</div>
                          <div>{language === 'en' ? 'Min. Investment' : 'Investimento Mín.'}: {currencySymbols[bank.currency]}{type.min_investment.toLocaleString()}</div>
                          <div className="capitalize">
                            {language === 'en' ? 'Risk' : 'Risco'}: {type.risk_level}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTracker;
