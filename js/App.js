const { useState: useStateApp } = React;

function App() {
  const [user,       setUser]       = useStateApp(() => getSession());
  const [activeView, setActiveView] = useStateApp('dashboard');

  function handleLogin(u)  { setUser(u); setActiveView('dashboard'); }
  function handleLogout()  { clearSession(); setUser(null); }

  if (!user) return <AuthPage onLogin={handleLogin} />;
  if (activeView === 'splitter')
    return <SplitterPage
      username={user}
      onBack={() => setActiveView('dashboard')}
      onLogout={handleLogout}
      onUsernameChange={u => setUser(u)}
    />;
  return (
    <Dashboard
      username={user}
      onLogout={handleLogout}
      onUsernameChange={u => setUser(u)}
      onOpenSplitter={() => setActiveView('splitter')}
    />
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
