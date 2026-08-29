import { api } from "@/lib/axios";
import type { ApiResponse, CreateUserPayload, User } from "@/types";

export const userService = {
  async getAll(): Promise<ApiResponse<User[]>> {
    const { data } = await api.get<ApiResponse<User[]>>("/users");
    return data;
  },

  async getById(id: string): Promise<ApiResponse<User>> {
    const { data } = await api.get<ApiResponse<User>>(`/users/${id}`);
    return data;
  },

  async create(payload: CreateUserPayload): Promise<ApiResponse<User>> {
    const { data } = await api.post<ApiResponse<User>>("/users", payload);
    return data;
  },

  async update(id: string, payload: CreateUserPayload): Promise<ApiResponse<User>> {
    const { data } = await api.put<ApiResponse<User>>(`/users/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<ApiResponse<null>> {
    const { data } = await api.delete<ApiResponse<null>>(`/users/${id}`);
    return data;
  },
};