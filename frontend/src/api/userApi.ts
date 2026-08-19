import axiosClient from "./axiosClient";
import type { ApiResponse, User } from "./types";

export const userApi = {
  getUsers: async (): Promise<User[]> => {
    const response = await axiosClient.get<ApiResponse<User[]>>("/users");
    return response.data.data;
  },
};
