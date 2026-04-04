type QueryValue = string | number | boolean | null | undefined;

interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, QueryValue>;
  token?: string;
  cache?: RequestCache;
}

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

const DEFAULT_API_BASE_URL = "http://localhost:5056";

function getApiBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;
  return configured.replace(/\/+$/, "");
}

function toQueryString(query: Record<string, QueryValue>) {
  const search = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, String(value));
  });

  return search.toString();
}

async function readResponsePayload(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text || null;
}

function getApiErrorMessage(payload: unknown, status: number) {
  if (typeof payload === "string" && payload.trim().length > 0) return payload;

  if (payload && typeof payload === "object") {
    const objectPayload = payload as Record<string, unknown>;

    if (typeof objectPayload.title === "string" && objectPayload.title.length > 0) {
      return objectPayload.title;
    }

    if (typeof objectPayload.message === "string" && objectPayload.message.length > 0) {
      return objectPayload.message;
    }

    if (typeof objectPayload.error === "string" && objectPayload.error.length > 0) {
      return objectPayload.error;
    }
  }

  if (status === 401) return "Sessao expirada ou credenciais invalidas.";
  if (status === 403) return "Voce nao tem permissao para executar esta acao.";
  if (status >= 500) return "Falha temporaria no servidor. Tente novamente em instantes.";

  return "Nao foi possivel concluir a solicitacao.";
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { method = "GET", body, query, token, cache = "no-store" } = options;
  const queryString = query ? toQueryString(query) : "";
  const baseUrl = getApiBaseUrl();
  const finalPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${baseUrl}${finalPath}${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    method,
    cache,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const payload = await readResponsePayload(response).catch(() => null);
    throw new ApiError(getApiErrorMessage(payload, response.status), response.status, payload);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return readResponsePayload(response) as Promise<T>;
}
