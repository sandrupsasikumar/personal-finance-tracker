const { useState: useStateRecurring } = React;

function RecurringModal({ recurring, recurringApplied, selectedMonth, onAddTemplate, onDeleteTemplate, onApply, onClose }) {
  const [name,     setName]     = useStateRecurring('');
  const [amount,   setAmount]   = useStateRecurring('');
  const [category, setCategory] = useStateRecurring('housing');
  const [shake,    setShake]    = useStateRecurring(false);

  const alreadyApplied = recurringApplied[selectedMonth];
  const monthName = (function() {
    const [y, m] = selectedMonth.split('-');
    return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  })();

  function handleAdd(e) {
    e.preventDefault();
    const trimName = name.trim();
    const amt = parseFloat(amount);
    if (!trimName || isNaN(amt) || amt <= 0) {
      setShake(true); setTimeout(() => setShake(false), 500); return;
    }
    onAddTemplate({ name: trimName, amount: amt, category });
    setName(''); setAmount('');
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#1a1d27] border border-slate-700/50 rounded-2xl p-6 w-full max-w-sm shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold text-white">Recurring Expenses</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors text-xl leading-none">&times;</button>
        </div>
        <p className="text-slate-400 text-sm mb-5">Save fixed monthly costs and apply them in one click.</p>

        {/* Add template form */}
        <form onSubmit={handleAdd} className={`space-y-3 mb-5 ${shake ? 'shake' : ''}`}>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Name (e.g. Rent)"
              value={name}
              onChange={e => setName(e.target.value)}
              className="bg-[#0f1117] border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none">$</span>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full bg-[#0f1117] border border-slate-700 rounded-xl pl-7 pr-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>
          <CategoryPicker value={category} onChange={setCategory} />
          <button
            type="submit"
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl py-2.5 transition-colors text-sm"
          >
            + Add Template
          </button>
        </form>

        {/* Template list */}
        {recurring.length === 0 ? (
          <div className="text-center py-4 border-t border-slate-800">
            <p className="text-slate-600 text-sm">No recurring expenses yet.</p>
            <p className="text-slate-700 text-xs mt-1">Add one above to get started.</p>
          </div>
        ) : (
          <div className="space-y-2 border-t border-slate-800 pt-4 mb-5">
            {recurring.map(r => {
              const cat = CAT_MAP[r.category] || CAT_MAP['other'];
              return (
                <div key={r.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-[#0f1117] border border-slate-800">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-lg flex-shrink-0">{cat.emoji}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{r.name}</p>
                      <p className={`text-xs ${cat.text}`}>{cat.label}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <span className="text-sm font-semibold text-white">${Number(r.amount).toFixed(2)}</span>
                    <button
                      onClick={() => onDeleteTemplate(r.id)}
                      className="text-slate-600 hover:text-rose-400 transition-colors"
                      title="Remove"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Apply button */}
        {recurring.length > 0 && (
          <button
            onClick={() => !alreadyApplied && onApply(selectedMonth)}
            disabled={alreadyApplied}
            className={`w-full rounded-xl py-3 font-semibold transition-colors text-sm ${
              alreadyApplied
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {alreadyApplied ? `✓ Already applied to ${monthName}` : `Apply to ${monthName}`}
          </button>
        )}
      </div>
    </div>
  );
}

window.RecurringModal = RecurringModal;
