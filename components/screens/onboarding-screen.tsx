"use client";

import Link from "next/link";
import { useState } from "react";
import { categories, cities, states } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Toast } from "@/components/ui/toast";

export function OnboardingScreen() {
  const [showLocationToast, setShowLocationToast] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(123,17,49,0.1),transparent_55%)]" />
      <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_1fr]">
          <section className="space-y-4">
            <p className="inline-flex rounded-full bg-wine-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-wine-800">Plataforma verificada</p>
            <h1 className="font-display text-4xl leading-tight text-zinc-900 sm:text-5xl">Sigillus: conexoes com discricao, seguranca e experiencia premium.</h1>
            <p className="max-w-xl text-zinc-600">Escolha sua regiao e categoria para acessar anuncios verificados com navegacao simples e suporte da plataforma.</p>
          </section>

          <Card className="space-y-4 p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-zinc-900">Comece sua experiencia</h2>
            <Select id="state" label="Estado" options={states.map((value) => ({ value, label: value }))} defaultValue="SP" />
            <Select id="city" label="Cidade" options={cities.map((value) => ({ value, label: value }))} defaultValue="Sao Paulo" />
            <Select id="category" label="Categoria" options={categories.map((value) => ({ value, label: value }))} defaultValue="Feminino" />
            <button
              className="text-sm font-medium text-wine-700 hover:text-wine-800"
              onClick={() => {
                setShowLocationToast(true);
                setTimeout(() => setShowLocationToast(false), 3000);
              }}
            >
              Usar minha localizacao atual
            </button>
            <Link href="/feed" className="block">
              <Button fullWidth size="lg">
                Entrar no feed
              </Button>
            </Link>
            {showLocationToast ? <Toast title="Localizacao atual aplicada" message="Sao Paulo, SP foi definida automaticamente." type="success" /> : null}
          </Card>
        </div>
      </div>
    </div>
  );
}
