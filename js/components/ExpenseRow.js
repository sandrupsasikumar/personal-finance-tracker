function ExpenseRow({ expense, onDelete, onEdit }) {
  const date  = new Date(expense.date);
  const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const cat   = CAT_MAP[expense.category] || CAT_MAP['other'];

  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-[#0f1117] border border-slate-800 hover:border-slate-700 transition-colors group">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-xl flex-shrink-0">{cat.emoji}</span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white leading-tight truncate">{expense.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-slate-500">{label}</span>
            <span className={`text-xs font-medium ${cat.text}`}>{cat.label}</span>
          </div>
          {expense.notes && (
            <p className="text-xs text-slate-600 italic truncate mt-0.5">{expense.notes}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
        <span className="text-sm font-semibold text-white">${Number(expense.amount).toFixed(2)}</span>
        <button
          onClick={() => onEdit(expense)}
          className="text-slate-700 hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100"
          title="Edit"
        >
          <EditIcon />
        </button>
        <button
          onClick={() => onDelete(expense.id)}
          className="text-slate-700 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
          title="Remove"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

window.ExpenseRow = ExpenseRow;
