const { useMemo } = React;

function CategoryBreakdown({ expenses, categoryBudgets }) {
  const totals = useMemo(() => {
    const map = {};
    for (const e of expenses) {
      const id = e.category || 'other';
      map[id] = (map[id] || 0) + Number(e.amount);
    }
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([id, amt]) => ({ cat: CAT_MAP[id] || CAT_MAP['other'], amt }));
  }, [expenses]);

  if (totals.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-slate-600 text-sm">No data yet.</p>
      </div>
    );
  }

  const max = totals[0].amt;
  const budgets = categoryBudgets || {};

  return (
    <div className="space-y-3">
      {totals.map(({ cat, amt }) => {
        const limit = budgets[cat.id] ? Number(budgets[cat.id]) : null;
        const overLimit = limit !== null && amt > limit;
        const barColor = overLimit ? 'bg-rose-500' : cat.bar;
        const barWidth = limit !== null
          ? `${Math.min((amt / limit) * 100, 100)}%`
          : `${(amt / max) * 100}%`;

        return (
          <div key={cat.id}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-300 flex items-center gap-1.5">
                <span>{cat.emoji}</span>{cat.label}
                {overLimit && <span className="text-xs text-rose-400 font-semibold">over limit</span>}
              </span>
              <span className="text-sm font-semibold text-white flex items-center gap-1">
                ${amt.toFixed(2)}
                {limit !== null && (
                  <span className="text-xs text-slate-500 font-normal">/ ${limit.toFixed(0)}</span>
                )}
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className={`${barColor} h-2 rounded-full transition-all duration-700`}
                style={{ width: barWidth }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

window.CategoryBreakdown = CategoryBreakdown;
