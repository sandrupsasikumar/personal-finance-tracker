const CATEGORIES = [
  { id: 'food',          label: 'Food & Dining',    emoji: '🍽️',  bg: 'bg-emerald-900/50',  text: 'text-emerald-300',  bar: 'bg-emerald-400' },
  { id: 'entertainment', label: 'Entertainment',    emoji: '🎬',  bg: 'bg-purple-900/50',   text: 'text-purple-300',   bar: 'bg-purple-400'  },
  { id: 'transport',     label: 'Transport',        emoji: '🚗',  bg: 'bg-blue-900/50',     text: 'text-blue-300',     bar: 'bg-blue-400'    },
  { id: 'shopping',      label: 'Shopping',         emoji: '🛍️',  bg: 'bg-pink-900/50',     text: 'text-pink-300',     bar: 'bg-pink-400'    },
  { id: 'health',        label: 'Health',           emoji: '🏥',  bg: 'bg-red-900/50',      text: 'text-red-300',      bar: 'bg-red-400'     },
  { id: 'utilities',     label: 'Utilities',        emoji: '💡',  bg: 'bg-yellow-900/50',   text: 'text-yellow-300',   bar: 'bg-yellow-400'  },
  { id: 'housing',       label: 'Housing & Rent',   emoji: '🏠',  bg: 'bg-orange-900/50',   text: 'text-orange-300',   bar: 'bg-orange-400'  },
  { id: 'education',     label: 'Education',        emoji: '📚',  bg: 'bg-cyan-900/50',     text: 'text-cyan-300',     bar: 'bg-cyan-400'    },
  { id: 'travel',        label: 'Travel',           emoji: '✈️',  bg: 'bg-sky-900/50',      text: 'text-sky-300',      bar: 'bg-sky-400'     },
  { id: 'subscriptions', label: 'Subscriptions',    emoji: '📱',  bg: 'bg-violet-900/50',   text: 'text-violet-300',   bar: 'bg-violet-400'  },
  { id: 'savings',       label: 'Savings',          emoji: '💰',  bg: 'bg-green-900/50',    text: 'text-green-300',    bar: 'bg-green-400'   },
  { id: 'other',         label: 'Other',            emoji: '📦',  bg: 'bg-slate-800',       text: 'text-slate-300',    bar: 'bg-slate-400'   },
];

const CAT_MAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

window.CATEGORIES = CATEGORIES;
window.CAT_MAP     = CAT_MAP;
