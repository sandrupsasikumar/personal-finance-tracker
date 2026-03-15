const { useMemo } = React;

function CategoryBreakdown({ expenses }) {
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

  return (
    <div className="space-y-3">
      {totals.map(({ cat, amt }) => (
        <div key={cat.id}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-slate-300 flex items-center gap-1.5">
              <span>{cat.emoji}</span>{cat.label}
            </span>
            <span className="text-sm font-semibold text-white">${amt.toFixed(2)}</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className={`${cat.bar} h-2 rounded-full transition-all duration-700`}
              style={{ width: `${(amt / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

window.CategoryBreakdown = CategoryBreakdown;
