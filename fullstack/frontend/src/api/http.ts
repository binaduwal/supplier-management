import axios, { type AxiosError } from "axios";
import type { ApiErrorBody, ApiErrorDetail } from "../types/api";

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: ApiErrorDetail[];

  constructor(
    code: string,
    message: string,
    status: number,
    details?: ApiErrorDetail[],
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

let activeUserId = "anna";

export function setHttpUserId(userId: string) {
  activeUserId = userId;
}

export const http = axios.create({
  baseURL: "/api",
});

http.interceptors.request.use((config) => {
  config.headers["X-User-Id"] = activeUserId;
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: ApiErrorBody }>) => {
    const payload = error.response?.data?.error;
    return Promise.reject(
      new ApiError(
        payload?.code ?? "INTERNAL_ERROR",
        payload?.message ?? "Something went wrong.",
        error.response?.status ?? 500,
        payload?.details,
      ),
    );
  },
);
