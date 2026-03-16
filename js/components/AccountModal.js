const { useState: useStateAccount } = React;

function AccountModal({ username, userData, onSave, onClose }) {
  const currentEmail = (getUsers()[username] || {}).email || '';

  const [displayName,   setDisplayName]   = useStateAccount(userData.name || '');
  const [email,         setEmail]         = useStateAccount(currentEmail);
  const [newUsername,   setNewUsername]   = useStateAccount(username);
  const [showPwSection, setShowPwSection] = useStateAccount(false);
  const [currentPw,     setCurrentPw]     = useStateAccount('');
  const [newPw,         setNewPw]         = useStateAccount('');
  const [error,         setError]         = useStateAccount('');

  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const trimmedUsername = newUsername.trim().toLowerCase();
    const users = getUsers();

    // Validate username change
    if (trimmedUsername !== username) {
      if (trimmedUsername.length < 2)       return setError('Username must be at least 2 characters.');
      if (/\s/.test(trimmedUsername))       return setError('Username cannot contain spaces.');
      if (users[trimmedUsername])           return setError('That username is already taken.');
    }

    // Validate password change
    if (newPw || currentPw) {
      if (!currentPw)                                  return setError('Enter your current password to change it.');
      if (users[username].pw !== hashPw(currentPw))   return setError('Current password is incorrect.');
      if (newPw.length < 4)                            return setError('New password must be at least 4 characters.');
    }

    onSave({
      name:        displayName.trim(),
      email:       email.trim(),
      newUsername: trimmedUsername,
      newPw:       newPw,
    });
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#1a1d27] border border-slate-700/50 rounded-2xl p-6 w-full max-w-sm shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold text-white">Account Details</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors text-xl leading-none">&times;</button>
        </div>
        <p className="text-slate-400 text-sm mb-5">Update your profile and login details.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Display name */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Display Name</label>
            <input
              type="text"
              placeholder="Your name (e.g. Alex)"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="w-full bg-[#0f1117] border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <p className="text-xs text-slate-600 mt-1">Shown in the greeting. Leave blank to use your username.</p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-[#0f1117] border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Username</label>
            <input
              type="text"
              value={newUsername}
              onChange={e => setNewUsername(e.target.value)}
              className="w-full bg-[#0f1117] border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <p className="text-xs text-slate-600 mt-1">Usernames are lowercase only.</p>
          </div>

          {/* Change password */}
          <div className="border-t border-slate-800 pt-4">
            <button
              type="button"
              onClick={() => setShowPwSection(p => !p)}
              className="flex items-center justify-between w-full text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              <span>Change Password</span>
              <span className="text-slate-500 text-xs">{showPwSection ? '▲ Hide' : '▼ Show'}</span>
            </button>
            {showPwSection && (
              <div className="mt-3 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Current Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={currentPw}
                    onChange={e => setCurrentPw(e.target.value)}
                    className="w-full bg-[#0f1117] border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">New Password</label>
                  <input
                    type="password"
                    placeholder="Min. 4 characters"
                    value={newPw}
                    onChange={e => setNewPw(e.target.value)}
                    className="w-full bg-[#0f1117] border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
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

window.AccountModal = AccountModal;
