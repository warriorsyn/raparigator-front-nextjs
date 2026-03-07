import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface InfoBannerProps {
  title: string;
  description: string;
  tone?: "neutral" | "highlight";
  icon?: ReactNode;
}

export function InfoBanner({ title, description, tone = "neutral", icon }: InfoBannerProps) {
  return (
    <div className={cn("rounded-2xl border p-4", tone === "highlight" ? "border-wine-200 bg-wine-50" : "border-zinc-200 bg-zinc-50")}>
      <div className="flex gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-sm">{icon ?? "i"}</div>
        <div>
          <p className="text-sm font-semibold text-zinc-900">{title}</p>
          <p className="text-sm text-zinc-600">{description}</p>
        </div>
      </div>
    </div>
  );
}
