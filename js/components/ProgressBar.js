function ProgressBar({ pct }) {
  const clamped = Math.min(pct, 100);
  const color = pct < 50 ? 'bg-emerald-400' : pct < 80 ? 'bg-amber-400' : 'bg-rose-500';
  return (
    <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">
      <div
        className={`${color} h-4 rounded-full transition-all duration-700 ease-out`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

window.ProgressBar = ProgressBar;
