import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let activeRequests = 0;
let loaderCallback = () => {};

export const injectLoader = (callback) => {
  loaderCallback = callback;
};

const startLoading = () => {
  activeRequests++;
  loaderCallback(true);
};

const stopLoading = () => {
  activeRequests = Math.max(activeRequests - 1, 0);
  if (activeRequests === 0) {
    loaderCallback(false);
  }
};

api.interceptors.request.use(
  (config) => {
    startLoading();

    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    stopLoading();
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    stopLoading();
    return response;
  },
  async (error) => {
    stopLoading();

    const originalRequest = error.config;
    const status = error.response?.status;
    const detail = error.response?.data?.detail;

    if (
      status === 403 &&
      detail === "Project password required" &&
      !originalRequest?._passwordRetry
    ) {
      originalRequest._passwordRetry = true;

      window.dispatchEvent(
        new CustomEvent("PROJECT_PASSWORD_REQUIRED", {
          detail: {
            projectId: extractProjectId(originalRequest.url),
            retryRequest: originalRequest,
          },
        })
      );

      return Promise.reject(error);
    }

    if (status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");

        const res = await axios.post(
          `${API_BASE_URL}/api/auth/token/refresh/`,
          { refresh: refreshToken }
        );

        localStorage.setItem("accessToken", res.data.access);

        originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
        return api(originalRequest);
      } catch (err) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.replace("/login");
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

function extractProjectId(url = "") {
  const match = url.match(/projects\/([0-9a-f-]{36})/i);
  return match ? match[1] : null;
}

export default api;