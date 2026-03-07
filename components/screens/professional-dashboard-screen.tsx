"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { dashboardSummary } from "@/lib/mock-data";
import { currency, cn } from "@/lib/utils";

const tabs = ["Resumo", "Servicos", "Valores", "Perfil", "Historico"];

export function ProfessionalDashboardScreen() {
  const [activeAd, setActiveAd] = useState(dashboardSummary.activeAd);
  const [activeTab, setActiveTab] = useState("Resumo");

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="hidden rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm lg:block">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Painel profissional</p>
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={cn("w-full rounded-lg px-3 py-2 text-left text-sm", activeTab === tab ? "bg-wine-700 text-white" : "text-zinc-600 hover:bg-zinc-100")}>{tab}</button>
            ))}
          </nav>
        </aside>

        <div className="space-y-4">
          <div className="flex gap-2 overflow-auto lg:hidden">
            {tabs.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={cn("whitespace-nowrap rounded-full px-3 py-1.5 text-sm", activeTab === tab ? "bg-wine-700 text-white" : "bg-zinc-100 text-zinc-600")}>{tab}</button>
            ))}
          </div>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard title="Receita do mes" value={currency(dashboardSummary.monthRevenue)} />
            <MetricCard title="Atendimentos" value={String(dashboardSummary.completedServices)} />
            <MetricCard title="Visualizacoes" value={String(dashboardSummary.profileViews)} />
            <MetricCard title="Conversao" value={`${dashboardSummary.conversionRate}%`} />
          </section>

          <Card className="flex flex-wrap items-center justify-between gap-3">
            <div><p className="text-sm text-zinc-500">Status do anuncio</p><p className="text-lg font-semibold text-zinc-900">{activeAd ? "Ativo" : "Pausado"}</p></div>
            <Button variant={activeAd ? "secondary" : "primary"} onClick={() => setActiveAd((value) => !value)}>{activeAd ? "Desativar anuncio" : "Ativar anuncio"}</Button>
          </Card>

          {activeTab === "Historico" ? (
            <Card className="space-y-3">
              <h2 className="text-base font-semibold text-zinc-900">Historico de atendimentos</h2>
              <HistoryItem title="Cliente verificado" subtitle="Concluido em 05/03 - R$ 820" />
              <HistoryItem title="Cliente premium" subtitle="Concluido em 03/03 - R$ 1.200" />
            </Card>
          ) : (
            <Card><EmptyState title={`Gestao: ${activeTab}`} description="Area pronta para integracao com API de perfil, servicos, valores, fotos e localizacao." actionLabel="Editar agora" /></Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function MetricCard({ title, value }: { title: string; value: string }) {
  return <Card className="p-3"><p className="text-xs text-zinc-500">{title}</p><p className="text-xl font-semibold text-zinc-900">{value}</p></Card>;
}

function HistoryItem({ title, subtitle }: { title: string; subtitle: string }) {
  return <div className="rounded-xl border border-zinc-200 p-3"><p className="text-sm font-medium text-zinc-900">{title}</p><p className="text-xs text-zinc-500">{subtitle}</p></div>;
}
