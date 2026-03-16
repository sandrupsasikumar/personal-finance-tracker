const { useState: useStateEdit } = React;

function EditExpenseModal({ expense, onSave, onClose }) {
  const [name,     setName]     = useStateEdit(expense.name);
  const [amount,   setAmount]   = useStateEdit(String(expense.amount));
  const [category, setCategory] = useStateEdit(expense.category);
  const [notes,    setNotes]    = useStateEdit(expense.notes || '');
  const [shake,    setShake]    = useStateEdit(false);

  function handleSubmit(e) {
    e.preventDefault();
    const trimName = name.trim();
    const amt = parseFloat(amount);
    if (!trimName || isNaN(amt) || amt <= 0) {
      setShake(true); setTimeout(() => setShake(false), 500); return;
    }
    onSave(expense.id, { name: trimName, amount: amt, category, notes: notes.trim() });
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#1a1d27] border border-slate-700/50 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h2 className="text-lg font-bold text-white mb-1">Edit Expense</h2>
        <p className="text-slate-400 text-sm mb-5">Update the details below.</p>
        <form onSubmit={handleSubmit} className={`space-y-4 ${shake ? 'shake' : ''}`}>
          <InputField label="Item name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Coffee" autoFocus />
          <InputField label="Amount" prefix="$" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
          <div>
            <p className="text-xs text-slate-400 font-medium mb-2">Category</p>
            <CategoryPicker value={category} onChange={setCategory} />
          </div>
          <input
            type="text"
            placeholder="Notes (optional)"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full bg-[#0f1117] border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
          />
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

window.EditExpenseModal = EditExpenseModal;
