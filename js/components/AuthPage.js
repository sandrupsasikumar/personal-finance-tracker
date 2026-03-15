const { useState: useStateAuth } = React;

function AuthPage({ onLogin }) {
  const [mode,     setMode] = useStateAuth('login');
  const [username, setUser] = useStateAuth('');
  const [password, setPass] = useStateAuth('');
  const [error,    setError]= useStateAuth('');
  const [shake,    setShake]= useStateAuth(false);

  function triggerError(msg) {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const u = username.trim().toLowerCase();
    const p = password.trim();
    if (!u || !p) return triggerError('Please fill in both fields.');

    const users = getUsers();

    if (mode === 'register') {
      if (users[u])    return triggerError('Username already taken.');
      if (p.length < 4) return triggerError('Password must be at least 4 characters.');
      users[u] = { pw: hashPw(p) };
      saveUsers(users);
      setSession(u);
      onLogin(u);
    } else {
      if (!users[u])                   return triggerError('No account found. Register first!');
      if (users[u].pw !== hashPw(p))   return triggerError('Incorrect password.');
      setSession(u);
      onLogin(u);
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black tracking-tight text-white">SpendCheck</h1>
          <p className="text-slate-500 text-sm mt-2">Your personal budget, locked to you.</p>
        </div>

        {/* Card */}
        <div className={`bg-[#1a1d27] border border-slate-800 rounded-2xl p-7 shadow-2xl ${shake ? 'shake' : ''}`}>
          {/* Tab toggle */}
          <div className="flex bg-[#0f1117] rounded-xl p-1 mb-6">
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  mode === m ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <InputField label="Username"  placeholder="e.g. alex"   value={username} onChange={e => setUser(e.target.value)} autoFocus />
            <InputField label="Password"  placeholder="••••••••"     value={password} onChange={e => setPass(e.target.value)} type="password" />
            {error && <p className="text-rose-400 text-xs font-medium pt-1">{error}</p>}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-bold rounded-xl py-3.5 transition-all text-sm tracking-wide mt-2"
            >
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-slate-700 text-xs text-center mt-6">Data is stored locally in this browser only.</p>
      </div>
    </div>
  );
}

window.AuthPage = AuthPage;
