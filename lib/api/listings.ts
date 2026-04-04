import { apiRequest } from "@/lib/api/client";
import type {
  ListingDetailsResponse,
  ListingSummaryResponse,
  PagedResponse,
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
  const price = toNumber(listing.monthlyPrice);

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
    heightCm: 0,
    ethnicity: "Nao informado",
    hairColor: "Nao informado",
    services: [],
    pricingTable: [{ label: "Valor inicial", price }],
    status: normalizeAvailabilityStatus(listing.availability),
    adTier: price >= 600 ? "premium" : "normal",
    images: [listing.coverUrl || FALLBACK_COVER_IMAGE],
    rating: 0,
    reviewsCount: 0,
    profileViews: toNumber(listing.viewCount),
  };
}

export function mapListingDetailsToAd(listing: ListingDetailsResponse): ProfessionalAd {
  const imageUrls = listing.medias
    ?.map((media) => media.fileUrl)
    .filter((url): url is string => typeof url === "string" && url.length > 0);

  const cover = imageUrls && imageUrls.length > 0 ? imageUrls : [FALLBACK_COVER_IMAGE];

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
    startingPrice: 0,
    heightCm: 0,
    ethnicity: "Nao informado",
    hairColor: "Nao informado",
    services: listing.services ?? [],
    pricingTable: [{ label: "Consultar valores no chat", price: 0 }],
    status: normalizeAvailabilityStatus(listing.availability),
    adTier: listing.listingStatus?.toLowerCase().includes("premium") ? "premium" : "normal",
    images: cover,
    rating: 0,
    reviewsCount: 0,
    profileViews: toNumber(listing.viewCount),
  };
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

export async function getMyListings(token: string) {
  const response = await apiRequest<ListingSummaryResponse[]>("/api/Listings/me", { token });
  return response.map(mapListingSummaryToAd);
}

export function publishListing(listingId: number | string, token: string) {
  return apiRequest<ListingDetailsResponse>(`/api/Listings/${listingId}/publish`, {
    method: "POST",
    token,
  });
}
