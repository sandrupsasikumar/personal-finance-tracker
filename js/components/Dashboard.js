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

function Dashboard({ username, onLogout, onUsernameChange, onOpenSplitter }) {
  const [data,            setData]            = useStateDash(() => {
    const d = loadUserData(username);
    if (!d.categoryBudgets)  d.categoryBudgets  = {};
    if (!d.recurring)         d.recurring         = [];
    if (!d.recurringApplied)  d.recurringApplied  = {};
    if (d.name === undefined)  d.name             = '';
    return d;
  });
  const [itemName,        setItemName]        = useStateDash('');
  const [price,           setPrice]           = useStateDash('');
  const [category,        setCategory]        = useStateDash('food');
  const [showSettings,    setShowSettings]    = useStateDash(false);
  const [shake,           setShake]           = useStateDash(false);
  const [tab,             setTab]             = useStateDash('recent');
  const [selectedMonth,   setSelectedMonth]   = useStateDash(() => toMonthKey(new Date()));
  const [editingExpense,  setEditingExpense]  = useStateDash(null);
  const [showRecurring,   setShowRecurring]   = useStateDash(false);
  const [searchQuery,     setSearchQuery]     = useStateDash('');
  const [showAllExpenses, setShowAllExpenses] = useStateDash(false);
  const [nudgeDismissed,  setNudgeDismissed]  = useStateDash(false);
  const [notes,           setNotes]           = useStateDash('');
  const [showAccount,     setShowAccount]     = useStateDash(false);

  useEffectDash(() => { saveUserData(username, data); }, [data]);

  const { budget, income, expenses, categoryBudgets, recurring, recurringApplied } = data;
  const currentMonth = toMonthKey(new Date());

  const filteredExpenses = expenses.filter(e => e.date.startsWith(selectedMonth));

  const totalSpent = filteredExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const remaining  = budget - totalSpent;
  const savings    = income > 0 ? income - totalSpent : null;
  const pct        = budget > 0 ? (totalSpent / budget) * 100 : 0;

  // Budget forecast (current month only)
  let forecast = null;
  if (selectedMonth === currentMonth && filteredExpenses.length > 0) {
    const now         = new Date();
    const dayOfMonth  = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dailyAvg    = totalSpent / dayOfMonth;
    const projected   = Math.round(dailyAvg * daysInMonth * 100) / 100;
    forecast = { projected };
  }

  // Search + show-all logic
  const searchedExpenses = [...filteredExpenses]
    .reverse()
    .filter(e =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (CAT_MAP[e.category]?.label || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  const displayedExpenses = showAllExpenses ? searchedExpenses : searchedExpenses.slice(0, 5);

  let statusText, statusColor;
  if      (pct < 50) { statusText = 'Looking good!';    statusColor = 'text-emerald-400'; }
  else if (pct < 80) { statusText = 'Watch your spend'; statusColor = 'text-amber-400';   }
  else               { statusText = 'Budget alert!';    statusColor = 'text-rose-400';    }

  const showNudge = selectedMonth === currentMonth
    && recurring.length > 0
    && !recurringApplied[selectedMonth]
    && !nudgeDismissed;

  function addExpense(e) {
    e.preventDefault();
    const trimName = itemName.trim();
    const amt = parseFloat(price);
    if (!trimName || isNaN(amt) || amt <= 0) {
      setShake(true); setTimeout(() => setShake(false), 500); return;
    }
    const now = new Date();
    const [sy, sm] = selectedMonth.split('-').map(Number);
    const entryDate = new Date(sy, sm - 1, now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds());
    const entry = { id: Date.now(), name: trimName, amount: amt, category, date: entryDate.toISOString(), notes: notes.trim() };
    setData(prev => ({ ...prev, expenses: [...prev.expenses, entry] }));
    setItemName(''); setPrice(''); setNotes('');
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

  function addRecurringTemplate(template) {
    setData(prev => ({ ...prev, recurring: [...prev.recurring, { ...template, id: Date.now() }] }));
  }

  function deleteRecurringTemplate(id) {
    setData(prev => ({ ...prev, recurring: prev.recurring.filter(r => r.id !== id) }));
  }

  function applyRecurring(month) {
    const [sy, sm] = month.split('-').map(Number);
    const baseTime = new Date(sy, sm - 1, 1).getTime();
    const entries = recurring.map((r, i) => ({
      id: baseTime + i,
      name: r.name,
      amount: r.amount,
      category: r.category,
      date: new Date(sy, sm - 1, 1).toISOString(),
      fromRecurring: true,
    }));
    setData(prev => ({
      ...prev,
      expenses: [...prev.expenses, ...entries],
      recurringApplied: { ...prev.recurringApplied, [month]: true },
    }));
    setShowRecurring(false);
    setNudgeDismissed(true);
  }

  function exportCSV() {
    const rows = [['Date', 'Name', 'Amount', 'Category', 'Notes']];
    [...filteredExpenses]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .forEach(e => {
        const cat  = CAT_MAP[e.category]?.label || e.category;
        const date = new Date(e.date).toLocaleDateString('en-US');
        rows.push([date, e.name, Number(e.amount).toFixed(2), cat, e.notes || '']);
      });
    const csv  = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `spendcheck-${selectedMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleAccountSave({ name, email, newUsername, newPw }) {
    // 1. Update display name in user data
    setData(prev => ({ ...prev, name }));
    // 2. Update email in user registry
    updateUserEmail(username, email);
    // 3. Handle password change (must happen before username rename)
    if (newPw) {
      changePassword(username, hashPw(newPw));
    }
    // 4. Handle username change last (renames data key + session)
    if (newUsername !== username) {
      changeUsername(username, newUsername);
      onUsernameChange(newUsername);
    }
    setShowAccount(false);
  }

  function changeMonth(key) {
    setSelectedMonth(key);
    setShowAllExpenses(false);
    setSearchQuery('');
    setNudgeDismissed(false);
  }

  return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col items-center px-4 py-10">

      {/* Header */}
      <div className="w-full max-w-lg flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">SpendCheck</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Hey, <span className="text-indigo-400 font-semibold">{data.name || username}</span> 👋
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-[#0f1117] border border-slate-800 rounded-lg p-1 gap-1">
            <span className="px-3 py-1.5 rounded-md text-xs font-semibold bg-indigo-600 text-white">Budget</span>
            <button
              onClick={onOpenSplitter}
              className="px-3 py-1.5 rounded-md text-xs font-semibold text-slate-500 hover:text-slate-300 transition-all"
            >Split</button>
          </div>
          <button
            onClick={() => setShowAccount(true)}
            title="Account"
            className="text-slate-400 hover:text-white transition-colors"
          >
            <PersonIcon />
          </button>
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
          onClick={() => changeMonth(prevMonth(selectedMonth))}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1a1d27] border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 transition-colors text-sm"
        >
          ‹
        </button>
        <span className="text-sm font-semibold text-slate-300">{monthLabel(selectedMonth)}</span>
        <button
          onClick={() => changeMonth(nextMonth(selectedMonth))}
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

        {forecast && (
          <div className={`mt-3 flex items-center justify-between text-xs rounded-lg px-3 py-2 ${
            forecast.projected <= budget
              ? 'bg-emerald-950/40 text-emerald-400'
              : forecast.projected <= budget * 1.2
              ? 'bg-amber-950/40 text-amber-400'
              : 'bg-rose-950/40 text-rose-400'
          }`}>
            <span>📈 Projected this month</span>
            <span className="font-semibold">${forecast.projected.toFixed(2)}</span>
          </div>
        )}

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

      {/* Recurring nudge banner */}
      {showNudge && (
        <div className="w-full max-w-lg bg-[#1a1d27] border border-indigo-900/60 rounded-2xl px-4 py-3 mb-4 flex items-center justify-between gap-3">
          <p className="text-sm text-slate-300">
            🔁 <span className="font-medium">{recurring.length}</span> recurring expense{recurring.length !== 1 ? 's' : ''} — apply to {monthLabel(selectedMonth)}?
          </p>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => applyRecurring(selectedMonth)}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Apply
            </button>
            <button
              onClick={() => setNudgeDismissed(true)}
              className="text-slate-600 hover:text-slate-400 transition-colors text-base leading-none"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Add Expense Card */}
      <div className="w-full max-w-lg bg-[#1a1d27] border border-slate-800 rounded-2xl p-6 mb-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Add Expense</h2>
          <button
            onClick={() => setShowRecurring(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-indigo-400 transition-colors"
          >
            🔁 Recurring{recurring.length > 0 && <span className="text-indigo-500">({recurring.length})</span>}
          </button>
        </div>
        <form onSubmit={addExpense} className={`space-y-4 ${shake ? 'shake' : ''}`}>
          <div className="grid grid-cols-2 gap-3">
            <InputField placeholder="Item name (e.g. Coffee)" value={itemName} onChange={e => setItemName(e.target.value)} />
            <InputField prefix="$" type="number" placeholder="0.00" value={price} onChange={e => setPrice(e.target.value)} />
          </div>
          <CategoryPicker value={category} onChange={setCategory} />
          <input
            type="text"
            placeholder="Notes (optional)"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full bg-[#0f1117] border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
          />
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
            <div className="flex items-center gap-3">
              <button
                onClick={exportCSV}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                title="Export to CSV"
              >
                ↓ CSV
              </button>
              <span className="text-xs text-slate-600">{filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {tab === 'recent' ? (
          <div>
            {/* Search bar */}
            {filteredExpenses.length > 0 && (
              <div className="relative mb-3">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-xs pointer-events-none">🔍</span>
                <input
                  type="text"
                  placeholder="Search expenses…"
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setShowAllExpenses(false); }}
                  className="w-full bg-[#0f1117] border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-slate-600 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors text-base leading-none"
                  >
                    &times;
                  </button>
                )}
              </div>
            )}

            {searchedExpenses.length === 0 ? (
              <div className="text-center py-8">
                {searchQuery ? (
                  <p className="text-slate-600 text-sm">No results for "{searchQuery}".</p>
                ) : (
                  <>
                    <p className="text-slate-600 text-sm">No expenses yet.</p>
                    <p className="text-slate-700 text-xs mt-1">Add your first one above!</p>
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {displayedExpenses.map(exp => (
                    <ExpenseRow key={exp.id} expense={exp} onDelete={deleteExpense} onEdit={setEditingExpense} />
                  ))}
                </div>
                {searchedExpenses.length > 5 && (
                  <button
                    onClick={() => setShowAllExpenses(p => !p)}
                    className="mt-3 w-full text-xs text-slate-500 hover:text-slate-300 transition-colors py-2 border-t border-slate-800"
                  >
                    {showAllExpenses
                      ? 'Show less ↑'
                      : `Show all ${searchedExpenses.length} expenses ↓`}
                  </button>
                )}
              </>
            )}
          </div>
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

      {showAccount && (
        <AccountModal
          username={username}
          userData={data}
          onSave={handleAccountSave}
          onClose={() => setShowAccount(false)}
        />
      )}

      {showRecurring && (
        <RecurringModal
          recurring={recurring}
          recurringApplied={recurringApplied}
          selectedMonth={selectedMonth}
          onAddTemplate={addRecurringTemplate}
          onDeleteTemplate={deleteRecurringTemplate}
          onApply={applyRecurring}
          onClose={() => setShowRecurring(false)}
        />
      )}
    </div>
  );
}

window.Dashboard = Dashboard;
