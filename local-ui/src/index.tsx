import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes } from 'react';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50 active:translate-y-px';
  const styles =
    variant === 'primary'
      ? 'bg-tropical-jade-500 text-neutral-50 hover:bg-tropical-jade-400 focus-visible:outline-tropical-aqua-300 shadow-[0_10px_28px_rgba(9,124,135,0.25)]'
      : 'bg-neutral-900 text-neutral-50 hover:bg-neutral-800 focus-visible:outline-tropical-sage-300 border border-neutral-800';

  return <button type="button" className={`${base} ${styles} ${className}`.trim()} {...props} />;
}

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = '', ...props }: InputProps) {
  const base =
    'w-full rounded-md border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-sm text-neutral-50 shadow-sm outline-none ring-tropical-aqua-400/0 transition placeholder:text-neutral-500 focus:border-tropical-aqua-400 focus:ring-2 focus:ring-tropical-aqua-400/25 disabled:cursor-not-allowed disabled:opacity-60';
  return <input className={`${base} ${className}`.trim()} {...props} />;
}

export type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-neutral-800/80 bg-neutral-950/60 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.35)] backdrop-blur ${className}`.trim()}
      {...props}
    />
  );
}

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: 'default' | 'success' | 'warning';
};

export function Badge({ tone = 'default', className = '', ...props }: BadgeProps) {
  const tones: Record<NonNullable<BadgeProps['tone']>, string> = {
    default: 'bg-neutral-900 text-neutral-200 border border-neutral-800',
    success: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25',
    warning: 'bg-amber-500/15 text-amber-300 border border-amber-500/25',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]} ${className}`.trim()}
      {...props}
    />
  );
}
