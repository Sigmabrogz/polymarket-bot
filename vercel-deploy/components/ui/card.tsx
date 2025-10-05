import { ReactNode } from 'react';
import clsx from 'clsx';

type CardProps = {
  title?: string;
  description?: string;
  headerAction?: ReactNode;
  children: ReactNode;
  className?: string;
};

export const Card = ({ title, description, headerAction, children, className }: CardProps) => (
  <div
    className={clsx(
      'rounded-xl border border-white/5 bg-slate-950/60 p-4 shadow-lg shadow-slate-950/40 backdrop-blur',
      className
    )}
  >
    {(title || description || headerAction) && (
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          {title && <h2 className="text-lg font-semibold text-white">{title}</h2>}
          {description && <p className="text-xs text-slate-400">{description}</p>}
        </div>
        {headerAction}
      </div>
    )}
    <div className="space-y-3 text-sm text-slate-200">{children}</div>
  </div>
);
