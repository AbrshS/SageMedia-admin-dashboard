import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  user: any | null;
  isAuthenticated: boolean;
  login: (token: string, user: any) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create(
  persist<AuthState>(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      login: (token, user) => {
        set({ token, user, isAuthenticated: true });
      },
      logout: () => {
        set({ token: null, user: null, isAuthenticated: false });
      },
      checkAuth: async () => {
        try {
          // Add your token validation logic here
          // For now, we'll just check if token exists
          const state = useAuthStore.getState();
          if (!state.token) {
            throw new Error('No token found');
          }
          // If you have an API endpoint for token validation, use it here
          return Promise.resolve();
        } catch (error) {
          set({ token: null, user: null, isAuthenticated: false });
          throw error;
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);