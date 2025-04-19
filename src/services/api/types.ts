// Dashboard Types
export interface DashboardStats {
  totalApplications: number;
  totalCompetitions: number;
  recentApplications: Application[];
  recentCompetitions: Competition[];
}

// Application Types
export interface Application {
  id: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  // Add other fields as needed
}

// Competition Types
export interface Competition {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  // Add other fields as needed
}

// Auth Types
export interface User {
  id: string;
  email: string;
  fullname: string;
  role: string;
  // Add other fields as needed
}