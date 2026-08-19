import axiosClient from "./axiosClient";
import type { ApiResponse, Resource, SlotsResponse } from "./types";

export const resourceApi = {
  getResources: async (): Promise<Resource[]> => {
    const response = await axiosClient.get<ApiResponse<Resource[]>>("/resources");
    return response.data.data;
  },

  getSlots: async (
    resourceId: string,
    date: string,
    timezone: string
  ): Promise<SlotsResponse> => {
    const response = await axiosClient.get<ApiResponse<SlotsResponse>>(
      `/resources/${resourceId}/slots`,
      {
        params: { date, timezone },
      }
    );
    return response.data.data;
  },
};
