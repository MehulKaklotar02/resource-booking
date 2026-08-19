import axiosClient from "./axiosClient";
import type { ApiResponse, LoginCredentials, LoginResponseData } from "./types";

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponseData> => {
    const response = await axiosClient.post<ApiResponse<LoginResponseData>>(
      "/auth/login",
      credentials
    );
    return response.data.data;
  },
};
