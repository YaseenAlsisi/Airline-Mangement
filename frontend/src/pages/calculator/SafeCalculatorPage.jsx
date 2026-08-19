import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CurrencyDollarIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon, 
  PlusIcon,
  BanknotesIcon,
  UserCircleIcon,
  TrashIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import clsx from 'clsx';

export const SafeCalculatorPage = () => {
  const { t } = useTranslation();
  const [initialCapital, setInitialCapital] = useState(() => {
    const saved = localStorage.getItem('safe_initialCapital');
    return saved !== null ? parseFloat(saved) : 100000;
  });
  const [isEditingCapital, setIsEditingCapital] = useState(false);
  const [capitalInput, setCapitalInput] = useState(initialCapital.toString());

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('safe_transactions');
    return saved !== null ? JSON.parse(saved) : [];
  });
  
  useEffect(() => {
    localStorage.setItem('safe_initialCapital', initialCapital.toString());
  }, [initialCapital]);

  useEffect(() => {
    localStorage.setItem('safe_transactions', JSON.stringify(transactions));
  }, [transactions]);
  
  // Form state
  const [clientName, setClientName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('received'); // 'paid' or 'received'
  
  const today = new Date().toISOString().split('T')[0];
  const [txDate, setTxDate] = useState(today);

  const [selectedClient, setSelectedClient] = useState('');

  const uniqueClients = useMemo(() => {
    return Array.from(new Set(transactions.map(t => t.clientName)));
  }, [transactions]);

  const displayTransactions = useMemo(() => {
    if (!selectedClient) return transactions;
    return transactions.filter(t => t.clientName === selectedClient);
  }, [transactions, selectedClient]);

  // Calculations
  const { currentBalance, totalPaid, totalReceived, chartData } = useMemo(() => {
    let balance = initialCapital;
    let paid = 0;
    let received = 0;
    
    // Initial data point for chart
    const data = [{
      name: 'Start',
      balance: initialCapital
    }];

    displayTransactions.forEach((t, index) => {
      if (t.type === 'paid') {
        balance -= t.amount;
        paid += t.amount;
      } else {
        balance += t.amount;
        received += t.amount;
      }
      
      data.push({
        name: `Tx ${index + 1}`,
        balance: balance
      });
    });

    return { currentBalance: balance, totalPaid: paid, totalReceived: received, chartData: data };
  }, [initialCapital, displayTransactions]);

  const profitAmount = currentBalance - initialCapital;
  const profitPercentage = initialCapital > 0 ? (profitAmount / initialCapital) * 100 : 0;
  
  const isProfit = profitAmount >= 0;

  const handleSetCapital = (e) => {
    e.preventDefault();
    const val = parseFloat(capitalInput);
    if (!isNaN(val) && val >= 0) {
      setInitialCapital(val);
      setIsEditingCapital(false);
    }
  };

  const handleAddTransaction = (e) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!clientName.trim() || isNaN(val) || val <= 0) return;

    const dateObj = new Date(txDate);
    const formattedDate = dateObj.toLocaleDateString('en-GB');

    const newTx = {
      id: Date.now().toString(),
      clientName: clientName.trim(),
      amount: val,
      type,
      date: formattedDate
    };

    setTransactions([...transactions, newTx]);
    setClientName('');
    setAmount('');
  };

  const handleDeleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('safeCalculator.title')}</h1>
          <p className="text-sm text-slate-500 mt-1">{t('safeCalculator.subtitle')}</p>
        </div>
        {uniqueClients.length > 0 && (
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
            <FunnelIcon className="w-5 h-5 text-slate-400" />
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="border-0 bg-transparent text-sm font-medium text-slate-700 focus:ring-0 p-0 cursor-pointer"
            >
              <option value="">{t('safeCalculator.allClients')}</option>
              {uniqueClients.map(client => (
                <option key={client} value={client}>{client}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Balance Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full opacity-50"></div>
          <div>
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <BanknotesIcon className="w-5 h-5" />
              <span className="font-medium">{t('safeCalculator.currentBalance')}</span>
            </div>
            <div className="text-3xl font-bold text-slate-900">
              {currentBalance.toLocaleString()}
            </div>
          </div>
          <div className="mt-4">
            <span className={clsx("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium", isProfit ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
              {isProfit ? <ArrowTrendingUpIcon className="w-3.5 h-3.5" /> : <ArrowTrendingDownIcon className="w-3.5 h-3.5" />}
              {isProfit ? '+' : ''}{profitAmount.toLocaleString()} ({profitPercentage.toFixed(2)}%)
            </span>
            <span className="text-xs text-slate-400 ml-2">{t('safeCalculator.vsInitial')}</span>
          </div>
        </div>

        {/* Initial Capital Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <CurrencyDollarIcon className="w-5 h-5" />
              <span className="font-medium">{t('safeCalculator.initialCapital')}</span>
            </div>
            
            {isEditingCapital ? (
              <form onSubmit={handleSetCapital} className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  value={capitalInput}
                  onChange={(e) => setCapitalInput(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-lg font-bold"
                  autoFocus
                />
                <button type="submit" className="bg-indigo-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-indigo-700">{t('safeCalculator.save')}</button>
              </form>
            ) : (
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-slate-900">
                  {initialCapital.toLocaleString()}
                </div>
                <button 
                  onClick={() => setIsEditingCapital(true)}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium bg-indigo-50 px-3 py-1 rounded-full transition-colors"
                >
                  {t('safeCalculator.edit')}
                </button>
              </div>
            )}
          </div>
          <div className="mt-4 flex items-center gap-4 text-sm">
             <div className="flex flex-col">
                <span className="text-slate-400">{t('safeCalculator.totalReceived')}</span>
                <span className="font-semibold text-green-600">+{totalReceived.toLocaleString()}</span>
             </div>
             <div className="flex flex-col">
                <span className="text-slate-400">{t('safeCalculator.totalPaid')}</span>
                <span className="font-semibold text-red-500">-{totalPaid.toLocaleString()}</span>
             </div>
          </div>
        </div>

        {/* Quick Add Transaction */}
        <div className="bg-slate-900 rounded-2xl p-6 shadow-lg text-white flex flex-col">
           <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <PlusIcon className="w-5 h-5 text-indigo-400" />
              {t('safeCalculator.newTransaction')}
           </h3>
           <form onSubmit={handleAddTransaction} className="space-y-3 flex-1 flex flex-col justify-end">
              <div>
                <input
                  type="text"
                  placeholder={t('safeCalculator.clientNamePlaceholder')}
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-slate-800 border-0 rounded-lg py-2 px-3 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 text-sm"
                  required
                />
              </div>
              <div>
                <input
                  type="date"
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                  className="w-full bg-slate-800 border-0 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-indigo-500 text-sm"
                  required
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder={t('safeCalculator.amountPlaceholder')}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-800 border-0 rounded-lg py-2 px-3 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 text-sm"
                  required
                />
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="bg-slate-800 border-0 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="received">{t('safeCalculator.received')}</option>
                  <option value="paid">{t('safeCalculator.paid')}</option>
                </select>
              </div>
              <button 
                type="submit"
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 rounded-lg transition-colors mt-2 text-sm"
              >
                {t('safeCalculator.addTransaction')}
              </button>
           </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">{t('safeCalculator.balanceOverview')}</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(value) => `${value / 1000}k`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [value.toLocaleString(), 'Balance']}
                />
                <Area type="monotone" dataKey="balance" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[400px]">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">{t('safeCalculator.recentTransactions')}</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {displayTransactions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                <BanknotesIcon className="w-12 h-12 mb-2 opacity-20" />
                <p>{t('safeCalculator.noTransactions')}</p>
                <p className="text-sm">{t('safeCalculator.addOne')}</p>
              </div>
            ) : (
              <ul className="space-y-1">
                {[...displayTransactions].reverse().map((tx) => (
                  <li key={tx.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className={clsx(
                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                        tx.type === 'received' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"
                      )}>
                        {tx.type === 'received' ? <ArrowTrendingUpIcon className="w-5 h-5" /> : <ArrowTrendingDownIcon className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{tx.clientName}</p>
                        <p className="text-xs text-slate-400">{tx.date}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <span className={clsx(
                        "font-bold text-sm",
                        tx.type === 'received' ? "text-green-600" : "text-red-500"
                      )}>
                        {tx.type === 'received' ? '+' : '-'}{tx.amount.toLocaleString()}
                      </span>
                      <button 
                        onClick={() => handleDeleteTransaction(tx.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50"
                        title="Delete transaction"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
