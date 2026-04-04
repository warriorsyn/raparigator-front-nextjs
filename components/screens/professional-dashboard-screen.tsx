
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Toast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api/client";
import { createListing, getMyListings, getMyListingsRaw, publishListing, updateListing } from "@/lib/api/listings";
import { getCities, getListingPlans, getListingPrices, getServicesCatalog } from "@/lib/api/reference";
import type {
  CreateListingRequest,
  ListingDetailsResponse,
  ListingPlanResponse,
  ListingPriceInput,
  ListingSummaryResponse,
  ReferenceItemResponse,
} from "@/lib/api/types";
import { getAccessToken } from "@/lib/auth/session";
import { dashboardSummary } from "@/lib/mock-data";
import type { ProfessionalAd } from "@/lib/types";
import { cn, currency } from "@/lib/utils";

interface ListingMediaForm {
  id: string;
  kind: "image" | "video";
  payload: string;
  previewUrl: string;
  isProfileCover: boolean;
}

interface ListingFormState {
  cityId: string;
  listingPlanId: string;
  title: string;
  description: string;
  currencyCode: string;
  availability: string;
  isVisible: boolean;
  publishNow: boolean;
  serviceCatalogIds: string[];
  prices: ListingPriceForm[];
  medias: ListingMediaForm[];
}

interface ListingPriceForm {
  listingPriceId: string;
  name: string;
  mode: "fixed" | "negotiable" | "not_realizable";
  value: string;
}

type ToastState = { title: string; message: string; type: "success" | "error" | "info" } | null;

const tabs = ["Resumo", "Anuncio", "Historico"];

const AVAILABILITY_OPTIONS = [
  { value: "0", label: "Livre" },
  { value: "1", label: "Em atendimento" },
  { value: "2", label: "Indisponivel" },
];

function normalizeText(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
}

function toNumber(value: number | string) {
  return typeof value === "number" ? value : Number(value);
}

function inferKindFromMediaType(value: number | string): "image" | "video" {
  const parsed = typeof value === "number" ? value : Number(value);
  return parsed === 1 ? "video" : "image";
}

function inferKindFromMime(mimeType: string): "image" | "video" {
  return mimeType.toLowerCase().startsWith("video/") ? "video" : "image";
}

async function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Falha ao ler arquivo."));
    reader.readAsDataURL(file);
  });
}

function getAvailabilityValue(value: number | string) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (parsed === 0 || parsed === 1 || parsed === 2) return String(parsed);
  const normalized = normalizeText(String(value));
  if (normalized.includes("livre") || normalized.includes("free")) return "0";
  if (normalized.includes("atendimento") || normalized.includes("busy")) return "1";
  return "2";
}

function createDefaultMedia(): ListingMediaForm {
  return {
    id: crypto.randomUUID(),
    kind: "image",
    payload: "",
    previewUrl: "",
    isProfileCover: true,
  };
}

function normalizeMediaSource(source: string, kind: "image" | "video") {
  const value = source.trim();
  if (!value) return "";
  if (value.startsWith("data:")) return value;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return kind === "video" ? `data:video/mp4;base64,${value}` : `data:image/jpeg;base64,${value}`;
}

function extractPayloadFromSource(source: string) {
  const value = source.trim();
  if (!value) return "";
  if (value.startsWith("data:")) {
    const split = value.split(",");
    return split.length > 1 ? split[1] ?? "" : "";
  }
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  return value;
}

function isListingDetails(value: ListingSummaryResponse | ListingDetailsResponse): value is ListingDetailsResponse {
  return "medias" in value && Array.isArray(value.medias) && "services" in value && Array.isArray(value.services);
}

function createDefaultPriceItems(items: ReferenceItemResponse[]): ListingPriceForm[] {
  return items.map((item) => ({
    listingPriceId: String(item.id),
    name: item.name,
    mode: "fixed",
    value: "",
  }));
}

function createDefaultForm(cities: ReferenceItemResponse[], plans: ListingPlanResponse[], listingPrices: ReferenceItemResponse[]): ListingFormState {
  return {
    cityId: cities[0] ? String(cities[0].id) : "",
    listingPlanId: plans[0] ? String(plans[0].id) : "",
    title: "",
    description: "",
    currencyCode: "BRL",
    availability: "0",
    isVisible: true,
    publishNow: false,
    serviceCatalogIds: [],
    prices: createDefaultPriceItems(listingPrices),
    medias: [createDefaultMedia()],
  };
}

function toPayload(form: ListingFormState): CreateListingRequest {
  const prices: ListingPriceInput[] = form.prices
    .filter((item) => item.mode !== "fixed" || item.value.trim().length > 0)
    .map((item) => ({
      listingPriceId: Number(item.listingPriceId),
      isNegotiable: item.mode === "negotiable",
      isNotRealizable: item.mode === "not_realizable",
      price: item.mode === "fixed" && item.value.trim().length > 0 ? Number(item.value.replace(",", ".")) : null,
    }));

  return {
    cityId: Number(form.cityId),
    listingPlanId: Number(form.listingPlanId),
    title: form.title.trim(),
    description: form.description.trim(),
    currencyCode: form.currencyCode.trim().toUpperCase(),
    availability: Number(form.availability),
    isVisible: form.isVisible,
    publishNow: form.publishNow,
    serviceCatalogIds: form.serviceCatalogIds.map((value) => Number(value)),
    prices,
    medias: form.medias
      .filter((media) => media.payload.trim().length > 0)
      .map((media, index) => ({
        mediaType: media.kind === "video" ? 1 : 0,
        fileUrl: media.payload.trim(),
        caption: null,
        displayOrder: index + 1,
        isProfileCover: media.isProfileCover,
      })),
  };
}

export function ProfessionalDashboardScreen() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeTab, setActiveTab] = useState("Anuncio");
  const [token, setToken] = useState<string | null>(null);
  const [bootstrapped, setBootstrapped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [feedback, setFeedback] = useState<ToastState>(null);

  const [cities, setCities] = useState<ReferenceItemResponse[]>([]);
  const [servicesCatalog, setServicesCatalog] = useState<ReferenceItemResponse[]>([]);
  const [listingPricesCatalog, setListingPricesCatalog] = useState<ReferenceItemResponse[]>([]);
  const [listingPlans, setListingPlans] = useState<ListingPlanResponse[]>([]);
  const [myListings, setMyListings] = useState<ProfessionalAd[]>([]);
  const [myListingsRaw, setMyListingsRaw] = useState<Array<ListingSummaryResponse | ListingDetailsResponse>>([]);
  const [selectedListingId, setSelectedListingId] = useState<string>("new");
  const [form, setForm] = useState<ListingFormState>(createDefaultForm([], [], []));

  const [neighborhood, setNeighborhood] = useState("Jardins");
  const [serviceRadiusKm, setServiceRadiusKm] = useState(15);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  const totalViews = useMemo(() => myListings.reduce((sum, listing) => sum + listing.profileViews, 0), [myListings]);
  const publishedCount = useMemo(() => myListings.filter((listing) => listing.status !== "indisponivel").length, [myListings]);

  const filledMedias = useMemo(() => form.medias.filter((media) => media.payload.trim().length > 0), [form.medias]);
  const coverMedia = useMemo(() => filledMedias.find((media) => media.isProfileCover) ?? filledMedias[0] ?? null, [filledMedias]);
  const secondaryMedias = useMemo(() => filledMedias.filter((media) => media.id !== coverMedia?.id).slice(0, 2), [filledMedias, coverMedia]);

  useEffect(() => {
    setToken(getAccessToken());
    setBootstrapped(true);
  }, []);

  useEffect(() => {
    if (!token) return;
    void bootstrapDashboard(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const showToast = (toast: NonNullable<ToastState>) => {
    setFeedback(toast);
    window.setTimeout(() => setFeedback(null), 4000);
  };

  const bootstrapDashboard = async (accessToken: string) => {
    setLoading(true);
    try {
      const [citiesResponse, servicesResponse, listingPricesResponse, plansResponse, listingsResponse, listingsRawResponse] = await Promise.all([
        getCities(),
        getServicesCatalog(),
        getListingPrices(),
        getListingPlans(),
        getMyListings(accessToken),
        getMyListingsRaw(accessToken),
      ]);

      setCities(citiesResponse);
      setServicesCatalog(servicesResponse);
      setListingPricesCatalog(listingPricesResponse);
      setListingPlans(plansResponse);
      setMyListings(listingsResponse);
      setMyListingsRaw(listingsRawResponse);
      setForm(createDefaultForm(citiesResponse, plansResponse, listingPricesResponse));
      setActiveMediaIndex(0);

      if (listingsRawResponse.length > 0) {
        const first = listingsRawResponse[0];
        const firstId = String(first.listingId);
        setSelectedListingId(firstId);
        hydrateFormFromListing(firstId, citiesResponse, servicesResponse, listingPricesResponse, plansResponse, listingsResponse, listingsRawResponse);
      }
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Nao foi possivel carregar os dados do painel.";
      showToast({ title: "Falha ao carregar painel", message, type: "error" });
    } finally {
      setLoading(false);
    }
  };
  const mapDetailsToForm = (
    details: ListingDetailsResponse,
    cityItems: ReferenceItemResponse[],
    serviceItems: ReferenceItemResponse[],
    listingPriceItems: ReferenceItemResponse[],
    planItems: ListingPlanResponse[],
    listingItems: ProfessionalAd[],
  ): ListingFormState => {
    const detailsPrices = details.prices ?? [];
    const cityMatch = cityItems.find((city) => normalizeText(city.name) === normalizeText(details.cityName));
    const listingSummary = listingItems.find((item) => String(item.id) === String(details.listingId));
    const planMatch = planItems.find((plan) => {
      const planPrice = toNumber(plan.monthlyPrice);
      return listingSummary ? planPrice === listingSummary.subscriptionPrice : false;
    });

    const serviceIds = serviceItems
      .filter((service) => details.services.some((serviceName) => normalizeText(service.name) === normalizeText(serviceName)))
      .map((service) => String(service.id));

    const basePriceItems =
      listingPriceItems.length > 0
        ? listingPriceItems
        : detailsPrices.map((item) => ({ id: item.listingPriceId, name: item.name }));

    const prices = basePriceItems.map((referenceItem) => {
      const current = detailsPrices.find((item) => String(item.listingPriceId) === String(referenceItem.id));
      if (!current) {
        return { listingPriceId: String(referenceItem.id), name: referenceItem.name, mode: "fixed", value: "" } as ListingPriceForm;
      }

      if (current.isNotRealizable) {
        return { listingPriceId: String(referenceItem.id), name: current.name || referenceItem.name, mode: "not_realizable", value: "" } as ListingPriceForm;
      }

      if (current.isNegotiable) {
        return { listingPriceId: String(referenceItem.id), name: current.name || referenceItem.name, mode: "negotiable", value: "" } as ListingPriceForm;
      }

      const numericValue = typeof current.price === "number" ? current.price : current.price ? Number(current.price) : 0;
      return {
        listingPriceId: String(referenceItem.id),
        name: current.name || referenceItem.name,
        mode: "fixed",
        value: Number.isFinite(numericValue) && numericValue > 0 ? String(numericValue) : "",
      } as ListingPriceForm;
    });

    const medias: ListingMediaForm[] = details.medias.length
      ? details.medias
          .sort((a, b) => toNumber(a.displayOrder) - toNumber(b.displayOrder))
          .map((media) => {
            const kind = inferKindFromMediaType(media.mediaType);
            return {
              id: String(media.mediaId),
              kind,
              payload: extractPayloadFromSource(media.fileUrl),
              previewUrl: normalizeMediaSource(media.fileUrl, kind),
              isProfileCover: media.isProfileCover,
            };
          })
      : [createDefaultMedia()];

    if (!medias.some((media) => media.isProfileCover)) medias[0].isProfileCover = true;

    return {
      cityId: cityMatch ? String(cityMatch.id) : cityItems[0] ? String(cityItems[0].id) : "",
      listingPlanId: planMatch ? String(planMatch.id) : planItems[0] ? String(planItems[0].id) : "",
      title: details.title ?? "",
      description: details.description ?? "",
      currencyCode: details.currencyCode || "BRL",
      availability: getAvailabilityValue(details.availability),
      isVisible: details.isVisible,
      publishNow: false,
      serviceCatalogIds: serviceIds,
      prices,
      medias,
    };
  };

  const hydrateFormFromListing = async (
    listingId: string,
    cityItems = cities,
    serviceItems = servicesCatalog,
    listingPriceItems = listingPricesCatalog,
    planItems = listingPlans,
    listingItems = myListings,
    rawListingItems = myListingsRaw,
  ) => {
    const raw = rawListingItems.find((item) => String(item.listingId) === listingId);
    if (!raw) {
      showToast({ title: "Anuncio nao encontrado", message: "Nao foi possivel carregar os dados deste anuncio.", type: "error" });
      return;
    }

    if (!isListingDetails(raw)) {
      showToast({
        title: "Dados incompletos",
        message: "Este anuncio nao retornou detalhes completos no endpoint listings/me.",
        type: "error",
      });
      return;
    }

    setForm(mapDetailsToForm(raw, cityItems, serviceItems, listingPriceItems, planItems, listingItems));
    setActiveMediaIndex(0);
  };

  const handleSelectListing = async (listingId: string) => {
    setSelectedListingId(listingId);
    if (listingId === "new") {
      setForm(createDefaultForm(cities, listingPlans, listingPricesCatalog));
      setActiveMediaIndex(0);
      return;
    }
    await hydrateFormFromListing(listingId);
  };

  const toggleService = (serviceId: string) => {
    setForm((current) => {
      const exists = current.serviceCatalogIds.includes(serviceId);
      return {
        ...current,
        serviceCatalogIds: exists ? current.serviceCatalogIds.filter((id) => id !== serviceId) : [...current.serviceCatalogIds, serviceId],
      };
    });
  };

  const updatePriceMode = (listingPriceId: string, mode: ListingPriceForm["mode"]) => {
    setForm((current) => ({
      ...current,
      prices: current.prices.map((item) =>
        item.listingPriceId === listingPriceId
          ? {
              ...item,
              mode,
              value: mode === "fixed" ? item.value : "",
            }
          : item,
      ),
    }));
  };

  const updatePriceValue = (listingPriceId: string, value: string) => {
    const sanitized = value.replace(/[^\d,.\s]/g, "").trim();
    setForm((current) => ({
      ...current,
      prices: current.prices.map((item) => (item.listingPriceId === listingPriceId ? { ...item, value: sanitized } : item)),
    }));
  };

  const updateMedia = (index: number, patch: Partial<ListingMediaForm>) => {
    setForm((current) => {
      const next = [...current.medias];
      next[index] = { ...next[index], ...patch };
      if (patch.isProfileCover) {
        return { ...current, medias: next.map((media, mediaIndex) => ({ ...media, isProfileCover: mediaIndex === index })) };
      }
      return { ...current, medias: next };
    });
  };

  const openFilePicker = () => fileInputRef.current?.click();

  const handleFilesSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    try {
      const uploaded = await Promise.all(
        files.map(async (file) => {
          const dataUrl = await fileToDataUrl(file);
          const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] ?? "" : dataUrl;
          return {
            id: crypto.randomUUID(),
            kind: inferKindFromMime(file.type),
            payload: base64,
            previewUrl: dataUrl,
            isProfileCover: false,
          } as ListingMediaForm;
        }),
      );

      setForm((current) => {
        const currentMedias = current.medias.filter((media) => media.payload.trim().length > 0);
        const next = [...currentMedias, ...uploaded];
        if (next.length > 0 && !next.some((media) => media.isProfileCover)) {
          next[0] = { ...next[0], isProfileCover: true };
        }
        return { ...current, medias: next.length > 0 ? next : [createDefaultMedia()] };
      });

      setActiveMediaIndex(0);
    } catch {
      showToast({
        title: "Falha no upload",
        message: "Nao foi possivel processar um ou mais arquivos selecionados.",
        type: "error",
      });
    } finally {
      event.target.value = "";
    }
  };

  const removeMedia = (index: number) => {
    setForm((current) => {
      if (current.medias.length <= 1) return current;
      const removedWasCover = current.medias[index].isProfileCover;
      const next = current.medias.filter((_, mediaIndex) => mediaIndex !== index);
      if (removedWasCover && next.length > 0) next[0] = { ...next[0], isProfileCover: true };
      setActiveMediaIndex((prev) => Math.max(0, Math.min(prev, next.length - 1)));
      return { ...current, medias: next };
    });
  };

  const validateForm = () => {
    if (!form.title.trim() || !form.description.trim()) {
      showToast({ title: "Dados obrigatorios", message: "Informe titulo e descricao do anuncio.", type: "error" });
      return false;
    }
    if (!form.cityId || !form.listingPlanId) {
      showToast({ title: "Dados obrigatorios", message: "Selecione cidade e plano do anuncio.", type: "error" });
      return false;
    }
    if (form.serviceCatalogIds.length === 0) {
      showToast({ title: "Servicos obrigatorios", message: "Selecione ao menos um servico para o anuncio.", type: "error" });
      return false;
    }
    const mediasValid = form.medias.filter((media) => media.payload.trim().length > 0);
    if (mediasValid.length === 0) {
      showToast({ title: "Midia obrigatoria", message: "Adicione ao menos um arquivo de foto ou video.", type: "error" });
      return false;
    }
    if (!mediasValid.some((media) => media.isProfileCover)) {
      showToast({ title: "Capa obrigatoria", message: "Selecione uma midia como capa do anuncio.", type: "error" });
      return false;
    }

    const invalidPrice = form.prices.find((item) => {
      if (item.mode !== "fixed" || !item.value.trim()) return false;
      const normalized = Number(item.value.replace(",", "."));
      return !Number.isFinite(normalized) || normalized <= 0;
    });
    if (invalidPrice) {
      showToast({
        title: "Valor invalido",
        message: `Revise o valor informado para ${invalidPrice.name}.`,
        type: "error",
      });
      return false;
    }

    return true;
  };

  const refreshMyListings = async () => {
    if (!token) return;
    const [listings, raw] = await Promise.all([getMyListings(token), getMyListingsRaw(token)]);
    setMyListings(listings);
    setMyListingsRaw(raw);
    return listings;
  };

  const handleSaveListing = async () => {
    if (!token || saving) return;
    if (!validateForm()) return;
    setSaving(true);
    try {
      const payload = toPayload(form);
      const creating = selectedListingId === "new";
      const response = creating ? await createListing(payload, token) : await updateListing(selectedListingId, payload, token);
      const refreshed = await refreshMyListings();
      const persistedId = String(response.listingId);
      setSelectedListingId(persistedId);
      if (refreshed) setForm(mapDetailsToForm(response, cities, servicesCatalog, listingPricesCatalog, listingPlans, refreshed));
      showToast({
        title: creating ? "Anuncio criado" : "Anuncio atualizado",
        message: creating ? "Seu anuncio foi salvo com sucesso e esta pronto para publicacao." : "As alteracoes do anuncio foram salvas com sucesso.",
        type: "success",
      });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Nao foi possivel salvar o anuncio agora.";
      showToast({ title: "Falha ao salvar", message, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!token || publishing || selectedListingId === "new") return;
    setPublishing(true);
    try {
      const response = await publishListing(selectedListingId, token);
      await refreshMyListings();
      setForm((current) => ({ ...current, availability: getAvailabilityValue(response.availability), isVisible: response.isVisible, publishNow: true }));
      showToast({ title: "Anuncio publicado", message: "Seu anuncio foi publicado com sucesso.", type: "success" });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Nao foi possivel publicar o anuncio agora.";
      showToast({ title: "Falha ao publicar", message, type: "error" });
    } finally {
      setPublishing(false);
    }
  };

  if (!bootstrapped) {
    return (
      <AppShell>
        <Card>Carregando sessao...</Card>
      </AppShell>
    );
  }

  if (!token) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl">
          <EmptyState
            title="Sessao profissional nao encontrada"
            description="Entre com uma conta profissional para criar e gerenciar anuncios."
            actionLabel="Ir para login"
            onAction={() => {
              if (typeof window !== "undefined") window.location.href = "/auth/login?next=/profissional/dashboard";
            }}
          />
        </div>
      </AppShell>
    );
  }

  const activeMedia = form.medias[activeMediaIndex] ?? form.medias[0];
  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="hidden h-fit sticky top-24 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm lg:block">
          <p className="mb-4 text-lg font-bold text-zinc-900">Painel profissional</p>
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn("w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors", activeTab === tab ? "bg-wine-700 text-white!" : "text-zinc-600 hover:bg-zinc-100")}
              >
                {tab}
              </button>
            ))}
          </nav>
        </aside>

        <div className="space-y-6">
          <div className="flex gap-2 overflow-auto lg:hidden hide-scrollbar pb-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn("whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors", activeTab === tab ? "bg-wine-700 text-white!" : "bg-zinc-100 text-zinc-600")}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "Resumo" && (
            <div className="space-y-4">
              <Card className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-semibold text-zinc-900">Resumo profissional</h1>
                  <p className="text-sm text-zinc-600">Visao geral do desempenho do seu perfil na plataforma.</p>
                </div>
                <div className="flex gap-2">
                  <StatPill label="Anuncios" value={String(myListings.length)} />
                  <StatPill label="Publicados" value={String(publishedCount)} />
                </div>
              </Card>

              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard title="Receita do mes" value={currency(dashboardSummary.monthRevenue)} />
                <MetricCard title="Atendimentos" value={String(dashboardSummary.completedServices)} />
                <MetricCard title="Visualizacoes" value={String(totalViews)} />
                <MetricCard title="Conversao" value={`${dashboardSummary.conversionRate}%`} />
              </section>
            </div>
          )}

          {activeTab === "Anuncio" && (
            <div className="space-y-4">
              {loading ? (
                <Card>Carregando dados do anuncio...</Card>
              ) : (
                <>
                  <Card className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-zinc-500 font-medium">Status do anuncio publico</p>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="relative flex h-3 w-3 items-center justify-center">
                          {form.isVisible ? <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /> : null}
                          <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full transition-colors", form.isVisible ? "bg-emerald-500" : "bg-zinc-400")} />
                        </div>
                        <p className="text-lg font-bold text-zinc-900">{form.isVisible ? "Ativo e visivel" : "Pausado"}</p>
                      </div>
                    </div>
                    <Button variant="secondary" onClick={() => setForm((current) => ({ ...current, isVisible: !current.isVisible }))}>
                      {form.isVisible ? "Pausar anuncio" : "Ativar anuncio"}
                    </Button>
                  </Card>

                  <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
                    <aside className="space-y-4">
                      <Card className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h2 className="text-sm font-semibold text-zinc-900">Meus anuncios</h2>
                          <Button size="sm" variant="secondary" onClick={() => void handleSelectListing("new")}>Novo</Button>
                        </div>
                        <div className="space-y-2">
                          <button
                            type="button"
                            onClick={() => void handleSelectListing("new")}
                            className={cn("w-full rounded-xl border px-3 py-2 text-left text-sm transition", selectedListingId === "new" ? "border-wine-500 bg-wine-50 text-wine-900" : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300")}
                          >
                            Criar novo anuncio
                          </button>
                          {myListings.map((listing) => (
                            <button
                              key={listing.id}
                              type="button"
                              onClick={() => void handleSelectListing(String(listing.id))}
                              className={cn("w-full rounded-xl border px-3 py-2 text-left text-sm transition", String(listing.id) === selectedListingId ? "border-wine-500 bg-wine-50 text-wine-900" : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300")}
                            >
                              <p className="font-semibold">{listing.artisticName || listing.displayName}</p>
                              <p className="text-xs text-zinc-500">{listing.city}</p>
                            </button>
                          ))}
                        </div>
                      </Card>
                    </aside>

                    <section className="space-y-4">
                      <Card className="space-y-5">
                        <div className="flex items-center justify-between">
                          <h2 className="text-2xl font-semibold text-zinc-900">Galeria de Fotos</h2>
                          <Button onClick={openFilePicker}>+ Adicionar</Button>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,video/*"
                          multiple
                          className="hidden"
                          onChange={handleFilesSelected}
                        />
                        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                          <div className="grid gap-3 md:grid-cols-[2fr_1fr_1fr] md:grid-rows-2">
                            {coverMedia ? (
                              <button
                                type="button"
                                onClick={() => {
                                  const index = form.medias.findIndex((media) => media.id === coverMedia.id);
                                  if (index >= 0) setActiveMediaIndex(index);
                                }}
                                className="relative min-h-56 overflow-hidden rounded-xl border-2 border-wine-600 bg-zinc-200 text-left md:row-span-2"
                              >
                                <MediaThumb media={coverMedia} />
                                <div className="absolute inset-0 bg-black/15" />
                                <span className="absolute left-3 top-3 rounded-full bg-wine-700 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white">CAPA</span>
                              </button>
                            ) : (
                              <div className="md:row-span-2 rounded-xl border-2 border-dashed border-zinc-300 bg-white p-4 flex items-center justify-center text-zinc-400">Sem midia ainda</div>
                            )}

                            {secondaryMedias.map((media) => {
                              const index = form.medias.findIndex((item) => item.id === media.id);
                              return (
                                <button
                                  key={media.id}
                                  type="button"
                                  onClick={() => setActiveMediaIndex(index)}
                                  className="relative min-h-28 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-200"
                                >
                                  <MediaThumb media={media} />
                                  <div className="absolute inset-0 bg-black/10" />
                                  <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-zinc-700">{media.kind === "video" ? "VIDEO" : "FOTO"}</span>
                                </button>
                              );
                            })}

                            <button type="button" onClick={openFilePicker} className="flex min-h-28 items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 bg-white text-zinc-400 transition hover:border-wine-300 hover:text-wine-700">
                              <div className="text-center">
                                <div className="text-3xl leading-none">+</div>
                                <div className="text-xs font-bold uppercase tracking-wider">Upload</div>
                              </div>
                            </button>
                          </div>
                        </div>
                        {activeMedia ? (
                          <div className="grid gap-3 md:grid-cols-2">
                            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700">
                              Tipo detectado automaticamente: <strong>{activeMedia.kind === "video" ? "Video" : "Imagem"}</strong>
                            </div>
                            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700">
                              Arquivo pronto para envio em <strong>base64</strong> ao backend.
                            </div>
                            <div className="flex items-end gap-2">
                              <Button variant="secondary" onClick={() => updateMedia(activeMediaIndex, { isProfileCover: true })}>Definir como capa</Button>
                              <Button variant="ghost" onClick={openFilePicker}>Adicionar mais arquivos</Button>
                            </div>
                            <div className="flex items-end gap-2">
                              <Button variant="ghost" disabled={form.medias.length <= 1} onClick={() => removeMedia(activeMediaIndex)}>Remover selecionada</Button>
                            </div>
                          </div>
                        ) : null}
                      </Card>

                      <Card className="space-y-4">
                        <h2 className="text-2xl font-semibold text-zinc-900">Detalhes & Localizacao</h2>
                        <div className="h-px w-full bg-zinc-200" />
                        <Input id="listing-stage-name" label="Nome artistico" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Ex: Isabella Valente" />
                        <div className="grid gap-3 md:grid-cols-2">
                          <Select
                            id="listing-city"
                            label="Cidade"
                            value={form.cityId}
                            onChange={(event) => setForm((current) => ({ ...current, cityId: event.target.value }))}
                            options={[{ value: "", label: "Selecione uma cidade" }, ...cities.map((city) => ({ value: String(city.id), label: city.name }))]}
                          />
                          <Input id="listing-neighborhood" label="Bairro" value={neighborhood} onChange={(event) => setNeighborhood(event.target.value)} placeholder="Jardins" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label htmlFor="radius" className="text-sm font-semibold text-zinc-700 uppercase tracking-wide">Raio de atendimento</label>
                            <span className="text-sm font-bold text-wine-700">{serviceRadiusKm} km</span>
                          </div>
                          <input id="radius" type="range" min={1} max={50} value={serviceRadiusKm} onChange={(event) => setServiceRadiusKm(Number(event.target.value))} className="w-full accent-wine-700" />
                        </div>
                        <div className="relative overflow-hidden rounded-xl border border-zinc-200 h-44 bg-zinc-100">
                          <div className="absolute inset-0 bg-cover bg-center opacity-70" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=1200&auto=format&fit=crop')" }} />
                          <div className="absolute inset-0 bg-black/10" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <button className="rounded-full border border-zinc-200 bg-white px-5 py-2 text-sm font-bold text-zinc-900 shadow-md transition hover:bg-zinc-50">Ajustar localizacao</button>
                          </div>
                        </div>
                      </Card>

                      <Card className="space-y-4">
                        <h2 className="text-base font-semibold text-zinc-900">Dados do anuncio</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                          <Select
                            id="listing-plan"
                            label="Plano do anuncio"
                            value={form.listingPlanId}
                            onChange={(event) => setForm((current) => ({ ...current, listingPlanId: event.target.value }))}
                            options={[{ value: "", label: "Selecione um plano" }, ...listingPlans.map((plan) => ({ value: String(plan.id), label: `${plan.name} - R$ ${toNumber(plan.monthlyPrice).toFixed(2).replace(".", ",")}` }))]}
                          />
                          <Input id="listing-currency" label="Moeda" value={form.currencyCode} onChange={(event) => setForm((current) => ({ ...current, currencyCode: event.target.value.toUpperCase() }))} placeholder="BRL" />
                          <Select id="listing-availability" label="Disponibilidade" value={form.availability} onChange={(event) => setForm((current) => ({ ...current, availability: event.target.value }))} options={AVAILABILITY_OPTIONS} />
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="listing-description" className="text-sm font-medium text-zinc-700">Descricao do anuncio</label>
                          <textarea id="listing-description" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows={5} className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-wine-600 focus:outline-none focus:ring-2 focus:ring-wine-200" placeholder="Descreva seu atendimento, estilo e diferenciais." />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-zinc-900">Servicos ofertados</p>
                          <div className="flex flex-wrap gap-2">
                            {servicesCatalog.map((service) => {
                              const selected = form.serviceCatalogIds.includes(String(service.id));
                              return (
                                <button key={service.id} type="button" onClick={() => toggleService(String(service.id))} className={cn("rounded-full border px-3 py-1.5 text-xs font-medium transition", selected ? "border-wine-600 bg-wine-700 text-white" : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400")}>
                                  {service.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <p className="text-sm font-semibold text-zinc-900">Valores dos servicos</p>
                          <div className="space-y-3">
                            {form.prices.map((item) => (
                              <div key={item.listingPriceId} className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <p className="text-sm font-semibold text-zinc-900">{item.name}</p>
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => updatePriceMode(item.listingPriceId, "fixed")}
                                      className={cn(
                                        "rounded-full border px-3 py-1 text-xs font-medium transition",
                                        item.mode === "fixed"
                                          ? "border-wine-600 bg-wine-700 text-white"
                                          : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400",
                                      )}
                                    >
                                      Valor fixo
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => updatePriceMode(item.listingPriceId, "negotiable")}
                                      className={cn(
                                        "rounded-full border px-3 py-1 text-xs font-medium transition",
                                        item.mode === "negotiable"
                                          ? "border-wine-600 bg-wine-700 text-white"
                                          : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400",
                                      )}
                                    >
                                      A combinar
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => updatePriceMode(item.listingPriceId, "not_realizable")}
                                      className={cn(
                                        "rounded-full border px-3 py-1 text-xs font-medium transition",
                                        item.mode === "not_realizable"
                                          ? "border-wine-600 bg-wine-700 text-white"
                                          : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400",
                                      )}
                                    >
                                      Nao realizo
                                    </button>
                                  </div>
                                </div>
                                <div className="mt-3">
                                  <Input
                                    id={`price-${item.listingPriceId}`}
                                    label="Valor em reais"
                                    placeholder="Ex: 450"
                                    value={item.value}
                                    disabled={item.mode !== "fixed"}
                                    onChange={(event) => updatePriceValue(item.listingPriceId, event.target.value)}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </Card>

                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Button fullWidth disabled={saving || publishing || loading} onClick={() => void handleSaveListing()}>
                          {saving ? "Salvando..." : selectedListingId === "new" ? "Criar anuncio" : "Salvar alteracoes"}
                        </Button>
                        <Button fullWidth variant="secondary" disabled={selectedListingId === "new" || publishing || saving || loading} onClick={() => void handlePublish()}>
                          {publishing ? "Publicando..." : "Publicar anuncio"}
                        </Button>
                      </div>
                    </section>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "Historico" && (
            <Card className="space-y-3">
              <h2 className="text-base font-semibold text-zinc-900 border-b border-zinc-100 pb-3">Historico de atendimentos</h2>
              <HistoryItem title="Cliente verificado" subtitle="Concluido em 05/03 - R$ 820" />
              <HistoryItem title="Cliente premium" subtitle="Concluido em 03/03 - R$ 1.200" />
              <HistoryItem title="Atendimento recorrente" subtitle="Concluido em 28/02 - R$ 760" />
            </Card>
          )}

          {feedback ? <Toast title={feedback.title} message={feedback.message} type={feedback.type} /> : null}
        </div>
      </div>
    </AppShell>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-center">
      <p className="text-[10px] font-semibold tracking-wide text-zinc-500 uppercase">{label}</p>
      <p className="text-sm font-semibold text-zinc-900">{value}</p>
    </div>
  );
}

function MediaThumb({ media }: { media: ListingMediaForm }) {
  if (media.kind === "video") {
    return <video src={media.previewUrl} className="absolute inset-0 h-full w-full object-cover" muted playsInline />;
  }

  return <img src={media.previewUrl} alt="Midia do anuncio" className="absolute inset-0 h-full w-full object-cover" />;
}

function MetricCard({ title, value }: { title: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-bold text-zinc-900 mt-1">{value}</p>
    </Card>
  );
}

function HistoryItem({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 p-3 bg-zinc-50/50">
      <p className="text-sm font-bold text-zinc-900">{title}</p>
      <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>
    </div>
  );
}
