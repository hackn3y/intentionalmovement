import { useState, useEffect } from 'react';
import Card from '../components/Card';
import UserViewModal from '../components/UserViewModal';
import BanUserModal from '../components/BanUserModal';
import EditSubscriptionModal from '../components/EditSubscriptionModal';
import { adminService } from '../services/adminService';
import toast from 'react-hot-toast';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [isEditSubscriptionModalOpen, setIsEditSubscriptionModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await adminService.getUsers();
      setUsers(data.users || []);
    } catch (error) {
      toast.error('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openViewModal = (userId) => {
    setSelectedUserId(userId);
    setIsViewModalOpen(true);
  };

  const openBanModal = (user) => {
    setSelectedUser(user);
    setIsBanModalOpen(true);
  };

  const openEditSubscriptionModal = (user) => {
    setSelectedUser(user);
    setIsEditSubscriptionModalOpen(true);
  };

  const handleBanUser = async (userId, reason) => {
    try {
      await adminService.banUser(userId, reason);
      toast.success('User banned successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to ban user');
      throw error;
    }
  };

  const handleUnbanUser = async (userId) => {
    try {
      await adminService.unbanUser(userId);
      toast.success('User unbanned successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to unban user');
      throw error;
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone and will permanently delete all their data including posts, comments, and purchases.`)) {
      return;
    }

    try {
      await adminService.deleteUser(userId);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Users</h1>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Total: {users.length} users
        </div>
      </div>

      <Card>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-max">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                  Email
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Subscription
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                  Joined
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                  Status
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                          <span className="text-xs sm:text-sm text-primary-700 dark:text-primary-300 font-medium">
                            {user.username?.[0]?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-2 sm:ml-4">
                        <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">
                          {user.username}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 sm:hidden">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                    <div className="text-sm text-gray-900 dark:text-gray-100">{user.email}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => openEditSubscriptionModal(user)}
                      className="flex flex-col items-start hover:opacity-75 transition-opacity"
                      title="Click to edit subscription"
                    >
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.subscriptionTier === 'premium'
                            ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300'
                            : user.subscriptionTier === 'pro'
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {user.subscriptionTier?.toUpperCase() || 'FREE'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {user.subscriptionStatus || 'active'}
                      </span>
                    </button>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.emailVerified
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300'
                          : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300'
                      }`}
                    >
                      {user.emailVerified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm font-medium">
                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-0">
                      <button
                        onClick={() => openViewModal(user.id)}
                        className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 sm:mr-4 text-left"
                      >
                        View
                      </button>
                      {user.role !== 'admin' && (
                        <>
                          <button
                            onClick={() => openBanModal(user)}
                            className={`sm:mr-4 text-left ${user.isBanned
                              ? "text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                              : "text-yellow-600 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-300"
                            }`}
                          >
                            {user.isBanned ? 'Unban' : 'Ban'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id, user.username)}
                            className="text-red-600 dark:text-pink-300 hover:text-red-900 dark:hover:text-pink-200 text-left"
                          >
                            Delete
                          </button>
                        </>
                      )}
                      {user.role === 'admin' && (
                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 italic">
                          Protected
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No users found
            </div>
          )}
        </div>
      </Card>

      {/* User View Modal */}
      <UserViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedUserId(null);
        }}
        userId={selectedUserId}
      />

      {/* Ban User Modal */}
      <BanUserModal
        isOpen={isBanModalOpen}
        onClose={() => {
          setIsBanModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onBan={handleBanUser}
        onUnban={handleUnbanUser}
      />

      {/* Edit Subscription Modal */}
      <EditSubscriptionModal
        isOpen={isEditSubscriptionModalOpen}
        onClose={() => {
          setIsEditSubscriptionModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onUpdate={fetchUsers}
      />
    </div>
  );
}

export default Users;
