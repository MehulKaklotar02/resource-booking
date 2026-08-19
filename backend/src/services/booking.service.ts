import prisma from "../config/prisma";
import { generateSlotsForDate } from "./time.service";

export interface CreateBookingInput {
  resourceId: string;
  userId: string;
  startTime: string;
  endTime: string;
}

export class BookingConflictError extends Error {
  statusCode: number = 409;
  constructor(message: string = "This slot is already booked or overlaps with an existing booking.") {
    super(message);
    this.name = "BookingConflictError";
  }
}

export const getResources = async () => {
  return prisma.resource.findMany({
    include: {
      availabilities: true,
    },
    orderBy: {
      name: "asc",
    },
  });
};

export const getSlotsForResource = async (
  resourceId: string,
  dateStr: string,
  userTimezone: string = "UTC"
) => {
  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
    include: { availabilities: true },
  });

  if (!resource) {
    throw new Error(`Resource with ID ${resourceId} not found`);
  }

  const candidateSlots = generateSlotsForDate(
    dateStr,
    resource.timezone,
    resource.availabilities,
    userTimezone,
    60
  );

  if (candidateSlots.length === 0) {
    return {
      resource: {
        id: resource.id,
        name: resource.name,
        timezone: resource.timezone,
      },
      date: dateStr,
      userTimezone,
      slots: [],
    };
  }

  const minStart = new Date(candidateSlots[0].startTimeUtc);
  const maxEnd = new Date(candidateSlots[candidateSlots.length - 1].endTimeUtc);

  const existingBookings = await prisma.booking.findMany({
    where: {
      resourceId,
      startTime: { lt: maxEnd },
      endTime: { gt: minStart },
    },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  const slotsWithStatus = candidateSlots.map((slot) => {
    const slotStart = new Date(slot.startTimeUtc);
    const slotEnd = new Date(slot.endTimeUtc);

    const overlappingBooking = existingBookings.find(
      (b) => b.startTime < slotEnd && b.endTime > slotStart
    );

    return {
      ...slot,
      isBooked: !!overlappingBooking,
      booking: overlappingBooking
        ? {
            id: overlappingBooking.id,
            userId: overlappingBooking.userId,
            userName: overlappingBooking.user.name,
          }
        : null,
    };
  });

  return {
    resource: {
      id: resource.id,
      name: resource.name,
      timezone: resource.timezone,
    },
    date: dateStr,
    userTimezone,
    slots: slotsWithStatus,
  };
};

export const createBooking = async (input: CreateBookingInput) => {
  const { resourceId, userId, startTime, endTime } = input;

  const startUtc = new Date(startTime);
  const endUtc = new Date(endTime);

  if (isNaN(startUtc.getTime()) || isNaN(endUtc.getTime())) {
    throw new Error("Invalid start or end time format");
  }

  if (startUtc >= endUtc) {
    throw new Error("Start time must be strictly before end time");
  }

  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
  });
  if (!resource) {
    throw new Error(`Resource ${resourceId} not found`);
  }

  // Ensure user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw new Error(`User ${userId} not found`);
  }

  try {
    const booking = await prisma.booking.create({
      data: {
        resourceId,
        userId,
        startTime: startUtc,
        endTime: endUtc,
      },
      include: {
        resource: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return booking;
  } catch (error: any) {
    const isExclusionViolation =
      error?.code === "P2010" ||
      error?.code === "P2002" ||
      (error?.message && error.message.includes("no_overlapping_bookings")) ||
      (error?.message && error.message.includes("23P01")) ||
      (error?.message && error.message.includes("40P01")) ||
      (error?.message && error.message.includes("deadlock")) ||
      (error?.meta?.code === "23P01") ||
      (error?.meta?.code === "40P01");

    if (isExclusionViolation) {
      throw new BookingConflictError("Double-booking prevented: This slot has already been booked by another user.");
    }

    throw error;
  }
};

export const getBookings = async (resourceId?: string) => {
  return prisma.booking.findMany({
    where: resourceId ? { resourceId } : undefined,
    include: {
      resource: true,
      user: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: {
      startTime: "asc",
    },
  });
};
