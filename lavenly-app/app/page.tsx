"use client";
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Wallet, Plus, ArrowDownRight, ArrowUpRight, X, Search, CreditCard, Trash2, Lock, Moon, Sun } from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(true); // Toggle state
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [selectedAccount, setSelectedAccount] = useState('Union Bank');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  
  const [isLocked, setIsLocked] = useState(true);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const MASTER_PIN = "1234";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: accData } = await supabase.from('accounts').select('*').order('id');
    if (accData) {
      const coloredAccounts = accData.map(acc => {
        if (acc.name === 'SBI Savings') return { ...acc, color: isDarkMode ? 'bg-[#1B4332]' : 'bg-[#90EE90]' };
        if (acc.name === 'Union Bank') return { ...acc, color: isDarkMode ? 'bg-[#3E2723]' : 'bg-[#C4A484]' };
        if (acc.name === 'HDFC Bank') return { ...acc, color: isDarkMode ? 'bg-[#612A05]' : 'bg-[#FFCC80]' };
        if (acc.name === 'Canara Bank') return { ...acc, color: isDarkMode ? 'bg-[#5B0B0B]' : 'bg-[#FF8A80]' };
        return { ...acc, color: 'bg-gray-500' };
      });
      setAccounts(coloredAccounts);
    }
    const { data: transData } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
    if (transData) setTransactions(transData);
  };

  // Re-run color mapping when theme changes
  useEffect(() => {
    fetchData();
  }, [isDarkMode]);

  const currentMonthExpenses = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const currentMonthIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const totalBalance = accounts.reduce((acc, curr) => acc + (Number(curr.balance) || 0), 0);

  const handleUnlock = () => {
    if (pin === MASTER_PIN) { setIsLocked(false); setError(''); }
    else { setError('Wrong PIN Mapla! ❌'); setPin(''); }
  };

  const handleSave = async () => {
    if (!name || !amount) return;
    const numAmount = parseFloat(amount);
    try {
      const { data: newTrans, error: transErr } = await supabase.from('transactions').insert([{ name, amount: numAmount, type, account: selectedAccount }]).select();
      if (transErr) throw transErr;
      const currentAccount = accounts.find(a => a.name === selectedAccount);
      const newBalance = type === 'income' ? Number(currentAccount.balance) + numAmount : Number(currentAccount.balance) - numAmount;
      await supabase.from('accounts').update({ balance: newBalance }).eq('name', selectedAccount);
      setTransactions([newTrans[0], ...transactions]);
      setAccounts(accounts.map(a => a.name === selectedAccount ? { ...a, balance: newBalance } : a));
      setIsModalOpen(false); setName(''); setAmount('');
    } catch (err: any) { alert(err.message); }
  };

  const handleDelete = async (id: number, tName: string, tAmount: number, tType: string, tAccount: string) => {
    if (!confirm(`Delete "${tName}"?`)) return;
    try {
      await supabase.from('transactions').delete().eq('id', id);
      const currentAccount = accounts.find(a => a.name === tAccount);
      const newBalance = tType === 'income' ? Number(currentAccount.balance) - tAmount : Number(currentAccount.balance) + tAmount;
      await supabase.from('accounts').update({ balance: newBalance }).eq('name', tAccount);
      setTransactions(transactions.filter(t => t.id !== id));
      setAccounts(accounts.map(a => a.name === tAccount ? { ...a, balance: newBalance } : a));
    } catch (err: any) { alert(err.message); }
  };

  if (isLocked) {
    return (
      <div className={`h-screen flex items-center justify-center font-sans ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F3F0FF]'}`}>
        <div className={`${isDarkMode ? 'bg-[#1E293B] border-gray-700' : 'bg-white border-transparent'} p-10 rounded-[40px] shadow-2xl w-full max-w-sm text-center border`}>
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 ${isDarkMode ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
            <Lock size={40} />
          </div>
          <h2 className={`text-2xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Lavenly Secure</h2>
          <input type="password" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value)} placeholder="****" className={`w-full text-center text-4xl tracking-[20px] font-black p-4 rounded-2xl border-2 outline-none mb-4 ${isDarkMode ? 'bg-[#0F172A] border-gray-700 text-white focus:border-purple-500' : 'bg-gray-50 border-gray-100 text-gray-800 focus:border-purple-300'}`} />
          {error && <p className="text-red-500 font-bold mb-4 text-sm">{error}</p>}
          <button onClick={handleUnlock} className="w-full bg-purple-600 text-white p-5 rounded-2xl font-black shadow-xl active:scale-95 transition-all">Unlock Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <main className={`flex h-screen p-4 gap-4 font-sans overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-[#0F172A] text-gray-100' : 'bg-[#F8F9FD] text-gray-800'}`}>
      {/* Sidebar */}
      <aside className={`w-72 rounded-[32px] p-6 flex flex-col shadow-xl border shrink-0 ${isDarkMode ? 'bg-[#1E293B] border-gray-800' : 'bg-white border-gray-100'}`}>
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">L</div>
            <h1 className={`text-2xl font-black italic ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Lavenly</h1>
          </div>
          {/* Theme Switcher Button */}
          <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-xl transition-all ${isDarkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'}`}>
            {isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}
          </button>
        </div>
        
        <div className="flex flex-col gap-3 mb-8 overflow-y-auto pr-1">
          {accounts.map(acc => (
            <div key={acc.id} className={`${acc.color} p-5 rounded-[24px] text-white shadow-lg border border-white/5`}>
              <p className="text-[10px] font-black opacity-60 uppercase mb-1">{acc.name}</p>
              <p className="text-xl font-black">₹ {Number(acc.balance)?.toLocaleString()}</p>
            </div>
          ))}
        </div>
        <button onClick={() => setIsLocked(true)} className={`mt-auto flex items-center gap-3 p-4 font-bold transition-all ${isDarkMode ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'}`}>
          <Lock size={18}/> Lock App
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2">
        <header className={`flex justify-between items-center p-6 rounded-[32px] shadow-sm shrink-0 border ${isDarkMode ? 'bg-[#1E293B] border-gray-800' : 'bg-white border-gray-100'}`}>
          <div>
            <h2 className="text-2xl font-black italic">Manager Mode</h2>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{isDarkMode ? 'Dark Mode' : 'Light Mode'} Active</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-purple-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-black shadow-lg hover:scale-105 transition-all"><Plus size={20}/> NEW LOG</button>
        </header>

        {/* Report Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
          <div className={`p-6 rounded-[32px] border ${isDarkMode ? 'bg-[#1E293B] border-gray-800' : 'bg-white border-purple-50'}`}>
            <p className="text-gray-500 text-[10px] font-black uppercase mb-1">Total Net Worth</p>
            <h3 className="text-3xl font-black text-purple-400">₹{totalBalance.toLocaleString()}</h3>
          </div>
          <div className={`p-6 rounded-[32px] border ${isDarkMode ? 'bg-[#1E293B] border-green-900/30' : 'bg-green-50 border-green-100'}`}>
            <p className="text-green-600 text-[10px] font-black uppercase mb-1">Monthly Income</p>
            <h3 className="text-3xl font-black text-green-600">₹{currentMonthIncome.toLocaleString()}</h3>
          </div>
          <div className={`p-6 rounded-[32px] border ${isDarkMode ? 'bg-[#1E293B] border-red-900/30' : 'bg-red-50 border-red-100'}`}>
            <p className="text-red-600 text-[10px] font-black uppercase mb-1">Monthly Expense</p>
            <h3 className="text-3xl font-black text-red-600">₹{currentMonthExpenses.toLocaleString()}</h3>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className={`p-8 rounded-[32px] shadow-sm flex-1 border mb-2 overflow-y-auto ${isDarkMode ? 'bg-[#1E293B] border-gray-800' : 'bg-white border-gray-100'}`}>
          <h3 className="font-black text-[10px] uppercase tracking-widest text-gray-500 mb-6 px-2">Recent Records</h3>
          <div className="flex flex-col gap-4">
            {transactions.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase())).map((t) => (
              <div key={t.id} className={`group flex justify-between items-center p-5 rounded-2xl transition-all border ${isDarkMode ? 'bg-[#0F172A]/50 hover:bg-[#0F172A] border-transparent hover:border-gray-700' : 'bg-gray-50/50 hover:bg-white hover:shadow-md border-transparent hover:border-gray-100'}`}>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${t.type === 'income' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {t.type === 'income' ? <ArrowUpRight size={20}/> : <ArrowDownRight size={20}/>}
                  </div>
                  <div>
                    <p className={`font-black ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{t.name}</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase">{t.account}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <p className={`font-black text-lg ${t.type === 'income' ? 'text-green-500' : (isDarkMode ? 'text-gray-200' : 'text-gray-800')}`}>
                    {t.type === 'income' ? '+' : '-'} ₹{Number(t.amount)?.toLocaleString()}
                  </p>
                  <button onClick={() => handleDelete(t.id, t.name, t.amount, t.type, t.account)} className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-500 transition-all"><Trash2 size={18}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Record Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md p-8 rounded-[40px] shadow-2xl relative border ${isDarkMode ? 'bg-[#1E293B] border-gray-700' : 'bg-white border-transparent'}`}>
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-gray-500 hover:text-red-500"><X size={24}/></button>
            <h3 className={`text-2xl font-black mb-6 italic text-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Record Entry</h3>
            <div className="flex flex-col gap-5">
              <div className={`flex gap-2 p-1.5 rounded-2xl ${isDarkMode ? 'bg-[#0F172A]' : 'bg-gray-100'}`}>
                <button onClick={() => setType('expense')} className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${type === 'expense' ? 'bg-purple-600 text-white' : 'text-gray-500'}`}>EXPENSE</button>
                <button onClick={() => setType('income')} className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${type === 'income' ? 'bg-purple-600 text-white' : 'text-gray-500'}`}>INCOME</button>
              </div>
              <select className={`w-full p-5 rounded-2xl outline-none font-black text-sm border-2 ${isDarkMode ? 'bg-[#0F172A] border-gray-700 text-white' : 'bg-gray-50 border-transparent text-gray-700'}`} value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)}>
                {accounts.map(acc => <option key={acc.id} value={acc.name}>{acc.name}</option>)}
              </select>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Description" className={`w-full p-5 rounded-2xl outline-none border-2 font-bold ${isDarkMode ? 'bg-[#0F172A] border-gray-700 text-white' : 'bg-gray-50 border-transparent text-gray-800'}`} />
              <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="Amount (₹)" className={`w-full p-5 rounded-2xl outline-none border-2 font-bold ${isDarkMode ? 'bg-[#0F172A] border-gray-700 text-white' : 'bg-gray-50 border-transparent text-gray-800'}`} />
              <button onClick={handleSave} className="bg-purple-600 text-white p-5 rounded-2xl font-black shadow-xl active:scale-95 transition-all">CONFIRM LOG</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}