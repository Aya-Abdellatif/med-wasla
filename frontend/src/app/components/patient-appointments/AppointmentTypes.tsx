export type AppointmentStatus = "upcoming" | "pending" | "completed" | "cancelled" | "overdue";
export type AppointmentType = "clinic" | "home";

export interface AppointmentReview {
  rating: number;
  comment: string;
}

export interface Appointment {
    id: string;
    specialistId: string;
    doctor: {
        name: string;
        specialty: string;
        photo: string;
        phone: string;
        rating: number;
    };
    date: string;
    time: string;
    type: AppointmentType;
    status: AppointmentStatus;
    address?: string;
    reason: string;
    reminders: string[];
    fee: number;
    review?: AppointmentReview;
}