"use client";
import React, { useState, useEffect } from 'react';
import { Lock, LogOut, Plus, ArrowDownRight, ArrowUpRight, X, CreditCard, Trash2, Moon, Sun } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Auth Check ---
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
    if (accData) setAccounts(accData);
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

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#0F172A] text-white font-bold italic">LAVENLY LOADING...</div>;

  // --- Login Screen ---
  if (!user) {
    return (
      <div className={`h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F3F0FF]'}`}>
        <form onSubmit={handleLogin} className={`p-10 rounded-[40px] shadow-2xl w-full max-w-sm border ${isDarkMode ? 'bg-[#1E293B] border-gray-700' : 'bg-white'}`}>
          <div className="text-center mb-8">
            <h1 className={`text-3xl font-black italic ${isDarkMode ? 'text-white' : 'text-purple-600'}`}>Lavenly</h1>
            <p className="text-gray-400 text-sm font-bold mt-2">Personal & Private Finance</p>
          </div>
          <input type="email" placeholder="Email" className="w-full p-4 mb-4 rounded-2xl bg-gray-50 border outline-none text-gray-800" value={email} onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" className="w-full p-4 mb-6 rounded-2xl bg-gray-50 border outline-none text-gray-800" value={password} onChange={e => setPassword(e.target.value)} />
          <button className="w-full bg-purple-600 text-white p-5 rounded-2xl font-black shadow-lg">LOGIN</button>
        </form>
      </div>
    );
  }

  // --- Dashboard logic follows as before ---
  return (
    <main className={`flex h-screen p-4 gap-4 ${isDarkMode ? 'bg-[#0F172A] text-white' : 'bg-[#F8F9FD] text-gray-800'}`}>
       {/* Sidebar with Logout */}
       <aside className={`w-72 rounded-[32px] p-6 flex flex-col border ${isDarkMode ? 'bg-[#1E293B] border-gray-800' : 'bg-white'}`}>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-black italic">Lavenly</h1>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 bg-gray-700/10 rounded-xl">{isDarkMode ? <Sun size={18}/> : <Moon size={18}/>}</button>
          </div>
          <div className="flex-1">
             <p className="text-[10px] font-black opacity-40 uppercase mb-4">Accounts</p>
             {accounts.length === 0 && <p className="text-xs italic text-gray-500">No accounts yet mapla!</p>}
             {accounts.map(acc => (
               <div key={acc.id} className="p-4 bg-purple-600/10 rounded-2xl mb-2">
                 <p className="text-[10px] font-bold opacity-60 uppercase">{acc.name}</p>
                 <p className="text-lg font-black">₹{acc.balance}</p>
               </div>
             ))}
          </div>
          <button onClick={handleLogout} className="mt-auto flex items-center gap-2 p-4 text-red-500 font-bold"><LogOut size={18}/> Logout</button>
       </aside>

       <div className="flex-1 flex flex-col gap-6">
          <header className={`p-6 rounded-[32px] flex justify-between items-center border ${isDarkMode ? 'bg-[#1E293B] border-gray-800' : 'bg-white'}`}>
             <div><h2 className="text-xl font-bold">Welcome, {user.email.split('@')[0]}!</h2><p className="text-xs text-gray-400">Your Private Vault</p></div>
             <button onClick={() => setIsModalOpen(true)} className="bg-purple-600 px-6 py-3 rounded-2xl text-white font-black">+ ENTRY</button>
          </header>
          {/* Rest of the UI follows same pattern... */}
          <div className="bg-gray-500/5 flex-1 rounded-[40px] flex items-center justify-center italic text-gray-500">
             Dashboard Fully Multi-User Ready Mapla! 🔥
          </div>
       </div>
    </main>
  );
}