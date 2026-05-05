import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes } from 'react';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50';
  const styles =
    variant === 'primary'
      ? 'bg-slate-900 text-white hover:bg-slate-800 focus-visible:outline-slate-900'
      : 'bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:outline-slate-400';

  return <button type="button" className={`${base} ${styles} ${className}`.trim()} {...props} />;
}

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = '', ...props }: InputProps) {
  const base =
    'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-emerald-500/0 transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60';
  return <input className={`${base} ${className}`.trim()} {...props} />;
}

export type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className = '', ...props }: CardProps) {
  return <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className}`.trim()} {...props} />;
}

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: 'default' | 'success' | 'warning';
};

export function Badge({ tone = 'default', className = '', ...props }: BadgeProps) {
  const tones: Record<NonNullable<BadgeProps['tone']>, string> = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]} ${className}`.trim()}
      {...props}
    />
  );
}
