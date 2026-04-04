import { apiRequest } from "@/lib/api/client";
import type {
  CreateListingRequest,
  ListingDetailsResponse,
  ListingPriceResponse,
  ListingSummaryResponse,
  PagedResponse,
  UpdateListingRequest,
} from "@/lib/api/types";
import type { AvailabilityStatus, ProfessionalAd } from "@/lib/types";

const FALLBACK_COVER_IMAGE =
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80";

interface GetListingsParams {
  cityId?: number | string;
  stateId?: number | string;
  serviceCatalogId?: number | string;
  genderId?: number | string;
  availability?: number | string;
  stageName?: string;
  page?: number;
  pageSize?: number;
}

function toNumber(value: number | string | null | undefined) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function findOneHourPrice(prices: ListingPriceResponse[] | undefined) {
  if (!prices?.length) return null;
  return (
    prices.find((item) => normalizeText(item.name) === "1 hora") ??
    prices.find((item) => normalizeText(item.name) === "1h") ??
    prices.find((item) => normalizeText(item.name).includes("hora")) ??
    null
  );
}

function mapPricesTable(prices: ListingPriceResponse[] | undefined) {
  if (!prices?.length) return [{ label: "Consultar valores no chat", price: 0, isNegotiable: true }];

  return prices.map((item) => ({
    label: item.name,
    price: item.price === null || typeof item.price === "undefined" ? null : toNumber(item.price),
    isNegotiable: item.isNegotiable,
    isNotRealizable: item.isNotRealizable,
  }));
}

function normalizeImageSource(source?: string | null) {
  const value = (source ?? "").trim();
  if (!value) return FALLBACK_COVER_IMAGE;
  if (value.startsWith("data:")) return value;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `data:image/jpeg;base64,${value}`;
}

export function normalizeAvailabilityStatus(value: number | string): AvailabilityStatus {
  if (typeof value === "number") {
    if (value === 0) return "livre";
    if (value === 1) return "em_atendimento";
    return "indisponivel";
  }

  const normalized = String(value).trim().toLowerCase();
  if (["0", "livre", "free", "available", "disponivel"].includes(normalized)) return "livre";
  if (["1", "em_atendimento", "busy", "ocupado", "inservice"].includes(normalized)) return "em_atendimento";
  return "indisponivel";
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function buildListingSlug(name: string, city: string, listingId: number | string) {
  const base = slugify(`${name}-${city}`) || "anuncio";
  return `${base}-${listingId}`;
}

export function extractListingIdFromSlug(slug: string) {
  const match = slug.match(/-(\d+)$/);
  return match ? Number(match[1]) : null;
}

export function mapListingSummaryToAd(listing: ListingSummaryResponse): ProfessionalAd {
  const oneHourPrice = findOneHourPrice(listing.prices);
  const oneHourValue = oneHourPrice?.price === null || typeof oneHourPrice?.price === "undefined" ? null : toNumber(oneHourPrice.price);
  const hasFixedHourPrice = Boolean(oneHourPrice && !oneHourPrice.isNegotiable && !oneHourPrice.isNotRealizable && oneHourValue !== null && oneHourValue > 0);
  const subscriptionPrice = toNumber(listing.monthlyPrice);
  const price = hasFixedHourPrice ? (oneHourValue ?? 0) : subscriptionPrice;
  const startingPriceLabel = oneHourPrice?.isNotRealizable ? "Nao realiza" : oneHourPrice?.isNegotiable ? "A combinar" : undefined;

  return {
    id: String(listing.listingId),
    slug: buildListingSlug(listing.stageName || listing.title, listing.cityName || "cidade", listing.listingId),
    displayName: listing.title || listing.stageName || "Perfil verificado",
    artisticName: listing.stageName || listing.title || "Profissional",
    city: listing.cityName || "Cidade nao informada",
    state: listing.stateCode || "SP",
    neighborhood: "Regiao central",
    category: "Profissional",
    shortDescription: listing.description || "Perfil publicado na plataforma.",
    description: listing.description || "Perfil publicado na plataforma.",
    startingPrice: price,
    startingPriceLabel,
    subscriptionPrice,
    heightCm: 0,
    ethnicity: "Nao informado",
    hairColor: "Nao informado",
    services: [],
    pricingTable: mapPricesTable(listing.prices),
    status: normalizeAvailabilityStatus(listing.availability),
    adTier: subscriptionPrice >= 600 ? "premium" : "normal",
    images: [normalizeImageSource(listing.coverUrl)],
    rating: 0,
    reviewsCount: 0,
    profileViews: toNumber(listing.viewCount),
  };
}

export function mapListingDetailsToAd(listing: ListingDetailsResponse): ProfessionalAd {
  const imageUrls = listing.medias
    ?.map((media) => normalizeImageSource(media.fileUrl))
    .filter((url): url is string => typeof url === "string" && url.length > 0);

  const cover = imageUrls && imageUrls.length > 0 ? imageUrls : [FALLBACK_COVER_IMAGE];

  const oneHourPrice = findOneHourPrice(listing.prices);
  const oneHourValue = oneHourPrice?.price === null || typeof oneHourPrice?.price === "undefined" ? null : toNumber(oneHourPrice.price);
  const hasFixedHourPrice = Boolean(oneHourPrice && !oneHourPrice.isNegotiable && !oneHourPrice.isNotRealizable && oneHourValue !== null && oneHourValue > 0);

  return {
    id: String(listing.listingId),
    slug: buildListingSlug(listing.stageName || listing.title, listing.cityName || "cidade", listing.listingId),
    displayName: listing.title || listing.stageName || "Perfil verificado",
    artisticName: listing.stageName || listing.title || "Profissional",
    city: listing.cityName || "Cidade nao informada",
    state: listing.stateCode || "SP",
    neighborhood: "Regiao central",
    category: "Profissional",
    shortDescription: listing.description || "Perfil publicado na plataforma.",
    description: listing.description || "Perfil publicado na plataforma.",
    startingPrice: hasFixedHourPrice ? (oneHourValue ?? 0) : 0,
    startingPriceLabel: oneHourPrice?.isNotRealizable ? "Nao realiza" : oneHourPrice?.isNegotiable ? "A combinar" : undefined,
    heightCm: 0,
    ethnicity: "Nao informado",
    hairColor: "Nao informado",
    services: listing.services ?? [],
    pricingTable: mapPricesTable(listing.prices),
    status: normalizeAvailabilityStatus(listing.availability),
    adTier: listing.listingStatus?.toLowerCase().includes("premium") ? "premium" : "normal",
    images: cover,
    rating: 0,
    reviewsCount: 0,
    profileViews: toNumber(listing.viewCount),
  };
}

function looksLikeListingDetails(value: unknown): value is ListingDetailsResponse {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ListingDetailsResponse>;
  return typeof candidate.listingId !== "undefined" && Array.isArray(candidate.medias) && Array.isArray(candidate.services);
}

export async function getListings(params: GetListingsParams = {}) {
  const response = await apiRequest<PagedResponse<ListingSummaryResponse>>("/api/Listings", {
    query: {
      CityId: params.cityId,
      StateId: params.stateId,
      ServiceCatalogId: params.serviceCatalogId,
      GenderId: params.genderId,
      Availability: params.availability,
      StageName: params.stageName,
      Page: params.page ?? 1,
      PageSize: params.pageSize ?? 24,
    },
  });

  return {
    ...response,
    items: response.items.map(mapListingSummaryToAd),
  };
}

export async function getListingDetails(listingId: number | string) {
  const response = await apiRequest<ListingDetailsResponse>(`/api/Listings/${listingId}`);
  return mapListingDetailsToAd(response);
}

export function getListingDetailsRaw(listingId: number | string) {
  return apiRequest<ListingDetailsResponse>(`/api/Listings/${listingId}`);
}

export async function getMyListings(token: string) {
  const response = await apiRequest<Array<ListingSummaryResponse | ListingDetailsResponse>>("/api/Listings/me", { token });
  return response.map((item) => (looksLikeListingDetails(item) ? mapListingDetailsToAd(item) : mapListingSummaryToAd(item)));
}

export async function getMyListingsRaw(token: string) {
  return apiRequest<Array<ListingSummaryResponse | ListingDetailsResponse>>("/api/Listings/me", { token });
}

export function createListing(payload: CreateListingRequest, token: string) {
  return apiRequest<ListingDetailsResponse>("/api/Listings", {
    method: "POST",
    body: payload,
    token,
  });
}

export function updateListing(listingId: number | string, payload: UpdateListingRequest, token: string) {
  return apiRequest<ListingDetailsResponse>(`/api/Listings/${listingId}`, {
    method: "PUT",
    body: payload,
    token,
  });
}

export function publishListing(listingId: number | string, token: string) {
  return apiRequest<ListingDetailsResponse>(`/api/Listings/${listingId}/publish`, {
    method: "POST",
    token,
  });
}
