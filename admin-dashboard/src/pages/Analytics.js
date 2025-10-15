import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../components/Card';
import { adminService } from '../services/adminService';
import toast from 'react-hot-toast';

function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Get analytics for last 30 days
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const data = await adminService.getAnalytics(startDate, endDate);
      setAnalytics(data);
    } catch (error) {
      toast.error('Failed to load analytics');
      console.error('Analytics error:', error);
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

  // Use real data from backend or show message if no data
  const analyticsData = analytics?.analytics || {};

  const userGrowthData = analytics?.userGrowth || [];
  const revenueData = analytics?.revenue || [];

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 sm:mb-8">Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
        <Card title="User Growth">
          {userGrowthData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#d4a373" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-gray-500 dark:text-gray-400">
                Time-series data not available yet
              </p>
            </div>
          )}
        </Card>

        <Card title="Revenue Trend">
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#d4a373" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-gray-500 dark:text-gray-400">
                Time-series data not available yet
              </p>
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <Card title="Period Summary">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">New Users</span>
              <span className="font-bold text-gray-900 dark:text-gray-100">{analyticsData.newUsers || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">New Posts</span>
              <span className="font-bold text-gray-900 dark:text-gray-100">{analyticsData.newPosts || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">New Subscriptions</span>
              <span className="font-bold text-gray-900 dark:text-gray-100">{analyticsData.newSubscriptions || 0}</span>
            </div>
          </div>
        </Card>

        <Card title="Revenue">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Period Revenue</span>
              <span className="font-bold text-gray-900 dark:text-gray-100">
                ${(analyticsData.revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Purchases</span>
              <span className="font-bold text-gray-900 dark:text-gray-100">{analyticsData.newPurchases || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Avg. Purchase Value</span>
              <span className="font-bold text-gray-900 dark:text-gray-100">
                ${analyticsData.newPurchases > 0
                  ? ((analyticsData.revenue || 0) / analyticsData.newPurchases).toFixed(2)
                  : '0.00'}
              </span>
            </div>
          </div>
        </Card>

        <Card title="Date Range">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">From</span>
              <span className="font-bold text-gray-900 dark:text-gray-100">
                {analyticsData.period?.startDate
                  ? new Date(analyticsData.period.startDate).toLocaleDateString()
                  : '-'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">To</span>
              <span className="font-bold text-gray-900 dark:text-gray-100">
                {analyticsData.period?.endDate
                  ? new Date(analyticsData.period.endDate).toLocaleDateString()
                  : '-'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Days</span>
              <span className="font-bold text-gray-900 dark:text-gray-100">30</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Analytics;
