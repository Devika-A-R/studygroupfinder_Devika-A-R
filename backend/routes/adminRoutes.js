const express = require('express');
const {
  getAllGroupsForAdmin,
  approveGroup,
  rejectGroup,
  getUsersForNotification,
  getUsersByGroup,
  getApprovedGroups
} = require('../controllers/adminController');
const { adminAuth } = require('../middlewares/auth');

const router = express.Router();

router.get('/groups', adminAuth, getAllGroupsForAdmin);
router.put('/groups/:id/approve', adminAuth, approveGroup);
router.put('/groups/:id/reject', adminAuth, rejectGroup);
router.get('/users-for-notification', adminAuth, getUsersForNotification);
router.get('/groups/:groupId/users', adminAuth, getUsersByGroup);
router.get('/approved-groups', adminAuth, getApprovedGroups);

module.exports = router;
