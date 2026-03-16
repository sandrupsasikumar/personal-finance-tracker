const { useState: useStateSplitter, useEffect: useEffectSplitter } = React;

// ── Add / Edit Expense Modal ───────────────────────────────────
function AddExpenseModal({ group, onSave, onClose, initialValues }) {
  const { useState: useStateExp } = React;
  const todayStr = new Date().toISOString().slice(0, 10);

  const equalShare = amt => {
    const share = Math.floor((amt / group.members.length) * 100) / 100;
    const splits = {};
    let remaining = amt;
    group.members.forEach((m, i) => {
      if (i === group.members.length - 1) {
        splits[m] = Math.round(remaining * 100) / 100;
      } else {
        splits[m] = share;
        remaining -= share;
      }
    });
    return splits;
  };

  const initSplits = () => {
    if (initialValues) {
      const s = {};
      group.members.forEach(m => { s[m] = initialValues.splits[m] !== undefined ? initialValues.splits[m] : ''; });
      return s;
    }
    const s = {};
    group.members.forEach(m => { s[m] = ''; });
    return s;
  };

  const [title,  setTitle]  = useStateExp(initialValues ? initialValues.title : '');
  const [date,   setDate]   = useStateExp(initialValues ? initialValues.date.slice(0, 10) : todayStr);
  const [amount, setAmount] = useStateExp(initialValues ? String(initialValues.amount) : '');
  const [paidBy, setPaidBy] = useStateExp(initialValues ? initialValues.paidBy : (group.members[0] || ''));
  const [splits, setSplits] = useStateExp(initSplits);
  const [error,  setError]  = useStateExp('');

  const isEditing = !!initialValues;

  const numAmount = parseFloat(amount) || 0;
  const splitSum  = Object.values(splits).reduce((s, v) => s + (parseFloat(v) || 0), 0);
  const diff      = Math.abs(splitSum - numAmount);
  const splitsOk  = numAmount > 0 && diff < 0.01;

  function handleAmountChange(val) {
    setAmount(val);
    const n = parseFloat(val) || 0;
    if (n > 0) setSplits(equalShare(n));
  }

  function handleSplitEqually() {
    if (numAmount > 0) setSplits(equalShare(numAmount));
  }

  function updateSplit(member, val) {
    setSplits(prev => ({ ...prev, [member]: val }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!title.trim())    return setError('Please enter an expense name.');
    if (numAmount <= 0)   return setError('Please enter a valid amount.');
    if (!paidBy)          return setError('Please select who paid.');
    if (!splitsOk)        return setError(`Splits must sum to $${numAmount.toFixed(2)} (currently $${splitSum.toFixed(2)}).`);

    const finalSplits = {};
    group.members.forEach(m => { finalSplits[m] = parseFloat(splits[m]) || 0; });

    onSave({
      id:     initialValues ? initialValues.id : Date.now(),
      title:  title.trim(),
      date:   new Date(date).toISOString(),
      paidBy,
      amount: numAmount,
      splits: finalSplits,
    });
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#1a1d27] border border-slate-700/50 rounded-2xl p-6 w-full max-w-sm shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold text-white">{isEditing ? 'Edit Expense' : 'Add Expense'}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors text-xl leading-none">&times;</button>
        </div>
        <p className="text-slate-400 text-xs mb-5">{group.name}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-[#0f1117] border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Expense Name</label>
            <input
              type="text"
              placeholder="e.g. Dinner, Hotel, Uber"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus={!isEditing}
              className="w-full bg-[#0f1117] border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Total Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none">$</span>
              <input
                type="number"
                placeholder="0.00"
                min="0"
                step="any"
                value={amount}
                onChange={e => handleAmountChange(e.target.value)}
                className="w-full bg-[#0f1117] border border-slate-700 rounded-xl pl-7 pr-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Paid by</label>
            <select
              value={paidBy}
              onChange={e => setPaidBy(e.target.value)}
              className="w-full bg-[#0f1117] border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
            >
              {group.members.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-slate-400">Split</label>
              <button
                type="button"
                onClick={handleSplitEqually}
                className="text-xs text-indigo-500 hover:text-indigo-400 transition-colors font-medium"
              >
                Split equally
              </button>
            </div>
            <div className="space-y-2">
              {group.members.map(m => (
                <div key={m} className="flex items-center gap-2">
                  <span className="flex-1 text-sm text-white truncate">{m}</span>
                  <div className="relative w-28 flex-shrink-0">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs pointer-events-none">$</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="any"
                      value={splits[m]}
                      onChange={e => updateSplit(m, e.target.value)}
                      className="w-full bg-[#0f1117] border border-slate-700 rounded-xl pl-6 pr-2 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>
              ))}
            </div>
            {numAmount > 0 && (
              <div className={`mt-2 flex items-center text-xs px-1 ${splitsOk ? 'text-emerald-500' : 'text-amber-400'}`}>
                <span>{splitsOk ? '✓ Splits match total' : `Sum: $${splitSum.toFixed(2)} · needs $${numAmount.toFixed(2)}`}</span>
              </div>
            )}
          </div>

          {error && <p className="text-rose-400 text-xs font-medium">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl py-3 font-semibold transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={numAmount > 0 && !splitsOk}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl py-3 font-semibold transition-colors text-sm"
            >
              {isEditing ? 'Save Changes' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Settlement plan helper ─────────────────────────────────────
function getSettlementPlan(group) {
  const net = {};
  group.members.forEach(m => { net[m] = 0; });
  group.expenses.forEach(exp => {
    group.members.forEach(m => {
      if (exp.paidBy === m) net[m] += exp.amount - (exp.splits[m] || 0);
      else net[m] -= (exp.splits[m] || 0);
    });
  });
  const creditors = group.members.filter(m => net[m] > 0.005).map(m => ({ name: m, amount: net[m] }));
  const debtors   = group.members.filter(m => net[m] < -0.005).map(m => ({ name: m, amount: -net[m] }));
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);
  const transactions = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(debtors[i].amount, creditors[j].amount);
    transactions.push({ from: debtors[i].name, to: creditors[j].name, amount: Math.round(amount * 100) / 100 });
    debtors[i].amount -= amount;
    creditors[j].amount -= amount;
    if (debtors[i].amount < 0.005) i++;
    if (creditors[j].amount < 0.005) j++;
  }
  return transactions;
}

// ── SplitterPage ───────────────────────────────────────────────
function SplitterPage({ username, onBack, onLogout, onUsernameChange }) {
  const [groups,             setGroups]             = useStateSplitter(() => {
    const d = loadUserData(username);
    return d.groups || [];
  });
  const [showCreateGroup,    setShowCreateGroup]    = useStateSplitter(false);
  const [addExpenseForGroup, setAddExpenseForGroup] = useStateSplitter(null);
  const [editingExpense,     setEditingExpense]     = useStateSplitter(null); // { groupId, expense }
  const [groupTabs,          setGroupTabs]          = useStateSplitter({});
  const [collapsedGroups,    setCollapsedGroups]    = useStateSplitter({});
  const [confirmDelete,      setConfirmDelete]      = useStateSplitter(null);
  const [showAccount,        setShowAccount]        = useStateSplitter(false);
  const [showSettings,       setShowSettings]       = useStateSplitter(false);

  useEffectSplitter(() => {
    const d = loadUserData(username);
    saveUserData(username, { ...d, groups });
  }, [groups]);

  function getTab(groupId) { return groupTabs[groupId] || 'owed'; }
  function setTab(groupId, tab) { setGroupTabs(prev => ({ ...prev, [groupId]: tab })); }
  function isCollapsed(id) { return collapsedGroups[id] || false; }
  function toggleCollapsed(id) { setCollapsedGroups(prev => ({ ...prev, [id]: !prev[id] })); }

  function handleCreateGroup(group) {
    setGroups(prev => [group, ...prev]);
    setShowCreateGroup(false);
  }

  function handleAddExpense(groupId, expense) {
    setGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, expenses: [...g.expenses, expense] } : g
    ));
    setAddExpenseForGroup(null);
  }

  function handleEditExpense(groupId, updatedExpense) {
    setGroups(prev => prev.map(g =>
      g.id === groupId
        ? { ...g, expenses: g.expenses.map(e => e.id === updatedExpense.id ? updatedExpense : e) }
        : g
    ));
    setEditingExpense(null);
  }

  function handleDeleteExpense(groupId, expenseId) {
    setGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, expenses: g.expenses.filter(e => e.id !== expenseId) } : g
    ));
  }

  function handleDeleteGroup(groupId) {
    setGroups(prev => prev.filter(g => g.id !== groupId));
    setConfirmDelete(null);
  }

  function handleSettleGroup(groupId) {
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, settled: true } : g));
  }

  function handleUnsettleGroup(groupId) {
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, settled: false } : g));
  }

  function handleSetMyName(groupId, myName) {
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, myName } : g));
  }

  function handleAccountSave({ name, email, newUsername, newPw }) {
    const d = loadUserData(username);
    saveUserData(username, { ...d, name, email });
    if (newUsername && newUsername !== username) {
      changeUsername(username, newUsername);
      onUsernameChange(newUsername);
    }
    if (newPw) changePassword(username, newPw);
    setShowAccount(false);
  }

  function handleSettingsSave(newBudget, newIncome, newCatBudgets) {
    const d = loadUserData(username);
    saveUserData(username, { ...d, budget: newBudget, income: newIncome, categoryBudgets: newCatBudgets });
    setShowSettings(false);
  }

  // ── Global "you are owed" ──────────────────────────────────────
  const totalOwedToMe = groups
    .filter(g => !g.settled && g.myName)
    .reduce((total, g) => {
      const net = g.members
        .filter(m => m !== g.myName)
        .reduce((s, m) => {
          const owes = g.expenses.filter(e => e.paidBy === g.myName).reduce((a, e) => a + (e.splits[m] || 0), 0);
          const owed = g.expenses.filter(e => e.paidBy === m).reduce((a, e) => a + (e.splits[g.myName] || 0), 0);
          return s + (owes - owed);
        }, 0);
      return total + Math.max(net, 0);
    }, 0);

  // ── Header ─────────────────────────────────────────────────────
  function Header() {
    return (
      <div className="w-full max-w-2xl flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">SpendCheck</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Hey, <span className="text-indigo-400 font-semibold">{loadUserData(username).name || username}</span> 👋
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-[#0f1117] border border-slate-800 rounded-lg p-1 gap-1">
            <button onClick={onBack} className="px-3 py-1.5 rounded-md text-xs font-semibold text-slate-500 hover:text-slate-300 transition-all">Budget</button>
            <span className="px-3 py-1.5 rounded-md text-xs font-semibold bg-indigo-600 text-white">Split</span>
          </div>
          <button onClick={() => setShowAccount(true)} title="Account" className="text-slate-400 hover:text-white transition-colors"><PersonIcon /></button>
          <GearIcon onClick={() => setShowSettings(true)} />
          <button onClick={onLogout} title="Sign out" className="flex items-center gap-1.5 text-slate-500 hover:text-rose-400 transition-colors text-xs font-medium"><LogoutIcon /> Sign out</button>
        </div>
      </div>
    );
  }

  // ── Group card ─────────────────────────────────────────────────
  function GroupCard({ group }) {
    const tab = getTab(group.id);
    const collapsed = isCollapsed(group.id);

    const groupTotal = group.expenses.reduce((s, e) => s + e.amount, 0);

    function getMemberBalance(member) {
      if (!group.myName || member === group.myName) return null;
      const owes = group.expenses.filter(e => e.paidBy === group.myName).reduce((s, e) => s + (e.splits[member] || 0), 0);
      const owed = group.expenses.filter(e => e.paidBy === member).reduce((s, e) => s + (e.splits[group.myName] || 0), 0);
      return owes - owed;
    }

    const otherMembers = group.members.filter(m => m !== group.myName);
    const totalOwed = otherMembers.reduce((s, m) => {
      const b = getMemberBalance(m);
      return s + (b !== null ? Math.max(b, 0) : 0);
    }, 0);

    const sortedExpenses = [...group.expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

    const totalIOweThem = otherMembers.reduce((s, m) => {
      const b = getMemberBalance(m);
      return s + (b !== null && b < -0.005 ? Math.abs(b) : 0);
    }, 0);

    const cardBorderColor = group.settled || !group.myName
      ? 'border-l-slate-700'
      : totalOwed > 0.005
        ? 'border-l-emerald-500'
        : totalIOweThem > 0.005
          ? 'border-l-rose-500'
          : 'border-l-slate-700';

    // Collapsed summary badge
    function CollapsedBadge() {
      if (!group.myName || group.expenses.length === 0) return null;
      if (totalOwed > 0.005) return <span className="text-xs font-semibold text-emerald-400">${totalOwed.toFixed(2)} owed to you</span>;
      const iOwe = otherMembers.reduce((s, m) => { const b = getMemberBalance(m); return s + (b !== null ? Math.min(b, 0) : 0); }, 0);
      if (iOwe < -0.005) return <span className="text-xs font-semibold text-rose-400">you owe ${Math.abs(iOwe).toFixed(2)}</span>;
      return <span className="text-xs font-semibold text-slate-500">all settled</span>;
    }

    return (
      <div className={`bg-[#1a1d27] border border-slate-800 border-l-4 ${cardBorderColor} rounded-2xl shadow-xl transition-opacity ${group.settled ? 'opacity-60' : ''}`}>
        {/* Card header — clickable to collapse */}
        <div
          className="flex items-center justify-between px-5 pt-5 pb-3 cursor-pointer select-none"
          onClick={() => toggleCollapsed(group.id)}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-white">{group.name}</h3>
              {group.settled && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">Settled</span>}
              {collapsed && <CollapsedBadge />}
            </div>
            <div className="flex items-center gap-1 flex-wrap mt-1.5">
              {group.members.map(m => {
                const isMe = m === group.myName;
                return (
                  <span key={m} className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium ${isMe ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-400'}`}>
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${isMe ? 'bg-indigo-500/40' : 'bg-slate-700'}`}>{m[0].toUpperCase()}</span>
                    {m}
                  </span>
                );
              })}
              {group.myName && (
                <button
                  onClick={e => { e.stopPropagation(); handleSetMyName(group.id, ''); }}
                  className="text-slate-600 hover:text-slate-400 transition-colors text-xs ml-0.5"
                >(change me)</button>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {group.expenses.length} expense{group.expenses.length !== 1 ? 's' : ''}
              {groupTotal > 0 && <span> · ${groupTotal.toFixed(2)} total</span>}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-3 flex-shrink-0">
            <button
              onClick={e => { e.stopPropagation(); setConfirmDelete(confirmDelete === group.id ? null : group.id); }}
              className="text-slate-600 hover:text-rose-400 transition-colors p-1"
              title="Delete group"
            >
              <TrashIcon />
            </button>
            <span className={`text-slate-500 text-sm transition-transform duration-200 ${collapsed ? '' : 'rotate-90'}`}>›</span>
          </div>
        </div>

        {/* Collapsed: only show confirm delete if active */}
        {collapsed && confirmDelete === group.id && (
          <div className="mx-5 mb-3 flex gap-2">
            <button onClick={() => setConfirmDelete(null)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl py-2 text-xs font-semibold transition-colors">Cancel</button>
            <button onClick={() => handleDeleteGroup(group.id)} className="flex-1 bg-rose-600 hover:bg-rose-500 text-white rounded-xl py-2 text-xs font-semibold transition-colors">Delete Group</button>
          </div>
        )}

        {/* Expanded content */}
        {!collapsed && (
          <>
            {/* Delete confirm */}
            {confirmDelete === group.id && (
              <div className="mx-5 mb-3 flex gap-2">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl py-2 text-xs font-semibold transition-colors">Cancel</button>
                <button onClick={() => handleDeleteGroup(group.id)} className="flex-1 bg-rose-600 hover:bg-rose-500 text-white rounded-xl py-2 text-xs font-semibold transition-colors">Delete Group</button>
              </div>
            )}

            {/* Tab switcher */}
            <div className="px-5 pb-3">
              <div className="flex bg-[#0f1117] rounded-lg p-1 gap-1 w-fit">
                {[['owed', 'Money Owed'], ['expenses', 'Expenses']].map(([id, lbl]) => (
                  <button
                    key={id}
                    onClick={() => setTab(group.id, id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${tab === id ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                  >{lbl}</button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <div className="px-5 pb-4">
              {tab === 'owed' ? (
                <div>
                  {group.expenses.length === 0 ? (
                    <p className="text-slate-600 text-sm py-2">No expenses yet. Add one below.</p>
                  ) : !group.myName ? (
                    <div>
                      <p className="text-slate-400 text-xs font-medium mb-2">Which member are you?</p>
                      <select
                        defaultValue=""
                        onChange={e => { if (e.target.value) handleSetMyName(group.id, e.target.value); }}
                        className="w-full bg-[#0f1117] border border-indigo-500 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-400 transition-colors mb-3"
                      >
                        <option value="" disabled>— Select yourself —</option>
                        {group.members.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <div className="space-y-1.5">
                        {group.members.map(m => {
                          const spent = group.expenses.filter(e => e.paidBy === m).reduce((s, e) => s + e.amount, 0);
                          return (
                            <div key={m} className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-[#0f1117] border border-slate-800">
                              <span className="text-sm text-white">{m}</span>
                              <span className="text-sm text-slate-400">${spent.toFixed(2)} paid</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {otherMembers.length > 1 && (() => {
                        if (totalOwed > 0.005) return (
                          <div className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <span className="text-xs font-semibold text-emerald-400">You're owed in total</span>
                            <span className="text-sm font-bold text-emerald-400">${totalOwed.toFixed(2)}</span>
                          </div>
                        );
                        if (totalIOweThem > 0.005) return (
                          <div className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                            <span className="text-xs font-semibold text-rose-400">You owe in total</span>
                            <span className="text-sm font-bold text-rose-400">${totalIOweThem.toFixed(2)}</span>
                          </div>
                        );
                        return null;
                      })()}
                      {otherMembers.map(m => {
                        const balance = getMemberBalance(m);
                        const isOwedToMe = balance > 0.005;
                        const iOweThem   = balance < -0.005;
                        return (
                          <div key={m} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-[#0f1117] border border-slate-800">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isOwedToMe ? 'bg-emerald-500' : iOweThem ? 'bg-rose-500' : 'bg-slate-600'}`} />
                              <span className="text-sm font-medium text-white">{m}</span>
                            </div>
                            {isOwedToMe
                              ? <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400">owes you ${balance.toFixed(2)}</span>
                              : iOweThem
                                ? <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400">you owe ${Math.abs(balance).toFixed(2)}</span>
                                : <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-500">settled up</span>
                            }
                          </div>
                        );
                      })}
                      {group.expenses.length > 0 && (() => {
                        const plan = getSettlementPlan(group);
                        if (plan.length === 0) return null;
                        return (
                          <div className="mt-1 pt-3 border-t border-slate-800">
                            <p className="text-xs font-semibold text-slate-400 mb-2">How to settle up</p>
                            <div className="space-y-1.5">
                              {plan.map((t, i) => {
                                const isFromMe = t.from === group.myName;
                                const isToMe   = t.to === group.myName;
                                return (
                                  <div key={i} className={`flex items-center justify-between py-2 px-3 rounded-xl border ${isFromMe || isToMe ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-[#0f1117] border-slate-800'}`}>
                                    <div className="flex items-center gap-1.5 text-sm">
                                      <span className={isFromMe ? 'text-indigo-400 font-medium' : 'text-white'}>{isFromMe ? 'You' : t.from}</span>
                                      <span className="text-slate-600">→</span>
                                      <span className={isToMe ? 'text-indigo-400 font-medium' : 'text-white'}>{isToMe ? 'You' : t.to}</span>
                                    </div>
                                    <span className="text-sm font-bold text-white">${t.amount.toFixed(2)}</span>
                                  </div>
                                );
                              })}
                              <p className="text-xs text-slate-600 px-1">{plan.length} payment{plan.length !== 1 ? 's' : ''} to clear all debts</p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  {sortedExpenses.length === 0 ? (
                    <p className="text-slate-600 text-sm py-2">No expenses yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {sortedExpenses.map(exp => {
                        const dateLabel = new Date(exp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        const isMe = exp.paidBy === group.myName;
                        return (
                          <div key={exp.id} className={`py-2.5 px-3 rounded-xl bg-[#0f1117] border border-slate-800 ${isMe ? 'border-l-2 border-l-indigo-500/50' : ''}`}>
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-white flex-1 min-w-0 truncate pr-2">{exp.title}</p>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="text-sm font-bold text-white">${exp.amount.toFixed(2)}</span>
                                <button
                                  onClick={() => setEditingExpense({ groupId: group.id, expense: exp })}
                                  className="text-slate-600 hover:text-indigo-400 transition-colors"
                                  title="Edit expense"
                                >
                                  <EditIcon />
                                </button>
                                <button
                                  onClick={() => handleDeleteExpense(group.id, exp.id)}
                                  className="text-slate-700 hover:text-rose-400 transition-colors"
                                  title="Delete expense"
                                >
                                  <TrashIcon />
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Paid by <span className={isMe ? 'text-indigo-400' : 'text-slate-400'}>{isMe ? 'you' : exp.paidBy}</span> · {dateLabel}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                              {group.members.map((m, idx) => {
                                const share = exp.splits[m] || 0;
                                const isMyChip = m === group.myName;
                                return (
                                  <span key={m} className={`text-xs ${isMyChip ? 'text-indigo-400 font-medium' : 'text-slate-500'}`}>
                                    {idx > 0 ? '· ' : ''}{isMyChip ? 'You' : m}: ${share.toFixed(2)}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="px-5 pb-5 flex items-center justify-between gap-3 border-t border-slate-800 pt-4">
              {!group.settled ? (
                <>
                  <button
                    onClick={() => setAddExpenseForGroup(group.id)}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-semibold rounded-xl py-2.5 transition-all text-sm"
                  >
                    + Add Expense
                  </button>
                  <button
                    onClick={() => handleSettleGroup(group.id)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  >
                    Mark settled
                  </button>
                </>
              ) : (
                <button onClick={() => handleUnsettleGroup(group.id)} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                  Unsettle
                </button>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────
  const activeGroup        = groups.find(g => g.id === addExpenseForGroup) || null;
  const editingGroup       = editingExpense ? groups.find(g => g.id === editingExpense.groupId) : null;

  return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col items-center px-4 py-10">
      <Header />

      <div className="w-full max-w-2xl">
        {groups.length > 0 && (
          <div className="bg-[#1a1d27] border border-slate-800 rounded-2xl p-4 mb-4 shadow-xl">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#0f1117] rounded-xl p-3">
                <p className="text-xs text-slate-500 mb-0.5">Groups</p>
                <p className="text-white font-bold text-sm">{groups.length}</p>
              </div>
              <div className="bg-[#0f1117] rounded-xl p-3">
                <p className="text-xs text-slate-500 mb-0.5">You are owed</p>
                <p className={`font-bold text-sm ${totalOwedToMe > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                  ${totalOwedToMe.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowCreateGroup(true)}
          className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-bold rounded-xl py-3.5 transition-all text-sm tracking-wide mb-4"
        >
          + New Group
        </button>

        {groups.length === 0 ? (
          <div className="bg-[#1a1d27] border border-slate-800 rounded-2xl p-10 text-center shadow-xl">
            <p className="text-slate-400 text-base font-semibold mb-1">No groups yet</p>
            <p className="text-slate-600 text-sm">Create a group to start tracking shared expenses.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {groups.map(g => <GroupCard key={g.id} group={g} />)}
          </div>
        )}
      </div>

      <p className="text-slate-700 text-xs mt-8">Data saved locally · {username}'s private account</p>

      {showCreateGroup && <SplitForm onSave={handleCreateGroup} onClose={() => setShowCreateGroup(false)} />}
      {activeGroup && (
        <AddExpenseModal
          group={activeGroup}
          onSave={exp => handleAddExpense(activeGroup.id, exp)}
          onClose={() => setAddExpenseForGroup(null)}
        />
      )}
      {editingExpense && editingGroup && (
        <AddExpenseModal
          group={editingGroup}
          initialValues={editingExpense.expense}
          onSave={exp => handleEditExpense(editingExpense.groupId, exp)}
          onClose={() => setEditingExpense(null)}
        />
      )}
      {showAccount && (
        <AccountModal
          username={username}
          userData={loadUserData(username)}
          onSave={handleAccountSave}
          onClose={() => setShowAccount(false)}
        />
      )}
      {showSettings && (() => {
        const d = loadUserData(username);
        return (
          <SettingsModal
            budget={d.budget || 0}
            income={d.income || 0}
            categoryBudgets={d.categoryBudgets || {}}
            onSave={handleSettingsSave}
            onClose={() => setShowSettings(false)}
          />
        );
      })()}
    </div>
  );
}

window.SplitterPage = SplitterPage;
