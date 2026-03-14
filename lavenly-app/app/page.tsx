"use client";
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Wallet, Plus, ArrowDownRight, X, Search, CreditCard } from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('Union Bank');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);

  // Load Data
  useEffect(() => {
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
    fetchData();
  }, []);

  const totalBalance = accounts.reduce((acc, curr) => acc + (Number(curr.balance) || 0), 0);

  // Save Transaction
  const handleSave = async () => {
    if (!name || !amount) return;
    const numAmount = parseFloat(amount);
    try {
      const { data: newTrans, error: transErr } = await supabase
        .from('transactions')
        .insert([{ name, amount: numAmount, type: 'expense', account: selectedAccount }])
        .select();

      if (transErr) throw transErr;

      const currentAccount = accounts.find(a => a.name === selectedAccount);
      const newBalance = Number(currentAccount.balance) - numAmount;

      await supabase.from('accounts').update({ balance: newBalance }).eq('name', selectedAccount);

      setTransactions([newTrans[0], ...transactions]);
      setAccounts(accounts.map(a => a.name === selectedAccount ? { ...a, balance: newBalance } : a));
      setIsModalOpen(false);
      setName('');
      setAmount('');
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  return (
    <main className="flex h-screen bg-[#F8F9FD] p-4 gap-4 font-sans overflow-hidden text-gray-800">
      <aside className="w-72 bg-white rounded-[32px] p-6 flex flex-col shadow-sm border border-gray-100 shrink-0">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 bg-[#7C3AED] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">L</div>
          <h1 className="text-2xl font-extrabold tracking-tight">Lavenly</h1>
        </div>
        <p className="text-gray-400 text-[10px] font-black uppercase mb-4 px-2 tracking-widest">Live Accounts</p>
        <div className="flex flex-col gap-3 mb-8 overflow-y-auto pr-1">
          {accounts.map(acc => (
            <div key={acc.id} className={`${acc.color} p-5 rounded-[24px] text-gray-800 shadow-sm border border-black/5 hover:scale-[1.02] transition-all cursor-pointer`}>
              <div className="flex justify-between items-start mb-3"><CreditCard size={16} className="opacity-60"/><span className="text-[9px] font-black opacity-40 uppercase tracking-tighter">Debit</span></div>
              <p className="text-[11px] font-bold opacity-70 uppercase tracking-tight">{acc.name}</p>
              <p className="text-xl font-black mt-1">₹ {Number(acc.balance)?.toLocaleString()}</p>
            </div>
          ))}
        </div>
        <nav className="mt-auto">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#7C3AED] text-white shadow-lg font-bold"><LayoutDashboard size={20}/> Dashboard</div>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2">
        <header className="flex justify-between items-center bg-white p-6 rounded-[32px] shadow-sm shrink-0 border border-gray-100">
          <div><h2 className="text-2xl font-bold text-gray-800 tracking-tight">Manager Mode</h2><p className="text-gray-400 text-xs tracking-wide">Permanent Sync Active</p></div>
          <button onClick={() => setIsModalOpen(true)} className="bg-[#7C3AED] text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold shadow-lg hover:scale-105 transition-all"><Plus size={20}/> Add Expense</button>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 shrink-0">
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 relative overflow-hidden flex flex-col justify-center min-h-[180px]">
             <div className="absolute top-0 right-0 p-10 opacity-5 text-purple-600"><Wallet size={120}/></div>
             <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Total Net Worth</p>
             <h3 className="text-5xl font-black mt-2 text-[#7C3AED]">₹ {totalBalance.toLocaleString()}</h3>
          </div>
          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 min-h-[180px] flex items-center justify-center italic text-gray-300">Activity Chart Ready</div>
        </div>

        <div className="bg-white p-8 rounded-[32px] shadow-sm flex-1 border border-gray-100 mb-2 overflow-y-auto">
          <h3 className="font-bold text-xl text-gray-800 tracking-tight mb-6 px-2 uppercase tracking-widest text-[12px]">Recent Transactions</h3>
          <div className="flex flex-col gap-4">
            {transactions.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase())).map((t) => (
              <div key={t.id} className="flex justify-between items-center p-5 bg-gray-50/50 rounded-2xl border border-transparent hover:border-gray-200 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-red-100 text-red-500"><ArrowDownRight size={20}/></div>
                  <div><p className="font-bold text-gray-800">{t.name}</p><span className="text-[10px] font-black text-purple-500 uppercase tracking-widest">{t.account}</span></div>
                </div>
                <p className="font-black text-lg text-gray-900">-₹{Number(t.amount)?.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md p-8 rounded-[40px] shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-gray-400"><X size={24}/></button>
            <h3 className="text-2xl font-bold mb-6 tracking-tight">Deduct Expense</h3>
            <div className="flex flex-col gap-5">
              <select className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-bold text-gray-700" value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)}>
                {accounts.map(acc => <option key={acc.id} value={acc.name}>{acc.name}</option>)}
              </select>
              <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="Expense Name" className="w-full p-5 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-purple-100 transition-all" />
              <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="Amount (₹)" className="w-full p-5 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-purple-100 transition-all" />
              <button onClick={handleSave} className="bg-[#7C3AED] text-white p-5 rounded-2xl font-bold mt-4 shadow-xl active:scale-95 transition-all tracking-wide">Confirm Payment</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}