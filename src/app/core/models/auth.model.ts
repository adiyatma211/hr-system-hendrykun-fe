export interface LoginCredentials {
  email: string;
  password: string;
}

export type UserRole = 'admin_hr' | 'employee';

export interface AuthenticatedUser {
  id: number;
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string | null;
  gender: string | null;
  address: string | null;
  hireDate: string | null;
  isActive: boolean;
  role: UserRole;
  departmentId: number | null;
  departmentName: string | null;
  positionId: number | null;
  positionName: string | null;
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  initials: string;
}

export interface AuthSessionSnapshot {
  accessToken: string;
  user: AuthenticatedUser;
}
