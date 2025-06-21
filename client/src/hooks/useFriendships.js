import { useState, useCallback } from 'react';
import axios from 'axios';

export const useFriendships = () => {
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  // Gửi lời mời kết bạn
  const sendFriendRequest = useCallback(async (receiverId) => {
    try {
      setLoading(true);
      const response = await axios.post('/friendships/send-request', { receiverId });
      return response.data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Chấp nhận lời mời kết bạn
  const acceptFriendRequest = useCallback(async (friendshipId) => {
    try {
      setLoading(true);
      const response = await axios.post('/friendships/accept-request', { friendshipId });
      
      // Cập nhật state
      setRequests(prev => prev.filter(req => req.id !== friendshipId));
      
      return response.data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Từ chối lời mời kết bạn
  const rejectFriendRequest = useCallback(async (friendshipId) => {
    try {
      setLoading(true);
      const response = await axios.post('/friendships/reject-request', { friendshipId });
      
      // Cập nhật state
      setRequests(prev => prev.filter(req => req.id !== friendshipId));
      
      return response.data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Hủy kết bạn
  const unfriend = useCallback(async (friendId) => {
    try {
      setLoading(true);
      const response = await axios.delete('/friendships/unfriend', { data: { friendId } });
      
      // Cập nhật state
      setFriends(prev => prev.filter(friend => friend.friend.id !== friendId));
      
      return response.data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy danh sách lời mời kết bạn
  const getFriendRequests = useCallback(async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const response = await axios.get(`/friendships/requests?page=${page}&limit=${limit}`);
      setRequests(response.data.data.requests);
      return response.data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy danh sách bạn bè
  const getFriends = useCallback(async (page = 1, limit = 20, search = '') => {
    try {
      setLoading(true);
      const response = await axios.get(`/friendships/friends?page=${page}&limit=${limit}&search=${search}`);
      setFriends(response.data.data.friends);
      return response.data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy gợi ý kết bạn
  const getFriendSuggestions = useCallback(async (limit = 10) => {
    try {
      setLoading(true);
      const response = await axios.get(`/friendships/suggestions?limit=${limit}`);
      setSuggestions(response.data.data.suggestions);
      return response.data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Kiểm tra trạng thái kết bạn
  const getFriendshipStatus = useCallback(async (targetUserId) => {
    try {
      const response = await axios.get(`/friendships/status/${targetUserId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error getting friendship status:', error);
      return { status: 'none', canSendRequest: true };
    }
  }, []);

  // Remove suggestion after sending request
  const removeSuggestion = useCallback((userId) => {
    setSuggestions(prev => prev.filter(user => user.id !== userId));
  }, []);

  return {
    loading,
    friends,
    requests,
    suggestions,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    unfriend,
    getFriendRequests,
    getFriends,
    getFriendSuggestions,
    getFriendshipStatus,
    removeSuggestion
  };
}; 