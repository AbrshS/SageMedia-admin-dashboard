import { useQuery } from '@tanstack/react-query';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { FiUsers, FiCalendar, FiThumbsUp, FiDollarSign, FiRefreshCw } from 'react-icons/fi';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useAuthStore } from '@/store/useAuthStore';
import { FiTrendingUp, FiAward, FiMapPin, FiClock, FiActivity } from 'react-icons/fi';
import { Doughnut, Bar } from 'react-chartjs-2';
import { ArcElement, BarElement } from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        color: '#6e8c6e',
        font: {
          family: "'Inter', sans-serif",
          size: 12,
        },
      },
    },
    title: {
      display: true,
      text: 'Hourly Vote Trends',
      color: '#344c3d',
      font: {
        size: 16,
        weight: '600',
        family: "'Inter', sans-serif",
      },
      padding: 20,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(169, 217, 161, 0.1)',
      },
      ticks: {
        color: '#6e8c6e',
      },
    },
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: '#6e8c6e',
      },
    },
  },
};

// Register additional chart types
ChartJS.register(ArcElement, BarElement);

export default function Dashboard() {
  const { token } = useAuthStore();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please login to access dashboard data');
        }
        throw new Error('Failed to fetch dashboard data');
      }
      return response.json();
    },
    enabled: !!token, // Only run query if token exists
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg">
        <p className="text-red-600">Error loading dashboard data</p>
        <button 
          onClick={() => refetch()}
          className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
        >
          Retry
        </button>
      </div>
    );
  }

  const stats = data?.data;
  if (!stats) return null;

  // Process hourly trends for chart
  const hourlyData = Array(24).fill(0).map((_, hour) => {
    const trend = stats.voteStats.hourlyTrends.find((t: any) => t._id === hour);
    return trend ? trend.count : 0;
  });

  const hourlyAmount = Array(24).fill(0).map((_, hour) => {
    const trend = stats.voteStats.hourlyTrends.find((t: any) => t._id === hour);
    return trend ? trend.amount : 0;
  });

  const chartData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        label: 'Votes',
        data: hourlyData,
        borderColor: '#5b806e',
        backgroundColor: 'rgba(91, 128, 110, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Amount ($)',
        data: hourlyAmount,
        borderColor: '#9fc6b7',
        backgroundColor: 'rgba(159, 198, 183, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="space-y-8 p-8 bg-gray-50">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <button 
          onClick={() => refetch()} 
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all"
        >
          <FiRefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-indigo-50 rounded-xl">
              <FiUsers className="h-6 w-6 text-indigo-600" />
            </div>
            <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              Applications
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-bold text-gray-900">
              {stats.applicationStats[0]?.count || 0}
            </h3>
            <p className="text-sm text-gray-500 mt-1">Total Applications</p>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <FiTrendingUp className="text-green-500" />
            <span className="text-sm text-green-500">
              {stats.applicationStats[0]?.averageVotes || 0} avg votes
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-purple-50 rounded-xl">
              <FiAward className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
              Competitions
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-bold text-gray-900">
              {stats.competitionStats.statusStats.reduce((acc: number, curr: any) => acc + curr.count, 0)}
            </h3>
            <p className="text-sm text-gray-500 mt-1">Active Competitions</p>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <FiTrendingUp className="text-green-500" />
            <span className="text-sm text-green-500">
              ${stats.competitionStats.revenueStats[0]?.totalRevenue || 0} revenue
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-amber-50 rounded-xl">
              <FiThumbsUp className="h-6 w-6 text-amber-600" />
            </div>
            <span className="text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
              Total Votes
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-bold text-gray-900">
              {stats.voteStats.totalStats[0]?.totalVotes || 0}
            </h3>
            <p className="text-sm text-gray-500 mt-1">Votes Received</p>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <FiDollarSign className="text-green-500" />
            <span className="text-sm text-green-500">
              ${stats.voteStats.totalStats[0]?.totalAmount || 0}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-rose-50 rounded-xl">
              <FiMapPin className="h-6 w-6 text-rose-600" />
            </div>
            <span className="text-sm font-medium text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
              Regions
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-bold text-gray-900">
              {stats.regionStats.length}
            </h3>
            <p className="text-sm text-gray-500 mt-1">Active Regions</p>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <FiUsers className="text-blue-500" />
            <span className="text-sm text-blue-500">
              {stats.regionStats[0]?.participantCount || 0} participants
            </span>
          </div>
        </div>
      </div>

      {/* System Health Metrics */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
          <div className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
            Healthy
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Success Rate</span>
              <span className="text-green-600 font-semibold">{(stats.systemHealth.applicationSuccessRate * 100).toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full">
              <div 
                className="h-full bg-green-500 rounded-full" 
                style={{ width: `${stats.systemHealth.applicationSuccessRate * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Avg. Votes/Application</span>
              <span className="text-blue-600 font-semibold">{stats.systemHealth.averageVotesPerApplication.toLocaleString()}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full">
              <div 
                className="h-full bg-blue-500 rounded-full" 
                style={{ width: '85%' }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Engagement Rate</span>
              <span className="text-purple-600 font-semibold">{stats.systemHealth.competitionEngagementRate}x</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full">
              <div 
                className="h-full bg-purple-500 rounded-full" 
                style={{ width: `${(stats.systemHealth.competitionEngagementRate / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Voting Trends Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="h-[400px]">
            <Line options={chartOptions} data={chartData} />
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top Performers</h3>
            <span className="text-sm text-gray-500">Last 30 days</span>
          </div>
          <div className="space-y-6">
            {stats.topApplications.map((app: any) => (
              <div key={app._id} className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
                    {app.portraitPhoto ? (
                      <img
                        src={`http://localhost:3000/${app.portraitPhoto}`}
                        alt={app.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-semibold text-gray-600">
                        {app.fullName[0]}
                      </span>
                    )}
                  </div>
                  {app.voteGrowthRate > 0 && (
                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-4 h-4 flex items-center justify-center">
                      <FiTrendingUp className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{app.fullName}</p>
                  <p className="text-sm text-gray-500">{app.competitionTitle}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{app.votes.count}</p>
                  <p className="text-sm text-gray-500">votes</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activities</h3>
          <div className="space-y-4">
            {stats.recentActivities.map((activity: any) => (
              <div key={activity._id} className="flex items-center gap-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FiActivity className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.fullName}</p>
                  <p className="text-sm text-gray-500">{activity.activityType}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(activity.updatedAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">{activity.competition}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Upcoming Deadlines</h3>
          <div className="space-y-4">
            {stats.upcomingDeadlines.map((deadline: any) => (
              <div key={deadline._id} className="flex items-center gap-4">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <FiClock className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{deadline.title}</p>
                  <p className="text-sm text-gray-500">
                    Ends: {new Date(deadline.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {deadline.participantCount} participants
                  </p>
                  <p className="text-sm text-green-500">${deadline.applicationFee} fee</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Vote Distribution Chart */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Vote Distribution</h3>
          <div className="h-[300px]">
            <Doughnut
              data={{
                labels: stats.voteStats.voteDistribution.map((d: any) => `${d._id} votes`),
                datasets: [{
                  data: stats.voteStats.voteDistribution.map((d: any) => d.count),
                  backgroundColor: [
                    'rgba(99, 102, 241, 0.8)',
                    'rgba(168, 85, 247, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                  ],
                }],
              }}
              options={{
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }}
            />
          </div>
        </div>
      
        {/* Demographics */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Demographics</h3>
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Gender Distribution</h4>
              {stats.genderDistribution.map((gender: any) => (
                <div key={gender._id} className="flex items-center justify-between mb-2">
                  <span className="capitalize text-gray-700">{gender._id}</span>
                  <span className="font-medium text-gray-900">{gender.count} participants</span>
                </div>
              ))}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Age Groups</h4>
              {stats.ageGroups.map((age: any) => (
                <div key={age._id} className="flex items-center justify-between mb-2">
                  <span className="text-gray-700">{age._id} years</span>
                  <span className="font-medium text-gray-900">{age.count} participants</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      
        {/* Regional Stats */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Distribution</h3>
          <div className="space-y-4">
            {stats.regionStats.map((region: any) => (
              <div key={`${region._id.city}-${region._id.country}`} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">{region._id.city}</span>
                  <span className="text-sm font-medium text-gray-700">{region._id.country}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 font-medium">Participants</p>
                    <p className="font-semibold text-gray-900">{region.participantCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Avg. Votes</p>
                    <p className="font-semibold text-gray-900">{region.averageVotes}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}