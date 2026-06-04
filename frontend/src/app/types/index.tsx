// Auth & Roles
export type UserRole = "patient" | "doctor" | "nurse";

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  profileImage?: string;
  createdAt: string;
}

// Patient
export interface Patient extends User {
  role: "patient";
  dateOfBirth?: string;
  gender?: "male" | "female";
  address?: string;
  medicalHistory?: string;
}

// Doctor
export interface Doctor extends User {
  role: "doctor";
  specialty: string;
  bio?: string;
  location: string;
  clinicName?: string;
  consultationFee: number;
  rating: number;
  reviewsCount: number;
  isVerified: boolean;         // Admin approves certificate
  availableDays: string[];     // ["Monday", "Wednesday"]
  availableHours: {
    from: string;              // "09:00"
    to: string;                // "17:00"
  };
  currentQueueLength: number;  // Real-time queue
}

// Nurse
export interface Nurse extends User {
  role: "nurse";
  certification: string;
  bio?: string;
  location: string;
  serviceFee: number;
  rating: number;
  reviewsCount: number;
  isVerified: boolean;
  availableDays: string[];
  availableHours: {
    from: string;
    to: string;
  };
  servicesOffered: string[];   // ["Wound Care", "IV Therapy"]
}

// Appointment
export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export interface Appointment {
  _id: string;
  patientId: string;
  patientName: string;
  providerId: string;          // Doctor or Nurse id
  providerName: string;
  serviceType: "doctor" | "nurse";
  date: string;
  time: string;
  reason: string;
  address?: string;            // Only for nurse appointments
  status: AppointmentStatus;
  createdAt: string;
}

// Specialty
export interface Specialty {
  _id: string;
  name: string;                // "Cardiology"
  icon?: string;
  doctorsCount: number;
}

// Booking Form
export interface BookingFormData {
  patientName: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  reason: string;
  address?: string;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}