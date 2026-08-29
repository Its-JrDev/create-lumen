/**
 * @typedef {import("@/types").ApiResponse} ApiResponse
 * @typedef {import("@/types").CreateUserPayload} CreateUserPayload
 * @typedef {import("@/types").User} User
 */
import { apiClient } from "@/lib/axios";

export const userService = {
  async getAll() {
    const { data } = await apiClient.get("/users");
    return data;
  },

  async getById(id) {
    const { data } = await apiClient.get(`/users/${id}`);
    return data;
  },

  async create(payload) {
    const { data } = await apiClient.post("/users", payload);
    return data;
  },

  async update(id, payload) {
    const { data } = await apiClient.put(`/users/${id}`, payload);
    return data;
  },

  async remove(id) {
    const { data } = await apiClient.delete(`/users/${id}`);
    return data;
  },
};