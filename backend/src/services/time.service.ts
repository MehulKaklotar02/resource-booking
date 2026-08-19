import { addMinutes, format as formatStd } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

export interface SlotAvailabilityRule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface GeneratedSlot {
  startTimeUtc: string;
  endTimeUtc: string;
  displayStart: string;
  displayEnd: string;
  userTimezone: string;
}

export const generateSlotsForDate = (
  dateStr: string,
  resourceTimezone: string,
  availabilities: SlotAvailabilityRule[],
  userTimezone: string = "UTC",
  slotDurationMinutes: number = 60
): GeneratedSlot[] => {
  const slots: GeneratedSlot[] = [];

  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) {
    return slots;
  }

  const localMidnightStr = `${dateStr}T00:00:00`;
  const utcMidnight = fromZonedTime(localMidnightStr, resourceTimezone);
  const localDateObj = toZonedTime(utcMidnight, resourceTimezone);
  const localDayOfWeek = localDateObj.getDay();

  const matchingRules = availabilities.filter(
    (rule) => rule.dayOfWeek === localDayOfWeek
  );

  for (const rule of matchingRules) {
    const windowStartIso = `${dateStr}T${rule.startTime}:00`;
    const windowEndIso = `${dateStr}T${rule.endTime}:00`;

    const windowStartUtc = fromZonedTime(windowStartIso, resourceTimezone);
    const windowEndUtc = fromZonedTime(windowEndIso, resourceTimezone);

    let currentSlotStartUtc = windowStartUtc;

    while (currentSlotStartUtc < windowEndUtc) {
      const nextSlotEndUtc = addMinutes(currentSlotStartUtc, slotDurationMinutes);

      if (nextSlotEndUtc > windowEndUtc) {
        break;
      }

      const displayStartLocal = toZonedTime(currentSlotStartUtc, userTimezone);
      const displayEndLocal = toZonedTime(nextSlotEndUtc, userTimezone);

      const displayStart = formatStd(displayStartLocal, "yyyy-MM-dd HH:mm");
      const displayEnd = formatStd(displayEndLocal, "HH:mm");

      slots.push({
        startTimeUtc: currentSlotStartUtc.toISOString(),
        endTimeUtc: nextSlotEndUtc.toISOString(),
        displayStart: `${displayStart} (${userTimezone})`,
        displayEnd: `${displayEnd}`,
        userTimezone,
      });

      currentSlotStartUtc = nextSlotEndUtc;
    }
  }

  return slots;
};
