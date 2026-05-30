'use client';

/**
 * Animated loading spinner used across the app for page transitions,
 * section loading, and data fetching states.
 *
 * Variants:
 * - "sm"   → inline/button-level (16px)
 * - "md"   → section-level (24px, default)
 * - "lg"   → full-page/route-level (40px)
 * - "page" → centered full-viewport with label
 */

type SpinnerSize = 'sm' | 'md' | 'lg' | 'page';

interface SpinnerProps {
  /** Visual size preset */
  size?: SpinnerSize;
  /** Optional label shown below the spinner (only for "page" variant or when explicitly passed) */
  label?: string;
  /** Additional CSS classes */
  className?: string;
}

const sizeMap: Record<Exclude<SpinnerSize, 'page'>, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-[3px]',
};

export function Spinner({ size = 'md', label, className = '' }: SpinnerProps) {
  if (size === 'page') {
    return (
      <div className={`flex min-h-[60vh] flex-col items-center justify-center gap-3 ${className}`.trim()}>
        <div
          className="h-10 w-10 animate-spin rounded-full border-[3px] border-tropical-aqua-400 border-t-transparent"
          role="status"
          aria-label={label || 'Loading'}
        />
        {label ? <p className="text-sm text-neutral-400">{label}</p> : null}
      </div>
    );
  }

  const sizeClasses = sizeMap[size];

  if (label) {
    return (
      <div className={`flex items-center gap-2 ${className}`.trim()}>
        <div
          className={`animate-spin rounded-full border-tropical-aqua-400 border-t-transparent ${sizeClasses}`}
          role="status"
          aria-label={label}
        />
        <span className="text-sm text-slate-500">{label}</span>
      </div>
    );
  }

  return (
    <div
      className={`animate-spin rounded-full border-tropical-aqua-400 border-t-transparent ${sizeClasses} ${className}`.trim()}
      role="status"
      aria-label="Loading"
    />
  );
}
