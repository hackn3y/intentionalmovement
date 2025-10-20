import { useState, useEffect } from 'react';
import Card from '../components/Card';
import { adminService } from '../services/adminService';
import toast from 'react-hot-toast';

function CuratedContent() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'curated', 'not-curated'

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await adminService.getPosts();
      let filteredPosts = data.posts || data || [];

      // Apply filter
      if (filter === 'curated') {
        filteredPosts = filteredPosts.filter(post => post.isCurated);
      } else if (filter === 'not-curated') {
        filteredPosts = filteredPosts.filter(post => !post.isCurated);
      }

      setPosts(filteredPosts);
    } catch (error) {
      toast.error('Failed to load posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleCurated = async (postId, currentStatus) => {
    try {
      const action = currentStatus ? 'uncurate' : 'curate';
      await adminService.bulkAction({
        action,
        targetType: 'posts',
        targetIds: [postId]
      });

      toast.success(currentStatus ? 'Removed from PMMB' : 'Added to PMMB');
      fetchPosts();
    } catch (error) {
      toast.error('Failed to update post');
    }
  };

  const deletePost = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await adminService.deletePost(id);
      toast.success('Post deleted');
      fetchPosts();
    } catch (error) {
      toast.error('Failed to delete post');
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Planted Mind Moving Body</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage curated content for the PMMB feed
          </p>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Total: {posts.length} posts
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          All Posts
        </button>
        <button
          onClick={() => setFilter('curated')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'curated'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          🌱 Curated
        </button>
        <button
          onClick={() => setFilter('not-curated')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'not-curated'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Not Curated
        </button>
      </div>

      {/* Posts List */}
      <div className="grid grid-cols-1 gap-6">
        {posts.map((post) => (
          <Card key={post.id}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-700 dark:text-primary-300 font-medium">
                    {post.user?.username?.[0]?.toUpperCase()}
                  </span>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {post.user?.username}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                    {post.isCurated && (
                      <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full font-medium">
                        🌱 PMMB
                      </span>
                    )}
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 mb-3">{post.content}</p>

                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt="Post"
                      className="rounded-lg max-h-96 object-cover mb-3"
                    />
                  )}

                  <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                    <span>❤️ {post.likesCount || 0} likes</span>
                    <span>💬 {post.commentsCount || 0} comments</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => toggleCurated(post.id, post.isCurated)}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    post.isCurated
                      ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                      : 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                  }`}
                >
                  {post.isCurated ? '❌ Remove' : '✨ Add to PMMB'}
                </button>
                <button
                  onClick={() => deletePost(post.id)}
                  className="px-3 py-1 text-sm text-red-600 dark:text-pink-300 hover:bg-red-50 dark:hover:bg-pink-900/20 rounded transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </Card>
        ))}

        {posts.length === 0 && (
          <Card>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
                No posts found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {filter === 'curated' ? 'No curated posts yet' : 'No posts to display'}
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default CuratedContent;
