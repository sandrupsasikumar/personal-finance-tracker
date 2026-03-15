function CategoryPicker({ value, onChange }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-2">Category</label>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onChange(cat.id)}
            className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border text-xs font-medium transition-all
              ${value === cat.id
                ? `${cat.bg} ${cat.text} border-current ring-1 ring-current`
                : 'bg-[#0f1117] text-slate-500 border-slate-800 hover:border-slate-600 hover:text-slate-300'
              }`}
          >
            <span className="text-base leading-none">{cat.emoji}</span>
            <span className="leading-tight text-center">{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

window.CategoryPicker = CategoryPicker;
