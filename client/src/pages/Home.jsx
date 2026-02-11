import React, { useState, useEffect, useCallback } from 'react';
import CreatePost from '../components/Home/CreatePost';
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
          <div className="text-center py-4">Đang tải...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Chưa có bài viết nào. Hãy là người đầu tiên đăng bài!</div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-facebook">
              {/* Post Header */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden">
                    {post.author.profilePicture ? (
                      <img
                        src={post.author.profilePicture}
                        alt={post.author.lastName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center bg-blue-500 text-white font-bold">
                        {post.author.firstName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {post.author.firstName} {post.author.lastName}
                      {post.author.isVerified && <span className="text-blue-500 ml-1">✓</span>}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(post.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
                <button className="text-gray-400 hover:bg-gray-100 p-2 rounded-full">
                  <span>⋯</span>
                </button>
              </div>

              {/* Post Content */}
              <div className="px-4 pb-3">
                <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
              </div>

              {/* Post Image */}
              {post.imageUrl && (
                <div className="bg-gray-100">
                  <img
                    src={post.imageUrl}
                    alt="Post content"
                    className="w-full h-auto max-h-[600px] object-contain"
                  />
                </div>
              )}

              {/* Post Actions Stats */}
              <div className="px-4 py-2">
                <div className="flex items-center justify-between text-gray-500 text-sm">
                  <span>👍 {post.likesCount} lượt thích</span>
                  <span>{post.commentsCount} bình luận</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-4 pb-2">
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <button
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg flex-1 justify-center ${post.isLiked ? 'text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    <span>{post.isLiked ? '👍' : '👍'}</span>
                    <span>Thích</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg flex-1 justify-center">
                    <span>💬</span>
                    <span>Bình luận</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg flex-1 justify-center">
                    <span>↗️</span>
                    <span>Chia sẻ</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Home;