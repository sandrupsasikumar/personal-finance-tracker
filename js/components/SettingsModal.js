const { useState: useStateSettings } = React;

function SettingsModal({ budget, income, onSave, onClose }) {
  const [b,   setB]   = useStateSettings(String(budget));
  const [inc, setInc] = useStateSettings(String(income));

  function handleSubmit(e) {
    e.preventDefault();
    const nb = parseFloat(b);
    const ni = parseFloat(inc);
    if (!isNaN(nb) && nb > 0) {
      onSave(nb, isNaN(ni) ? 0 : Math.max(0, ni));
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#1a1d27] border border-slate-700/50 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h2 className="text-lg font-bold text-white mb-1">Monthly Settings</h2>
        <p className="text-slate-400 text-sm mb-5">Set your income and spending budget.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField label="Monthly Income" prefix="$" type="number" value={inc} onChange={e => setInc(e.target.value)} placeholder="0.00" autoFocus />
          <InputField label="Monthly Budget" prefix="$" type="number" value={b}   onChange={e => setB(e.target.value)}   placeholder="2000" />
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
