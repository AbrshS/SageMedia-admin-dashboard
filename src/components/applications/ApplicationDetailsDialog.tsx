import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { 
  Instagram, 
  Facebook, 
  Twitter, 
  Globe, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  User2,
  Briefcase
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export function ApplicationDetailsDialog({ open, onClose, application }) {
  const statusColors = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-emerald-100 text-emerald-800",
    rejected: "bg-rose-100 text-rose-800"
  };

  // Add competition query
  const { data: competitionData } = useQuery({
    queryKey: ["competition", application?.competition],
    queryFn: async () => {
      if (!application?.competition) return null;
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`http://localhost:3000/api/competitions/${application.competition}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch competition");
      return response.json();
    },
    enabled: !!application?.competition,
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-semibold flex items-center justify-between">
            Application Details
            <Badge className={statusColors[application?.status]}>
              {application?.status?.toUpperCase()}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Profile Image */}
          <div className="md:col-span-2">
            <img
              src={`http://localhost:3000/${application?.portraitPhoto?.replace(/\\/g, '/')}`}
              alt={application?.fullName}
              className="w-full h-48 sm:h-56 object-cover rounded-lg"
            />
          </div>

          {/* Personal Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-base">Personal Information</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User2 className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="font-medium">{application?.fullName}</p>
                  <p className="text-sm text-gray-500">{application?.age} years old • {application?.gender}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <p>{application?.email}</p>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <div>
                  <p>{application?.phoneNumber}</p>
                  <p className="text-sm text-gray-500">{application?.alternatePhoneNumber}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <p>{application?.address?.city}, {application?.address?.country}</p>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-base">Professional Details</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-gray-500" />
                <p>{application?.experience}</p>
              </div>

              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-500" />
                <a 
                  href={application?.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Portfolio
                </a>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="md:col-span-2 space-y-3">
            <h3 className="font-semibold text-base">Social Media</h3>
            <div className="flex flex-wrap gap-2">
              {application?.socialMedia?.instagram && (
                <a
                  href={`https://${application.socialMedia.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                  <span>Instagram</span>
                </a>
              )}
              {application?.socialMedia?.facebook && (
                <a
                  href={`https://${application.socialMedia.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                  <span>Facebook</span>
                </a>
              )}
              {application?.socialMedia?.twitter && (
                <a
                  href={`https://twitter.com/${application.socialMedia.twitter.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                  <span>Twitter</span>
                </a>
              )}
            </div>
          </div>

          {/* Voting Information */}
          <div className="md:col-span-2 bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-base">Votes</h3>
                <p className="text-xl font-bold text-emerald-600">
                  {application?.votes?.count || 0}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Applied on</p>
                <p className="font-medium">
                  {application?.createdAt && format(new Date(application.createdAt), 'PP')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}