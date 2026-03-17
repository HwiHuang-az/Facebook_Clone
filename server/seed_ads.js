const { Ad, sequelize } = require('./models');

async function seedAds() {
  try {
    await sequelize.sync();
    
    const count = await Ad.count();
    if (count === 0) {
      await Ad.bulkCreate([
        {
          title: 'Khóa học Lập trình Web Fullstack',
          description: 'Giảm 50% học phí khóa học Web Developer chuyên nghiệp. Cam kết việc làm sau khóa học.',
          imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600',
          targetUrl: 'https://example.com/course',
          sponsorName: 'Tech Academy VN',
          budget: 1000.00,
          status: 'active'
        },
        {
          title: 'Tai nghe Bluetooth Pro X',
          description: 'Sự kiện ra mắt siêu phẩm tai nghe mới nhất. Đặt trước hôm nay nhận quà 1 triệu đồng.',
          imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600',
          targetUrl: 'https://example.com/shop/headphones',
          sponsorName: 'AudioViet Store',
          budget: 500.00,
          status: 'active'
        }
      ]);
      console.log('✅ Mock Ads seeded successfully!');
    } else {
      console.log('Ads already exist, skipping seed.');
    }
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed ads:', err);
    process.exit(1);
  }
}

seedAds();
