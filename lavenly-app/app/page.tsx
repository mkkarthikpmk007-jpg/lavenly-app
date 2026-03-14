"use client";
import React, { useState, useEffect } from 'react';
import { LogOut, Plus, ArrowDownRight, ArrowUpRight, X, CreditCard, Trash2, Moon, Sun, Wallet } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAccModalOpen, setIsAccModalOpen] = useState(false);
  
  // Data States
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form States
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [accName, setAccName] = useState('');
  const [accBalance, setAccBalance] = useState('');

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) fetchData();
      setLoading(false);
    };
    checkUser();
  }, []);

  const fetchData = async () => {
    const { data: accData } = await supabase.from('accounts').select('*');
    if (accData) {
      setAccounts(accData);
      if (accData.length > 0) setSelectedAccount(accData[0].name);
    }
    const { data: transData } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
    if (transData) setTransactions(transData);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else { setUser(data.user); fetchData(); }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // --- Add New Bank Account ---
  const handleAddAccount = async () => {
    if (!accName || !accBalance) return;
    const { data, error } = await supabase.from('accounts').insert([
      { name: accName, balance: parseFloat(accBalance), color: 'bg-purple-600' }
    ]).select();
    
    if (error) alert(error.message);
    else {
      setAccounts([...accounts, data[0]]);
      setIsAccModalOpen(false);
      setAccName(''); setAccBalance('');
    }
  };

  // --- Record Transaction ---
  const handleSave = async () => {
    if (!name || !amount || !selectedAccount) return;
    const numAmount = parseFloat(amount);
    const { data: newTrans, error: transErr } = await supabase.from('transactions').insert([
      { name, amount: numAmount, type, account: selectedAccount }
    ]).select();

    if (newTrans) {
      const currentAcc = accounts.find(a => a.name === selectedAccount);
      const newBal = type === 'income' ? currentAcc.balance + numAmount : currentAcc.balance - numAmount;
      await supabase.from('accounts').update({ balance: newBal }).eq('name', selectedAccount);
      
      fetchData(); // Refresh everything
      setIsModalOpen(false);
      setName(''); setAmount('');
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#0F172A] text-white font-black italic animate-pulse">LAVENLY LOADING...</div>;

  if (!user) {
    return (
      <div className={`h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F3F0FF]'}`}>
        <form onSubmit={handleLogin} className={`p-10 rounded-[40px] shadow-2xl w-full max-w-sm border ${isDarkMode ? 'bg-[#1E293B] border-gray-700' : 'bg-white'}`}>
          <h1 className={`text-3xl font-black italic text-center mb-8 ${isDarkMode ? 'text-white' : 'text-purple-600'}`}>Lavenly</h1>
          <input type="email" placeholder="Email" className="w-full p-4 mb-4 rounded-2xl bg-gray-50 border outline-none text-gray-800" value={email} onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" className="w-full p-4 mb-6 rounded-2xl bg-gray-50 border outline-none text-gray-800" value={password} onChange={e => setPassword(e.target.value)} />
          <button className="w-full bg-purple-600 text-white p-5 rounded-2xl font-black shadow-lg hover:scale-95 transition-all">LOGIN</button>
        </form>
      </div>
    );
  }

  return (
    <main className={`flex h-screen p-4 gap-4 transition-colors duration-500 ${isDarkMode ? 'bg-[#0F172A] text-white' : 'bg-[#F8F9FD] text-gray-800'}`}>
      {/* Sidebar */}
      <aside className={`w-72 rounded-[32px] p-6 flex flex-col border ${isDarkMode ? 'bg-[#1E293B] border-gray-800' : 'bg-white'}`}>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-black italic">Lavenly</h1>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 bg-gray-500/10 rounded-xl">{isDarkMode ? <Sun size={18}/> : <Moon size={18}/>}</button>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="flex justify-between items-center mb-4">
            <p className="text-[10px] font-black opacity-40 uppercase">My Accounts</p>
            <button onClick={() => setIsAccModalOpen(true)} className="text-purple-500 hover:scale-110 transition-all"><Plus size={16}/></button>
          </div>
          {accounts.map(acc => (
            <div key={acc.id} className="p-5 bg-purple-600/10 rounded-[24px] mb-3 border border-purple-500/20">
              <p className="text-[10px] font-bold opacity-60 uppercase">{acc.name}</p>
              <p className="text-xl font-black">₹{acc.balance.toLocaleString()}</p>
            </div>
          ))}
          {accounts.length === 0 && <p className="text-xs italic text-gray-500">Click + to add a bank account</p>}
        </div>

        <button onClick={handleLogout} className="mt-auto flex items-center gap-2 p-4 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-all"><LogOut size={18}/> Logout</button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto">
        <header className={`p-6 rounded-[32px] flex justify-between items-center border ${isDarkMode ? 'bg-[#1E293B] border-gray-800' : 'bg-white shadow-sm'}`}>
          <div><h2 className="text-xl font-bold italic tracking-tight">Welcome, {user.email.split('@')[0]}!</h2><p className="text-xs text-gray-400">Private Vault Connected</p></div>
          <button onClick={() => setIsModalOpen(true)} disabled={accounts.length === 0} className="bg-purple-600 px-6 py-3 rounded-2xl text-white font-black shadow-lg disabled:opacity-50">+ ENTRY</button>
        </header>

        {/* Recent Transactions */}
        <div className={`p-8 rounded-[32px] flex-1 border ${isDarkMode ? 'bg-[#1E293B] border-gray-800' : 'bg-white shadow-sm'}`}>
          <h3 className="font-black text-xs uppercase opacity-40 mb-6 tracking-widest">Recent Activity</h3>
          <div className="flex flex-col gap-4">
            {transactions.map(t => (
              <div key={t.id} className={`flex justify-between items-center p-5 rounded-2xl border ${isDarkMode ? 'bg-[#0F172A]/50 border-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${t.type === 'income' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>{t.type === 'income' ? <ArrowUpRight size={20}/> : <ArrowDownRight size={20}/>}</div>
                  <div><p className="font-bold">{t.name}</p><p className="text-[10px] font-bold text-gray-500 uppercase">{t.account}</p></div>
                </div>
                <p className={`font-black text-lg ${t.type === 'income' ? 'text-green-500' : ''}`}>{t.type === 'income' ? '+' : '-'}₹{t.amount}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal: Add Account */}
      {isAccModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-sm p-8 rounded-[40px] shadow-2xl ${isDarkMode ? 'bg-[#1E293B] border border-gray-700' : 'bg-white'}`}>
            <h3 className="text-xl font-black mb-6">Add Bank Account</h3>
            <input value={accName} onChange={e => setAccName(e.target.value)} placeholder="Bank Name (e.g. Union Bank)" className="w-full p-4 mb-4 rounded-2xl bg-gray-50 border outline-none text-gray-800" />
            <input value={accBalance} onChange={e => setAccBalance(e.target.value)} type="number" placeholder="Initial Balance (₹)" className="w-full p-4 mb-6 rounded-2xl bg-gray-50 border outline-none text-gray-800" />
            <div className="flex gap-3">
              <button onClick={() => setIsAccModalOpen(false)} className="flex-1 p-4 font-bold text-gray-500">Cancel</button>
              <button onClick={handleAddAccount} className="flex-1 bg-purple-600 text-white p-4 rounded-2xl font-black">SAVE</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Record Transaction */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-sm p-8 rounded-[40px] shadow-2xl ${isDarkMode ? 'bg-[#1E293B] border border-gray-700' : 'bg-white'}`}>
            <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-2xl">
              <button onClick={() => setType('expense')} className={`flex-1 py-3 rounded-xl font-bold ${type === 'expense' ? 'bg-white text-red-500 shadow-sm' : 'text-gray-500'}`}>Expense</button>
              <button onClick={() => setType('income')} className={`flex-1 py-3 rounded-xl font-bold ${type === 'income' ? 'bg-white text-green-500 shadow-sm' : 'text-gray-500'}`}>Income</button>
            </div>
            <select className="w-full p-4 mb-4 rounded-2xl bg-gray-50 border outline-none text-gray-800 font-bold" value={selectedAccount} onChange={e => setSelectedAccount(e.target.value)}>
              {accounts.map(acc => <option key={acc.id} value={acc.name}>{acc.name}</option>)}
            </select>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Description" className="w-full p-4 mb-4 rounded-2xl bg-gray-50 border outline-none text-gray-800" />
            <input value={amount} onChange={e => setAmount(e.target.value)} type="number" placeholder="Amount (₹)" className="w-full p-4 mb-6 rounded-2xl bg-gray-50 border outline-none text-gray-800" />
            <button onClick={handleSave} className="w-full bg-purple-600 text-white p-5 rounded-2xl font-black shadow-lg">CONFIRM</button>
            <button onClick={() => setIsModalOpen(false)} className="w-full mt-2 text-gray-400 font-bold">Cancel</button>
          </div>
        </div>
      )}
    </main>
  );
}