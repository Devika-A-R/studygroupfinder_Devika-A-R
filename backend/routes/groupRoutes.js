const express = require('express');
const {
  createGroup,
  getAllGroups,
  getGroupById,
  joinGroup,
  leaveGroup,
  updateGroup,
  deleteGroup,
  postMessage,
  addMaterial
} = require('../controllers/groupController');
const { auth } = require('../middlewares/auth');

const router = express.Router();

router.get('/', getAllGroups);
router.get('/:id', auth, getGroupById);
router.post('/', auth, createGroup);
router.put('/:id', auth, updateGroup);
router.delete('/:id', auth, deleteGroup);
router.post('/:id/join', auth, joinGroup);
router.post('/:id/leave', auth, leaveGroup);
router.post('/:id/messages', auth, postMessage);
router.post('/:id/materials', auth, addMaterial);

module.exports = router;
