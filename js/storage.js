const SESSION_KEY = 'spendcheck_session';
const USERS_KEY   = 'spendcheck_users';

function getUsers()     { try { return JSON.parse(localStorage.getItem(USERS_KEY)) || {}; } catch { return {}; } }
function saveUsers(u)   { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }
function getSession()   { return sessionStorage.getItem(SESSION_KEY) || null; }
function setSession(u)  { sessionStorage.setItem(SESSION_KEY, u); }
function clearSession() { sessionStorage.removeItem(SESSION_KEY); }

function userDataKey(u)     { return `spendcheck_data_${u}`; }
function defaultUserData()  { return { budget: 2000, income: 0, expenses: [], categoryBudgets: {}, recurring: [], recurringApplied: {}, name: '' }; }
function loadUserData(u)    { try { return JSON.parse(localStorage.getItem(userDataKey(u))) || defaultUserData(); } catch { return defaultUserData(); } }
function saveUserData(u, d) { localStorage.setItem(userDataKey(u), JSON.stringify(d)); }

// Simple encoding — fine for local-only storage
function hashPw(pw) { return btoa(unescape(encodeURIComponent(pw))); }

function changeUsername(oldU, newU) {
  const users = getUsers();
  users[newU] = users[oldU];
  delete users[oldU];
  saveUsers(users);
  const data = loadUserData(oldU);
  saveUserData(newU, data);
  localStorage.removeItem(userDataKey(oldU));
  setSession(newU);
}

function changePassword(username, newHashedPw) {
  const users = getUsers();
  users[username].pw = newHashedPw;
  saveUsers(users);
}

function updateUserEmail(username, email) {
  const users = getUsers();
  if (users[username]) {
    users[username].email = email;
    saveUsers(users);
  }
}

window.getUsers        = getUsers;
window.saveUsers       = saveUsers;
window.getSession      = getSession;
window.setSession      = setSession;
window.clearSession    = clearSession;
window.loadUserData    = loadUserData;
window.saveUserData    = saveUserData;
window.hashPw          = hashPw;
window.changeUsername  = changeUsername;
window.changePassword  = changePassword;
window.updateUserEmail = updateUserEmail;
