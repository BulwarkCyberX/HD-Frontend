import { forwardRef } from 'react';
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50 active:translate-y-px';
  const styles =
    variant === 'primary'
      ? 'bg-tropical-jade-500 text-neutral-50 hover:bg-tropical-jade-400 focus-visible:outline-tropical-aqua-300 shadow-[0_10px_28px_rgba(9,124,135,0.25)]'
      : 'border border-tropical-jade-300 bg-tropical-sage-100 text-tropical-jade-900 hover:bg-tropical-sage-200 focus-visible:outline-tropical-sage-400';

  return <button type="button" className={`${base} ${styles} ${className}`.trim()} {...props} />;
}

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ className = '', ...props }, ref) {
  const base =
    'w-full rounded-md border border-tropical-jade-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-tropical-aqua-400/0 transition placeholder:text-slate-400 focus:border-tropical-aqua-500 focus:ring-2 focus:ring-tropical-aqua-400/25 disabled:cursor-not-allowed disabled:opacity-60';
  return <input ref={ref} className={`${base} ${className}`.trim()} {...props} />;
});

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className = '', ...props },
  ref,
) {
  const base =
    'w-full rounded-md border border-tropical-jade-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-tropical-aqua-400/0 transition placeholder:text-slate-400 focus:border-tropical-aqua-500 focus:ring-2 focus:ring-tropical-aqua-400/25 disabled:cursor-not-allowed disabled:opacity-60';
  return <textarea ref={ref} className={`${base} ${className}`.trim()} {...props} />;
});

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  /** Dark glass card for marketing / auth; default light panel uses the tropical scale. */
  surface?: 'light' | 'dark';
};

export function Card({ className = '', surface = 'light', ...props }: CardProps) {
  const surfaces: Record<NonNullable<CardProps['surface']>, string> = {
    light:
      'rounded-xl border border-tropical-jade-200 bg-tropical-sand-50 p-5 shadow-[0_10px_28px_rgba(9,124,135,0.10)]',
    dark: 'rounded-xl border border-neutral-800/80 bg-neutral-950/60 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.35)] backdrop-blur',
  };

  return <div className={`${surfaces[surface]} ${className}`.trim()} {...props} />;
}

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: 'default' | 'success' | 'warning';
};

export function Badge({ tone = 'default', className = '', ...props }: BadgeProps) {
  const tones: Record<NonNullable<BadgeProps['tone']>, string> = {
    default: 'border border-tropical-jade-200 bg-tropical-sage-100 text-slate-800',
    success: 'border border-emerald-200 bg-emerald-50 text-emerald-900',
    warning: 'border border-amber-200 bg-amber-50 text-amber-950',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]} ${className}`.trim()}
      {...props}
    />
  );
}
