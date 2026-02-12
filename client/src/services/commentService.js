import api from '../utils/api';

export const getPostComments = async (postId, page = 1, limit = 10) => {
  const response = await api.get(`/comments/post/${postId}?page=${page}&limit=${limit}`);
  return response.data;
};

export const createComment = async (postId, content, parentCommentId = null) => {
  const response = await api.post('/comments', {
    postId,
    content,
    parentCommentId
  });
  return response.data;
};

export const deleteComment = async (commentId) => {
  const response = await api.delete(`/comments/${commentId}`);
  return response.data;
};

export const likeComment = async (commentId) => {
  const response = await api.post(`/comments/${commentId}/like`);
  return response.data;
};
