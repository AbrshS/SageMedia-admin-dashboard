import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";  // Add this import
import {
  UserCircle,
  Mail,
  Phone,
  Shield,
  Key,
  User,
  X,
  Loader2
} from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Users, Plus } from "lucide-react"; // Add to imports
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pencil,
  Trash2,
  MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { CreateUserModal } from "@/components/users/CreateUserModal";
import { ChevronDown, } from "lucide-react";      
           
interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  username: string;
  role: string;
  status: string;
}

interface User {
  _id: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
}

export default function Profile({ onClose }: { onClose?: () => void }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: "",
    email: "",
    phone: "",
    username: "",
    role: "",
    status: ""
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  
  // Add these new states
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Modify the existing useEffect
  useEffect(() => {
    fetchProfile();
    fetchUsers(); // Add this line
  }, []);

 

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get("/auth/me");
      const userData = response.data.data;
      setProfileData({
        fullName: userData.fullName || "",
        email: userData.email || "",
        phone: userData.phone || "",
        username: userData.username || "",
        role: userData.role || "",
        status: userData.status || ""
      });
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  // Update the handleProfileUpdate function
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put("/auth/profile", profileData);
      toast.success("Profile information updated successfully", {
        duration: 3000,
      });
    } catch (error) {
      toast.error("Unable to update profile. Please try again.", {
        duration: 4000,
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Update the handlePasswordChange function
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match", { duration: 4000 });
      return;
    }
    try {
      setSaving(true);
      await api.put("/auth/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success("Password changed successfully", { duration: 3000 });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error) {
      toast.error("Failed to change password. Please check your current password.", {
        duration: 4000,
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Update the handleStatusToggle function
  const handleStatusToggle = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await api.put(`/auth/users/${userId}/status`, { status: newStatus });
      fetchUsers();
      toast.success(`User status changed to ${newStatus}`, { duration: 3000 });
    } catch (error) {
      toast.error("Failed to update user status", { duration: 4000 });
    }
  };
  
  // Update the handleRoleChange function
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.put(`/auth/users/${userId}/role`, { role: newRole });
      fetchUsers();
      toast.success(`User role updated to ${newRole}`, { duration: 3000 });
    } catch (error) {
      toast.error("Failed to update user role", { duration: 4000 });
    }
  };
  
  // Update the handleDeleteUser function
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/auth/users/${userId}`);
      fetchUsers();
      toast.success("User deleted successfully", { duration: 3000 });
    } catch (error) {
      toast.error("Failed to delete user. Please try again.", { duration: 4000 });
    }
  };
  
  // Update the fetchUsers function
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await api.get('/auth/users');
      setUsers(response.data.data);
    } catch (error) {
      toast.error("Failed to load users. Please refresh the page.", {
        duration: 4000,
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Profile Settings</h1>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <UserCircle className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="fullName"
                        value={profileData.fullName}
                        onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="username"
                        value={profileData.username}
                        onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label>Role:</Label>
                    <Badge variant="outline" className="text-primary">
                      {profileData.role}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label>Status:</Label>
                    <Badge variant="outline" className="text-green-600">
                      {profileData.status}
                    </Badge>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
        
       
            
          
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>User Management</CardTitle>
                <Button 
                  size="sm" 
                  className="flex items-center gap-2"
                  onClick={() => setIsCreateUserOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  Add User
                </Button>
              </div>
            </CardHeader>
            
            {/* Add this before the closing tag of the Profile component */}
            <CreateUserModal 
              open={isCreateUserOpen}
              onOpenChange={setIsCreateUserOpen}
              onSuccess={fetchUsers}
            />
            <CardContent>
              {loadingUsers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-medium text-gray-700">User Info</TableHead>
                        <TableHead className="font-medium text-gray-700">Contact</TableHead>
                        <TableHead className="font-medium text-gray-700">Access Control</TableHead>
                        <TableHead className="font-medium text-gray-700">System Info</TableHead>
                        <TableHead className="text-right font-medium text-gray-700">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user._id} className="hover:bg-gray-50/50">
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-gray-900">{user.fullName}</p>
                              <p className="text-sm text-gray-500">@{user.username}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-gray-900">{user.email}</p>
                              {user.phone && (
                                <p className="text-sm text-gray-500">{user.phone}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className={cn(
                                      "h-8 w-full justify-start px-2 font-normal",
                                      user.role === 'admin' && "text-purple-700 hover:bg-purple-50",
                                      user.role === 'supervisor' && "text-blue-700 hover:bg-blue-50",
                                      user.role === 'user' && "text-gray-700 hover:bg-gray-50"
                                    )}
                                  >
                                    <Shield className="mr-2 h-4 w-4" />
                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                    <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent 
                                  align="start" 
                                  className="w-[200px] bg-white border rounded-md shadow-md"
                                >
                                  <DropdownMenuItem 
                                    onClick={() => handleRoleChange(user._id, 'admin')}
                                    className="text-purple-700 hover:bg-purple-50"
                                  >
                                    <Shield className="mr-2 h-4 w-4" />
                                    Admin
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleRoleChange(user._id, 'supervisor')}
                                    className="text-blue-700 hover:bg-blue-50"
                                  >
                                    <Users className="mr-2 h-4 w-4" />
                                    Supervisor
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleRoleChange(user._id, 'user')}
                                    className="text-gray-700 hover:bg-gray-50"
                                  >
                                    <User className="mr-2 h-4 w-4" />
                                    User
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={user.status === 'active'}
                                  onCheckedChange={() => handleStatusToggle(user._id, user.status)}
                                  className={cn(
                                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                                    user.status === 'active' 
                                      ? 'bg-green-500 hover:bg-green-600' 
                                      : 'bg-red-500 hover:bg-red-600'
                                  )}
                                />
                                <span className={cn(
                                  "text-sm",
                                  user.status === 'active' ? 'text-green-600' : 'text-gray-500'
                                )}>
                                  {user.status === 'active' ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-sm text-gray-500">
                                Created: {new Date(user.createdAt).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-gray-500">
                                Updated: {new Date(user.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeleteUser(user._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}