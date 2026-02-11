-- Facebook Clone Database Schema
-- Dự án cá nhân

CREATE DATABASE IF NOT EXISTS facebook_clone;
USE facebook_clone;

-- Bảng Users
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    profile_picture VARCHAR(255) DEFAULT 'default-avatar.png',
    cover_photo VARCHAR(255),
    bio TEXT,
    location VARCHAR(100),
    workplace VARCHAR(100),
    education VARCHAR(100),
    relationship_status ENUM('single', 'in_relationship', 'married', 'complicated'),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng Posts
CREATE TABLE IF NOT EXISTS posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    content TEXT,
    image_url VARCHAR(255),
    video_url VARCHAR(255),
    privacy ENUM('public', 'friends', 'only_me') DEFAULT 'public',
    location VARCHAR(100),
    feeling VARCHAR(50),
    activity VARCHAR(50),
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    shares_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bảng Comments
CREATE TABLE IF NOT EXISTS comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    parent_comment_id INT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(255),
    likes_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE
);

-- Bảng Likes
CREATE TABLE IF NOT EXISTS likes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    post_id INT NULL,
    comment_id INT NULL,
    type ENUM('like', 'love', 'haha', 'wow', 'sad', 'angry') DEFAULT 'like',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
    UNIQUE KEY unique_post_like (user_id, post_id),
    UNIQUE KEY unique_comment_like (user_id, comment_id)
);

-- Bảng Friend Requests
CREATE TABLE IF NOT EXISTS friend_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'declined') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_request (sender_id, receiver_id)
);

-- Bảng Friendships
CREATE TABLE IF NOT EXISTS friendships (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user1_id INT NOT NULL,
    user2_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_friendship (user1_id, user2_id)
);

-- Bảng Messages
CREATE TABLE IF NOT EXISTS messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    content TEXT,
    image_url VARCHAR(255),
    video_url VARCHAR(255),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bảng Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    from_user_id INT NOT NULL,
    type ENUM('like', 'comment', 'friend_request', 'friend_accept', 'message', 'mention') NOT NULL,
    post_id INT NULL,
    comment_id INT NULL,
    message VARCHAR(255) NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE
);

-- Bảng Stories
CREATE TABLE IF NOT EXISTS stories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    content TEXT,
    image_url VARCHAR(255),
    video_url VARCHAR(255),
    background_color VARCHAR(7),
    expires_at TIMESTAMP,
    views_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bảng Story Views
CREATE TABLE IF NOT EXISTS story_views (
    id INT PRIMARY KEY AUTO_INCREMENT,
    story_id INT NOT NULL,
    user_id INT NOT NULL,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_view (story_id, user_id)
);

-- Bảng Groups
CREATE TABLE IF NOT EXISTS `groups` (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    privacy ENUM('public', 'closed', 'secret') DEFAULT 'public',
    cover_photo VARCHAR(255),
    admin_id INT NOT NULL,
    members_count INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bảng Group Members
CREATE TABLE IF NOT EXISTS group_members (
    id INT PRIMARY KEY AUTO_INCREMENT,
    group_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('admin', 'moderator', 'member') DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES `groups`(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_membership (group_id, user_id)
);

-- Bảng Pages
CREATE TABLE IF NOT EXISTS pages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE,
    category VARCHAR(50),
    description TEXT,
    profile_picture VARCHAR(255),
    cover_photo VARCHAR(255),
    website VARCHAR(255),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    owner_id INT NOT NULL,
    followers_count INT DEFAULT 0,
    likes_count INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes để tối ưu performance
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at DESC);
CREATE INDEX idx_comments_post ON comments(post_id, created_at);
CREATE INDEX idx_likes_post ON likes(post_id);
CREATE INDEX idx_likes_comment ON likes(comment_id);
CREATE INDEX idx_messages_users ON messages(sender_id, receiver_id, created_at DESC);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_stories_expires ON stories(expires_at);
CREATE INDEX idx_friendships_users ON friendships(user1_id, user2_id);

-- Dữ liệu mẫu cho demo
INSERT INTO users (first_name, last_name, email, password, date_of_birth, gender, bio) VALUES
('John', 'Doe', 'john.doe@example.com', '$2b$10$example_hashed_password', '1990-01-15', 'male', 'Software Developer passionate about creating amazing user experiences'),
('Jane', 'Smith', 'jane.smith@example.com', '$2b$10$example_hashed_password', '1992-05-20', 'female', 'UX Designer who loves to create beautiful and functional designs'),
('Mike', 'Johnson', 'mike.johnson@example.com', '$2b$10$example_hashed_password', '1988-12-03', 'male', 'Full-stack developer and tech enthusiast'),
('Sarah', 'Wilson', 'sarah.wilson@example.com', '$2b$10$example_hashed_password', '1995-08-18', 'female', 'Marketing specialist and social media guru');

-- Thêm một số bài viết mẫu
INSERT INTO posts (user_id, content, privacy) VALUES
(1, 'Chào mọi người! Đây là bài viết đầu tiên của tôi trên Facebook clone này. Cảm ơn vì đã tham gia!', 'public'),
(2, 'Vừa hoàn thành một dự án design mới. Rất hào hứng để chia sẻ với mọi người!', 'public'),
(3, 'Đang học React và Node.js. Công nghệ này thật tuyệt vời!', 'public'),
(4, 'Cuối tuần rồi! Ai có kế hoạch gì thú vị không?', 'public');

-- Bảng Events (Sự kiện)
CREATE TABLE IF NOT EXISTS events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    start_date DATETIME NOT NULL,
    end_date DATETIME,
    cover_photo VARCHAR(255),
    privacy ENUM('public', 'friends', 'private') DEFAULT 'public',
    creator_id INT NOT NULL,
    interested_count INT DEFAULT 0,
    going_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bảng Event Responses
CREATE TABLE IF NOT EXISTS event_responses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    user_id INT NOT NULL,
    response ENUM('going', 'interested', 'not_going') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_response (event_id, user_id)
);

-- Bảng Marketplace (Chợ)
CREATE TABLE IF NOT EXISTS marketplace_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'VND',
    category VARCHAR(50),
    condition_item ENUM('new', 'like_new', 'good', 'fair', 'poor') DEFAULT 'good',
    location VARCHAR(255),
    seller_id INT NOT NULL,
    images TEXT, -- JSON array of image URLs
    is_sold BOOLEAN DEFAULT false,
    views_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bảng Saved Posts
CREATE TABLE IF NOT EXISTS saved_posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    collection_name VARCHAR(100) DEFAULT 'Saved Items',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_saved (user_id, post_id)
);

-- Bảng Post Shares
CREATE TABLE IF NOT EXISTS post_shares (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    shared_content TEXT, -- Nội dung thêm khi share
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Bảng Blocked Users
CREATE TABLE IF NOT EXISTS blocked_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    blocker_id INT NOT NULL,
    blocked_id INT NOT NULL,
    reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (blocker_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (blocked_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_block (blocker_id, blocked_id)
);

-- Bảng Reports
CREATE TABLE IF NOT EXISTS reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reporter_id INT NOT NULL,
    reported_user_id INT NULL,
    reported_post_id INT NULL,
    reported_comment_id INT NULL,
    report_type ENUM('spam', 'harassment', 'fake_news', 'inappropriate_content', 'violence', 'other') NOT NULL,
    description TEXT,
    status ENUM('pending', 'reviewed', 'resolved', 'dismissed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_comment_id) REFERENCES comments(id) ON DELETE CASCADE
);

-- Bảng User Sessions (for security)
CREATE TABLE IF NOT EXISTS user_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    session_token VARCHAR(255) NOT NULL,
    device_info TEXT,
    ip_address VARCHAR(45),
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ===== ADMIN PANEL TABLES (Trang quản trị) =====

-- Bảng Admin Users
CREATE TABLE IF NOT EXISTS admin_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    role ENUM('super_admin', 'admin', 'moderator', 'content_reviewer') NOT NULL,
    permissions JSON, -- Quyền cụ thể: {"users": ["view", "edit", "delete"], "posts": ["view", "delete"]}
    department VARCHAR(100), -- Phòng ban: Security, Content, Technical, etc.
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP NULL,
    created_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL
);

-- Bảng Admin Actions Log
CREATE TABLE IF NOT EXISTS admin_actions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    admin_id INT NOT NULL,
    action_type ENUM('user_ban', 'user_unban', 'post_delete', 'post_restore', 'comment_delete', 'report_review', 'user_verify', 'content_flag', 'system_config') NOT NULL,
    target_type ENUM('user', 'post', 'comment', 'group', 'page', 'report', 'system') NOT NULL,
    target_id INT NULL,
    old_data JSON, -- Dữ liệu trước khi thay đổi
    new_data JSON, -- Dữ liệu sau khi thay đổi
    reason TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE
);

-- Bảng Content Moderation Queue
CREATE TABLE IF NOT EXISTS moderation_queue (
    id INT PRIMARY KEY AUTO_INCREMENT,
    content_type ENUM('post', 'comment', 'user_profile', 'group', 'page', 'marketplace_item') NOT NULL,
    content_id INT NOT NULL,
    reason VARCHAR(255) NOT NULL,
    auto_flagged BOOLEAN DEFAULT false, -- Tự động phát hiện bởi AI
    flag_score DECIMAL(3,2), -- Điểm nghi ngờ từ 0.00 đến 1.00
    status ENUM('pending', 'approved', 'rejected', 'escalated') DEFAULT 'pending',
    reviewer_id INT NULL,
    review_notes TEXT,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    FOREIGN KEY (reviewer_id) REFERENCES admin_users(id) ON DELETE SET NULL
);

-- Bảng System Settings
CREATE TABLE IF NOT EXISTS system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    data_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    category VARCHAR(50), -- 'security', 'features', 'limits', 'notifications'
    description TEXT,
    is_public BOOLEAN DEFAULT false, -- Có thể xem bởi user thường không
    updated_by INT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL
);

-- Bảng User Penalties (Hình phạt người dùng)
CREATE TABLE IF NOT EXISTS user_penalties (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    penalty_type ENUM('warning', 'temporary_ban', 'permanent_ban', 'feature_restriction', 'shadowban') NOT NULL,
    reason TEXT NOT NULL,
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP NULL, -- NULL = vĩnh viễn
    restricted_features JSON, -- ["posting", "commenting", "messaging", "groups"]
    applied_by INT NOT NULL,
    appeal_status ENUM('none', 'pending', 'approved', 'rejected') DEFAULT 'none',
    appeal_reason TEXT,
    appeal_date TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (applied_by) REFERENCES admin_users(id) ON DELETE RESTRICT
);

-- Bảng Analytics Dashboard
CREATE TABLE IF NOT EXISTS analytics_daily (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL UNIQUE,
    new_users INT DEFAULT 0,
    active_users INT DEFAULT 0,
    total_posts INT DEFAULT 0,
    total_comments INT DEFAULT 0,
    total_likes INT DEFAULT 0,
    total_shares INT DEFAULT 0,
    total_messages INT DEFAULT 0,
    reported_content INT DEFAULT 0,
    banned_users INT DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0.00, -- Nếu có quảng cáo
    server_uptime_percent DECIMAL(5,2) DEFAULT 100.00,
    avg_response_time_ms INT DEFAULT 0,
    storage_used_gb DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Content Policy Violations
CREATE TABLE IF NOT EXISTS policy_violations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    content_type ENUM('post', 'comment', 'profile', 'message', 'group', 'page') NOT NULL,
    content_id INT NOT NULL,
    violation_type ENUM('spam', 'hate_speech', 'violence', 'harassment', 'fake_news', 'adult_content', 'copyright', 'terrorism') NOT NULL,
    severity ENUM('minor', 'major', 'severe', 'critical') NOT NULL,
    auto_detected BOOLEAN DEFAULT false,
    confidence_score DECIMAL(3,2), -- AI confidence
    reviewer_id INT NULL,
    action_taken ENUM('none', 'warning', 'content_removed', 'user_restricted', 'user_banned') NOT NULL,
    appeals_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (reviewer_id) REFERENCES admin_users(id) ON DELETE SET NULL
);

-- Bảng Feature Flags (Bật/tắt tính năng)
CREATE TABLE IF NOT EXISTS feature_flags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    flag_name VARCHAR(100) UNIQUE NOT NULL,
    is_enabled BOOLEAN DEFAULT false,
    rollout_percentage INT DEFAULT 0, -- 0-100%
    target_users JSON, -- Specific user IDs or groups
    description TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE RESTRICT
);

-- Bảng Server Monitoring
CREATE TABLE IF NOT EXISTS server_metrics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    metric_type ENUM('cpu_usage', 'memory_usage', 'disk_usage', 'network_io', 'database_connections', 'active_sessions') NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    unit VARCHAR(10), -- 'percent', 'mb', 'gb', 'count'
    server_name VARCHAR(50),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Thêm indexes cho admin tables
CREATE INDEX idx_admin_users_role ON admin_users(role, is_active);
CREATE INDEX idx_admin_actions_admin ON admin_actions(admin_id, created_at DESC);
CREATE INDEX idx_admin_actions_target ON admin_actions(target_type, target_id);
CREATE INDEX idx_moderation_queue_status ON moderation_queue(status, priority, created_at);
CREATE INDEX idx_user_penalties_user ON user_penalties(user_id, is_active);
CREATE INDEX idx_user_penalties_type ON user_penalties(penalty_type, end_date);
CREATE INDEX idx_analytics_date ON analytics_daily(date DESC);
CREATE INDEX idx_policy_violations_type ON policy_violations(violation_type, severity);
CREATE INDEX idx_feature_flags_enabled ON feature_flags(is_enabled, rollout_percentage);
CREATE INDEX idx_server_metrics_type ON server_metrics(metric_type, recorded_at DESC);

-- Thêm indexes cho các bảng cũ
CREATE INDEX idx_events_date ON events(start_date, end_date);
CREATE INDEX idx_marketplace_category ON marketplace_items(category, is_sold);
CREATE INDEX idx_marketplace_location ON marketplace_items(location);
CREATE INDEX idx_saved_posts_user ON saved_posts(user_id, created_at DESC);
CREATE INDEX idx_post_shares_post ON post_shares(post_id, created_at DESC);
CREATE INDEX idx_blocked_users ON blocked_users(blocker_id, blocked_id);
CREATE INDEX idx_reports_status ON reports(status, created_at DESC);
CREATE INDEX idx_user_sessions ON user_sessions(user_id, is_active, expires_at);

-- Thêm một số friendship mẫu
INSERT INTO friendships (user1_id, user2_id) VALUES
(1, 2),
(1, 3),
(2, 3),
(2, 4),
(3, 4);

-- ===== ADMIN SAMPLE DATA =====

-- Tạo admin users
INSERT INTO admin_users (user_id, role, permissions, department) VALUES
(1, 'super_admin', '{"users": ["view", "edit", "delete", "ban"], "posts": ["view", "edit", "delete"], "reports": ["view", "resolve"], "system": ["view", "edit"]}', 'Technical'),
(2, 'admin', '{"users": ["view", "edit", "ban"], "posts": ["view", "delete"], "reports": ["view", "resolve"]}', 'Content Moderation'),
(3, 'moderator', '{"posts": ["view", "delete"], "reports": ["view", "resolve"]}', 'Content Moderation');

-- System settings mẫu
INSERT INTO system_settings (setting_key, setting_value, data_type, category, description, is_public) VALUES
('max_file_upload_size', '10485760', 'number', 'limits', 'Maximum file upload size in bytes (10MB)', false),
('daily_post_limit', '50', 'number', 'limits', 'Maximum posts per user per day', false),
('enable_registration', 'true', 'boolean', 'features', 'Allow new user registration', true),
('maintenance_mode', 'false', 'boolean', 'system', 'Put site in maintenance mode', false),
('content_auto_moderation', 'true', 'boolean', 'security', 'Enable AI content moderation', false),
('friend_request_limit', '20', 'number', 'limits', 'Maximum friend requests per day', false),
('message_rate_limit', '100', 'number', 'limits', 'Maximum messages per hour', false),
('enable_stories', 'true', 'boolean', 'features', 'Enable Stories feature', true),
('enable_marketplace', 'true', 'boolean', 'features', 'Enable Marketplace feature', true),
('session_timeout_hours', '72', 'number', 'security', 'User session timeout in hours', false);

-- Feature flags mẫu
INSERT INTO feature_flags (flag_name, is_enabled, rollout_percentage, description, created_by) VALUES
('dark_mode', true, 100, 'Enable dark mode for all users', 1),
('video_calling', false, 0, 'Video calling feature in messenger', 1),
('ai_content_suggestions', true, 25, 'AI-powered content suggestions', 1),
('advanced_privacy_controls', true, 50, 'Enhanced privacy control options', 1),
('live_streaming', false, 0, 'Live video streaming feature', 1);

-- Analytics data mẫu (7 ngày gần đây)
INSERT INTO analytics_daily (date, new_users, active_users, total_posts, total_comments, total_likes, total_shares, total_messages, reported_content, banned_users) VALUES
('2024-01-20', 45, 1250, 450, 1200, 3500, 150, 2800, 5, 2),
('2024-01-19', 52, 1180, 420, 1100, 3200, 140, 2650, 8, 1),
('2024-01-18', 38, 1320, 380, 950, 2800, 120, 2400, 3, 0),
('2024-01-17', 41, 1290, 410, 1050, 3100, 135, 2550, 6, 1),
('2024-01-16', 48, 1400, 480, 1300, 3800, 160, 2900, 4, 3),
('2024-01-15', 55, 1350, 520, 1400, 4200, 180, 3100, 7, 2),
('2024-01-14', 43, 1200, 390, 980, 2900, 125, 2300, 2, 1);

-- Policy violations mẫu
INSERT INTO policy_violations (content_type, content_id, violation_type, severity, auto_detected, confidence_score, action_taken) VALUES
('post', 1, 'spam', 'minor', true, 0.85, 'warning'),
('comment', 1, 'harassment', 'major', false, null, 'content_removed'),
('post', 2, 'fake_news', 'severe', true, 0.92, 'content_removed');

-- Server metrics mẫu
INSERT INTO server_metrics (metric_type, value, unit, server_name) VALUES
('cpu_usage', 45.50, 'percent', 'web-server-01'),
('memory_usage', 78.20, 'percent', 'web-server-01'),
('disk_usage', 65.30, 'percent', 'web-server-01'),
('database_connections', 45, 'count', 'db-server-01'),
('active_sessions', 1250, 'count', 'web-server-01');

-- ===== BỔ SUNG HỆ THỐNG PHÂN QUYỀN CHI TIẾT =====

-- Bảng User Roles (Vai trò người dùng)
CREATE TABLE IF NOT EXISTS user_roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSON, -- Chi tiết quyền hạn
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng User Role Assignments  
CREATE TABLE IF NOT EXISTS user_role_assignments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    assigned_by INT NULL,
    expires_at TIMESTAMP NULL, -- Quyền có thời hạn
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES user_roles(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_user_role (user_id, role_id)
);

-- Bảng Privacy Settings (Cài đặt riêng tư)
CREATE TABLE IF NOT EXISTS privacy_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    profile_visibility ENUM('public', 'friends', 'friends_of_friends', 'only_me') DEFAULT 'friends',
    contact_info_visibility ENUM('public', 'friends', 'only_me') DEFAULT 'friends',
    friend_list_visibility ENUM('public', 'friends', 'only_me') DEFAULT 'friends',
    post_default_privacy ENUM('public', 'friends', 'friends_of_friends', 'only_me') DEFAULT 'friends',
    story_privacy ENUM('public', 'friends', 'close_friends', 'custom') DEFAULT 'friends',
    who_can_send_friend_requests ENUM('everyone', 'friends_of_friends', 'nobody') DEFAULT 'everyone',
    who_can_message_me ENUM('everyone', 'friends', 'nobody') DEFAULT 'friends',
    who_can_tag_me ENUM('everyone', 'friends', 'nobody') DEFAULT 'friends',
    who_can_post_on_timeline ENUM('everyone', 'friends', 'only_me') DEFAULT 'friends',
    who_can_see_posts_on_timeline ENUM('public', 'friends', 'friends_of_friends', 'only_me') DEFAULT 'friends',
    search_by_email BOOLEAN DEFAULT true,
    search_by_phone BOOLEAN DEFAULT true,
    search_engines_indexing BOOLEAN DEFAULT false,
    activity_status_visible BOOLEAN DEFAULT true,
    read_receipts_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bảng Content Permissions (Quyền truy cập nội dung)
CREATE TABLE IF NOT EXISTS content_permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    content_type ENUM('post', 'photo', 'video', 'album', 'story') NOT NULL,
    content_id INT NOT NULL,
    permission_type ENUM('view', 'comment', 'share', 'download') NOT NULL,
    target_type ENUM('public', 'friends', 'specific_users', 'except_users', 'custom_list') NOT NULL,
    target_users JSON, -- Array của user IDs
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_content_permissions (content_type, content_id, permission_type)
);

-- Bảng Friend Lists (Danh sách bạn bè tùy chỉnh)
CREATE TABLE IF NOT EXISTS friend_lists (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    list_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT false, -- Close Friends, Acquaintances, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bảng Friend List Members
CREATE TABLE IF NOT EXISTS friend_list_members (
    id INT PRIMARY KEY AUTO_INCREMENT,
    list_id INT NOT NULL,
    friend_id INT NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (list_id) REFERENCES friend_lists(id) ON DELETE CASCADE,
    FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_list_member (list_id, friend_id)
);

-- Bảng Content Visibility Rules (Quy tắc hiển thị nội dung)
CREATE TABLE IF NOT EXISTS content_visibility_rules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    rule_name VARCHAR(100) NOT NULL,
    content_types JSON, -- ["posts", "photos", "videos"]
    visibility_settings JSON, -- Chi tiết cài đặt
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bảng Account Verification Levels (Cấp độ xác minh tài khoản)
CREATE TABLE IF NOT EXISTS verification_levels (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    identity_verified BOOLEAN DEFAULT false, -- ID card, passport
    business_verified BOOLEAN DEFAULT false,
    public_figure_verified BOOLEAN DEFAULT false, -- Tick xanh
    verification_documents JSON, -- Danh sách documents đã upload
    verification_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    verified_by INT NULL,
    verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES admin_users(id) ON DELETE SET NULL
);

-- Thêm indexes cho bảng phân quyền
CREATE INDEX idx_user_roles_active ON user_roles(is_active);
CREATE INDEX idx_user_role_assignments_user ON user_role_assignments(user_id, is_active);
CREATE INDEX idx_privacy_settings_user ON privacy_settings(user_id);
CREATE INDEX idx_friend_lists_user ON friend_lists(user_id, is_default);
CREATE INDEX idx_friend_list_members_list ON friend_list_members(list_id);
CREATE INDEX idx_content_visibility_user ON content_visibility_rules(user_id, is_active);
CREATE INDEX idx_verification_levels_status ON verification_levels(verification_status);

-- Dữ liệu mẫu cho hệ thống phân quyền

-- User roles mặc định
INSERT INTO user_roles (role_name, description, permissions) VALUES
('regular_user', 'Người dùng thông thường', '{"posts": ["create", "view", "edit_own", "delete_own"], "comments": ["create", "view", "edit_own", "delete_own"], "messages": ["send", "receive"], "friends": ["add", "remove"], "groups": ["join", "leave"], "pages": ["like", "follow"]}'),
('verified_user', 'Người dùng đã xác minh', '{"posts": ["create", "view", "edit_own", "delete_own", "pin"], "comments": ["create", "view", "edit_own", "delete_own"], "messages": ["send", "receive", "broadcast"], "friends": ["add", "remove"], "groups": ["join", "leave", "create"], "pages": ["like", "follow", "create"], "stories": ["create", "view"], "live": ["stream"]}'),
('business_user', 'Tài khoản kinh doanh', '{"posts": ["create", "view", "edit_own", "delete_own", "promote"], "comments": ["create", "view", "edit_own", "delete_own"], "messages": ["send", "receive", "broadcast"], "friends": ["add", "remove"], "groups": ["join", "leave", "create", "manage"], "pages": ["like", "follow", "create", "manage"], "ads": ["create", "manage"], "analytics": ["view"], "marketplace": ["sell", "buy"]}'),
('content_creator', 'Nhà sáng tạo nội dung', '{"posts": ["create", "view", "edit_own", "delete_own", "monetize"], "comments": ["create", "view", "edit_own", "delete_own", "moderate"], "messages": ["send", "receive", "broadcast"], "friends": ["add", "remove"], "groups": ["join", "leave", "create", "manage"], "pages": ["like", "follow", "create", "manage"], "live": ["stream", "monetize"], "analytics": ["view", "advanced"], "brand_partnerships": ["create"]}'),
('restricted_user', 'Người dùng bị hạn chế', '{"posts": ["view"], "comments": ["view"], "messages": ["receive"], "friends": ["view_own"], "groups": ["view"], "pages": ["view"]}');

-- Gán role cho users mẫu
INSERT INTO user_role_assignments (user_id, role_id) VALUES
(1, 2), -- John Doe = verified_user
(2, 4), -- Jane Smith = content_creator  
(3, 3), -- Mike Johnson = business_user
(4, 1); -- Sarah Wilson = regular_user

-- Privacy settings mặc định cho users
INSERT INTO privacy_settings (user_id, profile_visibility, post_default_privacy, who_can_send_friend_requests) VALUES
(1, 'public', 'friends', 'everyone'),
(2, 'friends', 'friends', 'friends_of_friends'),
(3, 'public', 'public', 'everyone'), -- Business account
(4, 'friends', 'friends', 'everyone');

-- Friend lists mặc định
INSERT INTO friend_lists (user_id, list_name, description, is_default) VALUES
(1, 'Close Friends', 'Bạn thân thiết', true),
(1, 'Work Colleagues', 'Đồng nghiệp', false),
(2, 'Close Friends', 'Bạn thân thiết', true),
(2, 'Family', 'Gia đình', false);

-- Verification levels
INSERT INTO verification_levels (user_id, email_verified, phone_verified, public_figure_verified) VALUES
(1, true, true, false),
(2, true, true, true), -- Content creator có tick xanh
(3, true, true, false),
(4, true, false, false); 