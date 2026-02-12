import React, { useState, useEffect, useCallback } from 'react';
import CreatePost from '../components/Home/CreatePost';
import Post from '../components/Home/Post';
import StorySection from '../components/Home/StorySection';
import RightSidebar from '../components/Layout/RightSidebar';
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
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Main Feed Column */}
      <div className="lg:col-span-3 space-y-4 max-w-2xl mx-auto w-full">
        {/* Stories & Reels Section */}
        <StorySection />

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

      {/* Right Sidebar Column */}
      <div className="hidden lg:block lg:col-span-1">
        <RightSidebar />
      </div>
    </div>
  );
};

export default Home;