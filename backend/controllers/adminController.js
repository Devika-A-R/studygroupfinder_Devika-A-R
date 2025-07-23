const Group = require('../models/GroupModel');
const User = require('../models/UserModel');

const getAllGroupsForAdmin = async (req, res) => {
  try {
    const groups = await Group.find({})
      .populate('creator', 'name email')
      .populate('members', 'name email')
      .sort({ createdAt: -1 });

    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const approveGroup = async (req, res) => {
  try {
    const group = await Group.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    ).populate('creator', 'name email');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Return user data for frontend to send email via EmailJS
    res.json({ 
      message: 'Group approved successfully', 
      group,
      notificationData: {
        userEmail: group.creator.email,
        userName: group.creator.name,
        groupTitle: group.title,
        groupSubject: group.subject,
        groupDescription: group.description,
        status: 'approved'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const rejectGroup = async (req, res) => {
  try {
    const group = await Group.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    ).populate('creator', 'name email');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Return user data for frontend to send email via EmailJS
    res.json({ 
      message: 'Group rejected successfully', 
      group,
      notificationData: {
        userEmail: group.creator.email,
        userName: group.creator.name,
        groupTitle: group.title,
        status: 'rejected'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getUsersForNotification = async (req, res) => {
  try {
    const users = await User.find({ role: 'user', isBlocked: false })
      .select('name email');
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// New endpoint to get users by group
const getUsersByGroup = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const group = await Group.findById(groupId)
      .populate('members', 'name email')
      .populate('creator', 'name email');
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Return all members including creator
    const allMembers = group.members;
    res.json(allMembers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// New endpoint to get approved groups for email selection
const getApprovedGroups = async (req, res) => {
  try {
    const groups = await Group.find({ status: 'approved' })
      .select('title subject members')
      .populate('members', 'name email')
      .sort({ title: 1 });
    
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllGroupsForAdmin,
  approveGroup,
  rejectGroup,
  getUsersForNotification,
  getUsersByGroup,
  getApprovedGroups
};
