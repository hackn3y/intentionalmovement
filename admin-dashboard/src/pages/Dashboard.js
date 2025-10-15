import { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import { adminService } from '../services/adminService';
import toast from 'react-hot-toast';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activityFilter, setActivityFilter] = useState('all');

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
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 sm:mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon="👥"
        />
        <StatCard
          title="Active Programs"
          value={stats?.activePrograms || 0}
          icon="📚"
        />
        <StatCard
          title="Total Revenue"
          value={`$${(stats?.totalRevenue || 0).toLocaleString()}`}
          icon="💰"
        />
        <StatCard
          title="Total Posts"
          value={stats?.totalPosts || 0}
          icon="📝"
        />
      </div>

      {/* Additional Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card
          title={
            <div className="flex justify-between items-center">
              <span>Recent Activity</span>
              <select
                value={activityFilter}
                onChange={(e) => setActivityFilter(e.target.value)}
                className="text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Activity</option>
                <option value="user">New Users</option>
                <option value="post">New Posts</option>
                <option value="purchase">Purchases</option>
              </select>
            </div>
          }
        >
          <div className="space-y-2">
            {(stats?.recentActivity || [])
              .filter(activity => activityFilter === 'all' || activity.type === activityFilter)
              .map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 py-2 border-b dark:border-gray-700 last:border-0"
                >
                  <span className="text-xl flex-shrink-0 mt-0.5">{activity.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wide">
                      {activity.label}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 truncate">
                      {activity.description}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                    {activity.time}
                  </span>
                </div>
              ))}
            {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No recent activity
              </p>
            )}
            {stats?.recentActivity &&
             activityFilter !== 'all' &&
             stats.recentActivity.filter(a => a.type === activityFilter).length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No {activityFilter === 'user' ? 'new users' : activityFilter === 'post' ? 'new posts' : 'purchases'}
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
