const { useState: useStateSettings } = React;

function SettingsModal({ budget, income, categoryBudgets, onSave, onClose }) {
  const [b,        setB]        = useStateSettings(String(budget));
  const [inc,      setInc]      = useStateSettings(String(income));
  const [catBudgets, setCatBudgets] = useStateSettings(() => {
    const init = {};
    CATEGORIES.forEach(c => { init[c.id] = categoryBudgets[c.id] ? String(categoryBudgets[c.id]) : ''; });
    return init;
  });
  const [showCatLimits, setShowCatLimits] = useStateSettings(false);

  function handleSubmit(e) {
    e.preventDefault();
    const nb = parseFloat(b);
    const ni = parseFloat(inc);
    if (!isNaN(nb) && nb > 0) {
      const newCatBudgets = {};
      CATEGORIES.forEach(c => {
        const v = parseFloat(catBudgets[c.id]);
        if (!isNaN(v) && v > 0) newCatBudgets[c.id] = v;
      });
      onSave(nb, isNaN(ni) ? 0 : Math.max(0, ni), newCatBudgets);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#1a1d27] border border-slate-700/50 rounded-2xl p-6 w-full max-w-sm shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-white mb-1">Monthly Settings</h2>
        <p className="text-slate-400 text-sm mb-5">Set your income and spending budget.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField label="Monthly Income" prefix="$" type="number" value={inc} onChange={e => setInc(e.target.value)} placeholder="0.00" autoFocus />
          <InputField label="Monthly Budget" prefix="$" type="number" value={b}   onChange={e => setB(e.target.value)}   placeholder="2000" />

          {/* Category limits toggle */}
          <div className="border-t border-slate-800 pt-4">
            <button
              type="button"
              onClick={() => setShowCatLimits(p => !p)}
              className="flex items-center justify-between w-full text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              <span>Category Limits <span className="text-slate-500 font-normal">(optional)</span></span>
              <span className="text-slate-500 text-xs">{showCatLimits ? '▲ Hide' : '▼ Show'}</span>
            </button>
            {showCatLimits && (
              <div className="mt-3 space-y-2">
                {CATEGORIES.map(cat => (
                  <div key={cat.id} className="flex items-center gap-3">
                    <span className="text-base w-6 text-center flex-shrink-0">{cat.emoji}</span>
                    <span className="text-xs text-slate-400 flex-1 min-w-0 truncate">{cat.label}</span>
                    <div className="relative flex-shrink-0 w-24">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs pointer-events-none">$</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="—"
                        value={catBudgets[cat.id]}
                        onChange={e => setCatBudgets(prev => ({ ...prev, [cat.id]: e.target.value }))}
                        className="w-full bg-[#0f1117] border border-slate-700 rounded-lg pl-6 pr-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

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
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3 font-semibold transition-colors text-sm"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

window.SettingsModal = SettingsModal;
