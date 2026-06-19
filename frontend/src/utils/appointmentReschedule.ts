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
