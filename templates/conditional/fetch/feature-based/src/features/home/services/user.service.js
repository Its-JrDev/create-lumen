/**
 * @typedef {import("@/shared/types").ApiResponse} ApiResponse
 * @typedef {import("@/shared/types").CreateUserPayload} CreateUserPayload
 * @typedef {import("@/shared/types").User} User
 */
import { api } from "@/shared/api";

export const userService = {
  async getAll() {
    const { data } = await api.get("/users");
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },

  async create(payload) {
    const { data } = await api.post("/users", payload);
    return data;
  },

  async update(id, payload) {
    const { data } = await api.put(`/users/${id}`, payload);
    return data;
  },

  async remove(id) {
    const { data } = await api.delete(`/users/${id}`);
    return data;
  },
};