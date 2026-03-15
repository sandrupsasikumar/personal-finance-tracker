const { useState: useStateApp } = React;

function App() {
  const [user, setUser] = useStateApp(() => getSession());

  function handleLogin(u)  { setUser(u); }
  function handleLogout()  { clearSession(); setUser(null); }

  if (!user) return <AuthPage onLogin={handleLogin} />;
  return <Dashboard username={user} onLogout={handleLogout} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
