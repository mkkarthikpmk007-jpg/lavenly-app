{/* Main Content Area */}
<div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
  
  {/* Header Section */}
  <header className="flex justify-between items-center bg-white p-6 rounded-[32px] shadow-sm shrink-0">
    <div>
      <h2 className="text-2xl font-bold text-gray-800">Bank Manager Mode</h2>
      <p className="text-gray-400 text-sm">Tracking {accounts.length} accounts</p>
    </div>
    <button onClick={() => setIsModalOpen(true)} className="bg-[#7C3AED] text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold shadow-lg hover:scale-105 transition-all">
      <Plus size={20}/> Add Transaction
    </button>
  </header>

  {/* Row 1: Net Worth Card & Weekly Activity Chart (Side-by-side) */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 shrink-0">
    {/* Total Stats Card */}
    <div className="bg-[#7C3AED] p-8 rounded-[32px] shadow-xl text-white relative overflow-hidden flex flex-col justify-center min-h-[220px]">
       <div className="absolute top-0 right-0 p-10 opacity-10"><Wallet size={100}/></div>
       <p className="opacity-80 text-sm font-medium tracking-wide">Net Worth (Total Balance)</p>
       <h3 className="text-4xl font-bold mt-2">₹ {totalBalance.toLocaleString()}</h3>
    </div>

    {/* Compact Weekly Activity Chart */}
    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-purple-50 min-h-[220px]">
      <h3 className="font-bold text-lg text-gray-800 mb-4">Weekly Activity</h3>
      <div className="h-[140px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10}} />
            <Tooltip cursor={{fill: 'transparent'}} />
            <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={30}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === 4 ? '#7C3AED' : '#E5E7EB'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>

  {/* Row 2: Recent Transactions */}
  <div className="bg-white p-8 rounded-[32px] shadow-sm border border-purple-50 mb-4">
    {/* ... (Your existing transaction table code) ... */}
  </div>
</div>