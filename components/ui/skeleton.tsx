import clsx from 'clsx';

export const Skeleton = ({ rows = 3, className }: { rows?: number; className?: string }) => (
  <div className={clsx('space-y-2', className)}>
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className="h-4 animate-pulse rounded bg-slate-800/60" />
    ))}
  </div>
);
