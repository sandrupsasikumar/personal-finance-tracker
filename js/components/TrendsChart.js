const { useMemo: useMemoTrends } = React;

function TrendsChart({ expenses, selectedMonth }) {
  const months = useMemoTrends(() => {
    const result = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'short' });
      result.push({ key, label });
    }
    return result;
  }, []);

  const totals = useMemoTrends(() => {
    const map = {};
    for (const e of expenses) {
      const key = e.date.slice(0, 7);
      map[key] = (map[key] || 0) + Number(e.amount);
    }
    return months.map(m => ({ ...m, total: map[m.key] || 0 }));
  }, [expenses, months]);

  const max = Math.max(...totals.map(m => m.total), 1);

  return (
    <div>
      <div className="flex items-end justify-between gap-2 h-36 px-1">
        {totals.map(({ key, label, total }) => {
          const isSelected = key === selectedMonth;
          const heightPct = (total / max) * 100;
          return (
            <div key={key} className="flex-1 flex flex-col items-center gap-1">
              {total > 0 && (
                <span className={`text-xs font-medium ${isSelected ? 'text-indigo-300' : 'text-slate-500'}`}>
                  ${total >= 1000 ? `${(total / 1000).toFixed(1)}k` : total.toFixed(0)}
                </span>
              )}
              <div className="w-full flex items-end" style={{ height: '80px' }}>
                <div
                  className={`w-full rounded-t-md transition-all duration-700 ${isSelected ? 'bg-indigo-500' : 'bg-slate-700 hover:bg-slate-600'}`}
                  style={{ height: total > 0 ? `${Math.max(heightPct, 4)}%` : '4px', opacity: total > 0 ? 1 : 0.3 }}
                />
              </div>
              <span className={`text-xs font-medium ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`}>{label}</span>
            </div>
          );
        })}
      </div>
      {totals.every(m => m.total === 0) && (
        <p className="text-center text-slate-600 text-sm mt-4">No expense data in the last 6 months.</p>
      )}
    </div>
  );
}

window.TrendsChart = TrendsChart;
