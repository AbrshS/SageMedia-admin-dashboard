import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import Login from '@/pages/auth/login';
import Dashboard from './pages/dashboard';

import Competitions from './pages/dashboard/competitions';
import Analytics from './pages/dashboard/analytics';
import Profile from './pages/dashboard/profile';
import { Toaster } from "react-hot-toast";
import ApplicationsV2 from './pages/dashboard/ApplicationsV2';
import { NotificationProvider } from './contexts/NotificationContext';
import Support from '@/pages/support';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}> 
          <NotificationProvider>

      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            style: {
              background: '#10B981',
            },
          },
          error: {
            style: {
              background: '#EF4444',
            },
            duration: 4000,
          },
        }}
      />
    
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Root redirect to login instead of dashboard */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Protected dashboard routes */}
          <Route element={<AuthGuard />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/applications" element={<ApplicationsV2 />} />
              <Route path="/competitions" element={<Competitions />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/support" element={<Support />} />
            </Route>
          </Route>

          {/* Catch all route - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter> 
      </NotificationProvider>
    </QueryClientProvider>
  );
}

