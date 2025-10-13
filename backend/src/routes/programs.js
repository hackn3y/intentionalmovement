const express = require('express');
const router = express.Router();
const programController = require('../controllers/programController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/', verifyToken, programController.getPrograms);
router.get('/:id', verifyToken, programController.getProgram);

// User routes (require authentication)
router.get('/my/purchased', verifyToken, programController.getMyPrograms);
router.get('/:id/progress', verifyToken, programController.getProgramProgress);
router.put('/:id/progress', verifyToken, programController.updateProgramProgress);

// Admin routes
router.post('/', verifyToken, isAdmin, programController.createProgram);
router.put('/:id', verifyToken, isAdmin, programController.updateProgram);
router.delete('/:id', verifyToken, isAdmin, programController.deleteProgram);

module.exports = router;
