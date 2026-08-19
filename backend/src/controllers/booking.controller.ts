import { Request, Response } from "express";
import {
  BookingConflictError,
  createBooking as createBookingService,
  getBookings as getBookingsService,
} from "../services/booking.service";

export const createBooking = async (req: Request, res: Response) => {
  try {
    const { resourceId, userId, startTime, endTime } = req.body;

    if (!resourceId || !userId || !startTime || !endTime) {
      res.status(400).json({
        success: false,
        message: "resourceId, userId, startTime, and endTime are required",
      });
      return;
    }

    const booking = await createBookingService({
      resourceId,
      userId,
      startTime,
      endTime,
    });

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error: any) {
    if (error instanceof BookingConflictError || error.statusCode === 409) {
      res.status(409).json({
        success: false,
        message: error.message || "Conflict: Double-booking prevented.",
      });
      return;
    }

    res.status(400).json({
      success: false,
      message: error.message || "Failed to create booking",
    });
  }
};

export const getBookings = async (req: Request, res: Response) => {
  try {
    const resourceId = req.query.resourceId as string | undefined;
    const bookings = await getBookingsService(resourceId);
    res.json({ success: true, data: bookings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
