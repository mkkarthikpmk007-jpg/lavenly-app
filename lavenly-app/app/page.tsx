"use client";
import React, { useState } from 'react';
import { LayoutDashboard, Wallet, PieChart, Plus, ArrowUpRight, ArrowDownRight, X, Trash2 } from 'lucide-react';
// Chart-kku thevaiyana components-ah import pannuvom
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';

// Intha data thaan graph-la theriyum
const chartData = [
  { name: 'Sat', value: 400 }, { name: 'Sun', value: 300 }, { name: 'Mon', value: 500 },
  { name: 'Tue', value: 200 }, { name: 'Wed', value: 600 }, { name: 'Thu', value: 400 },
  { name: 'Fri', value: 700 },
];

export default function Home() {
  // ... (pazhaya state and handleSave logic ippadiye irukkattum)

  return (
    <main className="flex min-h-screen bg-[#F3F0FF] p-4 gap-4 font-sans relative">
      {/* Sidebar - pazhaya code */}
      {/* ... */}

      <div className="flex-1 flex flex-col gap-6">
        {/* Header and Stats Cards - pazhaya code */}
        {/* ... */}

        {/* --- PUTHU GRAPH SECTION --- */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm h-[300px]">
          <h3 className="font-bold text-xl text-gray-800 mb-4">Weekly Activity</h3>
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

        {/* Transactions Table - pazhaya code */}
        {/* ... */}
      </div>
    </main>
  );
}