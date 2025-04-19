import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';
import { differenceInHours } from 'date-fns';

interface Application {
  _id: string;
  fullName: string;
  competition: {
    title: string;
  };
  status: string;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Application[];
  loading: boolean;
  error: string | null;
  markAsViewed: (notification: Application) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      const lastViewed = localStorage.getItem('lastNotificationViewed');
      if (lastViewed) {
        const lastViewedTime = new Date(lastViewed);
        const now = new Date();
        const hoursDiff = (now.getTime() - lastViewedTime.getTime()) / (1000 * 60 * 60);
        if (hoursDiff < 12) {
          setNotifications([]);
          setLoading(false);
          return;
        }
      }

      const response = await api.get('/applications');
      // Access the data array from the response structure
      const applications = response.data.data || [];
      
      const newApplications = applications.filter((app: Application) => {
        const createdAt = new Date(app.createdAt);
        const now = new Date();
        const hoursSinceCreation = differenceInHours(now, createdAt);
        return app.status === 'pending' && hoursSinceCreation <= 24;
      });
      
      setNotifications(newApplications);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh notifications every 5 minutes
    const interval = setInterval(fetchNotifications, 300000);
    return () => clearInterval(interval);
  }, []);

  const markAsViewed = (notification: Application) => {
    localStorage.setItem('lastNotificationViewed', new Date().toISOString());
    setNotifications(notifications.filter(n => n._id !== notification._id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, loading, error, markAsViewed }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}