const { useState: useStateSplitter, useEffect: useEffectSplitter } = React;

function SplitterPage({ username, onBack, onLogout, onUsernameChange }) {
  const [splits,            setSplits]            = useStateSplitter(() => {
    const d = loadUserData(username);
    return d.splits || [];
  });
  const [view,              setView]              = useStateSplitter('list'); // 'list' | 'detail'
  const [activeSplitId,     setActiveSplitId]     = useStateSplitter(null);
  const [showForm,          setShowForm]          = useStateSplitter(false);
  const [confirmDelete,     setConfirmDelete]     = useStateSplitter(false);
  const [showSettleConfirm, setShowSettleConfirm] = useStateSplitter(false);
  const [logCategory,       setLogCategory]       = useStateSplitter('food');
  const [showAccount,       setShowAccount]       = useStateSplitter(false);
  const [showSettings,      setShowSettings]      = useStateSplitter(false);

  useEffectSplitter(() => {
    const d = loadUserData(username);
    saveUserData(username, { ...d, splits });
  }, [splits]);

  const activeSplit = splits.find(s => s.id === activeSplitId) || null;

  function openDetail(id) {
    setActiveSplitId(id);
    setView('detail');
    setConfirmDelete(false);
    setShowSettleConfirm(false);
    setLogCategory('food');
  }

  function handleSaveSplit(split) {
    setSplits(prev => [split, ...prev]);
    setShowForm(false);
  }

  function handleDeleteSplit() {
    setSplits(prev => prev.filter(s => s.id !== activeSplitId));
    setView('list');
    setActiveSplitId(null);
    setConfirmDelete(false);
  }

  function handleMarkSettled() {
    setSplits(prev => prev.map(s =>
      s.id === activeSplitId ? { ...s, settled: true } : s
    ));
    setShowSettleConfirm(false);
  }

  function handleUnsettle() {
    setSplits(prev => prev.map(s =>
      s.id === activeSplitId ? { ...s, settled: false } : s
    ));
  }

  function handleLogToExpenses() {
    if (!activeSplit || !activeSplit.myName) return;
    const myP = activeSplit.participants.find(p => p.name === activeSplit.myName);
    if (!myP) return;

    const expense = {
      id:       Date.now(),
      name:     activeSplit.title,
      amount:   myP.amount,
      category: logCategory,
      date:     activeSplit.date,
      notes:    `Bill split with ${activeSplit.participants.filter(p => p.name !== activeSplit.myName).map(p => p.name).join(', ')}`,
    };

    const d = loadUserData(username);
    saveUserData(username, { ...d, expenses: [...d.expenses, expense] });

    setSplits(prev => prev.map(s => s.id === activeSplitId ? { ...s, loggedToExpenses: true } : s));
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

  // ── Shared header ──────────────────────────────────────────────
  function Header() {
    return (
      <div className="w-full max-w-lg flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">SpendCheck</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Hey, <span className="text-indigo-400 font-semibold">{loadUserData(username).name || username}</span> 👋
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-[#0f1117] border border-slate-800 rounded-lg p-1 gap-1">
            <button
              onClick={onBack}
              className="px-3 py-1.5 rounded-md text-xs font-semibold text-slate-500 hover:text-slate-300 transition-all"
            >Budget</button>
            <span className="px-3 py-1.5 rounded-md text-xs font-semibold bg-indigo-600 text-white">Split</span>
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
    );
  }

  // ── Stats computations ─────────────────────────────────────────
  const totalBilled = splits.reduce((sum, s) =>
    sum + s.participants.reduce((a, p) => a + p.amount, 0), 0);

  const totalOwed = splits
    .filter(s => !s.settled && !s.loggedToExpenses && s.myName)
    .reduce((sum, s) => {
      const myP = s.participants.find(p => p.name === s.myName);
      return sum + (myP && s.paidBy !== s.myName ? myP.amount : 0);
    }, 0);

  // ── List view ──────────────────────────────────────────────────
  const listContent = (
    <div className="w-full max-w-lg">
      {/* Stats bar — only when splits exist */}
      {splits.length > 0 && (
        <div className="bg-[#1a1d27] border border-slate-800 rounded-2xl p-4 mb-4 shadow-xl">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#0f1117] rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-0.5">Splits</p>
              <p className="text-white font-bold text-sm">{splits.length}</p>
            </div>
            <div className="bg-[#0f1117] rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-0.5">Total billed</p>
              <p className="text-white font-bold text-sm">${totalBilled.toFixed(2)}</p>
            </div>
            <div className="bg-[#0f1117] rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-0.5">You owe</p>
              <p className={`font-bold text-sm ${totalOwed > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                ${totalOwed.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {splits.length === 0 ? (
        <div className="bg-[#1a1d27] border border-slate-800 rounded-2xl p-10 text-center shadow-xl">
          <p className="text-slate-400 text-base font-semibold mb-1">No splits yet</p>
          <p className="text-slate-600 text-sm">Create your first bill split below.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {splits.map(split => {
            const total = split.participants.reduce((s, p) => s + p.amount, 0);
            const myP   = split.myName ? split.participants.find(p => p.name === split.myName) : null;
            const dateLabel = new Date(split.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            let badge = null;
            if (split.settled) {
              badge = <span className="mt-1.5 inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-500">Settled</span>;
            } else if (split.loggedToExpenses) {
              badge = <span className="mt-1.5 inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-900/40 text-emerald-400">✓ Logged</span>;
            } else if (myP && split.paidBy !== split.myName) {
              badge = <span className="mt-1.5 inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-900/40 text-indigo-400">You owe ${myP.amount.toFixed(2)}</span>;
            }

            return (
              <button
                key={split.id}
                onClick={() => openDetail(split.id)}
                className={`w-full text-left bg-[#1a1d27] border border-slate-800 hover:border-slate-600 rounded-2xl p-4 shadow-xl transition-colors ${split.settled ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white font-semibold text-sm">{split.title}</p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {dateLabel} · {split.participants.length} people · ${total.toFixed(2)} total
                    </p>
                    {badge}
                  </div>
                  <span className="text-slate-600 text-sm mt-0.5">›</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <button
        onClick={() => setShowForm(true)}
        className="mt-5 w-full bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-bold rounded-xl py-3.5 transition-all text-sm tracking-wide"
      >
        + New Split
      </button>

      {showForm && <SplitForm onSave={handleSaveSplit} onClose={() => setShowForm(false)} />}
    </div>
  );

  // ── Detail view ────────────────────────────────────────────────
  const detailContent = activeSplit ? (() => {
    const total = activeSplit.participants.reduce((s, p) => s + p.amount, 0);
    const myP   = activeSplit.myName ? activeSplit.participants.find(p => p.name === activeSplit.myName) : null;
    const dateLabel = new Date(activeSplit.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const settlements = activeSplit.participants
      .filter(p => p.name !== activeSplit.paidBy)
      .map(p => ({ from: p.name, to: activeSplit.paidBy, amount: p.amount }));

    return (
      <div className="w-full max-w-lg space-y-4">
        {/* Back */}
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => setView('list')}
            className="text-slate-500 hover:text-white transition-colors text-xs font-medium"
          >
            ← Splits
          </button>
        </div>

        {/* Split header card */}
        <div className="bg-[#1a1d27] border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">{activeSplit.title}</h2>
              <p className="text-slate-500 text-xs mt-1">{dateLabel} · ${total.toFixed(2)} total</p>
            </div>
            {activeSplit.settled && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-400">Settled</span>
            )}
          </div>

          {/* Participants table */}
          <div className="mt-5 space-y-2">
            {activeSplit.participants.map(p => {
              const isPayer   = p.name === activeSplit.paidBy;
              const isMe      = p.name === activeSplit.myName;
              const nameLabel = isMe ? 'You' : p.name;
              return (
                <div key={p.name} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-[#0f1117] border border-slate-800">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {nameLabel}
                      {isPayer && <span className="ml-1.5 text-xs text-emerald-500 font-normal">(paid)</span>}
                    </p>
                    {!isPayer && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        owes {activeSplit.paidBy} ${p.amount.toFixed(2)}
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-white">${p.amount.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Settlement summary */}
        <div className="bg-[#1a1d27] border border-slate-800 rounded-2xl p-5 shadow-xl">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">💸 Settlement</p>
          {settlements.length === 0 ? (
            <p className="text-slate-600 text-sm">No settlements needed.</p>
          ) : (
            <div className="space-y-1.5">
              {settlements.map(s => (
                <p key={s.from} className="text-sm text-slate-300">
                  <span className={`font-semibold ${s.from === activeSplit.myName ? 'text-rose-400' : 'text-white'}`}>
                    {s.from === activeSplit.myName ? 'You' : s.from}
                  </span>
                  {' '}owe{s.from === activeSplit.myName ? '' : 's'}{' '}
                  <span className="font-semibold text-white">{s.to}</span>
                  {' '}
                  <span className="font-semibold text-indigo-400">${s.amount.toFixed(2)}</span>
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {/* Log to expenses — with category picker */}
          {myP && !activeSplit.loggedToExpenses && !activeSplit.settled && (
            <div className="bg-[#1a1d27] border border-slate-800 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Log as expense</p>
              <CategoryPicker value={logCategory} onChange={setLogCategory} />
              <button
                onClick={handleLogToExpenses}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3 font-semibold transition-colors text-sm"
              >
                Log my share (${myP.amount.toFixed(2)}) as expense
              </button>
            </div>
          )}

          {myP && activeSplit.loggedToExpenses && (
            <div className="w-full bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 rounded-xl py-3 text-sm font-semibold text-center">
              ✓ Your share logged to expenses
            </div>
          )}

          {/* Mark as settled / Unsettle */}
          {!activeSplit.settled ? (
            showSettleConfirm ? (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSettleConfirm(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl py-3 font-semibold transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMarkSettled}
                  className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl py-3 font-semibold transition-colors text-sm"
                >
                  Confirm Settled
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSettleConfirm(true)}
                className="w-full flex items-center justify-center gap-2 bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl py-3 transition-colors text-sm font-medium"
              >
                ✓ Mark as settled
              </button>
            )
          ) : (
            <div className="flex items-center justify-between px-4 py-3 bg-emerald-950/40 border border-emerald-900/50 rounded-xl">
              <span className="text-sm font-semibold text-emerald-400">✓ Settled</span>
              <button
                onClick={handleUnsettle}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                Unsettle
              </button>
            </div>
          )}

          {/* Delete */}
          {confirmDelete ? (
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl py-3 font-semibold transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSplit}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white rounded-xl py-3 font-semibold transition-colors text-sm"
              >
                Confirm Delete
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-full flex items-center justify-center gap-2 text-slate-600 hover:text-rose-400 transition-colors text-sm py-2"
            >
              <TrashIcon /> Delete split
            </button>
          )}
        </div>
      </div>
    );
  })() : null;

  // ── Single return ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col items-center px-4 py-10">
      <Header />

      {view === 'list' ? listContent : detailContent}

      <p className="text-slate-700 text-xs mt-8">Data saved locally · {username}'s private account</p>

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
