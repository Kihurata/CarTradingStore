import { api } from "./api";

export const apiWrapper = {
  async post<T>(path: string, data: any, config?: RequestInit): Promise<T> {
    const isFormData = typeof FormData !== "undefined" && data instanceof FormData;

    return api<T>(path, {
      method: "POST",
      body: isFormData ? data : JSON.stringify(data),
      headers: isFormData
        ? {} 
        : { "Content-Type": "application/json" },
      ...config,
    });
  },

  async get<T>(path: string, config?: RequestInit): Promise<T> {
    return api<T>(path, { method: "GET", ...config });
  },
};
