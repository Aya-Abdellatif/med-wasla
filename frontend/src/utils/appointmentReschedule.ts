function parseTimeSlot(time: string) {
  const hhmm = time.match(/^(\d{1,2}):(\d{2})$/);
  if (hhmm) {
    return { hours: Number(hhmm[1]), minutes: Number(hhmm[2]) };
  }

  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3].toUpperCase();

  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  return { hours, minutes };
}

export function formatSlotLabel(time: string) {
  const parsed = parseTimeSlot(time);
  if (!parsed) return time;

  const date = new Date();
  date.setHours(parsed.hours, parsed.minutes, 0, 0);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function buildRescheduleIsoDate(date: string, time: string) {
  const parsed = parseTimeSlot(time);
  if (!parsed) throw new Error("Invalid time selected");

  const nextDate = new Date(`${date}T00:00:00`);
  nextDate.setHours(parsed.hours, parsed.minutes, 0, 0);
  return nextDate.toISOString();
}

export function getLocalDayNameFromDateStr(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0).toLocaleDateString("en-US", {
    weekday: "long",
  });
}

export function getLocalDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMinutesFromTime(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function getLastSlotStartMinutes(endTime: string): number {
  return getMinutesFromTime(endTime) - 30;
}

export function hasTodayHoursEnded(
  availableSlots: Array<{ day: string; startTime: string; endTime: string }>,
): boolean {
  const todayStr = getLocalDateString();
  const dayName = getLocalDayNameFromDateStr(todayStr);
  const todaySlot = availableSlots.find((slot) => slot.day === dayName);
  if (!todaySlot) return false;

  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  return nowMinutes >= getLastSlotStartMinutes(todaySlot.endTime);
}

export function getEarliestBookableDate(
  _availableSlots: Array<{ day: string; startTime: string; endTime: string }>,
): string {
  // Always allow today; remaining times are loaded from the API when a date is selected.
  return getLocalDateString();
}

/** Minutes from midnight for the next bookable 30-minute slot (local time). */
export function getNextBookableSlotMinutes(now = new Date()): number {
  let hours = now.getHours();
  let minutes = now.getMinutes();

  if (minutes % 30 !== 0) {
    minutes = Math.ceil(minutes / 30) * 30;
    if (minutes >= 60) {
      hours += 1;
      minutes = 0;
    }
  }

  return hours * 60 + minutes;
}

export function describeEmptySlotsMessage(
  dateStr: string,
  workingHours: { start: string; end: string } | null,
): string {
  if (!workingHours) {
    return "This specialist is not scheduled on this day. Please pick another date.";
  }

  const isToday = dateStr === getLocalDateString();
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();

  if (isToday && nowMinutes >= getLastSlotStartMinutes(workingHours.end)) {
    return "Today's available hours have ended. Please choose a future date.";
  }

  if (isToday) {
    return "No more times left today. All remaining slots are booked or have passed.";
  }

  return "All slots are booked for this day. Please pick another date.";
}

export function emptySlotsTimeLabel(
  dateStr: string,
  workingHours: { start: string; end: string } | null,
): string {
  if (!workingHours) return "Not available this day";

  const isToday = dateStr === getLocalDateString();
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();

  if (isToday && nowMinutes >= getLastSlotStartMinutes(workingHours.end)) {
    return "Today's hours have ended";
  }

  if (isToday) return "No more times today";

  return "All slots booked";
}
