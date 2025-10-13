import { useState, useEffect } from 'react';
import Modal from './Modal';
import { adminService } from '../services/adminService';
import toast from 'react-hot-toast';

function UserViewModal({ isOpen, onClose, userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserDetails();
    }
  }, [isOpen, userId]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const data = await adminService.getUser(userId);
      setUser(data);
    } catch (error) {
      toast.error('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="User Details"
      size="lg"
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : user ? (
        <div className="space-y-6">
          {/* Profile Section */}
          <div className="flex items-start gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
              <span className="text-3xl text-primary-700 dark:text-primary-300 font-medium">
                {user.email?.[0]?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                {user.username || 'N/A'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-2">{user.email}</p>
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  user.role === 'admin'
                    ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300'
                    : user.role === 'moderator'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                }`}>
                  {user.role || 'user'}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  user.isBanned
                    ? 'bg-red-100 dark:bg-pink-900 text-red-800 dark:text-pink-300'
                    : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300'
                }`}>
                  {user.isBanned ? 'Banned' : 'Active'}
                </span>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Account Information
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">User ID</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{user.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Created At</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Last Login</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Email Verified</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {user.emailVerified ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          {user.bio && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Bio
              </h4>
              <p className="text-gray-700 dark:text-gray-300">{user.bio}</p>
            </div>
          )}

          {/* Stats Section */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Activity Stats
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {user.postsCount || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Posts</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {user.followersCount || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Followers</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {user.followingCount || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Following</p>
              </div>
            </div>
          </div>

          {/* Ban Information */}
          {user.isBanned && user.banReason && (
            <div className="p-4 bg-red-50 dark:bg-pink-900/20 border border-red-200 dark:border-pink-700 rounded-lg">
              <h4 className="text-sm font-semibold text-red-800 dark:text-pink-300 mb-1">
                Ban Reason
              </h4>
              <p className="text-sm text-red-700 dark:text-pink-400">{user.banReason}</p>
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          User not found
        </div>
      )}
    </Modal>
  );
}

export default UserViewModal;
