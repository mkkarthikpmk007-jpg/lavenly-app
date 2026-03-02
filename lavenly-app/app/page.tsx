"use client";
import React, { useState } from 'react';
import { LayoutDashboard, Wallet, PieChart, Plus, ArrowUpRight, ArrowDownRight, X, Trash2 } from 'lucide-react';

// Transaction object structure-ah define pannuvom
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
  
  // States for Balance and Expenses
  const [totalBalance, setTotalBalance] = useState(45500);
  const [totalExpenses, setTotalExpenses] = useState(8240);

  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 1, name: 'Adobe Subscription', date: '02 Mar 2026', amount: 1200, type: 'expense', category: 'Software' },
    { id: 2, name: 'Freelance Payment', date: '01 Mar 2026', amount: 25000, type: 'income', category: 'Income' },
  ]);

  const handleSave = () => {
    if (!name || !amount) return alert("Perum amount-um type pannunga mapla!");
    
    const numAmount = parseFloat(amount);
    const newTransaction: Transaction = {
      id: Date.now(),
      name: name,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      amount: numAmount,
      type: 'expense',
      category: 'Expense'
    };

    setTransactions([newTransaction, ...transactions]);
    setTotalBalance(prev => prev - numAmount);
    setTotalExpenses(prev => prev + numAmount);

    setIsModalOpen(false);
    setName('');
    setAmount('');
  };

  // Type annotations sethu errors-ah fix pannuvom
  const deleteTransaction = (id: number, amt: number, type: 'income' | 'expense') => {
    setTransactions(transactions.filter(t => t.id !== id));
    if (type === 'expense') {
      setTotalBalance(prev => prev + amt);
      setTotalExpenses(prev => prev - amt);
    } else {
      setTotalBalance(prev => prev - amt);
    }
  };

  return (
    <main className="flex min-h-screen bg-[#F3F0FF] p-4 gap-4 font-sans relative">
      {/* Sidebar */}
      <aside className="w-64 bg-white rounded-[32px] p-6 flex flex-col shadow-sm border border-purple-50">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-[#7C3AED] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-200">L</div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Lavenly</h1>
        </div>
        <nav className="flex-1 text-gray-400 font-semibold text-sm">
          <div className="flex items-center gap-4 p-4 rounded-2xl mb-2 bg-[#7C3AED] text-white shadow-md cursor-pointer transition-all"><LayoutDashboard size={20}/> Dashboard</div>
          <div className="flex items-center gap-4 p-4 rounded-2xl mb-2 hover:bg-purple-50 hover:text-[#7C3AED] cursor-pointer"><Wallet size={20}/> Transactions</div>
          <div className="flex items-center gap-4 p-4 rounded-2xl mb-2 hover:bg-purple-50 hover:text-[#7C3AED] cursor-pointer"><PieChart size={20}/> Analytics</div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-6">
        <header className="flex justify-between items-center bg-white p-6 rounded-[32px] shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Welcome back, Mapla!</h2>
            <p className="text-gray-400 text-sm italic">Lavenly: Smart Tracking active.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-[#7C3AED] text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold shadow-lg shadow-purple-200 hover:scale-105 transition-all">
            <Plus size={20}/> Add Transaction
          </button>
        </header>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-[#7C3AED] p-8 rounded-[32px] shadow-xl text-white relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
            <p className="opacity-80 text-sm font-medium">Total Balance</p>
            <h3 className="text-3xl font-bold mt-2 text-white">₹ {totalBalance.toLocaleString()}</h3>
          </div>
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-purple-50">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-100 text-red-600 rounded-lg"><ArrowDownRight size={20}/></div>
              <p className="text-gray-400 text-sm font-semibold">Expenses</p>
            </div>
            <h3 className="text-3xl font-bold text-gray-800">₹ {totalExpenses.toLocaleString()}</h3>
          </div>
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-purple-50">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 text-green-600 rounded-lg"><ArrowUpRight size={20}/></div>
              <p className="text-gray-400 text-sm font-semibold">Savings</p>
            </div>
            <h3 className="text-3xl font-bold text-gray-800">₹ 12,500</h3>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm flex-1 overflow-auto">
          <h3 className="font-bold text-xl text-gray-800 mb-6">Recent Transactions</h3>
          <div className="flex flex-col gap-4">
            {transactions.map((t) => (
              <div key={t.id} className="group flex justify-between items-center p-4 hover:bg-purple-50 rounded-2xl transition-all border border-transparent hover:border-purple-100 cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {t.type === 'income' ? <ArrowUpRight size={20}/> : <ArrowDownRight size={20}/>}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-base">{t.name}</p>
                    <p className="text-xs text-gray-400 font-medium">{t.date} • {t.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <p className={`font-bold text-lg ${t.type === 'income' ? 'text-green-600' : 'text-gray-800'}`}>
                    {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                  </p>
                  <button onClick={() => deleteTransaction(t.id, t.amount, t.type)} className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={18}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* POPUP MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md p-8 rounded-[40px] shadow-2xl relative border border-purple-100">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-gray-400 hover:text-gray-600"><X size={24}/></button>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">New Expense</h3>
            <p className="text-gray-400 text-sm mb-8 font-medium">Add your Lavenly transaction details below.</p>
            <div className="flex flex-col gap-5">
              <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="Expense Name" className="w-full p-5 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-purple-200 transition-all font-medium" />
              <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="Amount (₹)" className="w-full p-5 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-purple-200 transition-all font-medium" />
              <button onClick={handleSave} className="bg-[#7C3AED] text-white p-5 rounded-2xl font-bold mt-4 shadow-xl shadow-purple-200 hover:bg-[#6D28D9] transition-all text-lg">Save Transaction</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}