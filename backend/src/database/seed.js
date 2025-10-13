require('dotenv').config();
const bcrypt = require('bcrypt');
const {
  sequelize,
  User,
  Program,
  Achievement,
  Challenge
} = require('../models');
const logger = require('../utils/logger');

const seedDatabase = async () => {
  try {
    logger.info('Starting database seeding...');

    // Create sample users
    const password = await bcrypt.hash('Password123!', 10);

    const users = await User.bulkCreate([
      {
        email: 'admin@intentionalmovement.com',
        username: 'admin',
        displayName: 'Admin User',
        password,
        role: 'admin',
        isVerified: true
      },
      {
        email: 'john@example.com',
        username: 'johnmoves',
        displayName: 'John Doe',
        password,
        isVerified: true
      },
      {
        email: 'jane@example.com',
        username: 'janefitness',
        displayName: 'Jane Smith',
        password,
        isVerified: true
      }
    ]);

    logger.info(`Created ${users.length} users`);

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

    logger.info('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
