"use client";

import { ReactNode } from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children?: ReactNode;
  actions?: ReactNode;
  size?: "sm" | "md";
}

export function Modal({ open, title, description, onClose, children, actions, size = "sm" }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-zinc-900/50 p-4 sm:items-center sm:justify-center" role="dialog" aria-modal="true">
      <div className={cn("w-full rounded-2xl bg-white p-5 shadow-xl", size === "md" ? "sm:max-w-2xl" : "sm:max-w-md")}>
        <div className="mb-4 space-y-1">
          <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
          {description ? <p className="text-sm text-zinc-600">{description}</p> : null}
        </div>
        {children}
        <div className="mt-5 flex gap-2">
          {actions ?? (
            <Button variant="secondary" fullWidth onClick={onClose}>
              Fechar
            </Button>
          )}
        </div>
      </div>
      <button aria-label="Fechar modal" className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
}
