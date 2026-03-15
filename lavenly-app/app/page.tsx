"use client";
import React, { useState, useEffect } from 'react';
import { LogOut, Plus, ArrowDownRight, ArrowUpRight, X, Trash2, Moon, Sun, BarChart3, Lock, ShieldCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLocked, setIsLocked] = useState(true);
  const [dbPin, setDbPin] = useState<string | null>(null);
  const [inputPin, setInputPin] = useState('');
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [loading, setLoading] = useState(true);

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        checkSecurity(session.user);
        fetchData();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    const checkInitialUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        await checkSecurity(user);
        await fetchData();
      }
      setLoading(false);
    };

    checkInitialUser();
    return () => subscription.unsubscribe();
  }, []);

  const checkSecurity = async (currUser: any) => {
    const { data: profile } = await supabase.from('profiles').select('security_pin').eq('id', currUser.id).single();
    if (profile?.security_pin) {
      setDbPin(profile.security_pin);
      setIsSettingPin(false);
    } else {
      setIsSettingPin(true);
    }
  };

  const fetchData = async () => {
    const { data: accData } = await supabase.from('accounts').select('*');
    if (accData) {
      setAccounts(accData);
      if (accData.length > 0) setSelectedAccount(accData[0].name);
    }
    const { data: transData } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
    if (transData) setTransactions(transData);
  };

  // --- Handlers ---
  const handlePinAction = async (digit: string) => {
    if (inputPin.length < 4) {
      const newPin = inputPin + digit;
      setInputPin(newPin);
      if (newPin.length === 4) {
        if (isSettingPin) {
          const { error } = await supabase.from('profiles').insert([{ id: user.id, security_pin: newPin }]);
          if (!error) { setDbPin(newPin); setIsSettingPin(false); setInputPin(''); setIsLocked(false); }
        } else {
          if (newPin === dbPin) setIsLocked(false);
          else { alert("Wrong PIN mapla!"); setInputPin(''); }
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

  const handleDeleteTransaction = async (id: number, tAmount: number, tType: string, tAccount: string) => {
    if (!confirm("Delete pannalaama mapla?")) return;
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (!error) {
      const acc = accounts.find(a => a.name === tAccount);
      if (acc) {
        const newBal = tType === 'income' ? Number(acc.balance) - tAmount : Number(acc.balance) + tAmount;
        await supabase.from('accounts').update({ balance: newBal }).eq('name', tAccount);
      }
      fetchData();
    }
  };

  const handleDeleteAccount = async (accName: string) => {
    if (!confirm(`"${accName}" wallet-ah delete panna athula ulla elaa records-um poyidum. Delete pannalaama?`)) return;
    
    // 1. Delete transactions related to this account
    await supabase.from('transactions').delete().eq('account', accName);
    // 2. Delete the account itself
    const { error } = await supabase.from('accounts').delete().eq('name', accName);
    
    if (!error) fetchData();
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
        <div className={`p-10 rounded-[50px] shadow-2xl w-full max-w-sm border ${isDarkMode ? 'bg-[#1E293B] border-gray-700' : 'bg-white'}`}>
          <h1 className="text-4xl font-black italic text-center mb-8 text-purple-600">Lavenly</h1>
          <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })} className="w-full flex items-center justify-center gap-3 p-5 rounded-3xl font-black border-2 border-gray-700 text-white hover:bg-gray-800 transition-all bg-[#0F172A]">
            Continue with Google
          </button>
        </div>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className={`h-screen flex flex-col items-center justify-center ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F3F0FF]'}`}>
        <div className="text-center mb-10">
          {isSettingPin ? <ShieldCheck className="mx-auto text-green-500 mb-4" size={56} /> : <Lock className="mx-auto text-purple-600 mb-4" size={56} />}
          <h2 className={`text-3xl font-black italic ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{isSettingPin ? 'Create PIN' : 'Enter PIN'}</h2>
        </div>
        <div className="flex gap-5 mb-12">
          {[1, 2, 3, 4].map((dot) => (
            <div key={dot} className={`w-5 h-5 rounded-full border-2 border-purple-600 ${inputPin.length >= dot ? 'bg-purple-600 scale-125' : ''}`} />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, 'DEL'].map((num) => (
            <button key={num} onClick={() => { if (num === 'C') setInputPin(''); else if (num === 'DEL') setInputPin(inputPin.slice(0, -1)); else handlePinAction(num.toString()); }} className={`w-16 h-16 rounded-3xl flex items-center justify-center text-2xl font-black ${isDarkMode ? 'bg-[#1E293B] text-white' : 'bg-white'}`}>{num}</button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <main className={`flex h-screen p-4 gap-4 ${isDarkMode ? 'bg-[#0F172A] text-white' : 'bg-[#F8F9FD] text-gray-800'}`}>
      {/* Sidebar */}
      <aside className={`w-72 rounded-[40px] p-8 flex flex-col border ${isDarkMode ? 'bg-[#1E293B] border-gray-800' : 'bg-white shadow-lg'}`}>
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black italic text-purple-600">Lavenly</h1>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-3 bg-gray-500/10 rounded-2xl">{isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}</button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="flex justify-between items-center mb-6"><p className="text-[10px] font-black opacity-30 uppercase">Wallets</p><button onClick={() => setIsAccModalOpen(true)} className="text-purple-600"><Plus size={20}/></button></div>
          {accounts.map(acc => (
            <div key={acc.id} className="relative group p-6 bg-purple-600/5 rounded-[30px] mb-4 border border-purple-500/10 hover:border-purple-500/40 transition-all">
              <p className="text-[10px] font-bold opacity-40 uppercase mb-1">{acc.name}</p>
              <p className="text-2xl font-black italic">₹{Number(acc.balance).toLocaleString()}</p>
              <button onClick={() => handleDeleteAccount(acc.name)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                <Trash2 size={16}/>
              </button>
            </div>
          ))}
        </div>
        <button onClick={() => supabase.auth.signOut()} className="mt-auto p-5 text-red-500 font-bold flex items-center justify-center gap-2 bg-red-500/5 rounded-3xl hover:bg-red-500/10"><LogOut size={18}/> Logout</button>
      </aside>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2">
        <header className={`p-8 rounded-[40px] flex justify-between items-center border ${isDarkMode ? 'bg-[#1E293B] border-gray-800' : 'bg-white shadow-md'}`}>
          <div><h2 className="text-2xl font-black italic">Dashboard</h2><p className="text-xs text-gray-500 mt-1">{user.email}</p></div>
          <button onClick={() => setIsModalOpen(true)} className="bg-purple-600 px-10 py-4 rounded-[24px] text-white font-black shadow-2xl hover:scale-105 transition-all">+ ENTRY</button>
        </header>

        {/* Chart */}
        <div className={`p-8 rounded-[40px] border h-72 ${isDarkMode ? 'bg-[#1E293B] border-gray-800' : 'bg-white shadow-md'}`}>
           <div className="flex items-center gap-3 mb-6 opacity-30 text-[10px] font-black uppercase"><BarChart3 size={18}/> Weekly Spending</div>
           <ResponsiveContainer width="100%" height="85%">
              <BarChart data={getChartData()}>
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 11}} />
                 <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '20px', backgroundColor: '#1e293b', border: 'none', color: '#fff'}} />
                 <Bar dataKey="amount" fill="#9333ea" radius={[12, 12, 12, 12]} barSize={40} />
              </BarChart>
           </ResponsiveContainer>
        </div>

        {/* Transactions */}
        <div className={`p-8 rounded-[40px] flex-1 border ${isDarkMode ? 'bg-[#1E293B] border-gray-800' : 'bg-white shadow-md'}`}>
          <h3 className="font-black text-xs uppercase opacity-30 mb-8 tracking-widest">Recent Activity</h3>
          <div className="flex flex-col gap-5">
            {transactions.map(t => (
              <div key={t.id} className="group flex justify-between items-center p-6 rounded-[28px] bg-gray-500/5 hover:bg-gray-500/10 transition-all">
                <div className="flex items-center gap-5">
                  <div className={`p-4 rounded-2xl ${t.type === 'income' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{t.type === 'income' ? <ArrowUpRight size={24}/> : <ArrowDownRight size={24}/>}</div>
                  <div><p className="font-black text-lg">{t.name}</p><p className="text-[11px] font-bold text-gray-500 uppercase">{t.account}</p></div>
                </div>
                <div className="flex items-center gap-6">
                  <p className={`font-black text-xl italic ${t.type === 'income' ? 'text-green-500' : ''}`}>₹{Number(t.amount).toLocaleString()}</p>
                  <button onClick={() => handleDeleteTransaction(t.id, t.amount, t.type, t.account)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all transform hover:scale-125"><Trash2 size={20}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals same as before... */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0F172A]/90 backdrop-blur-md flex items-center justify-center z-50 p-6">
          <div className={`w-full max-w-md p-10 rounded-[50px] shadow-2xl ${isDarkMode ? 'bg-[#1E293B] border border-gray-700' : 'bg-white'}`}>
            <div className="flex gap-3 mb-8 p-1.5 bg-gray-500/5 rounded-3xl">
              <button onClick={() => setType('expense')} className={`flex-1 py-4 rounded-2xl font-black ${type === 'expense' ? 'bg-purple-600 text-white' : 'text-gray-500'}`}>Expense</button>
              <button onClick={() => setType('income')} className={`flex-1 py-4 rounded-2xl font-black ${type === 'income' ? 'bg-purple-600 text-white' : 'text-gray-500'}`}>Income</button>
            </div>
            <select className="w-full p-5 mb-5 rounded-3xl bg-gray-500/10 border-none outline-none font-black text-lg" value={selectedAccount} onChange={e => setSelectedAccount(e.target.value)}>
              {accounts.map(acc => <option key={acc.id} value={acc.name} className="text-black">{acc.name}</option>)}
            </select>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Description" className="w-full p-5 mb-5 rounded-3xl bg-gray-500/10 outline-none font-black text-lg" />
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount (₹)" className="w-full p-5 mb-8 rounded-3xl bg-gray-500/10 outline-none text-3xl font-black text-purple-600" />
            <button onClick={handleSave} className="w-full bg-purple-600 text-white p-5 rounded-3xl font-black">CONFIRM</button>
          </div>
        </div>
      )}

      {isAccModalOpen && (
        <div className="fixed inset-0 bg-[#0F172A]/90 backdrop-blur-md flex items-center justify-center z-50 p-6">
          <div className={`w-full max-w-md p-10 rounded-[50px] shadow-2xl ${isDarkMode ? 'bg-[#1E293B] border border-gray-700' : 'bg-white'}`}>
            <h3 className="text-2xl font-black italic mb-8 text-purple-600">Add Wallet</h3>
            <input value={accName} onChange={e => setAccName(e.target.value)} placeholder="Bank Name" className="w-full p-5 mb-5 rounded-3xl bg-gray-500/10 outline-none font-black text-lg" />
            <input type="number" value={accBalance} onChange={e => setAccBalance(e.target.value)} placeholder="Opening Balance" className="w-full p-5 mb-8 rounded-3xl bg-gray-500/10 outline-none font-black text-2xl" />
            <button onClick={handleAddAccount} className="w-full bg-purple-600 text-white p-5 rounded-[28px] font-black shadow-2xl hover:scale-105 transition-all">ACTIVATE WALLET</button>
            <button onClick={() => setIsAccModalOpen(false)} className="w-full mt-4 p-2 text-gray-500 font-bold text-sm">Cancel</button>
          </div>
        </div>
      )}
    </main>
  );
}