import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ApplicationCard } from "@/components/applications/ApplicationCard";
import { ApplicationStats } from "@/components/applications/ApplicationStats";
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  AlertCircle,
  Trophy // Add this import
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { ApplicationDetailsDialog } from "@/components/applications/ApplicationDetailsDialog";
import { RejectDialog } from "@/components/applications/RejectDialog";
import { DeleteDialog } from "@/components/applications/DeleteDialog";
import { ImagePreviewDialog } from "@/components/applications/ImagePreviewDialog";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

// Add these imports at the top
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function ApplicationsV2() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Add to your filters state
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
    sortBy: null as string | null,
    sortDirection: "asc" as "asc" | "desc",
    competition: "all" // Add this line
  });
  
  // Add competition query
  const { data: competitions } = useQuery({
    queryKey: ["competitions"],
    queryFn: async () => {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("http://localhost:3000/api/competitions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch competitions");
      return response.json();
    },
  });
  


  // Add competition filter dropdown in your JSX
  <div className="flex flex-wrap items-center gap-3">
    {/* ... existing filters ... */}
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Trophy className="w-4 h-4" />
          {competitions?.data?.find(c => c._id === filters.competition)?.name || "All Competitions"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, competition: "all" }))}>
          All Competitions
        </DropdownMenuItem>
        {competitions?.data?.map(competition => (
          <DropdownMenuItem
            key={competition._id}
            onClick={() => setFilters(prev => ({ ...prev, competition: competition._id }))}
          >
            {competition.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
  const [dialogs, setDialogs] = useState({
    details: { open: false, application: null },
    reject: { open: false, id: null },
    delete: { open: false, id: null },
    imagePreview: { open: false, url: null }
  });

  // Add authentication effect
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      navigate("/login", { 
        state: { from: location.pathname },
        replace: true 
      });
    }
  }, []);

  // Now use filters in useQuery
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["applications", filters],
    queryFn: async () => {
      const token = localStorage.getItem("auth_token");
      
      if (!token) {
        navigate("/login", { 
          state: { from: location.pathname },
          replace: true 
        });
        throw new Error("Please login to continue");
      }

      try {
        const response = await fetch("http://localhost:3000/api/applications", {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (response.status === 401) {
          localStorage.removeItem("auth_token");
          navigate("/login", { 
            state: { from: location.pathname },
            replace: true 
          });
          throw new Error("Session expired. Please login again.");
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch applications: ${response.statusText}`);
        }

        const result = await response.json();
        
      // Transform the data to match the stats interface
      const stats = {
        total: result.data.length,
        pending: result.data.filter((app: any) => app.status === "pending").length,
        approved: result.data.filter((app: any) => app.status === "approved").length,
        rejected: result.data.filter((app: any) => app.status === "rejected").length,
        paid: result.data.filter((app: any) => app.paymentStatus === "paid").length,
        totalVotes: result.data.reduce((sum: number, app: any) => sum + (app.votes?.count || 0), 0),
        totalAmount: result.data.reduce((sum: number, app: any) => sum + (app.totalVoteAmount || 0), 0),
      };
  
      return {
        data: result.data,
        stats,
        success: result.success,
        message: result.message
      };

      } catch (error) {
        console.error("Error fetching applications:", error);
        throw error;
      }
    },
  });
  
  // Add loading state handling
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[80px]" />
                <Skeleton className="h-4 w-[120px] mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  // Add error state handling
  if (error) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Error Loading Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error.message}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => refetch()}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle application actions
  const handleApprove = async (id: string) => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`http://localhost:3000/api/applications/${id}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: "approved" })
      });

      if (!response.ok) throw new Error("Failed to approve");

      toast({ title: "Application approved successfully" });
      refetch();
    } catch (error) {
      toast({ title: "Failed to approve application", variant: "destructive" });
    }
  };

  // Filter applications based on current filters
  const filteredApplications = data?.data?.filter(app => {
    if (filters.status !== "all" && app.status !== filters.status) return false;
    if (filters.search) {
      const search = filters.search.toLowerCase();
      return (
        app.fullName.toLowerCase().includes(search) ||
        app.phoneNumber.includes(search) ||
        app.address.toLowerCase().includes(search)
      );
    }
    return true;
  }) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50/30 via-gray-50 to-sage-100/30 py-6">
      <div className="container mx-auto px-4 space-y-5">
        {/* Stats Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-sage-100/50 hover:shadow-lg transition-shadow duration-200">
          <ApplicationStats stats={data?.stats || {}} />
        </div>

        {/* Filters Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-sage-100/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl text-indigo-950 font-medium">Applications Management</h2>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 h-4 w-4" />
                <Input
                  placeholder="Search applications..."
                  className="pl-9 w-full sm:w-[300px] h-10 bg-white border-indigo-100 focus:border-indigo-200 rounded-lg"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-10 bg-white hover:bg-indigo-50 border-indigo-100">
                    <Filter className="mr-2 h-4 w-4 text-indigo-500" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuLabel className="text-gray-700">Filter By Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, status: "all" }))}>
                    All Applications
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, status: "pending" }))}>
                    Pending Only
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, status: "approved" }))}>
                    Approved Only
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, status: "rejected" }))}>
                    Rejected Only
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-10 bg-white hover:bg-indigo-50 border-indigo-100">
                    <ArrowUpDown className="mr-2 h-4 w-4 text-indigo-500" />
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuLabel className="text-gray-700">Sort Applications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setFilters(prev => ({ 
                    ...prev, 
                    sortBy: "date",
                    sortDirection: prev.sortDirection === "asc" ? "desc" : "asc"
                  }))}>
                    Date {filters.sortBy === "date" && (filters.sortDirection === "asc" ? "↑" : "↓")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilters(prev => ({ 
                    ...prev, 
                    sortBy: "votes",
                    sortDirection: prev.sortDirection === "asc" ? "desc" : "asc"
                  }))}>
                    Votes {filters.sortBy === "votes" && (filters.sortDirection === "asc" ? "↑" : "↓")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <Tabs 
            defaultValue="all" 
            value={filters.status}
            onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            className="w-full"
          >
            <TabsList className="inline-flex h-10 bg-indigo-50/50 p-1 rounded-lg">
              <TabsTrigger value="all" className="px-4 rounded data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">All</TabsTrigger>
              <TabsTrigger value="pending" className="px-4 rounded data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">Pending</TabsTrigger>
              <TabsTrigger value="approved" className="px-4 rounded data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">Approved</TabsTrigger>
              <TabsTrigger value="rejected" className="px-4 rounded data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">Rejected</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Applications Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6">
          {filteredApplications.length === 0 ? (
            <div className="col-span-full bg-white/90 rounded-2xl p-12 text-center shadow-md border border-indigo-50/50">
              <Search className="h-12 w-12 mx-auto mb-4 text-indigo-300" />
              <p className="text-indigo-900 mb-3">No applications found matching your criteria</p>
              <Button 
                variant="outline"
                onClick={() => setFilters({
                  status: "all",
                  search: "",
                  sortBy: null,
                  sortDirection: "asc"
                })}
                className="bg-white hover:bg-indigo-50 border-indigo-100"
              >
                Clear all filters
              </Button>
            </div>
          ) : (
            filteredApplications.map(application => (
              <ApplicationCard
                key={application._id}
                application={application}
                onApprove={handleApprove}
                onReject={(id) => setDialogs(prev => ({ ...prev, reject: { open: true, id } }))}
                onView={(app) => setDialogs(prev => ({ ...prev, details: { open: true, application: app } }))}
                onImageView={(url) => setDialogs(prev => ({ ...prev, imagePreview: { open: true, url } }))}
              />
            ))
          )}
        </div>

        {/* Results Summary */}
        {filteredApplications.length > 0 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-md border border-indigo-50/50">
            <p className="text-sm text-indigo-900">
              Showing <span className="font-medium text-indigo-700">{filteredApplications.length}</span> of{" "}
              <span className="font-medium text-indigo-700">{data?.data?.length || 0}</span> applications
            </p>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <ApplicationDetailsDialog
        open={dialogs.details.open}
        application={dialogs.details.application}
        onClose={() => setDialogs(prev => ({ ...prev, details: { open: false, application: null } }))}
      />
      <RejectDialog
        open={dialogs.reject.open}
        onClose={() => setDialogs(prev => ({ ...prev, reject: { open: false, id: null } }))}
        onReject={(reason) => {
          // Handle reject logic
          setDialogs(prev => ({ ...prev, reject: { open: false, id: null } }));
          refetch();
        }}
      />
      <DeleteDialog
        open={dialogs.delete.open}
        onClose={() => setDialogs(prev => ({ ...prev, delete: { open: false, id: null } }))}
        onDelete={() => {
          // Handle delete logic
          setDialogs(prev => ({ ...prev, delete: { open: false, id: null } }));
          refetch();
        }}
      />
      <ImagePreviewDialog
        open={dialogs.imagePreview.open}
        imageUrl={dialogs.imagePreview.url}
        onClose={() => setDialogs(prev => ({ ...prev, imagePreview: { open: false, url: null } }))}
      />
    </div>
  );
}