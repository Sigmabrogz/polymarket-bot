import clsx from 'clsx';

export const StatPill = ({
  label,
  value,
  accent
}: {
  label: string;
  value: string;
  accent?: 'positive' | 'negative' | 'neutral';
}) => {
  const accentClass =
    accent === 'positive'
      ? 'text-emerald-300'
      : accent === 'negative'
        ? 'text-rose-300'
        : 'text-slate-300';

  return (
    <div className="flex flex-col gap-1 rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2">
      <span className="text-[10px] uppercase tracking-widest text-slate-500">{label}</span>
      <span className={clsx('text-sm font-semibold', accentClass)}>{value}</span>
    </div>
  );
};
