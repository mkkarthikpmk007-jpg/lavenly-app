"use client";
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Wallet, Plus, ArrowDownRight, ArrowUpRight, X, Search, CreditCard, Trash2, Lock, Eye, EyeOff } from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { supabase } from '@/lib/supabase';

export default function Home() {
  // --- States ---
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [selectedAccount, setSelectedAccount] = useState('Union Bank');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  
  // Security States
  const [isLocked, setIsLocked] = useState(true);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const MASTER_PIN = "1234"; // Mapla, unga PIN-ah inga maathikkonga!

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: accData } = await supabase.from('accounts').select('*').order('id');
    if (accData) {
      const coloredAccounts = accData.map(acc => {
        if (acc.name === 'SBI Savings') return { ...acc, color: 'bg-[#90EE90]' };
        if (acc.name === 'Union Bank') return { ...acc, color: 'bg-[#C4A484]' };
        if (acc.name === 'HDFC Bank') return { ...acc, color: 'bg-[#FFCC80]' };
        if (acc.name === 'Canara Bank') return { ...acc, color: 'bg-[#FF8A80]' };
        return { ...acc, color: 'bg-gray-200' };
      });
      setAccounts(coloredAccounts);
    }
    const { data: transData } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
    if (transData) setTransactions(transData);
  };

  // --- Sum-up Report Calculations ---
  const currentMonthExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const currentMonthIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const totalBalance = accounts.reduce((acc, curr) => acc + (Number(curr.balance) || 0), 0);

  // --- PIN Verification ---
  const handleUnlock = () => {
    if (pin === MASTER_PIN) {
      setIsLocked(false);
      setError('');
    } else {
      setError('Wrong PIN Mapla! ❌');
      setPin('');
    }
  };

  const handleSave = async () => {
    if (!name || !amount) return;
    const numAmount = parseFloat(amount);
    try {
      const { data: newTrans, error: transErr } = await supabase
        .from('transactions')
        .insert([{ name, amount: numAmount, type, account: selectedAccount }])
        .select();

      if (transErr) throw transErr;

      const currentAccount = accounts.find(a => a.name === selectedAccount);
      const newBalance = type === 'income' 
        ? Number(currentAccount.balance) + numAmount 
        : Number(currentAccount.balance) - numAmount;

      await supabase.from('accounts').update({ balance: newBalance }).eq('name', selectedAccount);

      setTransactions([newTrans[0], ...transactions]);
      setAccounts(accounts.map(a => a.name === selectedAccount ? { ...a, balance: newBalance } : a));
      setIsModalOpen(false);
      setName(''); setAmount('');
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleDelete = async (id: number, tName: string, tAmount: number, tType: string, tAccount: string) => {
    if (!confirm(`Delete "${tName}"?`)) return;
    try {
      await supabase.from('transactions').delete().eq('id', id);
      const currentAccount = accounts.find(a => a.name === tAccount);
      const newBalance = tType === 'income' 
        ? Number(currentAccount.balance) - tAmount 
        : Number(currentAccount.balance) + tAmount;
      await supabase.from('accounts').update({ balance: newBalance }).eq('name', tAccount);
      setTransactions(transactions.filter(t => t.id !== id));
      setAccounts(accounts.map(a => a.name === tAccount ? { ...a, balance: newBalance } : a));
    } catch (err: any) { alert(err.message); }
  };

  // --- Security Screen ---
  if (isLocked) {
    return (
      <div className="h-screen bg-[#7C3AED] flex items-center justify-center font-sans">
        <div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-sm text-center">
          <div className="w-20 h-20 bg-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-[#7C3AED]">
            <Lock size={40} />
          </div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">Lavenly Secure</h2>
          <p className="text-gray-400 text-sm mb-8 font-medium">Enter PIN to access your accounts</p>
          <input 
            type="password" 
            maxLength={4} 
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="****"
            className="w-full text-center text-4xl tracking-[20px] font-black p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-purple-200 outline-none mb-4"
          />
          {error && <p className="text-red-500 font-bold mb-4 text-sm animate-bounce">{error}</p>}
          <button 
            onClick={handleUnlock}
            className="w-full bg-[#7C3AED] text-white p-5 rounded-2xl font-black shadow-xl active:scale-95 transition-all"
          >
            Unlock Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="flex h-screen bg-[#F8F9FD] p-4 gap-4 font-sans overflow-hidden text-gray-800">
      {/* Sidebar */}
      <aside className="w-72 bg-white rounded-[32px] p-6 flex flex-col shadow-sm border border-gray-100 shrink-0">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 bg-[#7C3AED] rounded-xl flex items-center justify-center text-white font-bold text-xl">L</div>
          <h1 className="text-2xl font-black tracking-tight italic">Lavenly</h1>
        </div>
        <div className="flex flex-col gap-3 mb-8 overflow-y-auto pr-1">
          {accounts.map(acc => (
            <div key={acc.id} className={`${acc.color} p-5 rounded-[24px] text-gray-800 shadow-sm border border-black/5`}>
              <p className="text-[10px] font-black opacity-40 uppercase mb-1">{acc.name}</p>
              <p className="text-xl font-black">₹ {Number(acc.balance)?.toLocaleString()}</p>
            </div>
          ))}
        </div>
        <button onClick={() => setIsLocked(true)} className="mt-auto flex items-center gap-3 p-4 text-gray-400 hover:text-red-500 font-bold transition-all underline underline-offset-4 decoration-2">
          <Lock size={18}/> Lock App
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2">
        <header className="flex justify-between items-center bg-white p-6 rounded-[32px] shadow-sm shrink-0 border border-gray-100">
          <div><h2 className="text-2xl font-black italic">Manager Mode</h2><p className="text-gray-400 text-xs font-bold">LAVENLY SECURE V2.0</p></div>
          <button onClick={() => setIsModalOpen(true)} className="bg-[#7C3AED] text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-black shadow-lg hover:scale-105 transition-all"><Plus size={20}/> NEW RECORD</button>
        </header>

        {/* --- Sum-up Report Cards --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
          <div className="bg-white p-6 rounded-[32px] border-2 border-purple-50 flex flex-col justify-center">
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Net Worth</p>
            <h3 className="text-3xl font-black text-[#7C3AED]">₹{totalBalance.toLocaleString()}</h3>
          </div>
          <div className="bg-green-50 p-6 rounded-[32px] border-2 border-green-100 flex flex-col justify-center">
            <p className="text-green-600 text-[10px] font-black uppercase tracking-widest mb-1">Monthly Income</p>
            <h3 className="text-3xl font-black text-green-700">₹{currentMonthIncome.toLocaleString()}</h3>
          </div>
          <div className="bg-red-50 p-6 rounded-[32px] border-2 border-red-100 flex flex-col justify-center">
            <p className="text-red-600 text-[10px] font-black uppercase tracking-widest mb-1">Monthly Expense</p>
            <h3 className="text-3xl font-black text-red-700">₹{currentMonthExpenses.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] shadow-sm flex-1 border border-gray-100 mb-2 overflow-y-auto">
          <div className="flex justify-between items-center mb-6 px-2">
            <h3 className="font-black text-lg uppercase tracking-tighter">Recent Logs</h3>
            <div className="relative">
              <input type="text" placeholder="Search..." className="bg-gray-50 p-2 pl-8 rounded-xl outline-none text-sm border focus:border-purple-200" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <Search className="absolute left-2 top-2.5 text-gray-400" size={16}/>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {transactions.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase())).map((t) => (
              <div key={t.id} className="group flex justify-between items-center p-5 bg-gray-50/50 rounded-2xl hover:bg-white hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {t.type === 'income' ? <ArrowUpRight size={20}/> : <ArrowDownRight size={20}/>}
                  </div>
                  <div><p className="font-black text-gray-800">{t.name}</p><p className="text-[10px] font-bold text-gray-400 uppercase">{t.account}</p></div>
                </div>
                <div className="flex items-center gap-6">
                  <p className={`font-black text-lg ${t.type === 'income' ? 'text-green-600' : 'text-gray-800'}`}>{t.type === 'income' ? '+' : '-'} ₹{Number(t.amount)?.toLocaleString()}</p>
                  <button onClick={() => handleDelete(t.id, t.name, t.amount, t.type, t.account)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all"><Trash2 size={18}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Record Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md p-8 rounded-[40px] shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-gray-400"><X size={24}/></button>
            <h3 className="text-2xl font-black mb-6 tracking-tight">Record Entry</h3>
            <div className="flex flex-col gap-5">
              <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl">
                <button onClick={() => setType('expense')} className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${type === 'expense' ? 'bg-white shadow-sm text-red-500' : 'text-gray-500'}`}>EXPENSE</button>
                <button onClick={() => setType('income')} className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${type === 'income' ? 'bg-white shadow-sm text-green-500' : 'text-gray-500'}`}>INCOME</button>
              </div>
              <select className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-black text-sm border-2 border-transparent focus:border-purple-100" value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)}>
                {accounts.map(acc => <option key={acc.id} value={acc.name}>{acc.name}</option>)}
              </select>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Description" className="w-full p-5 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-purple-100 font-bold" />
              <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="Amount (₹)" className="w-full p-5 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-purple-100 font-bold" />
              <button onClick={handleSave} className="bg-[#7C3AED] text-white p-5 rounded-2xl font-black shadow-xl active:scale-95 transition-all">CONFIRM LOG</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}