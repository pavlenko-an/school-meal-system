import { ApiResponse } from "./api-response";

async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const defaultOptions: RequestInit = {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  };

  try {
    const res = await fetch(url, defaultOptions);
    const json = (await res.json()) as ApiResponse<T>;

    if (!res.ok) {
      return {
        error: json.error || json.message || "Помилка сервера",
      };
    }

    return json;
  } catch (err) {
    console.error(err);
    return { error: "Не вдалося підключитися до сервера" };
  }
}

function buildQueryString(params?: Record<string, any>): string {
  if (!params) return "";
  const query = new URLSearchParams();
  for (const key in params) {
    const value = params[key];
    if (value !== undefined && value !== null) {
      query.append(key, String(value));
    }
  }
  const str = query.toString();
  return str ? `?${str}` : "";
}

export async function get<T>(
  url: string,
  params?: Record<string, any>
): Promise<ApiResponse<T>> {
  const fullUrl = url + buildQueryString(params);
  return request<T>(fullUrl, { method: "GET" });
}

export async function post<T, B>(
  url: string,
  body?: B
): Promise<ApiResponse<T>> {
  return request<T>(url, { method: "POST", body: JSON.stringify(body) });
}

export async function patch<T, B>(
  url: string,
  body?: B
): Promise<ApiResponse<T>> {
  return request<T>(url, { method: "PATCH", body: JSON.stringify(body) });
}

export async function del<T>(url: string): Promise<ApiResponse<T>> {
  return request<T>(url, { method: "DELETE" });
}
