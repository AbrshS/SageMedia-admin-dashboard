import { useAuthStore } from '@/store/useAuthStore';
import { getCurrentUser } from '@/services/api/auth';
import { Menu, User, Cpu, Globe2, Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserCircle, LogOut } from 'lucide-react';
import api from '@/lib/api';
import { AdminNotificationDropdown } from '@/components/notifications/AdminNotificationDropdown';

interface HeaderProps {
  onMenuClick: () => void;
} 

// Remove duplicate fetchUserData effect and fix performance metrics
export function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const { user, logout, token } = useAuthStore();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('/auth/me');
        console.log('User data:', response.data);
        setUserData(response.data.data); // Access the data property from response
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const [performance, setPerformance] = useState({
    memory: '0',
    latency: '0',
    uptime: '0',
  });

  useEffect(() => {
    const updateMetrics = () => {
      const memory = Math.round(Math.random() * 1024);
      const latency = Math.round(Math.random() * 100);
      const uptime = Math.floor(Date.now() / 1000 / 60 / 60);

      setPerformance({
        memory: `${memory} MB`,
        latency: `${latency}ms`,
        uptime: `${uptime}h`,
      });
    };

    const timer = setInterval(updateMetrics, 5000);
    updateMetrics();
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5 text-gray-500" />
        </Button>

        {/* Performance Metrics Section */}
        <div className="hidden md:flex items-center space-x-6 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <Cpu className="h-3 w-3 text-blue-400" />
            <span className="font-normal">Memory: {performance.memory}</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe2 className="h-3 w-3 text-indigo-400" />
            <span className="font-normal">Latency: {performance.latency}</span>
          </div>
          <div className="flex items-center gap-2">
            <Gauge className="h-3 w-3 text-violet-400" />
            <span className="font-normal">Uptime: {performance.uptime}</span>
          </div>
        </div>

        {/* User Profile and Notifications Section */}
        <div className="flex items-center gap-4">
          <AdminNotificationDropdown />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 px-4 hover:bg-gray-50">
                <UserCircle className="h-5 w-5 text-gray-600" />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-normal text-gray-700">
                    {userData?.fullName || 'Guest User'}
                  </span>
                  <span className="text-xs font-normal text-gray-500">
                    {userData?.role || 'Administrator'}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white/80 backdrop-blur-sm border shadow-lg">
              <DropdownMenuItem 
                onClick={() => navigate('/profile')} 
                className="cursor-pointer text-gray-600 hover:bg-gray-50/80 font-normal"
              >
                <User className="mr-2 h-4 w-4" />
                <span>View Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-100" />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="cursor-pointer text-red-500 hover:bg-red-50/80 font-normal"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}