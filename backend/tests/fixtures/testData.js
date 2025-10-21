// Test data fixtures for consistent testing

const validUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'SecurePassword123!',
  displayName: 'Test User'
};

const invalidUser = {
  username: 't', // too short
  email: 'invalid-email',
  password: '123', // too weak
};

const validProgram = {
  title: 'Test Program',
  description: 'A test fitness program',
  price: 99.99,
  category: 'fitness',
  difficulty: 'beginner',
  duration: 30, // days
  lessons: [
    { id: 1, title: 'Introduction', duration: 10, isPreview: true },
    { id: 2, title: 'Workout 1', duration: 30, isPreview: false }
  ],
  features: ['Video tutorials', '30-day program', 'Progress tracking'],
  isPublished: true
};

const validPost = {
  content: 'This is a test post about my fitness journey',
  type: 'text'
};

const validComment = {
  text: 'Great post!'
};

module.exports = {
  validUser,
  invalidUser,
  validProgram,
  validPost,
  validComment
};
