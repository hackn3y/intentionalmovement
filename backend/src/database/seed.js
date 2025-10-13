require('dotenv').config();
const bcrypt = require('bcrypt');
const {
  sequelize,
  User,
  Program,
  Achievement,
  Challenge,
  Post,
  Comment,
  Like,
  Follow
} = require('../models');
const logger = require('../utils/logger');

const seedDatabase = async () => {
  try {
    logger.info('Starting database seeding...');

    // Clear existing data (for development only)
    await Comment.destroy({ where: {}, truncate: true });
    await Like.destroy({ where: {}, truncate: true });
    await Post.destroy({ where: {}, truncate: true });
    await Follow.destroy({ where: {}, truncate: true });
    await Program.destroy({ where: {}, truncate: true });
    await Achievement.destroy({ where: {}, truncate: true });
    await Challenge.destroy({ where: {}, truncate: true });
    await User.destroy({ where: { role: { [require('sequelize').Op.ne]: 'admin' } } });
    logger.info('Cleared existing seed data');

    // Create sample users
    const password = await bcrypt.hash('Password123!', 10);

    // Create or get admin user
    let adminUser = await User.findOne({ where: { role: 'admin' } });
    if (!adminUser) {
      adminUser = await User.create({
        email: 'admin@intentionalmovement.com',
        username: 'admin',
        displayName: 'Admin User',
        password,
        role: 'admin',
        isVerified: true,
        bio: 'Platform administrator and movement enthusiast.'
      });
    }

    const users = await User.bulkCreate([
      {
        email: 'john@example.com',
        username: 'johnmoves',
        displayName: 'John Doe',
        password,
        isVerified: true,
        bio: 'Yoga practitioner and wellness coach. Helping others find their flow. 🧘‍♂️'
      },
      {
        email: 'jane@example.com',
        username: 'janefitness',
        displayName: 'Jane Smith',
        password,
        isVerified: true,
        bio: 'Fitness trainer | Marathon runner | Plant-based athlete 🌱💪'
      },
      {
        email: 'mike@example.com',
        username: 'mikemovement',
        displayName: 'Mike Johnson',
        password,
        isVerified: true,
        bio: 'CrossFit coach and mobility specialist. Movement is medicine!'
      },
      {
        email: 'sarah@example.com',
        username: 'sarahflows',
        displayName: 'Sarah Williams',
        password,
        isVerified: true,
        bio: 'Dance instructor and mindfulness teacher. Moving with intention ✨'
      }
    ]);

    // Include admin user in the users array for later use
    users.unshift(adminUser);
    logger.info(`Created ${users.length - 1} new users (plus admin)`);

    // Create sample programs
    const programs = await Program.bulkCreate([
      {
        title: 'Beginner Movement Fundamentals',
        description: 'Start your movement journey with foundational practices.',
        price: 49.99,
        category: 'Fundamentals',
        difficulty: 'beginner',
        duration: 30,
        instructor: 'Movement Master',
        thumbnailUrl: 'https://via.placeholder.com/400x300',
        isActive: true
      },
      {
        title: 'Intermediate Flow State',
        description: 'Take your practice to the next level with dynamic flows.',
        price: 79.99,
        category: 'Flow',
        difficulty: 'intermediate',
        duration: 60,
        instructor: 'Flow Expert',
        thumbnailUrl: 'https://via.placeholder.com/400x300',
        isActive: true
      },
      {
        title: 'Advanced Mobility Mastery',
        description: 'Master advanced mobility techniques and movements.',
        price: 99.99,
        category: 'Mobility',
        difficulty: 'advanced',
        duration: 90,
        instructor: 'Mobility Guru',
        thumbnailUrl: 'https://via.placeholder.com/400x300',
        isActive: true
      }
    ]);

    logger.info(`Created ${programs.length} programs`);

    // Create sample achievements
    const achievements = await Achievement.bulkCreate([
      {
        name: 'First Step',
        description: 'Complete your first workout',
        icon: 'star',
        criteria: { type: 'workouts', count: 1 }
      },
      {
        name: 'Week Warrior',
        description: 'Train for 7 consecutive days',
        icon: 'fire',
        criteria: { type: 'streak', count: 7 }
      },
      {
        name: 'Social Butterfly',
        description: 'Make 10 posts',
        icon: 'heart',
        criteria: { type: 'posts', count: 10 }
      },
      {
        name: 'Program Completer',
        description: 'Complete your first program',
        icon: 'trophy',
        criteria: { type: 'programs', count: 1 }
      }
    ]);

    logger.info(`Created ${achievements.length} achievements`);

    // Create sample challenge
    const challenges = await Challenge.bulkCreate([
      {
        title: '30-Day Movement Challenge',
        description: 'Move every day for 30 days straight!',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        goal: 'Complete 30 workouts',
        isActive: true
      }
    ]);

    logger.info(`Created ${challenges.length} challenges`);

    // Create sample posts
    const posts = await Post.bulkCreate([
      {
        userId: users[1].id, // John
        content: 'Just finished an amazing morning yoga session! Feeling centered and ready for the day. 🙏',
        type: 'text'
      },
      {
        userId: users[2].id, // Jane
        content: 'Completed my first 10K today! The training paid off. Remember: consistency beats intensity every time! 🏃‍♀️💨',
        type: 'text'
      },
      {
        userId: users[3].id, // Mike
        content: 'New mobility routine dropping tomorrow! Focus on hip and shoulder health. Who is ready? 💪',
        type: 'text'
      },
      {
        userId: users[4].id, // Sarah
        content: 'Teaching a flow class tonight - all levels welcome! Movement is a celebration, not a punishment. ✨',
        type: 'text'
      },
      {
        userId: users[1].id, // John
        content: 'Pro tip: Start your day with 5 minutes of breathwork. It is a game changer for mental clarity and energy.',
        type: 'text'
      },
      {
        userId: users[2].id, // Jane
        content: 'Rest days are just as important as training days. Listen to your body! 💤',
        type: 'text'
      }
    ]);

    logger.info(`Created ${posts.length} posts`);

    // Create sample follows
    const follows = await Follow.bulkCreate([
      { followerId: users[1].id, followingId: users[2].id }, // John follows Jane
      { followerId: users[1].id, followingId: users[3].id }, // John follows Mike
      { followerId: users[2].id, followingId: users[1].id }, // Jane follows John
      { followerId: users[2].id, followingId: users[4].id }, // Jane follows Sarah
      { followerId: users[3].id, followingId: users[2].id }, // Mike follows Jane
      { followerId: users[4].id, followingId: users[1].id }, // Sarah follows John
      { followerId: users[4].id, followingId: users[2].id }, // Sarah follows Jane
    ]);

    logger.info(`Created ${follows.length} follow relationships`);

    // Create sample likes
    const likes = await Like.bulkCreate([
      { userId: users[2].id, postId: posts[0].id }, // Jane likes John's post
      { userId: users[3].id, postId: posts[0].id }, // Mike likes John's post
      { userId: users[1].id, postId: posts[1].id }, // John likes Jane's post
      { userId: users[4].id, postId: posts[1].id }, // Sarah likes Jane's post
      { userId: users[2].id, postId: posts[2].id }, // Jane likes Mike's post
      { userId: users[1].id, postId: posts[3].id }, // John likes Sarah's post
    ]);

    logger.info(`Created ${likes.length} likes`);

    // Create sample comments
    const comments = await Comment.bulkCreate([
      {
        userId: users[2].id, // Jane
        postId: posts[0].id, // on John's post
        content: 'Love this! Yoga is life 🧘‍♀️'
      },
      {
        userId: users[3].id, // Mike
        postId: posts[0].id, // on John's post
        content: 'Great way to start the day 💯'
      },
      {
        userId: users[1].id, // John
        postId: posts[1].id, // on Jane's post
        content: 'Congratulations! That is amazing! 🎉'
      },
      {
        userId: users[4].id, // Sarah
        postId: posts[2].id, // on Mike's post
        content: 'Cannot wait! My shoulders need this 🙌'
      }
    ]);

    logger.info(`Created ${comments.length} comments`);

    logger.info('Database seeding completed successfully!');
    logger.info('Test credentials: email: john@example.com, password: Password123!');
    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
