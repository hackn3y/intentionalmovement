import { useState, useEffect } from 'react';
import Card from '../components/Card';
import { adminService } from '../services/adminService';
import toast from 'react-hot-toast';

function Posts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await adminService.getPosts();
      setPosts(data.posts || data || []);
    } catch (error) {
      toast.error('Failed to load posts');
      setPosts([]);
    } finally {
      setLoading(false);
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Posts</h1>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Total: {posts.length} posts
        </div>
      </div>

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

              <button
                onClick={() => deletePost(post.id)}
                className="ml-4 px-3 py-1 text-sm text-red-600 dark:text-pink-300 hover:bg-red-50 dark:hover:bg-pink-900/20 rounded transition-colors"
              >
                Delete
              </button>
            </div>
          </Card>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          No posts yet
        </div>
      )}
    </div>
  );
}

export default Posts;
