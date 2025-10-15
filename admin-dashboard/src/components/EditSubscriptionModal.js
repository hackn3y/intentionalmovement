import { useState, useEffect } from 'react';
import Modal from './Modal';
import { adminService } from '../services/adminService';
import toast from 'react-hot-toast';

const SUBSCRIPTION_TIERS = [
  { value: 'free', label: 'Free', color: 'gray' },
  { value: 'pro', label: 'Pro', color: 'blue' },
  { value: 'premium', label: 'Premium', color: 'purple' }
];

const SUBSCRIPTION_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'past_due', label: 'Past Due' }
];

function EditSubscriptionModal({ isOpen, onClose, user, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState('free');
  const [subscriptionStatus, setSubscriptionStatus] = useState('active');

  useEffect(() => {
    if (isOpen && user) {
      setSubscriptionTier(user.subscriptionTier || 'free');
      setSubscriptionStatus(user.subscriptionStatus || 'active');
    }
  }, [isOpen, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await adminService.updateUser(user.id, {
        subscriptionTier,
        subscriptionStatus
      });

      toast.success('Subscription updated successfully');
      onUpdate();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update subscription');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Subscription - ${user.username}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current Subscription Display */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Current Subscription
          </h4>
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              user.subscriptionTier === 'premium'
                ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300'
                : user.subscriptionTier === 'pro'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300'
                : 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-300'
            }`}>
              {(user.subscriptionTier || 'free').toUpperCase()}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              • {user.subscriptionStatus || 'active'}
            </span>
          </div>
        </div>

        {/* Subscription Tier Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Subscription Tier
          </label>
          <div className="space-y-2">
            {SUBSCRIPTION_TIERS.map((tier) => (
              <label
                key={tier.value}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  subscriptionTier === tier.value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name="subscriptionTier"
                  value={tier.value}
                  checked={subscriptionTier === tier.value}
                  onChange={(e) => setSubscriptionTier(e.target.value)}
                  className="mr-3"
                />
                <span className="flex-1 font-medium text-gray-900 dark:text-gray-100">
                  {tier.label}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  tier.color === 'purple'
                    ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300'
                    : tier.color === 'blue'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300'
                    : 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-300'
                }`}>
                  {tier.value}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Subscription Status Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <select
            value={subscriptionStatus}
            onChange={(e) => setSubscriptionStatus(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {SUBSCRIPTION_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update Subscription'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default EditSubscriptionModal;
