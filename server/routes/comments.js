const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const commentController = require('../controllers/commentController');

// @route   GET /api/comments/post/:postId
// @desc    Get comments for a post
// @access  Private
router.get('/post/:postId', auth, commentController.getPostComments);

// @route   POST /api/comments
// @desc    Create new comment
// @access  Private
router.post('/', auth, commentController.createComment);

// @route   PUT /api/comments/:id
// @desc    Update comment
// @access  Private
router.put('/:id', auth, commentController.updateComment);

// @route   DELETE /api/comments/:id
// @desc    Delete comment
// @access  Private
router.delete('/:id', auth, commentController.deleteComment);

// @route   POST /api/comments/:id/like
// @desc    Like/Unlike comment
// @access  Private
router.post('/:id/like', auth, commentController.toggleLikeComment);

// @route   GET /api/comments/:commentId/replies
// @desc    Get replies for a comment
// @access  Private
router.get('/:commentId/replies', auth, commentController.getCommentReplies);

module.exports = router;
 