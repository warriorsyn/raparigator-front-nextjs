WWWWWWexport type ApiId = number | string;

export interface AuthResponse {
  userId: ApiId;
  email: string;
  roles: string[];
  accessToken: string;
  expiresAtUtc: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterClientRequest {
  email: string;
  password: string;
  useRealNameInChat?: boolean;
  chatNickname?: string | null;
}

export interface RegisterProfessionalRequest {
  email: string;
  password: string;
  genderId: ApiId;
  heightCm: number;
  stageName?: string | null;
  bio?: string | null;
  publicPhone?: string | null;
  ethnicityId?: ApiId | null;
  hairColorId?: ApiId | null;
  cityId?: ApiId | null;
}

export interface ReferenceItemResponse {
  id: ApiId;
  name: string;
}

export interface GenderResponse extends ReferenceItemResponse {
  clientViewName: string;
}

export interface ClientProfileResponse {
  userId: ApiId;
  useRealNameInChat: boolean;
  chatNickname?: string | null;
}

export interface ProfessionalProfileResponse {
  userId: ApiId;
  stageName?: string | null;
  bio?: string | null;
  publicPhone?: string | null;
  heightCm: number;
  genderId: ApiId;
  ethnicityId?: ApiId | null;
  hairColorId?: ApiId | null;
  cityId?: ApiId | null;
  availability?: number | string;
  isVerified: boolean;
}

export interface MyProfileResponse {
  userId: ApiId;
  email: string;
  roles: string[];
  clientProfile?: ClientProfileResponse | null;
  professionalProfile?: ProfessionalProfileResponse | null;
}

export interface ListingSummaryResponse {
  listingId: ApiId;
  professionalProfileId: ApiId;
  title: string;
  description: string;
  stageName: string;
  cityName: string;
  stateCode: string;
  coverUrl?: string | null;
  monthlyPrice: number | string;
  availability: number | string;
  viewCount: number | string;
}

export interface ListingMediaResponse {
  mediaId: ApiId;
  mediaType: number | string;
  fileUrl: string;
  caption?: string | null;
  displayOrder: number | string;
  isProfileCover: boolean;
}

export interface ListingDetailsResponse {
  listingId: ApiId;
  professionalProfileId: ApiId;
  title: string;
  description: string;
  stageName: string;
  cityName: string;
  stateCode: string;
  currencyCode: string;
  listingStatus: string;
  availability: number | string;
  isVisible: boolean;
  publishedAt?: string | null;
  viewCount: number | string;
  services: string[];
  medias: ListingMediaResponse[];
}

export interface PagedResponse<T> {
  items: T[];
  page: number | string;
  pageSize: number | string;
  totalItems: number | string;
}
