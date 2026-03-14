"use client";
import React, { useState, useMemo } from 'react';
import { LayoutDashboard, Wallet, Plus, ArrowUpRight, ArrowDownRight, X, Trash2, Search, CreditCard } from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';

// Accounts interface
interface Account {
  id: string;
  name: string;
  balance: number;
  color: string;
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('SBI');

  // Bank Accounts State
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

  const handleSave = () => {
    if (!name || !amount) return;
    const numAmount = parseFloat(amount);
    
    // Update the specific bank balance
    setAccounts(accounts.map(acc => 
      acc.name === selectedAccount ? { ...acc, balance: acc.balance - numAmount } : acc
    ));

    const newTransaction = {
      id: Date.now(),
      name,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      amount: numAmount,
      type: 'expense' as const,
      account: selectedAccount
    };

    setTransactions([newTransaction, ...transactions]);
    setIsModalOpen(false);
    setName(''); setAmount('');
  };

  return (
    <main className="flex min-h-screen bg-[#F3F0FF] p-4 gap-4 font-sans overflow-hidden">
      {/* Sidebar with Bank Accounts */}
      <aside className="w-72 bg-white rounded-[32px] p-6 flex flex-col shadow-sm border border-purple-50">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-[#7C3AED] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">L</div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Lavenly</h1>
        </div>
        
        <p className="text-gray-400 text-xs font-bold uppercase mb-4 px-2">My Accounts</p>
        <div className="flex flex-col gap-3 mb-10">
          {accounts.map(acc => (
            <div key={acc.id} className={`${acc.color} p-4 rounded-2xl text-white shadow-md transform hover:scale-105 transition-all cursor-pointer`}>
              <div className="flex justify-between items-start mb-2">
                <CreditCard size={18} className="opacity-80"/>
                <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Debit</span>
              </div>
              <p className="text-xs opacity-80">{acc.name}</p>
              <p className="text-lg font-bold">₹ {acc.balance.toLocaleString()}</p>
            </div>
          ))}
        </div>

        <nav className="flex-1 text-gray-400 font-semibold text-sm">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#7C3AED] text-white shadow-md"><LayoutDashboard size={20}/> Dashboard</div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
        <header className="flex justify-between items-center bg-white p-6 rounded-[32px] shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Bank Manager Mode</h2>
            <p className="text-gray-400 text-sm">Tracking {accounts.length} accounts</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-[#7C3AED] text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold shadow-lg hover:scale-105 transition-all">
            <Plus size={20}/> Add Transaction
          </button>
        </header>

        {/* Total Stats Card */}
        <div className="bg-[#7C3AED] p-8 rounded-[32px] shadow-xl text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 p-10 opacity-10"><Wallet size={120}/></div>
           <p className="opacity-80 text-sm font-medium tracking-wide text-white/80">Net Worth (Total Balance)</p>
           <h3 className="text-4xl font-bold mt-2">₹ {totalBalance.toLocaleString()}</h3>
        </div>

        {/* Transactions with Bank Tag */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm flex-1 border border-purple-50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl text-gray-800">Recent Transactions</h3>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-gray-50 p-2 pl-8 rounded-xl outline-none text-sm border border-transparent focus:border-purple-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-2 top-2.5 text-gray-400" size={16}/>
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            {transactions.map((t) => (
              <div key={t.id} className="group flex justify-between items-center p-4 hover:bg-purple-50 rounded-2xl transition-all border border-transparent">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {t.type === 'income' ? <ArrowUpRight size={20}/> : <ArrowDownRight size={20}/>}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-base">{t.name}</p>
                    <div className="flex gap-2 mt-1">
                      <p className="text-[10px] text-gray-400 font-medium">{t.date}</p>
                      <span className="text-[10px] bg-purple-100 text-purple-600 px-2 rounded-full font-bold">{t.account}</span>
                    </div>
                  </div>
                </div>
                <p className={`font-bold text-lg ${t.type === 'income' ? 'text-green-600' : 'text-gray-800'}`}>
                  -₹{t.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal with Account Selector */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md p-8 rounded-[40px] shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-gray-400"><X size={24}/></button>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Deduct from Account</h3>
            <div className="flex flex-col gap-5">
              <select 
                className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-bold text-gray-700"
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
              >
                {accounts.map(acc => <option key={acc.name} value={acc.name}>{acc.name}</option>)}
              </select>
              <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="What did you buy?" className="w-full p-5 bg-gray-50 rounded-2xl outline-none" />
              <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="Amount (₹)" className="w-full p-5 bg-gray-50 rounded-2xl outline-none" />
              <button onClick={handleSave} className="bg-[#7C3AED] text-white p-5 rounded-2xl font-bold mt-4 shadow-xl">Confirm Payment</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}