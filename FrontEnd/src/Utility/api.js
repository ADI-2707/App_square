import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let setLoadingCallback = () => {};

export const injectLoader = (callback) => {
  setLoadingCallback = callback;
};

api.interceptors.request.use(
  (config) => {
    setLoadingCallback(true);
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    setLoadingCallback(false);
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    setLoadingCallback(false);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");

        const res = await axios.post(
          `${API_BASE_URL}/api/auth/token/refresh/`,
          {
            refresh: refreshToken,
          },
        );

        localStorage.setItem("accessToken", res.data.access);
        originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
        return api(originalRequest);
      } catch (err) {
        setLoadingCallback(false);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.replace("/login");
        return Promise.reject(err);
      }
    }

    setLoadingCallback(false);
    return Promise.reject(error);
  },
);

export default api;