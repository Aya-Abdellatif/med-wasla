export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  role?: string;
  specialistType?: string;
  licenseNumber?: string;
  homeVisit?: boolean;
  specialization?: string;
  serviceAreas?: string[];
  clinicAddress?: string;
  bio?: string;
  consultationFee?: number;
}

export interface AuthResult {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}
