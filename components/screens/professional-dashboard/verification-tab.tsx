"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type VerificationItem = {
  id: string;
  title: string;
  description: string;
  status: "pendente" | "enviado" | "aprovado";
};

const INITIAL_ITEMS: VerificationItem[] = [
  {
    id: "doc-id",
    title: "Documento de identidade",
    description: "RG, CNH ou passaporte em boa resolução.",
    status: "pendente",
  },
  {
    id: "doc-face",
    title: "Selfie de validação",
    description: "Foto atual para validação de perfil.",
    status: "enviado",
  },
  {
    id: "doc-address",
    title: "Comprovante de endereço",
    description: "Documento emitido nos últimos 90 dias.",
    status: "aprovado",
  },
];

const statusLabel: Record<VerificationItem["status"], string> = {
  pendente: "Pendente",
  enviado: "Enviado",
  aprovado: "Aprovado",
};

const statusClass: Record<VerificationItem["status"], string> = {
  pendente: "border-amber-200 bg-amber-50 text-amber-700",
  enviado: "border-sky-200 bg-sky-50 text-sky-700",
  aprovado: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export function VerificationTab() {
  const [items, setItems] = useState(INITIAL_ITEMS);

  const approvedCount = items.filter((item) => item.status === "aprovado").length;
  const progress = Math.round((approvedCount / items.length) * 100);

  const handleSend = (id: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status: "enviado" } : item)));
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <Card className="border-zinc-200 bg-white p-4 sm:p-5">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Verificação</p>
        <h2 className="mt-1 text-xl font-black text-zinc-900 sm:text-2xl">Status da sua conta profissional</h2>
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-zinc-600">Progresso</span>
            <span className="font-black text-zinc-900">{progress}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-100">
            <div className="h-full rounded-full bg-wine-700" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.id} className="border-zinc-200 bg-white p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-zinc-900">{item.title}</p>
                <p className="mt-1 text-sm text-zinc-600">{item.description}</p>
              </div>
              <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${statusClass[item.status]}`}>
                {statusLabel[item.status]}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                variant="primary"
                className="h-10"
                onClick={() => handleSend(item.id)}
                disabled={item.status === "aprovado"}
              >
                {item.status === "pendente" ? "Enviar" : "Reenviar"}
              </Button>
              <Button variant="secondary" className="h-10">
                Editar
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
