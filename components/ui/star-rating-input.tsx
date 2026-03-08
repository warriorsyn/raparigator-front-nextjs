"use client";

import { cn } from "@/lib/utils";

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function StarRatingInput({ value, onChange, disabled }: StarRatingInputProps) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Nota do atendimento">
      {Array.from({ length: 5 }).map((_, index) => {
        const star = index + 1;
        const active = star <= value;
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${star} estrela${star > 1 ? "s" : ""}`}
            disabled={disabled}
            onClick={() => onChange(star)}
            className={cn(
              "h-9 w-9 rounded-lg text-2xl leading-none transition",
              active ? "bg-amber-50 text-amber-500" : "bg-zinc-100 text-zinc-400",
              !disabled && "hover:bg-amber-100",
            )}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
