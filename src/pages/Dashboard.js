import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calculator as CalcIcon, BarChart3, PieChart, Save, Sparkles, LogOut, Moon, Sun, Languages, Menu } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CHART_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6'];

const currencySymbols = {
  USD: '$',
  EUR: '€',
  BRL: 'R$'
};

export const Dashboard = () => {
  const { user, logout, getAuthHeaders } = useAuth();
  const { t, toggleLanguage, language } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Data states
  const [banks, setBanks] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  
  // Calculator states
  const [currency, setCurrency] = useState('USD');
  const [initialAmount, setInitialAmount] = useState(10000);
  const [monthlySalary, setMonthlySalary] = useState(5000);
  const [salaryInvestmentType, setSalaryInvestmentType] = useState('percentage');
  const [salaryInvestmentValue, setSalaryInvestmentValue] = useState(20);
  const [durationMonths, setDurationMonths] = useState(60);
  const [selectedBankId, setSelectedBankId] = useState('');
  const [selectedInvestmentTypeId, setSelectedInvestmentTypeId] = useState('');
  
  // Results
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Save scenario dialog
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [scenarioName, setScenarioName] = useState('');

  useEffect(() => {
    fetchBanks();
    fetchScenarios();
  }, [currency]);

  const fetchBanks = async () => {
    try {
      const response = await axios.get(`${API}/banks?currency=${currency}`);
      setBanks(response.data);
      if (response.data.length > 0 && !selectedBankId) {
        setSelectedBankId(response.data[0].id);
        if (response.data[0].investment_types.length > 0) {
          setSelectedInvestmentTypeId(response.data[0].investment_types[0].id);
        }
      }
    } catch (error) {
      toast.error('Failed to fetch banks');
    }
  };

  const fetchScenarios = async () => {
    try {
      const response = await axios.get(`${API}/scenarios`, {
        headers: getAuthHeaders()
      });
      setScenarios(response.data);
    } catch (error) {
      console.error('Failed to fetch scenarios', error);
    }
  };

  const handleCalculate = async () => {
    if (!selectedBankId || !selectedInvestmentTypeId) {
      toast.error('Please select a bank and investment type');
      return;
    }

    setLoading(true);
    try {
      const inputData = {
        initial_amount: initialAmount,
        monthly_salary: monthlySalary,
        salary_investment_type: salaryInvestmentType,
        salary_investment_value: salaryInvestmentValue,
        duration_months: durationMonths,
        bank_id: selectedBankId,
        investment_type_id: selectedInvestmentTypeId,
        currency: currency
      };

      const response = await axios.post(`${API}/calculate`, inputData);
      setResults(response.data);
      
      // Fetch recommendations
      const recResponse = await axios.post(`${API}/recommendations`, inputData, {
        headers: getAuthHeaders()
      });
      setRecommendations(recResponse.data);
      
      toast.success('Calculation complete!');
    } catch (error) {
      toast.error('Calculation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveScenario = async () => {
    if (!scenarioName || !results) return;

    try {
      const inputData = {
        initial_amount: initialAmount,
        monthly_salary: monthlySalary,
        salary_investment_type: salaryInvestmentType,
        salary_investment_value: salaryInvestmentValue,
        duration_months: durationMonths,
        bank_id: selectedBankId,
        investment_type_id: selectedInvestmentTypeId,
        currency: currency
      };

      await axios.post(`${API}/scenarios`, {
        name: scenarioName,
        input_data: inputData,
        result: results
      }, {
        headers: getAuthHeaders()
      });

      toast.success('Scenario saved!');
      setShowSaveDialog(false);
      setScenarioName('');
      fetchScenarios();
    } catch (error) {
      toast.error('Failed to save scenario');
    }
  };

  const handleDeleteScenario = async (scenarioId) => {
    try {
      await axios.delete(`${API}/scenarios/${scenarioId}`, {
        headers: getAuthHeaders()
      });
      toast.success('Scenario deleted');
      fetchScenarios();
    } catch (error) {
      toast.error('Failed to delete scenario');
    }
  };

  const selectedBank = banks.find(b => b.id === selectedBankId);
  const availableInvestmentTypes = selectedBank?.investment_types || [];

  // Chart data preparation
  const monthlyChartData = results?.monthly_breakdown.map(m => ({
    month: m.month,
    total: m.total,
    returns: m.returns
  })) || [];

  const yearlyChartData = results?.yearly_breakdown.map(y => ({
    year: `Year ${y.year}`,
    invested: y.total_invested,
    returns: y.total_returns,
    balance: y.ending_balance
  })) || [];

  const pieData = results ? [
    { name: 'Principal', value: results.total_invested },
    { name: 'Returns', value: results.total_returns }
  ] : [];

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        <div>
          <h1 className="text-xl md:text-2xl font-heading font-bold">{t('investmentCalculator')}</h1>
        </div>
            {/* Calculator Card */}
            <Card className="p-4 md:p-6" data-testid="calculator-card">
              <h2 className="text-lg md:text-xl font-heading font-semibold mb-4 md:mb-6 flex items-center gap-2">
                <CalcIcon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                {t('investmentCalculator')}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div>
                  <Label htmlFor="currency">{t('currency')}</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger data-testid="currency-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="BRL">BRL (R$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="initial">{t('initialAmount')}</Label>
                  <Input
                    id="initial"
                    type="number"
                    value={initialAmount}
                    onChange={(e) => setInitialAmount(parseFloat(e.target.value))}
                    data-testid="initial-amount-input"
                  />
                </div>

                <div>
                  <Label htmlFor="salary">{t('monthlySalary')}</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={monthlySalary}
                    onChange={(e) => setMonthlySalary(parseFloat(e.target.value))}
                    data-testid="monthly-salary-input"
                  />
                </div>

                <div>
                  <Label>{t('investmentFromSalary')}</Label>
                  <Select value={salaryInvestmentType} onValueChange={setSalaryInvestmentType}>
                    <SelectTrigger data-testid="salary-investment-type-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">{t('percentage')}</SelectItem>
                      <SelectItem value="fixed">{t('fixedAmount')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>
                    {salaryInvestmentType === 'percentage' ? t('percentage') + ' (%)' : t('fixedAmount')}
                  </Label>
                  <Input
                    type="number"
                    value={salaryInvestmentValue}
                    onChange={(e) => setSalaryInvestmentValue(parseFloat(e.target.value))}
                    data-testid="salary-investment-value-input"
                  />
                </div>

                <div>
                  <Label>{t('investmentDuration')} ({t('months')})</Label>
                  <Input
                    type="number"
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(parseInt(e.target.value))}
                    data-testid="duration-input"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.floor(durationMonths / 12)} {t('years')} {durationMonths % 12} {t('months')}
                  </p>
                </div>

                <div>
                  <Label>{t('selectBank')}</Label>
                  <Select value={selectedBankId} onValueChange={(val) => {
                    setSelectedBankId(val);
                    const bank = banks.find(b => b.id === val);
                    if (bank && bank.investment_types.length > 0) {
                      setSelectedInvestmentTypeId(bank.investment_types[0].id);
                    }
                  }}>
                    <SelectTrigger data-testid="bank-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {banks.map(bank => (
                        <SelectItem key={bank.id} value={bank.id}>
                          {bank.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Label>{t('selectInvestmentType')}</Label>
                  <Select value={selectedInvestmentTypeId} onValueChange={setSelectedInvestmentTypeId}>
                    <SelectTrigger data-testid="investment-type-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableInvestmentTypes.map(type => (
                        <SelectItem key={type.id} value={type.id}>
                          {language === 'en' ? type.name : type.name_pt} - {type.annual_rate}% {language === 'en' ? 'annual' : 'anual'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-6 flex gap-4">
                <Button 
                  onClick={handleCalculate} 
                  disabled={loading}
                  className="btn-primary"
                  data-testid="calculate-btn"
                >
                  {loading ? t('loading') : t('calculate')}
                </Button>
                {results && (
                  <Button 
                    onClick={() => setShowSaveDialog(true)}
                    variant="outline"
                    className="gap-2"
                    data-testid="save-scenario-btn"
                  >
                    <Save className="w-4 h-4" />
                    {t('saveScenario')}
                  </Button>
                )}
              </div>
            </Card>

            {/* Results */}
            {results && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-testid="results-summary">
                  <Card className="p-6">
                    <div className="text-sm text-muted-foreground mb-2">{t('totalInvested')}</div>
                    <div className="text-3xl font-mono font-bold text-primary">
                      {currencySymbols[currency]}{results.total_invested.toLocaleString()}
                    </div>
                  </Card>
                  <Card className="p-6">
                    <div className="text-sm text-muted-foreground mb-2">{t('totalReturns')}</div>
                    <div className="text-3xl font-mono font-bold text-accent">
                      {currencySymbols[currency]}{results.total_returns.toLocaleString()}
                    </div>
                  </Card>
                  <Card className="p-6">
                    <div className="text-sm text-muted-foreground mb-2">{t('finalAmount')}</div>
                    <div className="text-3xl font-mono font-bold">
                      {currencySymbols[currency]}{results.final_amount.toLocaleString()}
                    </div>
                  </Card>
                </div>

                {/* Charts */}
                <Card className="p-6">
                  <Tabs defaultValue="line" className="w-full">
                    <TabsList className="mb-4">
                      <TabsTrigger value="line" data-testid="line-chart-tab">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Growth Over Time
                      </TabsTrigger>
                      <TabsTrigger value="yearly" data-testid="yearly-chart-tab">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Yearly Breakdown
                      </TabsTrigger>
                      <TabsTrigger value="pie" data-testid="pie-chart-tab">
                        <PieChart className="w-4 h-4 mr-2" />
                        Distribution
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="line" className="mt-0">
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={monthlyChartData}>
                          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                          <Legend />
                          <Line type="monotone" dataKey="total" stroke="#10B981" strokeWidth={2} name="Total Balance" />
                          <Line type="monotone" dataKey="returns" stroke="#3B82F6" strokeWidth={2} name="Returns" />
                        </LineChart>
                      </ResponsiveContainer>
                    </TabsContent>

                    <TabsContent value="yearly" className="mt-0">
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={yearlyChartData}>
                          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                          <XAxis dataKey="year" />
                          <YAxis />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                          <Legend />
                          <Bar dataKey="invested" fill="#10B981" name="Invested" />
                          <Bar dataKey="returns" fill="#3B82F6" name="Returns" />
                        </BarChart>
                      </ResponsiveContainer>
                    </TabsContent>

                    <TabsContent value="pie" className="mt-0">
                      <ResponsiveContainer width="100%" height={400}>
                        <RePieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({name, value}) => `${name}: ${currencySymbols[currency]}${value.toLocaleString()}`}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                        </RePieChart>
                      </ResponsiveContainer>
                    </TabsContent>
                  </Tabs>
                </Card>

                {/* Tables */}
                <Card className="p-6">
                  <Tabs defaultValue="monthly" className="w-full">
                    <TabsList className="mb-4">
                      <TabsTrigger value="monthly" data-testid="monthly-table-tab">{t('monthlyBreakdown')}</TabsTrigger>
                      <TabsTrigger value="yearly" data-testid="yearly-table-tab">{t('yearlyBreakdown')}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="monthly" className="mt-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm" data-testid="monthly-breakdown-table">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left p-2 font-heading">{t('month')}</th>
                              <th className="text-right p-2 font-heading">{t('investment')}</th>
                              <th className="text-right p-2 font-heading">{t('returns')}</th>
                              <th className="text-right p-2 font-heading">{t('total')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {results.monthly_breakdown.map((m) => (
                              <tr key={m.month} className="border-b border-border/50">
                                <td className="p-2">{m.month}</td>
                                <td className="text-right p-2 font-mono">{currencySymbols[currency]}{m.investment.toLocaleString()}</td>
                                <td className="text-right p-2 font-mono text-accent">{currencySymbols[currency]}{m.returns.toLocaleString()}</td>
                                <td className="text-right p-2 font-mono font-semibold">{currencySymbols[currency]}{m.total.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </TabsContent>

                    <TabsContent value="yearly" className="mt-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm" data-testid="yearly-breakdown-table">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left p-2 font-heading">{t('year')}</th>
                              <th className="text-right p-2 font-heading">{t('totalInvested')}</th>
                              <th className="text-right p-2 font-heading">{t('totalReturns')}</th>
                              <th className="text-right p-2 font-heading">{t('endingBalance')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {results.yearly_breakdown.map((y) => (
                              <tr key={y.year} className="border-b border-border/50">
                                <td className="p-2">{y.year}</td>
                                <td className="text-right p-2 font-mono">{currencySymbols[currency]}{y.total_invested.toLocaleString()}</td>
                                <td className="text-right p-2 font-mono text-accent">{currencySymbols[currency]}{y.total_returns.toLocaleString()}</td>
                                <td className="text-right p-2 font-mono font-semibold">{currencySymbols[currency]}{y.ending_balance.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </TabsContent>
                  </Tabs>
                </Card>

                {/* AI Recommendations */}
                {recommendations.length > 0 && (
                  <Card className="p-6 border-2 border-primary/30" data-testid="ai-recommendations-card">
                    <h3 className="text-xl font-heading font-semibold mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      {t('aiRecommendations')}
                    </h3>
                    <div className="space-y-4">
                      {recommendations.map((rec, index) => (
                        <div key={index} className="p-4 bg-muted/50 rounded-lg" data-testid={`recommendation-${index}`}>
                          <h4 className="font-semibold mb-2">
                            {language === 'en' ? rec.title : rec.title_pt}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {language === 'en' ? rec.description : rec.description_pt}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </>
            )}

            {/* Saved Scenarios */}
            {scenarios.length > 0 && (
              <Card className="p-6" data-testid="saved-scenarios-card">
                <h3 className="text-xl font-heading font-semibold mb-4">{t('myScenarios')}</h3>
                <div className="space-y-3">
                  {scenarios.map((scenario) => (
                    <div key={scenario.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-semibold">{scenario.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {currencySymbols[scenario.input_data.currency]}{scenario.result.final_amount.toLocaleString()} 
                          {' - '}
                          {scenario.result.bank_name}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteScenario(scenario.id)}
                        data-testid={`delete-scenario-${scenario.id}`}
                      >
                        {t('delete')}
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

      {/* Save Scenario Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent data-testid="save-scenario-dialog">
          <DialogHeader>
            <DialogTitle>{t('saveScenario')}</DialogTitle>
            <DialogDescription>
              {language === 'en' ? 'Give this scenario a name to save it' : 'Dê um nome a este cenário para salvá-lo'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="scenario-name">{t('scenarioName')}</Label>
            <Input
              id="scenario-name"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              data-testid="scenario-name-input"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)} data-testid="cancel-save-btn">
              {t('cancel')}
            </Button>
            <Button onClick={handleSaveScenario} className="btn-primary" data-testid="confirm-save-btn">
              {t('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
