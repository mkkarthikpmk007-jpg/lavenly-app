"use client";
import React, { useState, useMemo } from 'react';
import { LayoutDashboard, Wallet, Plus, ArrowUpRight, ArrowDownRight, X, Trash2, Search, CreditCard } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';

interface Account { id: string; name: string; balance: number; color: string; }

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('SBI Savings');

  const [accounts, setAccounts] = useState<Account[]>([
    { id: '1', name: 'SBI Savings', balance: 32000, color: 'bg-blue-600' },
    { id: '2', name: 'HDFC Bank', balance: 12500, color: 'bg-red-500' },
    { id: '3', name: 'Cash Wallet', balance: 1000, color: 'bg-green-500' },
  ]);

  const [transactions, setTransactions] = useState([
    { id: 1, name: 'Adobe Subscription', date: '02 Mar 2026', amount: 1200, type: 'expense', account: 'SBI Savings' },
    { id: 2, name: 'Freelance Payment', date: '01 Mar 2026', amount: 25000, type: 'income', account: 'HDFC Bank' },
  ]);

  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

  const chartData = [
    { name: 'Mon', value: 400 }, { name: 'Tue', value: 300 }, { name: 'Wed', value: 600 },
    { name: 'Thu', value: 200 }, { name: 'Fri', value: 700 }, { name: 'Sat', value: 400 },
    { name: 'Sun', value: 500 },
  ];

  const handleSave = () => {
    if (!name || !amount) return;
    const numAmount = parseFloat(amount);
    setAccounts(accounts.map(acc => acc.name === selectedAccount ? { ...acc, balance: acc.balance - numAmount } : acc));
    setTransactions([{ id: Date.now(), name, date: 'Today', amount: numAmount, type: 'expense', account: selectedAccount }, ...transactions]);
    setIsModalOpen(false); setName(''); setAmount('');
  };

  return (
    <main className="flex h-screen bg-[#F3F0FF] p-4 gap-4 font-sans overflow-hidden">
      {/* Sidebar - Accounts (Left) */}
      <aside className="w-72 bg-white rounded-[32px] p-6 flex flex-col shadow-sm border border-purple-50 shrink-0">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 bg-[#7C3AED] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">L</div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Lavenly</h1>
        </div>
        <p className="text-gray-400 text-[10px] font-bold uppercase mb-4 px-2 tracking-widest">My Accounts</p>
        <div className="flex flex-col gap-3 mb-8 overflow-y-auto pr-1">
          {accounts.map(acc => (
            <div key={acc.id} className={`${acc.color} p-4 rounded-2xl text-white shadow-md hover:scale-105 transition-all cursor-pointer`}>
              <div className="flex justify-between items-start mb-2"><CreditCard size={14} className="opacity-80"/><span className="text-[10px] font-bold opacity-60 uppercase tracking-tighter">Debit</span></div>
              <p className="text-[10px] opacity-80">{acc.name}</p>
              <p className="text-lg font-bold tracking-tight">₹ {acc.balance.toLocaleString()}</p>
            </div>
          ))}
        </div>
        <nav className="mt-auto">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#7C3AED] text-white shadow-md"><LayoutDashboard size={20}/> Dashboard</div>
        </nav>
      </aside>

      {/* Main Content (Right) */}
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
        <header className="flex justify-between items-center bg-white p-6 rounded-[32px] shadow-sm shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Bank Manager Mode</h2>
            <p className="text-gray-400 text-xs tracking-wide">Tracking {accounts.length} accounts</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-[#7C3AED] text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold shadow-lg hover:scale-105 transition-all"><Plus size={20}/> Add Transaction</button>
        </header>

        {/* Dashboard Grid: Balance & Chart */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 shrink-0">
          <div className="bg-[#7C3AED] p-8 rounded-[32px] shadow-xl text-white relative overflow-hidden flex flex-col justify-center min-h-[220px]">
             <div className="absolute top-0 right-0 p-10 opacity-10"><Wallet size={100}/></div>
             <p className="opacity-80 text-sm font-medium">Total Net Worth</p>
             <h3 className="text-4xl font-bold mt-2 tracking-tight">₹ {totalBalance.toLocaleString()}</h3>
          </div>

          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-purple-50 min-h-[220px]">
            <h3 className="font-bold text-lg text-gray-800 mb-4 px-2">Weekly Activity</h3>
            <div className="h-[140px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10}} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={30}>
                    {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={index === 4 ? '#7C3AED' : '#E5E7EB'} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm flex-1 border border-purple-50 mb-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl text-gray-800 tracking-tight">Recent Transactions</h3>
            <div className="relative"><input type="text" placeholder="Search..." className="bg-gray-50 p-2 pl-8 rounded-xl outline-none text-sm border border-transparent focus:border-purple-200" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /><Search className="absolute left-2 top-2.5 text-gray-400" size={16}/></div>
          </div>
          <div className="flex flex-col gap-4">
            {transactions.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase())).map((t) => (
              <div key={t.id} className="group flex justify-between items-center p-4 hover:bg-purple-50 rounded-2xl transition-all border border-transparent">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{t.type === 'income' ? <ArrowUpRight size={20}/> : <ArrowDownRight size={20}/>}</div>
                  <div><p className="font-bold text-gray-800 text-base">{t.name}</p><div className="flex gap-2 mt-1"><p className="text-[10px] text-gray-400 font-medium">{t.date}</p><span className="text-[10px] bg-purple-100 text-purple-600 px-2 rounded-full font-bold">{t.account}</span></div></div>
                </div>
                <p className={`font-bold text-lg ${t.type === 'income' ? 'text-green-600' : 'text-gray-800'}`}>{t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md p-8 rounded-[40px] shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-gray-400 hover:text-gray-600"><X size={24}/></button>
            <h3 className="text-2xl font-bold text-gray-800 mb-6 tracking-tight">Deduct Expense</h3>
            <div className="flex flex-col gap-5">
              <select className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-bold text-gray-700 border-2 border-transparent focus:border-purple-200 transition-all" value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)}>
                {accounts.map(acc => <option key={acc.name} value={acc.name}>{acc.name}</option>)}
              </select>
              <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="Expense Name" className="w-full p-5 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-purple-200 transition-all" />
              <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="Amount (₹)" className="w-full p-5 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-purple-200 transition-all" />
              <button onClick={handleSave} className="bg-[#7C3AED] text-white p-5 rounded-2xl font-bold mt-4 shadow-xl active:scale-95 transition-all">Confirm Payment</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}