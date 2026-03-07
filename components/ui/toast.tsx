import { cn } from "@/lib/utils";

interface ToastProps {
  title: string;
  message: string;
  type?: "success" | "error" | "info";
}

const tone = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-red-200 bg-red-50 text-red-800",
  info: "border-wine-200 bg-wine-50 text-wine-800",
};

export function Toast({ title, message, type = "info" }: ToastProps) {
  return (
    <div className={cn("rounded-xl border p-3 shadow-sm", tone[type])} role="status" aria-live="polite">
      <p className="text-sm font-semibold">{title}</p>
      <p className="text-xs">{message}</p>
    </div>
  );
}
