const { useState: useStateSplitForm } = React;

function SplitForm({ onSave, onClose }) {
  const todayStr = new Date().toISOString().slice(0, 10);

  const [title,        setTitle]        = useStateSplitForm('');
  const [date,         setDate]         = useStateSplitForm(todayStr);
  const [participants, setParticipants] = useStateSplitForm([
    { name: '', amount: '' },
    { name: '', amount: '' },
  ]);
  const [paidBy,  setPaidBy]  = useStateSplitForm('');
  const [myName,  setMyName]  = useStateSplitForm('');
  const [error,   setError]   = useStateSplitForm('');

  const validParticipants = participants.filter(p => p.name.trim() && parseFloat(p.amount) > 0);
  const validNames = validParticipants.map(p => p.name.trim());

  function updateParticipant(i, field, value) {
    setParticipants(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
  }

  function addParticipant() {
    setParticipants(prev => [...prev, { name: '', amount: '' }]);
  }

  function removeParticipant(i) {
    setParticipants(prev => prev.filter((_, idx) => idx !== i));
  }

  function splitEqually() {
    const total = participants.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
    const count = participants.length;
    if (count === 0) return;
    const share = (total / count).toFixed(2);
    setParticipants(prev => prev.map(p => ({ ...p, amount: share })));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!title.trim())              return setError('Please enter a bill title.');
    if (validParticipants.length < 2) return setError('Add at least 2 participants with names and amounts.');
    if (!paidBy)                    return setError('Select who paid the bill.');

    onSave({
      id:                  Date.now(),
      title:               title.trim(),
      date:                new Date(date).toISOString(),
      paidBy,
      participants:        validParticipants.map(p => ({ name: p.name.trim(), amount: parseFloat(p.amount) })),
      myName:              myName || '',
      loggedToExpenses:    false,
    });
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#1a1d27] border border-slate-700/50 rounded-2xl p-6 w-full max-w-sm shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold text-white">New Split</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors text-xl leading-none">&times;</button>
        </div>
        <p className="text-slate-400 text-sm mb-5">Enter the bill details and who owes what.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title + date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Bill Title</label>
              <input
                type="text"
                placeholder="e.g. Dinner at Nobu"
                value={title}
                onChange={e => setTitle(e.target.value)}
                autoFocus
                className="w-full bg-[#0f1117] border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-[#0f1117] border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Participants */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-slate-400">Participants</label>
              <button
                type="button"
                onClick={splitEqually}
                className="text-xs text-indigo-500 hover:text-indigo-400 transition-colors font-medium"
              >
                Split equally
              </button>
            </div>
            <div className="space-y-2">
              {participants.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Name"
                    value={p.name}
                    onChange={e => updateParticipant(i, 'name', e.target.value)}
                    className="flex-1 bg-[#0f1117] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <div className="relative w-24 flex-shrink-0">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs pointer-events-none">$</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="any"
                      value={p.amount}
                      onChange={e => updateParticipant(i, 'amount', e.target.value)}
                      className="w-full bg-[#0f1117] border border-slate-700 rounded-xl pl-6 pr-2 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  {participants.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeParticipant(i)}
                      className="text-slate-700 hover:text-rose-400 transition-colors flex-shrink-0"
                    >
                      <TrashIcon />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addParticipant}
              className="mt-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              + Add person
            </button>
          </div>

          {/* Paid by */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Paid by</label>
            <select
              value={paidBy}
              onChange={e => setPaidBy(e.target.value)}
              className="w-full bg-[#0f1117] border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="">— Select who paid —</option>
              {validNames.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          {/* That's me */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              That's me <span className="text-slate-600 font-normal">(optional — to log your share later)</span>
            </label>
            <select
              value={myName}
              onChange={e => setMyName(e.target.value)}
              className="w-full bg-[#0f1117] border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="">— Skip —</option>
              {validNames.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
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
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3 font-semibold transition-colors text-sm"
            >
              Save Split
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

window.SplitForm = SplitForm;
