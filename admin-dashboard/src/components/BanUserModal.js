import { useState } from 'react';
import Modal from './Modal';
import toast from 'react-hot-toast';

function BanUserModal({ isOpen, onClose, user, onBan, onUnban }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user.isBanned && !reason.trim()) {
      toast.error('Please provide a reason for banning');
      return;
    }

    setLoading(true);
    try {
      if (user.isBanned) {
        await onUnban(user.id);
      } else {
        await onBan(user.id, reason);
      }
      setReason('');
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={user.isBanned ? 'Unban User' : 'Ban User'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* User Info */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
            <span className="text-lg text-primary-700 dark:text-primary-300 font-medium">
              {user.email?.[0]?.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {user.username || 'N/A'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
          </div>
        </div>

        {user.isBanned ? (
          // Unban confirmation
          <div className="space-y-3">
            <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to unban this user? They will regain full access to the platform.
            </p>
            {user.banReason && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-1">
                  Current Ban Reason:
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  {user.banReason}
                </p>
              </div>
            )}
          </div>
        ) : (
          // Ban form
          <div className="space-y-3">
            <div className="p-3 bg-red-50 dark:bg-pink-900/20 border border-red-200 dark:border-pink-700 rounded-lg">
              <p className="text-sm text-red-700 dark:text-pink-400">
                <strong>Warning:</strong> Banning this user will prevent them from accessing the platform and all its features.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason for Ban *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                placeholder="Explain why this user is being banned..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-100"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                This reason will be visible to other administrators
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 ${
              user.isBanned
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
            disabled={loading}
          >
            {loading ? 'Processing...' : (user.isBanned ? 'Unban User' : 'Ban User')}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default BanUserModal;
