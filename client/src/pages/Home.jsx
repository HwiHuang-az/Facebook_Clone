import React, { useState, useEffect, useCallback } from 'react';
import CreatePost from '../components/Home/CreatePost';
import Post from '../components/Home/Post';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await api.get(`/posts?page=1&limit=10`);
      if (res.data.success) {
        setPosts(res.data.data.posts);
        setHasMore(res.data.data.pagination.page < res.data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Fetch posts error:', error);
      toast.error('Không thể tải bài viết');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);
  return (
    <div className="max-w-2xl mx-auto">
      {/* Stories Section */}
      <div className="bg-white rounded-lg shadow-facebook p-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Stories</h2>
        <div className="flex space-x-3 overflow-x-auto">
          <div className="flex-shrink-0 w-20 h-32 bg-gradient-to-b from-blue-400 to-blue-600 rounded-lg flex items-end justify-center text-white text-sm font-medium cursor-pointer">
            <span className="mb-2">Tạo Story</span>
          </div>
          {/* Placeholder stories */}
          {[1, 2, 3, 4, 5].map((story) => (
            <div key={story} className="flex-shrink-0 w-20 h-32 bg-gray-300 rounded-lg cursor-pointer">
            </div>
          ))}
        </div>
      </div>

      {/* Create Post */}
      <CreatePost onPostCreated={fetchPosts} />

      {/* Posts Feed */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-4 text-gray-500">Đang tải...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow-facebook">
            Chưa có bài viết nào. Hãy là người đầu tiên đăng bài!
          </div>
        ) : (
          posts.map((post) => (
            <Post key={post.id} post={post} />
          ))
        )}
      </div>
    </div>
  );
};

export default Home;