const Group = require('../models/GroupModel');
const User = require('../models/UserModel');

const createGroup = async (req, res) => {
  try {
    const { title, subject, description, image, maxMembers } = req.body;
    
    // Check if the user is an admin and auto-approve their groups
    const groupStatus = req.user.role === 'admin' ? 'approved' : 'pending';
    
    const group = new Group({
      title,
      subject,
      description,
      image: image || 'https://via.placeholder.com/300x200?text=Study+Group',
      creator: req.user._id,
      members: [req.user._id], // Add creator as member by default
      maxMembers: maxMembers || 50,
      status: groupStatus // Auto-approve if admin, otherwise pending
    });

    await group.save();

    // Add group to user's createdGroups and joinedGroups
    await User.findByIdAndUpdate(req.user._id, {
      $push: { 
        createdGroups: group._id,
        joinedGroups: group._id 
      }
    });

    // Different success messages based on user role
    const message = req.user.role === 'admin' 
      ? 'Study group created and automatically approved!'
      : 'Study group created successfully and awaiting approval';

    res.status(201).json({
      message,
      group
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find({ status: 'approved' })
      .populate('creator', 'name email')
      .populate('members', 'name email')
      .sort({ createdAt: -1 });

    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('creator', 'name email')
      .populate('members', 'name email')
      .populate('messages.user', 'name')
      .populate('materials.uploadedBy', 'name');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const joinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.status !== 'approved') {
      return res.status(400).json({ message: 'Group is not approved yet' });
    }

    if (group.members.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already a member of this group' });
    }

    if (group.members.length >= group.maxMembers) {
      return res.status(400).json({ message: 'Group is full' });
    }

    group.members.push(req.user._id);
    await group.save();

    await User.findByIdAndUpdate(req.user._id, {
      $push: { joinedGroups: group._id }
    });

    res.json({ message: 'Successfully joined the group' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!group.members.includes(req.user._id)) {
      return res.status(400).json({ message: 'You are not a member of this group' });
    }

    // Don't allow creator to leave their own group
    if (group.creator.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Group creator cannot leave the group. Delete the group instead.' });
    }

    group.members = group.members.filter(member => member.toString() !== req.user._id.toString());
    await group.save();

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { joinedGroups: group._id }
    });

    res.json({ message: 'Successfully left the group' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is creator or admin
    if (group.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only group creator or admin can edit this group' });
    }

    const { title, subject, description, image, maxMembers } = req.body;

    group.title = title || group.title;
    group.subject = subject || group.subject;
    group.description = description || group.description;
    group.image = image || group.image;
    group.maxMembers = maxMembers || group.maxMembers;

    await group.save();

    res.json({ message: 'Group updated successfully', group });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is creator or admin
    if (group.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only group creator or admin can delete this group' });
    }

    // Remove group from all members' joinedGroups
    await User.updateMany(
      { joinedGroups: group._id },
      { $pull: { joinedGroups: group._id } }
    );

    // Remove group from creator's createdGroups
    await User.findByIdAndUpdate(group.creator, {
      $pull: { createdGroups: group._id }
    });

    await Group.findByIdAndDelete(req.params.id);

    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const postMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!group.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'You must be a member to post messages' });
    }

    group.messages.push({
      user: req.user._id,
      content,
      timestamp: new Date()
    });

    await group.save();
    
    const updatedGroup = await Group.findById(req.params.id)
      .populate('messages.user', 'name');

    res.json({ 
      message: 'Message posted successfully', 
      messages: updatedGroup.messages 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const addMaterial = async (req, res) => {
  try {
    const { title, url } = req.body;
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!group.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'You must be a member to add materials' });
    }

    group.materials.push({
      title,
      url,
      uploadedBy: req.user._id,
      uploadedAt: new Date()
    });

    await group.save();
    
    const updatedGroup = await Group.findById(req.params.id)
      .populate('materials.uploadedBy', 'name');

    res.json({ 
      message: 'Material added successfully', 
      materials: updatedGroup.materials 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createGroup,
  getAllGroups,
  getGroupById,
  joinGroup,
  leaveGroup,
  updateGroup,
  deleteGroup,
  postMessage,
  addMaterial
};
