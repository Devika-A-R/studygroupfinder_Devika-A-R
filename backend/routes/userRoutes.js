const express = require('express');
const {
  getProfile,
  updateProfile,
  getAllUsers,
  blockUser,
  unblockUser,
  deleteUser
} = require('../controllers/userController');
const { auth, adminAuth } = require('../middlewares/auth');

const router = express.Router();

router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.get('/', adminAuth, getAllUsers);
router.put('/:id/block', adminAuth, blockUser);
router.put('/:id/unblock', adminAuth, unblockUser);
router.delete('/:id', adminAuth, deleteUser);

module.exports = router;
