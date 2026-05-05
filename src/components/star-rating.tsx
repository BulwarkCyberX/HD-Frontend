'use client';

type StarRatingProps = {
  value: number;
  onChange: (value: number) => void;
  max?: number;
};

export function StarRating({ value, onChange, max = 5 }: StarRatingProps) {
  return (
    <div className="flex gap-2">
      {Array.from({ length: max }, (_, idx) => idx + 1).map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`rounded-md px-2 py-1 text-sm ${
            value >= star ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
          }`}
        >
          ★ {star}
        </button>
      ))}
    </div>
  );
}
