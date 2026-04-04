import { apiRequest } from "@/lib/api/client";
import type {
  GenderResponse,
  ListingPlanResponse,
  ReferenceItemResponse,
} from "@/lib/api/types";

export function getCountries() {
  return apiRequest<ReferenceItemResponse[]>("/api/reference/countries");
}

export function getStates(countryId?: number | string) {
  return apiRequest<ReferenceItemResponse[]>("/api/reference/states", {
    query: { countryId },
  });
}

export function getCities(stateId?: number | string) {
  return apiRequest<ReferenceItemResponse[]>("/api/reference/cities", {
    query: { stateId },
  });
}

export function getGenders() {
  return apiRequest<GenderResponse[]>("/api/reference/genders");
}

export function getEthnicities() {
  return apiRequest<ReferenceItemResponse[]>("/api/reference/ethnicities");
}

export function getHairColors() {
  return apiRequest<ReferenceItemResponse[]>("/api/reference/hair-colors");
}

export function getServicesCatalog() {
  return apiRequest<ReferenceItemResponse[]>("/api/reference/services");
}

export function getListingPlans() {
  return apiRequest<ListingPlanResponse[]>("/api/reference/listing-plans");
}

export function getListingPrices() {
  return apiRequest<ReferenceItemResponse[]>("/api/reference/listing-prices");
}
