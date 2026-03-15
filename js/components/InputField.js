const { useEffect, useRef } = React;

function InputField({ label, prefix, type = 'text', value, onChange, placeholder, autoFocus }) {
  const ref = useRef(null);
  useEffect(() => { if (autoFocus) ref.current?.focus(); }, []);

  return (
    <div>
      {label && <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>}
      <div className="relative">
        {prefix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold text-sm select-none">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full bg-[#0f1117] border border-slate-700 rounded-xl ${prefix ? 'pl-8' : 'px-4'} pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm`}
        />
      </div>
    </div>
  );
}

window.InputField = InputField;
