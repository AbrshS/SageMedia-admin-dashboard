import { useState } from "react";
import { format } from "date-fns";
import { Application } from "@/types/application";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Eye, 
  Check, 
  X, 
  ChevronDown, 
  Image as ImageIcon,
  Info,
  CheckCircle2,
  XCircle,
  Clock,
  CheckCircle
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ImagePreviewDialog } from "@/components/applications/ImagePreviewDialog";
import { RejectDialog } from "@/components/applications/RejectDialog";
import { useToast } from "@/components/ui/use-toast"; // Add this import

export function ApplicationCard({ application, onApprove, onReject, onView, onImageView }) {
  const { toast } = useToast(); // Add toast hook
  const [isExpanded, setIsExpanded] = useState(false);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  const statusConfig = {
    pending: {
      color: "bg-amber-100 text-amber-800",
      icon: <Clock className="w-4 h-4" />
    },
    approved: {
      color: "bg-emerald-100 text-emerald-800",
      icon: <CheckCircle className="w-4 h-4" />
    },
    rejected: {
      color: "bg-rose-100 text-rose-800",
      icon: <XCircle className="w-4 h-4" />
    }
  };

  // Update the click handler for reject button
  const handleRejectClick = () => {
    console.log('Opening reject dialog for:', application._id);
    setIsRejectDialogOpen(true);
  };

  const handleReject = async (reason: string) => {
    console.log('Starting rejection process...');
    console.log('Application:', application);
    console.log('Reason:', reason);
    
    try {
      const token = localStorage.getItem("auth_token");
      console.log('Token:', token ? 'Present' : 'Missing');

      const response = await fetch(`http://localhost:3000/api/applications/${application._id}/reject`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ rejectionReason: reason })
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(`Rejection failed: ${data.message || 'Unknown error'}`);
      }

      setIsRejectDialogOpen(false);
      onReject(application._id);
      toast({
        title: "Application rejected successfully",
        description: "The applicant will be notified of the rejection."
      });
    } catch (error) {
      console.error("Rejection error details:", error);
      toast({
        title: "Failed to reject application",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  // Update the reject button onClick handler
  return (
    <>
      <motion.div>
        {/* Image Section with Loading State */}
        <div className="relative aspect-[16/9] overflow-hidden bg-gray-50">
          <AnimatePresence>
            {application.portraitPhoto && (
              <motion.img
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                src={`http://localhost:3000/${application.portraitPhoto.replace(/\\/g, '/')}`}
                alt={`${application.fullName}'s portrait`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-zoom-in"
                onClick={() => onImageView(application.portraitPhoto)}
                onError={(e) => {
                  console.error('Image failed to load:', application.portraitPhoto);
                  e.currentTarget.src = '/placeholder.jpg';
                  e.currentTarget.className = 'w-full h-full object-contain p-4 opacity-70';
                }}
              />
            )}
          </AnimatePresence>
          {!application.portraitPhoto && (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-gray-300" />
            </div>
          )}
          <Badge 
            variant="outline" 
            className={cn(
              "absolute top-2 right-2 px-3 py-1",
              statusConfig[application.status].color
            )}
          >
            <span className="mr-1">{statusConfig[application.status].icon}</span>
            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
          </Badge>
        </div>

        {/* Content Section */}
        <div className="p-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900">{application.fullName}</h3>
              <p className="text-sm text-gray-500">{application.phoneNumber}</p>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="text-emerald-600">
                <span className="font-medium">{application.votes?.count || 0}</span> votes
              </div>
              <div className="text-emerald-600 font-medium">
                ${application.totalVoteAmount || 0}
              </div>
            </div>

            {/* Expandable Details Section */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 space-y-3 border-t">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Address:</span> {application.address}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Applied:</span> {format(new Date(application.createdAt), 'PPP')}
                    </p>
                    {application.notes && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Notes:</span> {application.notes}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Actions Section */}
          <div className="flex items-center gap-2 pt-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 border-gray-200 hover:bg-gray-50"
                    onClick={() => onView(application)}
                  >
                    <Info className="h-4 w-4 text-gray-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View Details</p>
                </TooltipContent>
              </Tooltip>

              {application.status === 'pending' && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 border-emerald-200 hover:bg-emerald-50"
                        onClick={() => onApprove(application._id)}
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Approve Application</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 border-rose-200 hover:bg-rose-50"
                        onClick={handleRejectClick}  // Updated this line
                      >
                        <XCircle className="h-4 w-4 text-rose-600" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Reject Application</p>
                    </TooltipContent>
                  </Tooltip>
                </>
              )}
            </TooltipProvider>
          </div>
        </div>
      </motion.div>

      <ImagePreviewDialog
        open={isImagePreviewOpen}
        onClose={() => setIsImagePreviewOpen(false)}
        imageUrl={application.portraitPhoto}
      />
      <RejectDialog 
        open={isRejectDialogOpen}
        onClose={() => setIsRejectDialogOpen(false)}
        onReject={handleReject}
        applicationName={application.fullName}
      />
    </>
  );
}