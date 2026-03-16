const { useState: useStateCreateGroup } = React;

function CreateGroupModal({ onSave, onClose }) {
  const [name,    setName]    = useStateCreateGroup('');
  const [members, setMembers] = useStateCreateGroup(['', '']);
  const [myName,  setMyName]  = useStateCreateGroup('');
  const [error,   setError]   = useStateCreateGroup('');

  const validMembers = members.map(m => m.trim()).filter(Boolean);
  const uniqueValid  = [...new Set(validMembers)];

  function updateMember(i, val) {
    setMembers(prev => prev.map((m, idx) => idx === i ? val : m));
  }

  function addMember() {
    setMembers(prev => [...prev, '']);
  }

  function removeMember(i) {
    setMembers(prev => prev.filter((_, idx) => idx !== i));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!name.trim())           return setError('Please enter a group name.');
    if (uniqueValid.length < 2) return setError('Add at least 2 members with unique names.');
    if (uniqueValid.length !== validMembers.length) return setError('Member names must be unique.');

    onSave({
      id:       Date.now(),
      name:     name.trim(),
      members:  uniqueValid,
      myName:   myName || '',
      expenses: [],
      settled:  false,
    });
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#1a1d27] border border-slate-700/50 rounded-2xl p-6 w-full max-w-sm shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold text-white">New Group</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors text-xl leading-none">&times;</button>
        </div>
        <p className="text-slate-400 text-sm mb-5">Create a group to track shared expenses.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Group name */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Group Name</label>
            <input
              type="text"
              placeholder="e.g. Dinner Squad, Trip to Vegas"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              className="w-full bg-[#0f1117] border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Members */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Members</label>
            <div className="space-y-2">
              {members.map((m, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Member ${i + 1} name`}
                    value={m}
                    onChange={e => updateMember(i, e.target.value)}
                    className="flex-1 bg-[#0f1117] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  {members.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeMember(i)}
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
              onClick={addMember}
              className="mt-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              + Add member
            </button>
          </div>

          {/* That's me */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              That's me <span className="text-slate-600 font-normal">(optional — to track your balances)</span>
            </label>
            <select
              value={myName}
              onChange={e => setMyName(e.target.value)}
              className="w-full bg-[#0f1117] border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="">— Skip —</option>
              {uniqueValid.map(n => <option key={n} value={n}>{n}</option>)}
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
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

window.SplitForm = CreateGroupModal;
