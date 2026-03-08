"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { currency } from "@/lib/utils";

const TARGET = 1_000_000;
const MIN_WAGE = 1512;

export function FinancialIndependenceScreen() {
  const [serviceValue, setServiceValue] = useState("450");
  const [serviceHours, setServiceHours] = useState("2");
  const [workDaysPerWeek, setWorkDaysPerWeek] = useState("5");
  const [projectionMonths, setProjectionMonths] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const parsed = useMemo(() => {
    const value = Number(serviceValue);
    const hours = Number(serviceHours);
    const days = Number(workDaysPerWeek);
    const months = projectionMonths ? Number(projectionMonths) : undefined;

    const valid = value > 0 && hours > 0 && days > 0 && days <= 7 && (!months || months > 0);
    if (!valid) return null;

    const appointmentsPerDay = Math.max(Math.floor(8 / hours), 1);
    const weeklyRevenue = value * appointmentsPerDay * days;
    const monthlyRevenue = weeklyRevenue * 4.33;
    const projectedAmount = months ? monthlyRevenue * months : 0;

    const monthsToMillion = Math.ceil(TARGET / monthlyRevenue);
    const reachedWithinProjection = months ? projectedAmount >= TARGET : false;

    const cltInss = MIN_WAGE * 0.075;
    const cltTransport = MIN_WAGE * 0.06;
    const cltNet = MIN_WAGE - cltInss - cltTransport;
    const cltFgts = MIN_WAGE * 0.08;
    const cltMonthsToMillion = Math.ceil(TARGET / cltNet);

    return {
      appointmentsPerDay,
      weeklyRevenue,
      monthlyRevenue,
      projectedAmount,
      monthsToMillion,
      reachedWithinProjection,
      cltInss,
      cltTransport,
      cltNet,
      cltFgts,
      cltMonthsToMillion,
      months,
    };
  }, [projectionMonths, serviceHours, serviceValue, workDaysPerWeek]);

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-5">
        <header>
          <h1 className="text-2xl font-semibold text-zinc-900">Independencia Financeira</h1>
          <p className="text-sm text-zinc-600">Simule ganhos com base na sua rotina e compare com um cenario CLT padrao.</p>
        </header>

        <Card className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <Input id="valor-servico" label="Valor do servico (R$)" value={serviceValue} onChange={(e) => setServiceValue(e.target.value)} inputMode="decimal" />
            <Input id="tempo-atendimento" label="Tempo por atendimento (horas)" value={serviceHours} onChange={(e) => setServiceHours(e.target.value)} inputMode="decimal" />
            <Input id="dias-semana" label="Dias de trabalho por semana" value={workDaysPerWeek} onChange={(e) => setWorkDaysPerWeek(e.target.value)} inputMode="numeric" />
            <Input id="tempo-opcional" label="Tempo de projecao (meses, opcional)" value={projectionMonths} onChange={(e) => setProjectionMonths(e.target.value)} inputMode="numeric" />
          </div>
          <Button onClick={() => setSubmitted(true)}>Gerar simulacao</Button>
        </Card>

        {submitted && !parsed ? <EmptyState title="Dados invalidos" description="Revise os valores. Use numeros positivos e no maximo 7 dias por semana." /> : null}

        {submitted && parsed ? (
          <>
            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Summary title="Atendimentos/dia" value={`${parsed.appointmentsPerDay}`} />
              <Summary title="Receita semanal" value={currency(parsed.weeklyRevenue)} />
              <Summary title="Receita mensal" value={currency(parsed.monthlyRevenue)} />
              <Summary
                title="Status 1 milhao"
                value={parsed.months && parsed.reachedWithinProjection ? "Atingiu" : "Em projecao"}
                highlight={parsed.months ? parsed.reachedWithinProjection : false}
              />
            </section>

            <Card className="space-y-2">
              <h2 className="text-lg font-semibold text-zinc-900">Relatorio de montante</h2>
              {parsed.months ? (
                <p className="text-sm text-zinc-700">Montante no periodo informado: <strong>{currency(parsed.projectedAmount)}</strong></p>
              ) : (
                <p className="text-sm text-zinc-700">Sem periodo informado: calculamos automaticamente o tempo ate {currency(TARGET)}.</p>
              )}
              <p className="text-sm text-zinc-700">
                {parsed.months && parsed.reachedWithinProjection
                  ? `Meta de R$ 1.000.000,00 atingida em aproximadamente ${parsed.monthsToMillion} meses.`
                  : `Tempo estimado para atingir R$ 1.000.000,00: ${parsed.monthsToMillion} meses.`}
              </p>
            </Card>

            <Card className="space-y-3">
              <h2 className="text-lg font-semibold text-zinc-900">Comparativo: Voce x CLT</h2>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl bg-wine-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-wine-700">Voce (simulacao)</p>
                  <p className="text-lg font-semibold text-zinc-900">{currency(parsed.monthlyRevenue)} / mes</p>
                  <p className="text-sm text-zinc-700">Tempo ate 1 milhao: {parsed.monthsToMillion} meses</p>
                </div>
                <div className="rounded-xl bg-zinc-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-zinc-600">CLT padrao (minimo referencia)</p>
                  <p className="text-sm text-zinc-700">Salario: {currency(MIN_WAGE)}</p>
                  <p className="text-sm text-zinc-700">INSS (7,5%): {currency(parsed.cltInss)}</p>
                  <p className="text-sm text-zinc-700">Vale transporte (6%): {currency(parsed.cltTransport)}</p>
                  <p className="text-sm text-zinc-700">FGTS (8%): {currency(parsed.cltFgts)} (beneficio)</p>
                  <p className="text-sm font-semibold text-zinc-900">Liquido aproximado: {currency(parsed.cltNet)}</p>
                  <p className="text-sm text-zinc-700">Tempo ate 1 milhao: {parsed.cltMonthsToMillion} meses</p>
                </div>
              </div>
            </Card>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}

function Summary({ title, value, highlight }: { title: string; value: string; highlight?: boolean }) {
  return (
    <Card className={highlight ? "border-emerald-200 bg-emerald-50" : undefined}>
      <p className="text-xs text-zinc-500">{title}</p>
      <p className="text-lg font-semibold text-zinc-900">{value}</p>
    </Card>
  );
}
