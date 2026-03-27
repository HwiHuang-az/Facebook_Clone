const { Comment, User, Post, Like } = require('./models');
const { Op } = require('sequelize');

async function test() {
  try {
    const postId = 10;
    const userId = 1;
    
    console.log('Fetching comments for post 10...');
    const comments = await Comment.findAndCountAll({
      where: {
        postId: postId,
        parentCommentId: null,
        isActive: true
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'isVerified']
        },
        {
          model: Comment,
          as: 'replies',
          where: { isActive: true },
          required: false,
          limit: 3,
          order: [['createdAt', 'ASC']],
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'firstName', 'lastName', 'profilePicture']
            },
            {
              model: Like,
              as: 'likes',
              include: [
                {
                  model: User,
                  as: 'user',
                  attributes: ['id', 'firstName', 'lastName']
                }
              ]
            }
          ]
        },
        {
          model: Like,
          as: 'likes',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName']
            }
          ]
        }
      ],
      limit: 10,
      offset: 0,
      order: [['createdAt', 'ASC']]
    });
    
    console.log('Comments found:', comments.count);
    
    // Helper to format comment with reaction stats
    const formatCommentWithStats = (comment, currentUserId) => {
      const jsonComment = comment.toJSON();
      const reactions = comment.likes || [];
      
      const reactionStats = {
        like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0
      };
      
      let userReaction = null;
      reactions.forEach(like => {
        if (reactionStats[like.type] !== undefined) reactionStats[like.type]++;
        if (like.userId === currentUserId) userReaction = like.type;
      });

      const repliesWithStats = (comment.replies || []).map(reply => formatCommentWithStats(reply, currentUserId));

      return {
        ...jsonComment,
        isLiked: !!userReaction,
        userReaction,
        reactionStats,
        likesCount: reactions.length,
        replies: repliesWithStats
      };
    };

    const commentsWithStats = comments.rows.map(comment => formatCommentWithStats(comment, userId));
    console.log('Formatted comments:', JSON.stringify(commentsWithStats, null, 2));

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

test();
