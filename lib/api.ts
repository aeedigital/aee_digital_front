const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export function apiUrl(path: string) {
  if (!API_BASE) {
    throw new Error("NEXT_PUBLIC_API_URL não está configurada");
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalizedPath}`;
}

export async function apiFetch(path: string, options?: RequestInit) {
  const url = apiUrl(path);
  return fetch(url, options);
}
