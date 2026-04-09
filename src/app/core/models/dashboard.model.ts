import { AppIconName } from '../../shared/types/app-icon-name.type';

export interface DashboardStat {
  label: string;
  value: string;
  delta: string;
  accent: 'blue' | 'green' | 'gold' | 'info';
  icon: AppIconName;
}

export interface EmployeeRecord {
  id: number;
  name: string;
  role: string;
  department: string;
  location: string;
  status: 'Active' | 'Inactive' | 'Remote';
  startDate: string;
}

export interface QuickAction {
  title: string;
  description: string;
  actionLabel: string;
  icon: AppIconName;
  kind: 'modal' | 'ghost';
}

export interface DashboardStatsPayload {
  totalEmployees: number;
  activeEmployees: number;
  totalDepartments: number;
  totalPositions: number;
  totalAttendancesToday: number;
  totalPendingLeaves: number;
  totalApprovedLeaves: number;
  totalRejectedLeaves: number;
}

export interface EmployeeListItem {
  id: number;
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string | null;
  gender: string | null;
  address: string | null;
  hireDate: string | null;
  isActive: boolean;
  role: 'admin_hr' | 'employee';
  departmentId: number | null;
  departmentName: string | null;
  positionId: number | null;
  positionName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedItems<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
