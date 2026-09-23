/**
 * Single place where the React app talks to the Express backend.
 * The base URL comes from VITE_API_URL so it is never hard-coded in pages.
 */

const BASE_URL = String(
  import.meta.env.VITE_API_URL || "http://localhost:5000/api",
).replace(/\/+$/, "");

const TOKEN_KEY = "labbuddy_token";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getToken() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}

function buildQuery(params) {
  if (!params) return "";
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      search.append(key, String(value).trim());
    }
  });
  const text = search.toString();
  return text ? `?${text}` : "";
}

/**
 * Performs an authenticated JSON request.
 * Throws an ApiError with the backend message so the UI can show it.
 */
export async function api(path, options = {}) {
  const { method = "GET", body, params, auth = true } = options;

  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}${buildQuery(params)}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      "Cannot reach the server. Make sure the backend is running.",
      0,
    );
  }

  let payload = null;
  const text = await response.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const message =
      (payload && payload.message) || `Request failed (${response.status})`;

    if (response.status === 401) {
      clearToken();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("labbuddy:unauthorized"));
      }
    }

    throw new ApiError(message, response.status);
  }

  return payload;
}

export const API_BASE_URL = BASE_URL;
