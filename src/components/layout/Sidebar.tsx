import { cn } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Trophy, 
  BarChart2, 
  X,
  Signal,
  Clock,
  MessageSquare // Add this
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Applications', href: '/applications', icon: FileText },
  { name: 'Competitions', href: '/competitions', icon: Trophy },
  { name: 'Analytics', href: '/analytics', icon: BarChart2 },
  { name: 'Support Messages', href: '/support', icon: MessageSquare }, // Add this
];



export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastActivity] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* Modern overlay with blur effect */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-overlay backdrop-blur-sm bg-black/10 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Modernized Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-sidebar w-72 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        "bg-white/80 backdrop-blur-lg border-r border-gray-100",
        "dark:bg-gray-900/80 dark:border-gray-800",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Updated Elegant header */}
        <div className="flex h-20 items-center px-6 border-b border-gray-100/50">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex items-center justify-center w-24 h-24 backdrop-blur-sm">
              <img src="logo.png" alt="" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-normal text-primary-dark/90 uppercase">
                Admin
              </span>
              <span className="text-xs font-normal text-primary-dark/80 uppercase">
                Portal
              </span>
            </div>
          </Link>
          <Button 
            variant="ghost" 
            size="icon"
            className="absolute right-4 lg:hidden hover:bg-gray-100/50"
            onClick={onClose}
          >
            <X className="h-4 w-4 text-gray-500" />
          </Button>
        </div>

        {/* Modern navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-1.5">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "group flex items-center gap-3 px-4 py-3 text-sm transition-all duration-150 ease-in-out rounded-lg",
                  "font-normal tracking-wide",
                  location.pathname === item.href
                    ? "bg-primary-dark/10 text-primary-dark"
                    : "text-gray-600 hover:bg-gray-50 hover:text-primary-dark",
                )}
              >
                <item.icon className={cn(
                  "h-4 w-4 transition-colors",
                  location.pathname === item.href
                    ? "text-primary-dark"
                    : "text-gray-400 group-hover:text-primary-dark"
                )} />
                {item.name}
              </Link>
            ))}
          </div>
        </nav>
        {/* Elegant system status section */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-100/50">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <Signal className="h-3 w-3 text-green-500" />
                <span className="font-normal">System Status</span>
              </div>
              <span className="font-normal">Active</span>
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span className="font-normal">Local Time</span>
              </div>
              <span className="font-normal">
                {currentTime.toLocaleTimeString()}
              </span>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100/50">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span className="font-normal">Last Activity</span>
                <span className="font-normal">
                  {`${Math.round((currentTime.getTime() - lastActivity.getTime()) / 1000)}s ago`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}