import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Modal from './Modal';
import { toast } from 'react-hot-toast';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';

interface Competition {
  _id: string;
  title: string;
  startDate: string;
  endDate: string;
  applicationFee: number;
  status: 'upcoming' | 'active' | 'completed';
  daysUntilStart: number;
  daysUntilEnd: number;
  bannerImage: string;
  registrationDeadline: string;
  description: string;
  category: string;
  eligibility: {
    minAge: number;
    maxAge: number;
    gender: string;
    otherRequirements: string;
  };
}

const getCompetitionStatus = (startDate: string, endDate: string): string => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) return 'upcoming';
  if (now >= start && now <= end) return 'active';
  return 'ended';
};

export default function Competitions() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeadlineDialogOpen, setIsDeadlineDialogOpen] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const [newDeadline, setNewDeadline] = useState('');
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [newCompetition, setNewCompetition] = useState({
    title: '',
    startDate: '',
    endDate: '',
    applicationFee: 0,
    registrationDeadline: '',
    description: '',
    category: 'Photography', // Default value
    eligibility: {
      minAge: 18,
      maxAge: 35,
      gender: 'all',
      otherRequirements: ''
    }
  });
  const [currentStep, setCurrentStep] = useState(1);

  const fetchCompetitions = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:3000/api/competitions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setCompetitions(data.data);
      } else {
        setError(data.message || 'Failed to fetch competitions');
      }
    } catch (err) {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const handleCreate = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      const formData = new FormData();
      formData.append('title', newCompetition.title);
      formData.append('startDate', newCompetition.startDate);
      formData.append('endDate', newCompetition.endDate);
      formData.append('applicationFee', newCompetition.applicationFee.toString());
      formData.append('registrationDeadline', newCompetition.registrationDeadline);
      formData.append('description', newCompetition.description);
      formData.append('category', newCompetition.category);
      
      // Add eligibility as nested fields
      formData.append('eligibility[minAge]', newCompetition.eligibility.minAge.toString());
      formData.append('eligibility[maxAge]', newCompetition.eligibility.maxAge.toString());
      formData.append('eligibility[gender]', newCompetition.eligibility.gender);
      formData.append('eligibility[otherRequirements]', newCompetition.eligibility.otherRequirements);
      
      // Add banner image if selected
      if (bannerImage) {
        formData.append('bannerImage', bannerImage);
      }
      
      // Form validation
      if (!newCompetition.title) {
        toast.error('Title is required');
        return;
      }
      
      if (!newCompetition.startDate || !newCompetition.endDate) {
        toast.error('Start and end dates are required');
        return;
      }
      
      if (!newCompetition.registrationDeadline) {
        toast.error('Registration deadline is required');
        return;
      }
      
      if (!newCompetition.description) {
        toast.error('Description is required');
        return;
      }
      
      if (!bannerImage) {
        toast.error('Banner image is required');
        return;
      }
      
      // Show loading toast
      const loadingToast = toast.loading('Creating competition...');
      
      const response = await fetch('http://localhost:3000/api/competitions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      if (response.ok) {
        toast.success('Competition created successfully!');
        setIsCreateModalOpen(false);
        // Reset form
        setNewCompetition({
          title: '',
          startDate: '',
          endDate: '',
          applicationFee: 0,
          registrationDeadline: '',
          description: '',
          category: 'Photography',
          eligibility: {
            minAge: 18,
            maxAge: 35,
            gender: 'all',
            otherRequirements: ''
          }
        });
        setBannerImage(null);
        setCurrentStep(1);
        fetchCompetitions();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to create competition');
      }
    } catch (err) {
      toast.error('Failed to create competition');
      console.error('Create error:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`http://localhost:3000/api/competitions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Competition deleted successfully!');
        setIsDeleteDialogOpen(false);
        setSelectedCompetition(null);
        await fetchCompetitions();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete competition');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete competition');
      console.error('Delete error:', error);
    }
  };

  const handleUpdateDeadline = async () => {
    if (!selectedCompetition || !newDeadline) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:3000/api/competitions/${selectedCompetition._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ endDate: newDeadline }),
      });
      
      if (response.ok) {
        toast.success('Deadline updated successfully!');
        setIsDeadlineDialogOpen(false);
        fetchCompetitions();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to update deadline');
      }
    } catch (err) {
      toast.error('Failed to update deadline');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBannerImage(e.target.files[0]);
    }
  };

  const handleEligibilityChange = (field: string, value: string | number) => {
    setNewCompetition({
      ...newCompetition,
      eligibility: {
        ...newCompetition.eligibility,
        [field]: value
      }
    });
  };

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7ab87a]"></div>
    </div>
  );

  if (error) return (
    <div className="rounded-lg bg-[#f0f7f0] p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-[#496949]" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-[#2a3c2b]">Error</h3>
          <div className="mt-2 text-sm text-[#496949]">
            <p>{error}</p>
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={fetchCompetitions}
              className="inline-flex items-center rounded-md border border-transparent bg-[#d0e7d0] px-3 py-2 text-sm font-medium text-[#2a3c2b] hover:bg-[#a2d2a2] focus:outline-none focus:ring-2 focus:ring-[#496949] focus:ring-offset-2"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-[#2a3c2b]">Competitions</h1>
          <p className="mt-2 text-sm text-[#496949]">
            A list of all competitions including their title, dates, and status.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-[#7ab87a] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#496949] focus:outline-none focus:ring-2 focus:ring-[#496949] focus:ring-offset-2 sm:w-auto"
          >
            Create Competition
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-[#d0e7d0] ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-[#d0e7d0]">
                <thead className="bg-[#f0f7f0]">
                  <tr>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-[#2a3c2b]">Title</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-[#2a3c2b]">Start Date</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-[#2a3c2b]">End Date</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-[#2a3c2b]">Fee</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-[#2a3c2b]">Status</th>
                    <th className="relative py-3.5 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d0e7d0] bg-white">
                  {competitions.map((competition) => (
                    <tr key={competition._id} className="hover:bg-[#f0f7f0]">
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-[#2a3c2b]">
                        <div className="flex items-center space-x-3">
                          {competition.bannerImage ? (
                            <img 
                              src={competition.bannerImage.startsWith('http') 
                                ? competition.bannerImage 
                                : `http://localhost:3000/${competition.bannerImage.replace(/^\//, '')}`}
                              alt={competition.title}
                              className="h-12 w-12 rounded-md object-cover border border-[#d0e7d0]"
                              onError={(e) => {
                                console.error("Image failed to load:", competition.bannerImage);
                                // Use a data URI instead of an external placeholder service
                                e.currentTarget.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2248%22%20height%3D%2248%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2048%2048%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_18d62c0ae59%20text%20%7B%20fill%3A%23%237ab87a%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A8pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_18d62c0ae59%22%3E%3Crect%20width%3D%2248%22%20height%3D%2248%22%20fill%3D%22%23f0f7f0%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2212%22%20y%3D%2228%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
                              }}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-md bg-[#f0f7f0] flex items-center justify-center border border-[#d0e7d0]">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#7ab87a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          <span className="font-medium">{competition.title}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-[#496949]">
                        <div>
                          {format(new Date(competition.startDate), 'MMM d, yyyy')}
                          <p className="text-xs text-[#7ab87a]">
                            {competition.daysUntilStart > 0 
                              ? `Starts in ${competition.daysUntilStart} days`
                              : 'Started'}
                          </p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-[#496949]">
                        <div className="flex items-center space-x-2">
                          <div>
                            <span>{format(new Date(competition.endDate), 'MMM d, yyyy')}</span>
                            <p className="text-xs text-[#7ab87a]">
                              {competition.daysUntilEnd > 0 
                                ? `Ends in ${competition.daysUntilEnd} days`
                                : 'Ended'}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedCompetition(competition);
                              setNewDeadline(format(new Date(competition.endDate), 'yyyy-MM-dd'));
                              setIsDeadlineDialogOpen(true);
                            }}
                            className="text-[#7ab87a] hover:text-[#496949]"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-[#496949]">
                        ${competition.applicationFee}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          (() => {
                            const status = getCompetitionStatus(competition.startDate, competition.endDate);
                            switch (status) {
                              case 'upcoming':
                                return 'bg-[#d0e7d0] text-[#2a3c2b]';
                              case 'active':
                                return 'bg-[#7ab87a] text-white';
                              case 'ended':
                                return 'bg-[#f0f7f0] text-[#496949]';
                              default:
                                return 'bg-[#f0f7f0] text-[#496949]';
                            }
                          })()
                        }`}>
                          {getCompetitionStatus(competition.startDate, competition.endDate)}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => {
                            setSelectedCompetition(competition);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {competitions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-3 py-8 text-center text-sm text-[#496949]">
                        No competitions found. Create your first competition!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setCurrentStep(1);
          // Reset form when closing modal
          setNewCompetition({
            title: '',
            startDate: '',
            endDate: '',
            applicationFee: 0,
            registrationDeadline: '',
            description: '',
            category: 'Photography',
            eligibility: {
              minAge: 18,
              maxAge: 35,
              gender: 'all',
              otherRequirements: ''
            }
          });
          setBannerImage(null);
        }}
        title="Create New Competition"
      >
        <div className="space-y-4">
          <div className="mb-6">
            <Tabs defaultValue="1" className="w-full" onValueChange={(value) => setCurrentStep(parseInt(value))}>
              <TabsList className="grid w-full grid-cols-3 bg-[#f0f7f0]">
                <TabsTrigger 
                  value="1" 
                  className="data-[state=active]:bg-[#7ab87a] data-[state=active]:text-white"
                >
                  Basic Info
                </TabsTrigger>
                <TabsTrigger 
                  value="2" 
                  className="data-[state=active]:bg-[#7ab87a] data-[state=active]:text-white"
                >
                  Eligibility
                </TabsTrigger>
                <TabsTrigger 
                  value="3" 
                  className="data-[state=active]:bg-[#7ab87a] data-[state=active]:text-white"
                >
                  Details
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-[#2a3c2b]">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={newCompetition.title}
                  onChange={(e) => setNewCompetition({ ...newCompetition, title: e.target.value })}
                  placeholder="e.g. Summer Fashion 2025"
                  className="mt-1 block w-full rounded-md border-[#d0e7d0] shadow-sm focus:border-[#7ab87a] focus:ring-[#7ab87a] sm:text-sm text-[#2a3c2b]"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-[#2a3c2b]">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={newCompetition.startDate}
                    onChange={(e) => setNewCompetition({ ...newCompetition, startDate: e.target.value })}
                    className="mt-1 block w-full rounded-md border-[#d0e7d0] shadow-sm focus:border-[#7ab87a] focus:ring-[#7ab87a] sm:text-sm text-[#2a3c2b]"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-[#2a3c2b]">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={newCompetition.endDate}
                    onChange={(e) => setNewCompetition({ ...newCompetition, endDate: e.target.value })}
                    className="mt-1 block w-full rounded-md border-[#d0e7d0] shadow-sm focus:border-[#7ab87a] focus:ring-[#7ab87a] sm:text-sm text-[#2a3c2b]"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="registrationDeadline" className="block text-sm font-medium text-[#2a3c2b]">
                  Registration Deadline <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="registrationDeadline"
                  value={newCompetition.registrationDeadline}
                  onChange={(e) => setNewCompetition({ ...newCompetition, registrationDeadline: e.target.value })}
                  className="mt-1 block w-full rounded-md border-[#d0e7d0] shadow-sm focus:border-[#7ab87a] focus:ring-[#7ab87a] sm:text-sm text-[#2a3c2b]"
                  required
                />
                <p className="mt-1 text-xs text-[#496949]">
                  Registration deadline must be before the competition start date
                </p>
              </div>
              <div>
                <label htmlFor="applicationFee" className="block text-sm font-medium text-[#2a3c2b]">
                  Application Fee ($)
                </label>
                <input
                  type="number"
                  id="applicationFee"
                  value={newCompetition.applicationFee}
                  onChange={(e) => setNewCompetition({ ...newCompetition, applicationFee: Number(e.target.value) })}
                  placeholder="e.g. 50"
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full rounded-md border-[#d0e7d0] shadow-sm focus:border-[#7ab87a] focus:ring-[#7ab87a] sm:text-sm text-[#2a3c2b]"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex justify-center rounded-md border border-transparent bg-[#7ab87a] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#496949] focus:outline-none focus:ring-2 focus:ring-[#496949] focus:ring-offset-2"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="minAge" className="block text-sm font-medium text-[#2a3c2b]">
                    Minimum Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="minAge"
                    value={newCompetition.eligibility.minAge}
                    onChange={(e) => handleEligibilityChange('minAge', Number(e.target.value))}
                    placeholder="e.g. 18"
                    min="0"
                    className="mt-1 block w-full rounded-md border-[#d0e7d0] shadow-sm focus:border-[#7ab87a] focus:ring-[#7ab87a] sm:text-sm text-[#2a3c2b]"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="maxAge" className="block text-sm font-medium text-[#2a3c2b]">
                    Maximum Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="maxAge"
                    value={newCompetition.eligibility.maxAge}
                    onChange={(e) => handleEligibilityChange('maxAge', Number(e.target.value))}
                    placeholder="e.g. 35"
                    min="1"
                    className="mt-1 block w-full rounded-md border-[#d0e7d0] shadow-sm focus:border-[#7ab87a] focus:ring-[#7ab87a] sm:text-sm text-[#2a3c2b]"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-[#2a3c2b]">
                  Gender Eligibility <span className="text-red-500">*</span>
                </label>
                <select
                  id="gender"
                  value={newCompetition.eligibility.gender}
                  onChange={(e) => handleEligibilityChange('gender', e.target.value)}
                  className="mt-1 block w-full rounded-md border-[#d0e7d0] shadow-sm focus:border-[#7ab87a] focus:ring-[#7ab87a] sm:text-sm text-[#2a3c2b]"
                  required
                >
                  <option value="all">All Genders</option>
                  <option value="male">Male Only</option>
                  <option value="female">Female Only</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="otherRequirements" className="block text-sm font-medium text-[#2a3c2b]">
                  Other Requirements
                </label>
                <textarea
                  id="otherRequirements"
                  value={newCompetition.eligibility.otherRequirements}
                  onChange={(e) => handleEligibilityChange('otherRequirements', e.target.value)}
                  placeholder="e.g. Must have professional camera equipment"
                  rows={3}
                  className="mt-1 block w-full rounded-md border-[#d0e7d0] shadow-sm focus:border-[#7ab87a] focus:ring-[#7ab87a] sm:text-sm text-[#2a3c2b]"
                />
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  className="inline-flex justify-center rounded-md border border-[#d0e7d0] bg-white px-4 py-2 text-sm font-medium text-[#2a3c2b] shadow-sm hover:bg-[#f0f7f0] focus:outline-none focus:ring-2 focus:ring-[#496949] focus:ring-offset-2"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex justify-center rounded-md border border-transparent bg-[#7ab87a] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#496949] focus:outline-none focus:ring-2 focus:ring-[#496949] focus:ring-offset-2"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-[#2a3c2b]">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  value={newCompetition.category}
                  onChange={(e) => setNewCompetition({ ...newCompetition, category: e.target.value })}
                  className="mt-1 block w-full rounded-md border-[#d0e7d0] shadow-sm focus:border-[#7ab87a] focus:ring-[#7ab87a] sm:text-sm text-[#2a3c2b]"
                  required
                >
                  <option value="Modeling">Modeling</option>
                  <option value="Photography">Photography</option>
                  <option value="Videography">Videography</option>
                  <option value="Fashion Design">Fashion Design</option>
                  <option value="Makeup Artistry">Makeup Artistry</option>
                  <option value="Hair Styling">Hair Styling</option>
                  <option value="Fitness Modeling">Fitness Modeling</option>
                  <option value="Commercial Modeling">Commercial Modeling</option>
                  <option value="Runway Modeling">Runway Modeling</option>
                  <option value="Art Direction">Art Direction</option>
                </select>
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-[#2a3c2b]">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  value={newCompetition.description}
                  onChange={(e) => setNewCompetition({ ...newCompetition, description: e.target.value })}
                  placeholder="e.g. Capture the essence of summer fashion through your lens"
                  rows={4}
                  className="mt-1 block w-full rounded-md border-[#d0e7d0] shadow-sm focus:border-[#7ab87a] focus:ring-[#7ab87a] sm:text-sm text-[#2a3c2b]"
                  required
                />
              </div>
              <div>
                <label htmlFor="bannerImage" className="block text-sm font-medium text-[#2a3c2b]">
                  Banner Image <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 flex items-center">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-[#7ab87a] hover:text-[#496949] focus-within:outline-none">
                    <span className="inline-flex items-center px-4 py-2 border border-[#d0e7d0] rounded-md shadow-sm text-sm font-medium text-[#2a3c2b] bg-white hover:bg-[#f0f7f0]">
                      {bannerImage ? 'Change Image' : 'Select Image'}
                    </span>
                    <input 
                      id="bannerImage" 
                      name="bannerImage" 
                      type="file" 
                      className="sr-only"
                      onChange={handleFileChange}
                      accept="image/*"
                      required
                    />
                  </label>
                  {bannerImage && (
                    <span className="ml-3 text-sm text-[#496949]">
                      {bannerImage.name}
                    </span>
                  )}
                </div>
                {bannerImage && (
                  <div className="mt-2">
                    <img 
                      src={URL.createObjectURL(bannerImage)} 
                      alt="Banner preview" 
                      className="h-24 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  className="inline-flex justify-center rounded-md border border-[#d0e7d0] bg-white px-4 py-2 text-sm font-medium text-[#2a3c2b] shadow-sm hover:bg-[#f0f7f0] focus:outline-none focus:ring-2 focus:ring-[#496949] focus:ring-offset-2"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={handleCreate}
                  className="inline-flex justify-center rounded-md border border-transparent bg-[#7ab87a] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#496949] focus:outline-none focus:ring-2 focus:ring-[#496949] focus:ring-offset-2"
                >
                  Create Competition
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Modal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Confirm Delete"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#496949]">
            Are you sure you want to delete this competition? This action cannot be undone.
          </p>
          <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
            <button
              type="button"
              onClick={() => selectedCompetition && handleDelete(selectedCompetition._id)}
              className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="mt-3 inline-flex w-full justify-center rounded-md border border-[#d0e7d0] bg-white px-4 py-2 text-base font-medium text-[#2a3c2b] shadow-sm hover:bg-[#f0f7f0] focus:outline-none focus:ring-2 focus:ring-[#496949] focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Update Deadline Dialog */}
      <Modal
        isOpen={isDeadlineDialogOpen}
        onClose={() => setIsDeadlineDialogOpen(false)}
        title="Update Competition Deadline"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-[#2a3c2b]">
              New Deadline
            </label>
            <input
              type="date"
              id="deadline"
              value={newDeadline}
              onChange={(e) => setNewDeadline(e.target.value)}
              className="mt-1 block w-full rounded-md border-[#d0e7d0] shadow-sm focus:border-[#7ab87a] focus:ring-[#7ab87a] sm:text-sm text-[#2a3c2b]"
            />
          </div>
          <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
            <button
              type="button"
              onClick={handleUpdateDeadline}
              className="inline-flex w-full justify-center rounded-md border border-transparent bg-[#7ab87a] px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-[#496949] focus:outline-none focus:ring-2 focus:ring-[#496949] focus:ring-offset-2 sm:col-start-2 sm:text-sm"
            >
              Update
            </button>
            <button
              type="button"
              onClick={() => setIsDeadlineDialogOpen(false)}
              className="mt-3 inline-flex w-full justify-center rounded-md border border-[#d0e7d0] bg-white px-4 py-2 text-base font-medium text-[#2a3c2b] shadow-sm hover:bg-[#f0f7f0] focus:outline-none focus:ring-2 focus:ring-[#496949] focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}