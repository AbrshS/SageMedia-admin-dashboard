import { useEffect, useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

export function AuthGuard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, token, checkAuth } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      setIsChecking(true);
      
      if (!isAuthenticated || !token) {
        navigate('/login', { 
          state: { from: location.pathname },
          replace: true 
        });
        return;
      }

      try {
        await checkAuth();
        setIsChecking(false);
      } catch (error) {
        navigate('/login', { 
          state: { from: location.pathname },
          replace: true 
        });
      }
    };

    validateSession();
  }, [isAuthenticated, token, navigate, location, checkAuth]);

  // Show loading or nothing while checking authentication
  if (isChecking) return null;

  // Only render the protected content when authenticated and checked
  return isAuthenticated ? <Outlet /> : null;
}