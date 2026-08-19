export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Availability {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface Resource {
  id: string;
  name: string;
  timezone: string;
  availabilities: Availability[];
}

export interface SlotBookingInfo {
  id: string;
  userId: string;
  userName: string;
}

export interface Slot {
  startTimeUtc: string;
  endTimeUtc: string;
  displayStart: string;
  displayEnd: string;
  userTimezone: string;
  isBooked: boolean;
  booking?: SlotBookingInfo | null;
}

export interface SlotsResponse {
  resource: {
    id: string;
    name: string;
    timezone: string;
  };
  date: string;
  userTimezone: string;
  slots: Slot[];
}

export interface Booking {
  id: string;
  resourceId: string;
  userId: string;
  startTime: string;
  endTime: string;
  resource: Resource;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponseData {
  token: string;
  user: User;
}

export interface CreateBookingPayload {
  resourceId: string;
  userId: string;
  startTime: string;
  endTime: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ApiErrorPayload {
  status?: number;
  message: string;
  isConflict?: boolean;
}
