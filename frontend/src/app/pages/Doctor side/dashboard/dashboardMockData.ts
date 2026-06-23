import type { Appointment, HomeServiceRequest } from "./dashboardTypes";
import { getDateStrWithOffset } from "./dashboardUtils";

/**
 * Dev-only sample data. Not used in the live dashboard — appointments come from the API once wired up.
 * Keep for local testing or Storybook if needed.
 */
export function createMockAppointments(): Appointment[] {
  const todayStr = getDateStrWithOffset(0);
  const yesterdayStr = getDateStrWithOffset(-1);
  const tomorrowStr = getDateStrWithOffset(1);

  return [
    { id: "1", patientName: "John Smith", time: "09:00 AM", date: todayStr, type: "Check-up", status: "scheduled" },
    { id: "2", patientName: "Sarah Johnson", time: "10:30 AM", date: todayStr, type: "Follow-up", status: "scheduled" },
    { id: "3", patientName: "Mike Davis", time: "02:00 PM", date: todayStr, type: "Consultation", status: "scheduled" },
    { id: "4", patientName: "Emily Brown", time: "03:30 PM", date: todayStr, type: "Check-up", status: "completed" },
    { id: "5", patientName: "Anna White", time: "11:00 AM", date: getDateStrWithOffset(-2), type: "Check-up", status: "completed" },
    { id: "6", patientName: "Tom Green", time: "03:00 PM", date: getDateStrWithOffset(-2), type: "Follow-up", status: "completed" },
    { id: "7", patientName: "Lisa Park", time: "09:30 AM", date: getDateStrWithOffset(-3), type: "Consultation", status: "scheduled" },
    { id: "8", patientName: "James Miller", time: "01:00 PM", date: getDateStrWithOffset(-3), type: "Check-up", status: "completed" },
    { id: "9", patientName: "Chris Wilson", time: "11:30 AM", date: yesterdayStr, type: "Follow-up", status: "completed" },
    { id: "10", patientName: "Nadia Farouk", time: "04:00 PM", date: tomorrowStr, type: "Consultation", status: "scheduled" },
  ];
}

/** Mock home-service requests until the nurse requests API exists. */
export const MOCK_HOME_SERVICE_REQUESTS: HomeServiceRequest[] = [
  {
    id: "1",
    patientName: "Robert Wilson",
    address: "123 Main St, Apt 4B, New York, NY 10001",
    service: "Blood Pressure Monitoring",
    requestedDate: "2026-06-04",
    requestedTime: "10:00 AM",
    status: "pending",
    phone: "+1 (234) 567-8901",
  },
  {
    id: "2",
    patientName: "Linda Martinez",
    address: "456 Oak Ave, Brooklyn, NY 11201",
    service: "Wound Care",
    requestedDate: "2026-06-04",
    requestedTime: "02:00 PM",
    status: "pending",
    phone: "+1 (234) 567-8902",
  },
  {
    id: "3",
    patientName: "David Lee",
    address: "789 Pine Rd, Queens, NY 11354",
    service: "Medication Administration",
    requestedDate: "2026-06-05",
    requestedTime: "09:00 AM",
    status: "pending",
    phone: "+1 (234) 567-8903",
  },
];
