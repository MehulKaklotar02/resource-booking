import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import type { ApiErrorPayload } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5050/api";

export const axiosClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request Interceptor: Attach bearer token if available in localStorage
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Standardize error payloads & response data
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    const status = error.response?.status;
    const serverMessage = error.response?.data?.message;

    const formattedError: ApiErrorPayload = {
      status,
      message: serverMessage || error.message || "An unexpected network error occurred.",
      isConflict: status === 409,
    };

    return Promise.reject(formattedError);
  }
);

export default axiosClient;
