import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
});

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem("auth-storage");
  if (stored) {
    try {
      const { state } = JSON.parse(stored);
      if (state.accessToken) {
        config.headers.Authorization = `Bearer ${state.accessToken}`;
      }
    } catch {}
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      const stored = localStorage.getItem("auth-storage");
      try {
        const { state } = stored ? JSON.parse(stored) : { state: null };
        if (!state?.refreshToken) throw new Error("No refresh token");
        const { data } = await axios.post(
          `${api.defaults.baseURL}/auth/refresh/`,
          { refresh: state.refreshToken }
        );
        const newAccess = data.access;
        const newState = { ...state, accessToken: newAccess };
        localStorage.setItem(
          "auth-storage",
          JSON.stringify({ state: newState })
        );
        processQueue(null, newAccess);
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("auth-storage");
        // Also clear the cookie so middleware redirects correctly
        document.cookie = "auth-storage=; path=/; max-age=0; SameSite=Lax";
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
