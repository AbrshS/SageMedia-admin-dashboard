import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  MessageSquare,
  Trash2,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  User,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteDialog } from '@/components/shared/DeleteDialog';
import api from '@/lib/api';

interface Message {
  _id: string;  // Changed from id to _id for MongoDB
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  subject: string;
  message: string;
  createdAt: string;
}

interface APIResponse {
  success: boolean;
  data: Message[];
  pagination: any; // Add proper pagination type if needed
}

export default function Support() {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const queryClient = useQueryClient();

  // Fetch messages query
  // Update the fetch messages query
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['support-messages'],
    queryFn: async () => {
      try {
        const response = await api.get<APIResponse>('http://localhost:3000/api/contact');
        console.log('API Response:', response.data);
        return response.data.data || []; // Access the data array from the response
      } catch (error) {
        console.error('Error fetching messages:', error);
        return [];
      }
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`http://localhost:3000/api/contact/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-messages'] });
      setShowDeleteDialog(false);
    },
  });

  const handleDelete = () => {
    if (selectedMessage) {
      deleteMutation.mutate(selectedMessage._id);
    }
  };

  // Render loading state after all hooks
  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <p>Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 ">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Support Messages</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">Manage and respond to customer inquiries</p>
        </div>
        <Badge variant="secondary" className="text-base md:text-lg px-3 py-1.5 self-start sm:self-center">
          {messages.length} Messages
        </Badge>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">Name</TableHead>
                <TableHead className="min-w-[200px]">Subject</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No messages found
                  </TableCell>
                </TableRow>
              ) : (
                messages.map((message) => (
                  <TableRow key={message._id}>
                    <TableCell className="font-medium">
                      {message.firstName} {message.lastName}
                    </TableCell>
                    <TableCell className="truncate max-w-[200px]">
                      {message.subject}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{message.email}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {format(new Date(message.createdAt), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedMessage(message);
                              setShowDetailsDialog(true);
                            }}
                          >
                            <User className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setSelectedMessage(message);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Message
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Message Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader className="border-b pb-4 sticky top-0 bg-white z-10"> 
            <DialogTitle className="text-xl md:text-2xl font-semibold">Message Details</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-6 py-4">
              {/* Contact Information */}
              <div className="bg-gray-50 rounded-xl p-4 md:p-6">
                <h3 className="text-base md:text-lg font-medium text-gray-900 mb-4">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                  {/* Contact info items */}
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <User className="h-4 w-4" />
                      <span className="font-medium text-sm">Name</span>
                    </div>
                    <p className="text-base md:text-lg text-gray-900">
                      {selectedMessage.firstName} {selectedMessage.lastName}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium text-sm">Date Sent</span>
                    </div>
                    <p className="text-base md:text-lg text-gray-900">
                      {format(new Date(selectedMessage.createdAt), 'PPP')}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <Mail className="h-4 w-4" />
                      <span className="font-medium text-sm">Email Address</span>
                    </div>
                    <p className="text-base md:text-lg text-gray-900 break-all">
                      {selectedMessage.email}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <Phone className="h-4 w-4" />
                      <span className="font-medium text-sm">Phone Number</span>
                    </div>
                    <p className="text-base md:text-lg text-gray-900">
                      {selectedMessage.phoneNumber}
                    </p>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4 md:p-6">
                  <h3 className="text-base md:text-lg font-medium text-gray-900 mb-3">Subject</h3>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-gray-700">{selectedMessage.subject}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 md:p-6">
                  <h3 className="text-base md:text-lg font-medium text-gray-900 mb-3">Message</h3>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog remains unchanged */}
        <DeleteDialog
          open={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onDelete={handleDelete}
          title="Delete Message"
          description="Are you sure you want to delete this message? This action cannot be undone."
        />
      </div>
    );
}