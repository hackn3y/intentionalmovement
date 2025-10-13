import { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import { adminService } from '../services/adminService';
import toast from 'react-hot-toast';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (error) {
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon="👥"
          trend="up"
          trendValue="+12%"
        />
        <StatCard
          title="Active Programs"
          value={stats?.activePrograms || 0}
          icon="📚"
          trend="up"
          trendValue="+3"
        />
        <StatCard
          title="Total Revenue"
          value={`$${(stats?.totalRevenue || 0).toLocaleString()}`}
          icon="💰"
          trend="up"
          trendValue="+23%"
        />
        <StatCard
          title="Total Posts"
          value={stats?.totalPosts || 0}
          icon="📝"
          trend="up"
          trendValue="+45"
        />
      </div>

      {/* Additional Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent Activity">
          <div className="space-y-4">
            {stats?.recentActivity?.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b dark:border-gray-700 last:border-0"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{activity.type}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{activity.description}</p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</span>
              </div>
            )) || (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No recent activity
              </p>
            )}
          </div>
        </Card>

        <Card title="Popular Programs">
          <div className="space-y-4">
            {stats?.popularPrograms?.map((program, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b dark:border-gray-700 last:border-0"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{program.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {program.purchases} purchases
                  </p>
                </div>
                <span className="font-semibold text-primary-600 dark:text-primary-400">
                  ${program.price}
                </span>
              </div>
            )) || (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No programs yet
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
