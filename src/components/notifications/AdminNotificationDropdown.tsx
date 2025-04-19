import { Bell, Info, User2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNotifications } from "@/contexts/NotificationContext";
import { format } from "date-fns";
import { differenceInHours } from 'date-fns';

export function AdminNotificationDropdown() {
  const { notifications, loading, markAsViewed } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = (notification: any) => {
    markAsViewed(notification);
    navigate('/applications');
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-6 w-6 text-gray-500 hover:text-gray-700 transition-colors duration-200" />
          {notifications.length > 0 && (
            <div className="absolute -top-1 -right-1 flex items-center">
              <span className="animate-ping absolute h-3 w-3 rounded-full bg-blue-400 opacity-75"></span>
              <Badge className="relative h-3 w-3 rounded-full bg-blue-500" />
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 shadow-lg rounded-xl border-gray-200" align="end">
        <div className="bg-white p-3 border-b">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <User2 className="h-4 w-4" />
            New Applications ({notifications.length})
          </h3>
        </div>
        <div className="max-h-[350px] overflow-y-auto bg-white">
          {loading ? (
            <div className="p-6 text-center">
              <div className="w-8 h-8 animate-spin rounded-full border-3 border-gray-300 border-t-blue-500 mx-auto" />
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <div 
                key={notification._id} 
                className="p-4 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <User2 className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.fullName}
                      </p>
                      {differenceInHours(new Date(), new Date(notification.createdAt)) <= 24 && (
                        <span className="px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-600 rounded-full">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Competition: {notification.competition.title}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(notification.createdAt), 'MMM dd, yyyy HH:mm')}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-gray-500">
              <Info className="h-8 w-8 mx-auto mb-3 text-gray-400" />
              <p className="font-medium">All caught up!</p>
              <p className="text-sm mt-1">No new applications</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}