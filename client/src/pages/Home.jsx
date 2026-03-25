import React, { useState, useEffect, useCallback, useRef } from 'react';
import CreatePost from '../components/Home/CreatePost';
import Post from '../components/Home/Post';
import PostSkeleton from '../components/Home/PostSkeleton';
import StorySection from '../components/Home/StorySection';
import RightSidebar from '../components/Layout/RightSidebar';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await api.get(`/posts?page=1&limit=10`);
      if (res.data.success) {
        setPosts(res.data.data.posts);
        setHasMore(res.data.data.pagination.page < res.data.data.pagination.totalPages);
        setPage(1);
      }
    } catch (error) {
      console.error('Fetch posts error:', error);
      toast.error('Không thể tải bài viết');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMorePosts = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const res = await api.get(`/posts?page=${nextPage}&limit=10`);
      if (res.data.success) {
        setPosts(prev => [...prev, ...res.data.data.posts]);
        setHasMore(res.data.data.pagination.page < res.data.data.pagination.totalPages);
        setPage(nextPage);
      }
    } catch (error) {
      console.error('Load more posts error:', error);
      toast.error('Không thể tải thêm bài viết');
    } finally {
      setLoadingMore(false);
    }
  }, [page, hasMore, loadingMore]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    if (loading) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, hasMore, loadingMore, loadMorePosts]);

  const handlePostDeleted = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const handlePostCreated = (newPost) => {
    if (newPost) {
      setPosts(prev => [newPost, ...prev]);
    } else {
      fetchPosts();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-[1600px] mx-auto">
      {/* Left Sidebar Spacer - Usually taken by the global Sidebar in Layout.jsx */}
      <div className="hidden lg:block lg:col-span-3"></div>

      {/* Main Feed Column */}
      <div className="col-span-1 lg:col-span-6 space-y-4 max-w-2xl mx-auto w-full">
        {/* Stories & Reels Section */}
        <StorySection />

        {/* Create Post */}
        <CreatePost onPostCreated={handlePostCreated} />

        {/* Posts Feed */}
        <div className="space-y-4">
          {loading ? (
            <>
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
            </>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 font-bold">
              Chưa có bài viết nào. Hãy là người đầu tiên đăng bài!
            </div>
          ) : (
            <>
              {posts.map((post) => (
                <Post
                  key={post.id}
                  post={post}
                  onPostDeleted={handlePostDeleted}
                  onPostUpdate={fetchPosts}
                />
              ))}

              {/* Infinite scroll trigger */}
              <div ref={loadMoreRef} className="py-2">
                {loadingMore && (
                  <div className="space-y-4">
                    <PostSkeleton />
                    <PostSkeleton />
                  </div>
                )}

                {!hasMore && posts.length > 0 && (
                  <div className="text-center py-6 text-gray-400 text-sm">
                    <p>Bạn đã xem hết tất cả bài viết 🎉</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right Sidebar Column */}
      <div className="hidden lg:block lg:col-span-3 sticky top-24 self-start">
        <RightSidebar />
      </div>
    </div>
  );
};

export default Home;