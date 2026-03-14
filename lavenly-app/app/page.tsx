"use client";
import React, { useState, useEffect } from 'react';
import { LogOut, Plus, ArrowDownRight, ArrowUpRight, X, Trash2, Moon, Sun, BarChart3, Lock, ShieldCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [isLocked, setIsLocked] = useState(true);
  const [dbPin, setDbPin] = useState<string | null>(null);
  const [inputPin, setInputPin] = useState('');
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [loading, setLoading] = useState(true);

  // Dashboard States
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAccModalOpen, setIsAccModalOpen] = useState(false);
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
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('security_pin').eq('id', user.id).single();
        if (profile?.security_pin) {
          setDbPin(profile.security_pin);
          setIsSettingPin(false);
        } else {
          setIsSettingPin(true);
        }
        fetchData();
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  // --- Keyboard Support for PIN & Dashboard ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Numbers 0-9 for PIN
      if (isLocked && /^[0-9]$/.test(e.key)) {
        handlePinAction(e.key);
      }
      // Enter key to confirm
      if (e.key === 'Enter') {
        if (isModalOpen) handleSave();
        else if (isAccModalOpen) handleAddAccount();
      }
      // Backspace to delete PIN
      if (isLocked && e.key === 'Backspace') {
        setInputPin(prev => prev.slice(0, -1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputPin, isLocked, isModalOpen, isAccModalOpen, name, amount, selectedAccount, accName, accBalance]);

  const fetchData = async () => {
    const { data: accData } = await supabase.from('accounts').select('*');
    if (accData) {
      setAccounts(accData);
      if (accData.length > 0) setSelectedAccount(accData[0].name);
    }
    const { data: transData } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
    if (transData) setTransactions(transData);
  };

  const handlePinAction = async (digit: string) => {
    if (inputPin.length < 4) {
      const newPin = inputPin + digit;
      setInputPin(newPin);

      if (newPin.length === 4) {
        if (isSettingPin) {
          const { error } = await supabase.from('profiles').insert([{ id: user.id, security_pin: newPin }]);
          if (!error) {
            setDbPin(newPin);
            setIsSettingPin(false);
            setInputPin('');
            setIsLocked(false);
          }
        } else {
          if (newPin === dbPin) {
            setTimeout(() => setIsLocked(false), 200);
          } else {
            alert("Wrong PIN mapla!");
            setInputPin('');
          }
        }
      }
    }
  };

  const handleSave = async () => {
    if (!name || !amount || !selectedAccount) return;
    const numAmount = parseFloat(amount);
    const { data: newTrans } = await supabase.from('transactions').insert([{ name, amount: numAmount, type, account: selectedAccount, user_id: user.id }]).select();
    if (newTrans) {
      const acc = accounts.find(a => a.name === selectedAccount);
      const newBal = type === 'income' ? Number(acc.balance) + numAmount : Number(acc.balance) - numAmount;
      await supabase.from('accounts').update({ balance: newBal }).eq('name', selectedAccount);
      fetchData(); setIsModalOpen(false); setName(''); setAmount('');
    }
  };

  const handleAddAccount = async () => {
    if (!accName || !accBalance) return;
    const { error } = await supabase.from('accounts').insert([{ name: accName, balance: parseFloat(accBalance), user_id: user.id }]).select();
    if (!error) { fetchData(); setIsAccModalOpen(false); setAccName(''); setAccBalance(''); }
  };

  const getChartData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.map(day => {
      const total = transactions
        .filter(t => t.type === 'expense' && new Date(t.created_at).getDay() === days.indexOf(day))
        .reduce((sum, t) => sum + Number(t.amount), 0);
      return { name: day, amount: total };
    });
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#0F172A] text-white font-black italic">LAVENLY...</div>;

  if (!user) {
    return (
      <div className={`h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F3F0FF]'}`}>
        <div className={`p-10 rounded-[40px] shadow-2xl w-full max-w-sm border ${isDarkMode ? 'bg-[#1E293B] border-gray-700' : 'bg-white'}`}>
          <h1 className="text-3xl font-black italic text-center mb-8 text-purple-600">Lavenly</h1>
          <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })} className="w-full flex items-center justify-center gap-3 p-5 rounded-2xl font-black border-2 border-gray-700 text-white hover:bg-gray-800 transition-all">
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="google" />
            Continue with Google
          </button>
        </div>
      </div>
    );
  }

  // --- Security Screen ---
  if (isLocked) {
    return (
      <div className={`h-screen flex flex-col items-center justify-center ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F3F0FF]'}`}>
        <div className="text-center mb-8">
          {isSettingPin ? <ShieldCheck className="mx-auto text-green-500 mb-4" size={48} /> : <Lock className="mx-auto text-purple-600 mb-4" size={48} />}
          <h2 className={`text-2xl font-black italic ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{isSettingPin ? 'Create Your Vault PIN' : 'Enter Security PIN'}</h2>
          <p className="text-gray-400 text-[10px] font-black uppercase mt-2">Use Keyboard or Click</p>
        </div>
        <div className="flex gap-4 mb-10">
          {[1, 2, 3, 4].map((dot) => (
            <div key={dot} className={`w-4 h-4 rounded-full border-2 border-purple-600 transition-all ${inputPin.length >= dot ? 'bg-purple-600 scale-125' : ''}`} />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, 'DEL'].map((num) => (
            <button key={num} onClick={() => { if (num === 'C') setInputPin(''); else if (num === 'DEL') setInputPin(inputPin.slice(0, -1)); else handlePinAction(num.toString()); }} className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black ${isDarkMode ? 'bg-[#1E293B] text-white' : 'bg-white text-gray-800 shadow-lg'}`}>{num}</button>
          ))}
        </div>
      </div>
    );
  }

  // --- Main Dashboard (Correctly Displayed Now) ---
  return (
    <main className={`flex h-screen p-4 gap-4 transition-all duration-500 ${isDarkMode ? 'bg-[#0F172A] text-white' : 'bg-[#F8F9FD] text-gray-800'}`}>
      <aside className={`w-72 rounded-[32px] p-6 flex flex-col border ${isDarkMode ? 'bg-[#1E293B] border-gray-800' : 'bg-white shadow-sm'}`}>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-black italic">Lavenly</h1>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 bg-gray-500/10 rounded-xl">{isDarkMode ? <Sun size={18}/> : <Moon size={18}/>}</button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="flex justify-between items-center mb-4"><p className="text-[10px] font-black opacity-40 uppercase">Accounts</p><button onClick={() => setIsAccModalOpen(true)} className="text-purple-500"><Plus size={18}/></button></div>
          {accounts.map(acc => (
            <div key={acc.id} className="p-5 bg-purple-600/10 rounded-[24px] mb-3 border border-purple-500/10 hover:scale-105 transition-all">
              <p className="text-[10px] font-bold opacity-60 uppercase">{acc.name}</p>
              <p className="text-xl font-black">₹{Number(acc.balance).toLocaleString()}</p>
            </div>
          ))}
        </div>
        <button onClick={() => supabase.auth.signOut().then(() => setUser(null))} className="mt-auto p-4 text-red-500 font-bold flex items-center gap-2"><LogOut size={18}/> Logout</button>
      </aside>

      <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2">
        <header className={`p-6 rounded-[32px] flex justify-between items-center border ${isDarkMode ? 'bg-[#1E293B] border-gray-800' : 'bg-white shadow-sm'}`}>
          <div><h2 className="text-xl font-bold italic">Dashboard</h2><p className="text-xs text-gray-400">{user.email}</p></div>
          <button onClick={() => setIsModalOpen(true)} className="bg-purple-600 px-8 py-3 rounded-2xl text-white font-black shadow-lg hover:scale-105 transition-all">+ ENTRY</button>
        </header>

        <div className={`p-6 rounded-[32px] border h-64 ${isDarkMode ? 'bg-[#1E293B] border-gray-800' : 'bg-white shadow-sm'}`}>
           <div className="flex items-center gap-2 mb-4 opacity-40 text-[10px] font-black uppercase"><BarChart3 size={16}/> Weekly Spending</div>
           <ResponsiveContainer width="100%" height="80%">
              <BarChart data={getChartData()}>
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 10}} />
                 <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px', backgroundColor: '#1e293b', border: 'none', color: '#fff'}} />
                 <Bar dataKey="amount" fill="#9333ea" radius={[6, 6, 6, 6]} barSize={30} />
              </BarChart>
           </ResponsiveContainer>
        </div>

        <div className={`p-8 rounded-[32px] flex-1 border ${isDarkMode ? 'bg-[#1E293B] border-gray-800' : 'bg-white shadow-sm'}`}>
          <h3 className="font-black text-xs uppercase opacity-40 mb-6">Recent Records</h3>
          <div className="flex flex-col gap-4">
            {transactions.map(t => (
              <div key={t.id} className={`group flex justify-between items-center p-5 rounded-2xl ${isDarkMode ? 'bg-[#0F172A]/50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${t.type === 'income' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{t.type === 'income' ? <ArrowUpRight size={20}/> : <ArrowDownRight size={20}/>}</div>
                  <div><p className="font-bold">{t.name}</p><p className="text-[10px] font-bold text-gray-500 uppercase">{t.account}</p></div>
                </div>
                <div className="flex items-center gap-4">
                  <p className={`font-black text-lg ${t.type === 'income' ? 'text-green-500' : ''}`}>₹{Number(t.amount).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals for Entry & Accounts */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-sm p-8 rounded-[40px] shadow-2xl ${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'}`}>
            <div className="flex gap-2 mb-6 p-1 bg-gray-500/10 rounded-2xl">
              <button onClick={() => setType('expense')} className={`flex-1 py-3 rounded-xl font-black ${type === 'expense' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500'}`}>Expense</button>
              <button onClick={() => setType('income')} className={`flex-1 py-3 rounded-xl font-black ${type === 'income' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500'}`}>Income</button>
            </div>
            <select className="w-full p-4 mb-4 rounded-2xl bg-gray-500/10 border-none outline-none font-bold" value={selectedAccount} onChange={e => setSelectedAccount(e.target.value)}>
              {accounts.map(acc => <option key={acc.id} value={acc.name} className="text-black">{acc.name}</option>)}
            </select>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Description" className="w-full p-4 mb-4 rounded-2xl bg-gray-500/10 outline-none font-bold" />
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount (₹)" className="w-full p-4 mb-6 rounded-2xl bg-gray-500/10 outline-none text-2xl font-black" />
            <button onClick={handleSave} className="w-full bg-purple-600 text-white p-5 rounded-2xl font-black shadow-xl">CONFIRM (Enter)</button>
          </div>
        </div>
      )}

      {isAccModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-sm p-8 rounded-[40px] shadow-2xl ${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'}`}>
            <h3 className="text-xl font-black mb-6 italic">Add Wallet</h3>
            <input value={accName} onChange={e => setAccName(e.target.value)} placeholder="Bank Name" className="w-full p-4 mb-4 rounded-2xl bg-gray-500/10 outline-none font-bold" />
            <input type="number" value={accBalance} onChange={e => setAccBalance(e.target.value)} placeholder="Initial Balance" className="w-full p-4 mb-6 rounded-2xl bg-gray-500/10 outline-none font-bold text-xl" />
            <button onClick={handleAddAccount} className="w-full bg-purple-600 text-white p-4 rounded-2xl font-black">SAVE ACCOUNT</button>
            <button onClick={() => setIsAccModalOpen(false)} className="w-full mt-4 text-gray-400 text-sm font-bold">Cancel</button>
          </div>
        </div>
      )}
    </main>
  );
}