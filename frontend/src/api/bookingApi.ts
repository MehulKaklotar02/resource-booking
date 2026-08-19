import axiosClient from "./axiosClient";
import type { ApiResponse, Booking, CreateBookingPayload } from "./types";

export const bookingApi = {
  getBookings: async (resourceId?: string): Promise<Booking[]> => {
    const response = await axiosClient.get<ApiResponse<Booking[]>>("/bookings", {
      params: resourceId ? { resourceId } : undefined,
    });
    return response.data.data;
  },

  createBooking: async (payload: CreateBookingPayload): Promise<Booking> => {
    const response = await axiosClient.post<ApiResponse<Booking>>(
      "/bookings",
      payload
    );
    return response.data.data;
  },
};
