"use client";
import React, { useState, useEffect } from 'react';
import { LogOut, Plus, ArrowDownRight, ArrowUpRight, X, Trash2, Moon, Sun, BarChart3, Lock, ShieldCheck, CalendarClock } from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { supabase } from '@/lib/supabase';

export default function Home() {
  // --- States ---
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLocked, setIsLocked] = useState(true);
  const [dbPin, setDbPin] = useState<string | null>(null);
  const [inputPin, setInputPin] = useState('');
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Dashboard & Recurring States
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [recurringList, setRecurringList] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAccModalOpen, setIsAccModalOpen] = useState(false);
  const [isRecModalOpen, setIsRecModalOpen] = useState(false);

  // Form States
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [accName, setAccName] = useState('');
  const [accBalance, setAccBalance] = useState('');
  const [recDay, setRecDay] = useState('1');

  // --- Keyboard Support (PIN & Forms) ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLocked && user && !isModalOpen && !isAccModalOpen && !isRecModalOpen) {
        if (/^[0-9]$/.test(e.key)) handlePinAction(e.key);
        if (e.key === 'Backspace') setInputPin(prev => prev.slice(0, -1));
      }
      if (e.key === 'Enter') {
        if (isModalOpen) handleSave();
        else if (isAccModalOpen) handleAddAccount();
        else if (isRecModalOpen) handleSaveRecurring();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputPin, isLocked, user, isModalOpen, isAccModalOpen, isRecModalOpen, name, amount, selectedAccount, accName, accBalance, recDay]);

  // --- Auth & Auto-Processing ---
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        checkSecurity(session.user);
        initDashboard(session.user);
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
        await initDashboard(user);
      }
      setLoading(false);
    };

    checkInitialUser();
    return () => subscription.unsubscribe();
  }, []);

  const initDashboard = async (currUser: any) => {
    await fetchData();
    await processRecurringEntries(currUser.id);
  };

  const fetchData = async () => {
    const { data: accData } = await supabase.from('accounts').select('*');
    if (accData) {
      setAccounts(accData);
      if (accData.length > 0) setSelectedAccount(accData[0].name);
    }
    const { data: transData } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
    if (transData) setTransactions(transData);
    
    const { data: recData } = await supabase.from('recurring_settings').select('*');
    if (recData) setRecurringList(recData);
  };

  const processRecurringEntries = async (userId: string) => {
    const today = new Date();
    const currentDay = today.getDate();
    const todayStr = today.toISOString().split('T')[0];

    const { data: settings } = await supabase.from('recurring_settings').select('*').eq('day_of_month', currentDay);

    if (settings && settings.length > 0) {
      for (const item of settings) {
        if (item.last_processed !== todayStr) {
          await supabase.from('transactions').insert([{
            name: `[AUTO] ${item.name}`,
            amount: item.amount,
            type: item.type,
            account: item.account,
            user_id: userId
          }]);

          const { data: acc } = await supabase.from('accounts').select('balance').eq('name', item.account).single();
          if (acc) {
            const newBal = item.type === 'income' ? Number(acc.balance) + Number(item.amount) : Number(acc.balance) - Number(item.amount);
            await supabase.from('accounts').update({ balance: newBal }).eq('name', item.account);
          }
          await supabase.from('recurring_settings').update({ last_processed: todayStr }).eq('id', item.id);
        }
      }
      fetchData();
    }
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

  const handleSaveRecurring = async () => {
    if (!name || !amount || !selectedAccount) return;
    const { error } = await supabase.from('recurring_settings').insert([{
      name, amount: parseFloat(amount), type, account: selectedAccount, day_of_month: parseInt(recDay), user_id: user.id
    }]);
    if (!error) { fetchData(); setIsRecModalOpen(false); setName(''); setAmount(''); }
  };

  const handleDeleteTransaction = async (id: number, tAmount: number, tType: string, tAccount: string) => {
    if (!confirm("Delete pannalaama?")) return;
    await supabase.from('transactions').delete().eq('id', id);
    const acc = accounts.find(a => a.name === tAccount);
    if (acc) {
      const newBal = tType === 'income' ? Number(acc.balance) - tAmount : Number(acc.balance) + tAmount;
      await supabase.from('accounts').update({ balance: newBal }).eq('name', tAccount);
    }
    fetchData();
  };

  const handleDeleteAccount = async (accName: string) => {
    if (!confirm(`"${accName}" wallet-ah delete panna records-um poyidum. Delete pannalaama?`)) return;
    await supabase.from('transactions').delete().eq('account', accName);
    await supabase.from('accounts').delete().eq('name', accName);
    fetchData();
  };

  const handleAddAccount = async () => {
    if (!accName || !accBalance) return;
    const { error } = await supabase.from('accounts').insert([{ name: accName, balance: parseFloat(accBalance), user_id: user.id }]);
    if (!error) { fetchData(); setIsAccModalOpen(false); setAccName(''); setAccBalance(''); }
  };

  const checkSecurity = async (currUser: any) => {
    const { data: profile } = await supabase.from('profiles').select('security_pin').eq('id', currUser.id).single();
    if (profile?.security_pin) { setDbPin(profile.security_pin); setIsSettingPin(false); }
    else setIsSettingPin(true);
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

  if (!user) return (
    <div className="h-screen flex items-center justify-center bg-[#0F172A]">
       <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })} className="bg-purple-600 text-white px-10 py-5 rounded-3xl font-black">LOGIN WITH GOOGLE</button>
    </div>
  );

  if (isLocked) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#0F172A] text-white">
      <Lock className="mb-6 text-purple-600" size={60} />
      <h2 className="text-3xl font-black italic mb-10">{isSettingPin ? 'Set Your Vault PIN' : 'Vault Locked'}</h2>
      <div className="flex gap-4 mb-10">
        {[1, 2, 3, 4].map(dot => <div key={dot} className={`w-5 h-5 rounded-full border-2 border-purple-600 transition-all ${inputPin.length >= dot ? 'bg-purple-600 scale-125' : ''}`} />)}
      </div>
      <div className="grid grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, 'DEL'].map(num => (
          <button key={num} onClick={() => { if (num === 'C') setInputPin(''); else if (num === 'DEL') setInputPin(inputPin.slice(0, -1)); else handlePinAction(num.toString()); }} className="w-16 h-16 rounded-3xl bg-[#1E293B] text-2xl font-black hover:bg-purple-600">{num}</button>
        ))}
      </div>
    </div>
  );

  return (
    <main className={`flex h-screen p-4 gap-4 ${isDarkMode ? 'bg-[#0F172A] text-white' : 'bg-[#F8F9FD] text-gray-800'}`}>
      {/* Sidebar */}
      <aside className={`w-80 rounded-[40px] p-8 flex flex-col border ${isDarkMode ? 'bg-[#1E293B] border-gray-800' : 'bg-white shadow-lg'}`}>
        <h1 className="text-3xl font-black italic text-purple-600 mb-10">Lavenly</h1>
        <div className="flex-1 overflow-y-auto space-y-8">
          <section>
            <div className="flex justify-between items-center mb-4"><p className="text-[10px] font-black opacity-30 uppercase">Wallets</p><button onClick={() => setIsAccModalOpen(true)} className="text-purple-600"><Plus size={18}/></button></div>
            {accounts.map(acc => (
              <div key={acc.id} className="relative group p-6 bg-purple-600/5 rounded-[30px] mb-3 border border-purple-500/10">
                <p className="text-[10px] font-bold opacity-40 uppercase mb-1">{acc.name}</p>
                <p className="text-2xl font-black italic text-purple-600">₹{Number(acc.balance).toLocaleString()}</p>
                <button onClick={() => handleDeleteAccount(acc.name)} className="absolute top-4 right-4 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={14}/></button>
              </div>
            ))}
          </section>
          
          <section>
            <div className="flex justify-between items-center mb-4"><p className="text-[10px] font-black opacity-30 uppercase">Auto-Pay (Recurring)</p><button onClick={() => setIsRecModalOpen(true)} className="text-purple-600"><Plus size={18}/></button></div>
            {recurringList.map(rec => (
              <div key={rec.id} className="p-4 bg-gray-500/5 rounded-2xl mb-2 flex justify-between items-center group">
                <div><p className="text-xs font-black">{rec.name}</p><p className="text-[10px] text-purple-500">Every month: Day {rec.day_of_month}</p></div>
                <button onClick={() => { if(confirm("Stop auto-pay?")) supabase.from('recurring_settings').delete().eq('id', rec.id).then(fetchData) }} className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={14}/></button>
              </div>
            ))}
          </section>
        </div>
        <button onClick={() => supabase.auth.signOut()} className="mt-auto p-5 text-red-500 font-bold flex items-center justify-center gap-2 bg-red-500/5 rounded-3xl">Logout</button>
      </aside>

      <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2">
        <header className={`p-8 rounded-[40px] flex justify-between items-center border ${isDarkMode ? 'bg-[#1E293B] border-gray-800' : 'bg-white shadow-md'}`}>
          <div><h2 className="text-2xl font-black italic">Dashboard</h2><p className="text-xs text-gray-500">{user.email}</p></div>
          <button onClick={() => setIsModalOpen(true)} className="bg-purple-600 px-10 py-4 rounded-[24px] text-white font-black shadow-2xl hover:scale-105 transition-all">+ ENTRY</button>
        </header>

        <div className={`p-8 rounded-[40px] border h-72 ${isDarkMode ? 'bg-[#1E293B] border-gray-800' : 'bg-white shadow-md'}`}>
           <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getChartData()}>
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 11, fontWeight: 'bold'}} />
                 <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '20px', backgroundColor: '#1e293b', border: 'none', color: '#fff'}} />
                 <Bar dataKey="amount" fill="#9333ea" radius={[12, 12, 12, 12]} barSize={40} />
              </BarChart>
           </ResponsiveContainer>
        </div>

        <div className={`p-8 rounded-[40px] flex-1 border ${isDarkMode ? 'bg-[#1E293B] border-gray-800' : 'bg-white shadow-md'}`}>
          <h3 className="font-black text-xs uppercase opacity-30 mb-8 tracking-widest">Recent Activity</h3>
          <div className="flex flex-col gap-4">
            {transactions.map(t => (
              <div key={t.id} className="group flex justify-between items-center p-6 rounded-[28px] bg-gray-500/5 hover:bg-gray-500/10 transition-all">
                <div className="flex items-center gap-5">
                  <div className={`p-4 rounded-2xl ${t.type === 'income' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{t.type === 'income' ? <ArrowUpRight size={24}/> : <ArrowDownRight size={24}/>}</div>
                  <div><p className="font-black text-lg">{t.name}</p><p className="text-[11px] font-bold text-gray-500 uppercase">{t.account}</p></div>
                </div>
                <div className="flex items-center gap-6">
                  <p className={`font-black text-xl italic ${t.type === 'income' ? 'text-green-500' : ''}`}>₹{Number(t.amount).toLocaleString()}</p>
                  <button onClick={() => handleDeleteTransaction(t.id, t.amount, t.type, t.account)} className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={18}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals Logic */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-6">
          <div className={`w-full max-w-md p-10 rounded-[50px] ${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'}`}>
            <div className="flex gap-2 mb-8 p-1 bg-gray-500/5 rounded-2xl">
              <button onClick={() => setType('expense')} className={`flex-1 py-4 rounded-xl font-black ${type === 'expense' ? 'bg-purple-600 text-white' : 'text-gray-500'}`}>Expense</button>
              <button onClick={() => setType('income')} className={`flex-1 py-4 rounded-xl font-black ${type === 'income' ? 'bg-purple-600 text-white' : 'text-gray-500'}`}>Income</button>
            </div>
            <select className="w-full p-5 mb-4 rounded-3xl bg-gray-500/10 border-none outline-none font-bold" value={selectedAccount} onChange={e => setSelectedAccount(e.target.value)}>
              {accounts.map(acc => <option key={acc.id} value={acc.name} className="text-black">{acc.name}</option>)}
            </select>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="What was this for?" className="w-full p-5 mb-4 rounded-3xl bg-gray-500/10 outline-none font-bold" />
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount (₹)" className="w-full p-5 mb-8 rounded-3xl bg-gray-500/10 outline-none text-3xl font-black text-purple-600" />
            <button onClick={handleSave} className="w-full bg-purple-600 text-white p-5 rounded-3xl font-black shadow-2xl">CONFIRM ENTRY</button>
            <button onClick={() => setIsModalOpen(false)} className="w-full mt-4 text-gray-500 font-bold">Cancel</button>
          </div>
        </div>
      )}

      {isRecModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-6">
          <div className={`w-full max-w-md p-10 rounded-[50px] ${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'}`}>
            <h3 className="text-2xl font-black mb-8 italic flex items-center gap-2 text-purple-600"><CalendarClock/> Set Auto-Pay</h3>
            <select className="w-full p-5 mb-4 rounded-3xl bg-gray-500/10 border-none outline-none font-bold" value={selectedAccount} onChange={e => setSelectedAccount(e.target.value)}>
              {accounts.map(acc => <option key={acc.id} value={acc.name} className="text-black">{acc.name}</option>)}
            </select>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Entry Name (Ex: Salary)" className="w-full p-5 mb-4 rounded-3xl bg-gray-500/10 outline-none font-bold" />
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount (₹)" className="w-full p-5 mb-4 rounded-3xl bg-gray-500/10 outline-none font-bold" />
            <div className="mb-8">
              <p className="text-[10px] font-black opacity-40 uppercase mb-2">Execute on day of month:</p>
              <input type="number" min="1" max="31" value={recDay} onChange={e => setRecDay(e.target.value)} className="w-full p-5 rounded-3xl bg-gray-500/10 outline-none font-black text-xl" />
            </div>
            <button onClick={handleSaveRecurring} className="w-full bg-purple-600 text-white p-5 rounded-3xl font-black shadow-2xl">ACTIVATE AUTO-PAY</button>
            <button onClick={() => setIsRecModalOpen(false)} className="w-full mt-4 text-gray-500 font-bold">Cancel</button>
          </div>
        </div>
      )}

      {isAccModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-6">
          <div className={`w-full max-w-md p-10 rounded-[50px] ${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'}`}>
            <h3 className="text-2xl font-black italic mb-8">New Wallet</h3>
            <input value={accName} onChange={e => setAccName(e.target.value)} placeholder="Bank Name" className="w-full p-5 mb-4 rounded-3xl bg-gray-500/10 outline-none font-bold" />
            <input type="number" value={accBalance} onChange={e => setAccBalance(e.target.value)} placeholder="Initial Balance" className="w-full p-5 mb-8 rounded-3xl bg-gray-500/10 outline-none font-bold text-2xl" />
            <button onClick={handleAddAccount} className="w-full bg-purple-600 text-white p-5 rounded-[28px] font-black shadow-2xl">SAVE WALLET</button>
            <button onClick={() => setIsAccModalOpen(false)} className="w-full mt-4 text-gray-500 font-bold">Cancel</button>
          </div>
        </div>
      )}
    </main>
  );
}