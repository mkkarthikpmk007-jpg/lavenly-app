"use client";
import React, { useState, useMemo } from 'react';
import { LayoutDashboard, Wallet, Plus, ArrowUpRight, ArrowDownRight, X, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';

interface Transaction {
  id: number;
  name: string;
  date: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
}

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [totalBalance, setTotalBalance] = useState(45500);
  const [totalExpenses, setTotalExpenses] = useState(8240);
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 1, name: 'Adobe Subscription', date: '02 Mar 2026', amount: 1200, type: 'expense', category: 'Software' },
    { id: 2, name: 'Freelance Payment', date: '01 Mar 2026', amount: 25000, type: 'income', category: 'Income' },
  ]);

  const chartData = useMemo(() => [
    { name: 'Sat', value: 400 }, { name: 'Sun', value: 300 }, { name: 'Mon', value: 500 },
    { name: 'Tue', value: 200 }, { name: 'Wed', value: 600 }, { name: 'Thu', value: 400 },
    { name: 'Fri', value: totalExpenses / 10 },
  ], [totalExpenses]);

  const handleSave = () => {
    if (!name || !amount) return;
    const numAmount = parseFloat(amount);
    const newTransaction: Transaction = {
      id: Date.now(),
      name,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      amount: numAmount,
      type: 'expense',
      category: 'Expense'
    };
    setTransactions([newTransaction, ...transactions]);
    setTotalBalance(prev => prev - numAmount);
    setTotalExpenses(prev => prev + numAmount);
    setIsModalOpen(false);
    setName(''); setAmount('');
  };

  return (
    <main className="flex min-h-screen bg-[#F3F0FF] p-4 gap-4 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white rounded-[32px] p-6 flex flex-col shadow-sm">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-[#7C3AED] rounded-xl flex items-center justify-center text-white font-bold text-xl">L</div>
          <h1 className="text-2xl font-bold text-gray-800">Lavenly</h1>
        </div>
        <nav className="flex-1 text-gray-400 font-semibold text-sm">
          <div className="flex items-center gap-4 p-4 rounded-2xl mb-2 bg-[#7C3AED] text-white shadow-md cursor-pointer"><LayoutDashboard size={20}/> Dashboard</div>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2">
        <header className="flex justify-between items-center bg-white p-6 rounded-[32px] shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Welcome back, Mapla!</h2>
          <button onClick={() => setIsModalOpen(true)} className="bg-[#7C3AED] text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold hover:scale-105 transition-all">
            <Plus size={20}/> Add Transaction
          </button>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-[#7C3AED] p-8 rounded-[32px] shadow-xl text-white">
             <p className="opacity-80 text-sm font-medium">Total Balance</p>
             <h3 className="text-3xl font-bold mt-2">₹ {totalBalance.toLocaleString()}</h3>
          </div>
          <div className="bg-white p-8 rounded-[32px] shadow-sm">
             <p className="text-gray-400 text-sm font-semibold mb-2">Expenses</p>
             <h3 className="text-3xl font-bold text-gray-800">₹ {totalExpenses.toLocaleString()}</h3>
          </div>
          <div className="bg-white p-8 rounded-[32px] shadow-sm">
             <p className="text-gray-400 text-sm font-semibold mb-2">Savings</p>
             <h3 className="text-3xl font-bold text-gray-800">₹ 12,500</h3>
          </div>
        </div>

        {/* Weekly Activity Section - Ippo ithu dashboard-kulla fixed-ah irukkum */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm min-h-[300px]">
          <h3 className="font-bold text-xl text-gray-800 mb-6">Weekly Activity</h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" radius={[10, 10, 10, 10]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 4 ? '#7C3AED' : '#E5E7EB'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transactions Section */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm">
          <h3 className="font-bold text-xl text-gray-800 mb-6">Recent Transactions</h3>
          <div className="flex flex-col gap-4">
            {transactions.map((t) => (
              <div key={t.id} className="flex justify-between items-center p-4 hover:bg-purple-50 rounded-2xl transition-all">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {t.type === 'income' ? <ArrowUpRight size={20}/> : <ArrowDownRight size={20}/>}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.date}</p>
                  </div>
                </div>
                <p className={`font-bold text-lg ${t.type === 'income' ? 'text-green-600' : 'text-gray-800'}`}>
                  {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal - Same as before */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md p-8 rounded-[40px] shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-gray-400"><X size={24}/></button>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">New Expense</h3>
            <div className="flex flex-col gap-5">
              <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="Expense Name" className="w-full p-5 bg-gray-50 rounded-2xl outline-none" />
              <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="Amount (₹)" className="w-full p-5 bg-gray-50 rounded-2xl outline-none" />
              <button onClick={handleSave} className="bg-[#7C3AED] text-white p-5 rounded-2xl font-bold shadow-xl">Save Transaction</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}