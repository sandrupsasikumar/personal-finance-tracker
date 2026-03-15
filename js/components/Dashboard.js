const { useState: useStateDash, useEffect: useEffectDash } = React;

function toMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(key) {
  const [y, m] = key.split('-');
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function prevMonth(key) {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(y, m - 2, 1);
  return toMonthKey(d);
}

function nextMonth(key) {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(y, m, 1);
  return toMonthKey(d);
}

function Dashboard({ username, onLogout }) {
  const [data,           setData]           = useStateDash(() => {
    const d = loadUserData(username);
    if (!d.categoryBudgets) d.categoryBudgets = {};
    return d;
  });
  const [itemName,       setItemName]       = useStateDash('');
  const [price,          setPrice]          = useStateDash('');
  const [category,       setCategory]       = useStateDash('food');
  const [showSettings,   setShowSettings]   = useStateDash(false);
  const [shake,          setShake]          = useStateDash(false);
  const [tab,            setTab]            = useStateDash('recent');
  const [selectedMonth,  setSelectedMonth]  = useStateDash(() => toMonthKey(new Date()));
  const [editingExpense, setEditingExpense] = useStateDash(null);

  useEffectDash(() => { saveUserData(username, data); }, [data]);

  const { budget, income, expenses, categoryBudgets } = data;
  const currentMonth = toMonthKey(new Date());

  const filteredExpenses = expenses.filter(e => e.date.startsWith(selectedMonth));

  const totalSpent = filteredExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const remaining  = budget - totalSpent;
  const savings    = income > 0 ? income - totalSpent : null;
  const pct        = budget > 0 ? (totalSpent / budget) * 100 : 0;
  const recent5    = [...filteredExpenses].reverse().slice(0, 5);

  let statusText, statusColor;
  if      (pct < 50) { statusText = 'Looking good!';    statusColor = 'text-emerald-400'; }
  else if (pct < 80) { statusText = 'Watch your spend'; statusColor = 'text-amber-400';   }
  else               { statusText = 'Budget alert!';    statusColor = 'text-rose-400';    }

  function addExpense(e) {
    e.preventDefault();
    const trimName = itemName.trim();
    const amt = parseFloat(price);
    if (!trimName || isNaN(amt) || amt <= 0) {
      setShake(true); setTimeout(() => setShake(false), 500); return;
    }
    // Use first day of selectedMonth + current time so the expense lands in the right month
    const now = new Date();
    const [sy, sm] = selectedMonth.split('-').map(Number);
    const entryDate = new Date(sy, sm - 1, now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds());
    const entry = { id: Date.now(), name: trimName, amount: amt, category, date: entryDate.toISOString() };
    setData(prev => ({ ...prev, expenses: [...prev.expenses, entry] }));
    setItemName(''); setPrice('');
  }

  function deleteExpense(id) {
    setData(prev => ({ ...prev, expenses: prev.expenses.filter(e => e.id !== id) }));
  }

  function updateExpense(id, fields) {
    setData(prev => ({
      ...prev,
      expenses: prev.expenses.map(e => e.id === id ? { ...e, ...fields } : e)
    }));
    setEditingExpense(null);
  }

  function handleSettingsSave(newBudget, newIncome, newCatBudgets) {
    setData(prev => ({ ...prev, budget: newBudget, income: newIncome, categoryBudgets: newCatBudgets }));
    setShowSettings(false);
  }

  return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col items-center px-4 py-10">

      {/* Header */}
      <div className="w-full max-w-lg flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">SpendCheck</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Hey, <span className="text-indigo-400 font-semibold">{username}</span> 👋
          </p>
        </div>
        <div className="flex items-center gap-3">
          <GearIcon onClick={() => setShowSettings(true)} />
          <button
            onClick={onLogout}
            title="Sign out"
            className="flex items-center gap-1.5 text-slate-500 hover:text-rose-400 transition-colors text-xs font-medium"
          >
            <LogoutIcon /> Sign out
          </button>
        </div>
      </div>

      {/* Month Navigator */}
      <div className="w-full max-w-lg flex items-center justify-between mb-4 px-1">
        <button
          onClick={() => setSelectedMonth(prevMonth(selectedMonth))}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1a1d27] border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 transition-colors text-sm"
        >
          ‹
        </button>
        <span className="text-sm font-semibold text-slate-300">{monthLabel(selectedMonth)}</span>
        <button
          onClick={() => setSelectedMonth(nextMonth(selectedMonth))}
          disabled={selectedMonth >= currentMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1a1d27] border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 transition-colors text-sm disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ›
        </button>
      </div>

      {/* Hero Card */}
      <div className="w-full max-w-lg bg-[#1a1d27] border border-slate-800 rounded-2xl p-6 mb-4 shadow-xl">
        <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mb-1">Remaining Budget</p>
        <p className={`text-5xl sm:text-6xl font-black tracking-tight mb-1 ${remaining < 0 ? 'text-rose-400' : 'text-white'}`}>
          {remaining < 0 ? '-' : ''}${Math.abs(remaining).toFixed(2)}
        </p>
        <p className={`text-sm font-medium mb-5 ${statusColor}`}>{statusText}</p>

        <ProgressBar pct={pct} />
        <div className="flex justify-between mt-1 mb-1">
          <span className="text-xs text-slate-600">0%</span>
          <span className="text-xs text-slate-600">{Math.round(pct)}% used</span>
        </div>

        {/* Stats tiles */}
        <div className={`grid ${income > 0 ? 'grid-cols-3' : 'grid-cols-2'} gap-3 mt-4`}>
          <div className="bg-[#0f1117] rounded-xl p-3">
            <p className="text-xs text-slate-500 mb-0.5">Spent</p>
            <p className="text-white font-bold text-sm">${totalSpent.toFixed(2)}</p>
          </div>
          <div className="bg-[#0f1117] rounded-xl p-3">
            <p className="text-xs text-slate-500 mb-0.5">Budget</p>
            <button
              onClick={() => setShowSettings(true)}
              className="text-white font-bold text-sm hover:text-indigo-400 transition-colors"
            >
              ${budget.toFixed(2)}
            </button>
          </div>
          {income > 0 && (
            <div className="bg-[#0f1117] rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-0.5">
                {savings !== null && savings >= 0 ? '💚 Savings' : '⚠️ Over Income'}
              </p>
              <p className={`font-bold text-sm ${savings !== null && savings < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {savings !== null && savings < 0 ? '-' : ''}${savings !== null ? Math.abs(savings).toFixed(2) : '0.00'}
              </p>
            </div>
          )}
        </div>

        {income > 0 ? (
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-800 pt-3">
            <span>Monthly Income</span>
            <span className="text-slate-300 font-semibold">${income.toFixed(2)}</span>
          </div>
        ) : (
          <button
            onClick={() => setShowSettings(true)}
            className="mt-3 text-xs text-indigo-500 hover:text-indigo-400 transition-colors"
          >
            + Set monthly income →
          </button>
        )}
      </div>

      {/* Add Expense Card */}
      <div className="w-full max-w-lg bg-[#1a1d27] border border-slate-800 rounded-2xl p-6 mb-4 shadow-xl">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Add Expense</h2>
        <form onSubmit={addExpense} className={`space-y-4 ${shake ? 'shake' : ''}`}>
          <div className="grid grid-cols-2 gap-3">
            <InputField placeholder="Item name (e.g. Coffee)" value={itemName} onChange={e => setItemName(e.target.value)} />
            <InputField prefix="$" type="number" placeholder="0.00" value={price} onChange={e => setPrice(e.target.value)} />
          </div>
          <CategoryPicker value={category} onChange={setCategory} />
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-bold rounded-xl py-3.5 transition-all text-sm tracking-wide"
          >
            + Add Expense
          </button>
        </form>
      </div>

      {/* History / Breakdown / Trends Card */}
      <div className="w-full max-w-lg bg-[#1a1d27] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex bg-[#0f1117] rounded-lg p-1 gap-1">
            {[['recent', 'Recent'], ['breakdown', 'By Category'], ['trends', 'Trends']].map(([id, lbl]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  tab === id ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>
          {tab !== 'trends' && filteredExpenses.length > 0 && (
            <span className="text-xs text-slate-600">{filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        {tab === 'recent' ? (
          recent5.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-600 text-sm">No expenses yet.</p>
              <p className="text-slate-700 text-xs mt-1">Add your first one above!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recent5.map(exp => (
                <ExpenseRow key={exp.id} expense={exp} onDelete={deleteExpense} onEdit={setEditingExpense} />
              ))}
            </div>
          )
        ) : tab === 'breakdown' ? (
          <CategoryBreakdown expenses={filteredExpenses} categoryBudgets={categoryBudgets} />
        ) : (
          <TrendsChart expenses={expenses} selectedMonth={selectedMonth} />
        )}
      </div>

      <p className="text-slate-700 text-xs mt-8">Data saved locally · {username}'s private account</p>

      {showSettings && (
        <SettingsModal
          budget={budget}
          income={income}
          categoryBudgets={categoryBudgets || {}}
          onSave={handleSettingsSave}
          onClose={() => setShowSettings(false)}
        />
      )}

      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          onSave={updateExpense}
          onClose={() => setEditingExpense(null)}
        />
      )}
    </div>
  );
}

window.Dashboard = Dashboard;
