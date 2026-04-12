"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const REVIEWS = [
  { id: "r1", author: "Cliente verificado", timeAgo: "3 dias", text: "Pontual, educada e super discreta.", score: 5 },
  { id: "r2", author: "Cliente premium", timeAgo: "1 semana", text: "Experiência impecável do início ao fim.", score: 5 },
  { id: "r3", author: "Cliente verificado", timeAgo: "2 semanas", text: "Excelente conversa e atendimento cordial.", score: 4 },
  { id: "r4", author: "Cliente novo", timeAgo: "1 mês", text: "Atendimento respeitoso e ambiente muito organizado.", score: 4 },
];

export function ReviewsTab() {
  const avg = (REVIEWS.reduce((sum, item) => sum + item.score, 0) / REVIEWS.length).toFixed(1);

  return (
    <div className="space-y-4 lg:space-y-6">
      <Card className="border-zinc-200 bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Avaliações</p>
            <h2 className="mt-1 text-xl font-black text-zinc-900 sm:text-2xl">Reputação do anúncio</h2>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-right">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">Média atual</p>
            <p className="text-lg font-black text-amber-700">{avg} ★</p>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {REVIEWS.map((review) => (
          <Card key={review.id} className="border-zinc-200 bg-white p-4 sm:p-5">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-zinc-900">{review.author}</p>
                <p className="text-xs text-zinc-500">{review.timeAgo}</p>
              </div>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <span key={index} className={cn("text-sm", index < review.score ? "text-amber-400" : "text-zinc-200")}>
                    ★
                  </span>
                ))}
              </div>
            </div>
            <p className="text-sm leading-relaxed text-zinc-600">{review.text}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
