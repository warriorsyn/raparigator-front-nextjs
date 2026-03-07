import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InfoBanner } from "@/components/ui/info-banner";
import { serviceTracking } from "@/lib/mock-data";

export function TrackingScreen() {
  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-5">
        <h1 className="text-2xl font-semibold text-zinc-900">Acompanhamento do servico</h1>
        <Card className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Metric label="Status" value={serviceTracking.status} />
            <Metric label="Previsao" value={serviceTracking.estimatedArrival} />
            <Metric label="Tempo em atendimento" value={serviceTracking.elapsed} />
          </div>
          <InfoBanner title="Profissional pronta" description="Recebemos confirmacao de preparo. Voce pode liberar check-in ao chegar no local." tone="highlight" />
          <div className="grid gap-2 sm:grid-cols-2"><Button>Confirmar check-in</Button><Button variant="danger">Botao de emergencia / panico</Button></div>
        </Card>
        <Card className="space-y-3">
          <h2 className="text-base font-semibold text-zinc-900">Linha do atendimento</h2>
          <TimelineItem title="Pagamento em custodia confirmado" subtitle="19:10" />
          <TimelineItem title="Profissional em deslocamento" subtitle="19:30" />
          <TimelineItem title="Codigo de check-in" subtitle={serviceTracking.checkInCode} />
        </Card>
      </div>
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-zinc-50 p-3"><p className="text-xs text-zinc-500">{label}</p><p className="text-sm font-semibold text-zinc-900">{value}</p></div>;
}

function TimelineItem({ title, subtitle }: { title: string; subtitle: string }) {
  return <div className="flex items-center gap-3 rounded-xl border border-zinc-200 p-3"><span className="h-2.5 w-2.5 rounded-full bg-wine-700" /><div><p className="text-sm font-medium text-zinc-900">{title}</p><p className="text-xs text-zinc-500">{subtitle}</p></div></div>;
}
