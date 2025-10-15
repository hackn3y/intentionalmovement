import { useState, useEffect } from 'react';
import Card from '../components/Card';
import { adminService } from '../services/adminService';
import toast from 'react-hot-toast';

function DailyContent() {
  const [contents, setContents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [filter, setFilter] = useState('all'); // all, quote, tip, challenge, affirmation, reflection

  const [formData, setFormData] = useState({
    date: '',
    contentType: 'quote',
    title: '',
    message: '',
    mediaUrl: '',
    category: '',
    isActive: true
  });

  useEffect(() => {
    fetchContents();
    fetchStats();
  }, [filter]);

  const fetchContents = async () => {
    try {
      const params = filter !== 'all' ? { contentType: filter } : {};
      const data = await adminService.getDailyContents(params);
      setContents(data.contents || []);
    } catch (error) {
      toast.error('Failed to load daily content');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await adminService.getDailyContentStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingContent) {
        await adminService.updateDailyContent(editingContent.id, formData);
        toast.success('Content updated successfully');
      } else {
        await adminService.createDailyContent(formData);
        toast.success('Content created successfully');
      }

      closeModal();
      fetchContents();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save content');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      await adminService.deleteDailyContent(id);
      toast.success('Content deleted successfully');
      fetchContents();
      fetchStats();
    } catch (error) {
      toast.error('Failed to delete content');
    }
  };

  const openModal = (content = null) => {
    if (content) {
      setEditingContent(content);
      setFormData({
        date: content.date,
        contentType: content.contentType,
        title: content.title,
        message: content.message,
        mediaUrl: content.mediaUrl || '',
        category: content.category || '',
        isActive: content.isActive
      });
    } else {
      setEditingContent(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        contentType: 'quote',
        title: '',
        message: '',
        mediaUrl: '',
        category: '',
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingContent(null);
  };

  const getTypeColor = (type) => {
    const colors = {
      quote: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300',
      tip: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300',
      challenge: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300',
      affirmation: 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-300',
      reflection: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300'
    };
    return colors[type] || colors.quote;
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">Daily Content</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage daily motivational content</p>
        </div>
        <button
          onClick={() => openModal()}
          className="w-full md:w-auto px-6 py-3 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors font-medium shadow-sm"
        >
          Add New Content
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card>
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Content</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{stats.totalContents}</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Active</p>
              <p className="text-3xl font-bold text-primary-600 dark:text-primary-400 mt-2">{stats.activeContents}</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Check-ins</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{stats.totalCheckIns}</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Unique Users</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{stats.uniqueUsers}</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Today</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{stats.todayCheckIns}</p>
            </div>
          </Card>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'quote', 'tip', 'challenge', 'affirmation', 'reflection'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === type
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Content List */}
      <div className="space-y-4">
        {contents.map((content) => (
          <Card key={content.id}>
            <div className="flex flex-col md:flex-row md:items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(content.contentType)}`}>
                    {content.contentType}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(content.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  {content.category && (
                    <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                      {content.category}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded ${
                    content.isActive
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}>
                    {content.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {content.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                  {content.message}
                </p>
              </div>
              <div className="flex md:flex-col gap-2">
                <button
                  onClick={() => openModal(content)}
                  className="flex-1 md:flex-none px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(content.id, content.title)}
                  className="flex-1 md:flex-none px-4 py-2 bg-red-100 dark:bg-pink-900/20 text-red-700 dark:text-pink-300 rounded-lg hover:bg-red-200 dark:hover:bg-pink-900/30 transition-colors text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </Card>
        ))}

        {contents.length === 0 && (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <p className="text-lg mb-4">No content found</p>
            <button
              onClick={() => openModal()}
              className="px-6 py-3 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
            >
              Create Your First Content
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                {editingContent ? 'Edit Content' : 'Add New Content'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Content Type
                    </label>
                    <select
                      value={formData.contentType}
                      onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="quote">Quote</option>
                      <option value="tip">Tip</option>
                      <option value="challenge">Challenge</option>
                      <option value="affirmation">Affirmation</option>
                      <option value="reflection">Reflection</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="Enter title or headline"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows="4"
                    placeholder="Enter the main message or content"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Media URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={formData.mediaUrl}
                      onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g., mindfulness, movement"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Active (visible to users)
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
                  >
                    {editingContent ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DailyContent;
