import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { bookingApi, resourceApi, userApi } from "../api";
import type { ApiErrorPayload, Booking, Resource, Slot, User } from "../api";

export interface AlertInfo {
  severity: "success" | "error" | "info" | "warning";
  message: string;
}

export interface BookingState {
  resources: Resource[];
  users: User[];
  selectedResourceId: string;
  selectedUserId: string;
  targetDate: string;
  userTimezone: string;
  slots: Slot[];
  bookings: Booking[];
  loading: boolean;
  bookingLoading: string | null;
  alertInfo: AlertInfo | null;
}

const initialState: BookingState = {
  resources: [],
  users: [],
  selectedResourceId: "",
  selectedUserId: "",
  targetDate: new Date().toISOString().split("T")[0],
  userTimezone: "Asia/Kolkata",
  slots: [],
  bookings: [],
  loading: false,
  bookingLoading: null,
  alertInfo: null,
};

export const fetchInitialDataThunk = createAsyncThunk(
  "booking/fetchInitialData",
  async (_, { rejectWithValue }) => {
    try {
      const [resList, userList] = await Promise.all([
        resourceApi.getResources(),
        userApi.getUsers(),
      ]);
      return { resources: resList, users: userList };
    } catch (err: unknown) {
      const apiError = err as ApiErrorPayload;
      return rejectWithValue(apiError.message || "Failed to load initial data");
    }
  }
);

export const fetchSlotsAndBookingsThunk = createAsyncThunk(
  "booking/fetchSlotsAndBookings",
  async (
    params: { resourceId: string; date: string; timezone: string },
    { rejectWithValue }
  ) => {
    try {
      const [slotsData, bookingsData] = await Promise.all([
        resourceApi.getSlots(params.resourceId, params.date, params.timezone),
        bookingApi.getBookings(params.resourceId),
      ]);
      return { slots: slotsData.slots, bookings: bookingsData };
    } catch (err: unknown) {
      const apiError = err as ApiErrorPayload;
      return rejectWithValue(apiError.message || "Failed to load slots and bookings");
    }
  }
);

export const createBookingThunk = createAsyncThunk(
  "booking/createBooking",
  async (
    data: {
      resourceId: string;
      userId: string;
      startTime: string;
      endTime: string;
      slotDisplayStart: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const result = await bookingApi.createBooking({
        resourceId: data.resourceId,
        userId: data.userId,
        startTime: data.startTime,
        endTime: data.endTime,
      });

      return { result, slotDisplayStart: data.slotDisplayStart };
    } catch (err: unknown) {
      const apiError = err as ApiErrorPayload;
      if (apiError.isConflict || apiError.status === 409) {
        return rejectWithValue({
          isConflict: true,
          message: `409 Conflict: ${apiError.message || "Double-booking prevented by database exclusion constraint!"}`,
        });
      }
      return rejectWithValue({
        isConflict: false,
        message: apiError.message || "Failed to create booking",
      });
    }
  }
);

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    setSelectedResourceId: (state, action: PayloadAction<string>) => {
      state.selectedResourceId = action.payload;
    },
    setSelectedUserId: (state, action: PayloadAction<string>) => {
      state.selectedUserId = action.payload;
    },
    setTargetDate: (state, action: PayloadAction<string>) => {
      state.targetDate = action.payload;
    },
    setUserTimezone: (state, action: PayloadAction<string>) => {
      state.userTimezone = action.payload;
    },
    setAlertInfo: (state, action: PayloadAction<AlertInfo | null>) => {
      state.alertInfo = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Initial Data
    builder.addCase(fetchInitialDataThunk.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchInitialDataThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.resources = action.payload.resources;
      state.users = action.payload.users;
      if (action.payload.resources.length > 0 && !state.selectedResourceId) {
        state.selectedResourceId = action.payload.resources[0].id;
      }
      if (action.payload.users.length > 0 && !state.selectedUserId) {
        state.selectedUserId = action.payload.users[0].id;
      }
    });
    builder.addCase(fetchInitialDataThunk.rejected, (state, action) => {
      state.loading = false;
      state.alertInfo = {
        severity: "error",
        message: (action.payload as string) || "Failed to load initial resources",
      };
    });

    // Slots & Bookings
    builder.addCase(fetchSlotsAndBookingsThunk.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchSlotsAndBookingsThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.slots = action.payload.slots;
      state.bookings = action.payload.bookings;
    });
    builder.addCase(fetchSlotsAndBookingsThunk.rejected, (state, action) => {
      state.loading = false;
      state.alertInfo = {
        severity: "error",
        message: (action.payload as string) || "Failed to load slots",
      };
    });

    // Create Booking
    builder.addCase(createBookingThunk.pending, (state, action) => {
      state.bookingLoading = action.meta.arg.startTime;
    });
    builder.addCase(createBookingThunk.fulfilled, (state, action) => {
      state.bookingLoading = null;
      state.alertInfo = {
        severity: "success",
        message: `Successfully booked slot: ${action.payload.slotDisplayStart}!`,
      };
    });
    builder.addCase(createBookingThunk.rejected, (state, action) => {
      state.bookingLoading = null;
      const err = action.payload as { isConflict: boolean; message: string };
      state.alertInfo = {
        severity: "error",
        message: err?.message || "Failed to create booking",
      };
    });
  },
});

export const {
  setSelectedResourceId,
  setSelectedUserId,
  setTargetDate,
  setUserTimezone,
  setAlertInfo,
} = bookingSlice.actions;

export default bookingSlice.reducer;
