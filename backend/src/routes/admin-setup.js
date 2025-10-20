const express = require('express');
const router = express.Router();
const { User } = require('../models');

// Temporary endpoint to grant admin access
// This should be removed after initial setup
router.post('/grant-admin', async (req, res) => {
  try {
    const { email, secret } = req.body;

    // Simple secret check (you should change this)
    if (secret !== process.env.ADMIN_SETUP_SECRET) {
      return res.status(403).json({ error: 'Invalid secret' });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update({ role: 'admin' });

    return res.json({
      success: true,
      message: `User ${email} is now an admin`,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Grant admin error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Check user role
router.get('/check-role/:email', async (req, res) => {
  try {
    const user = await User.findOne({ where: { email: req.params.email } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Check role error:', error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
