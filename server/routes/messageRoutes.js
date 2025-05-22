const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

// Apply auth middleware to all routes
router.use(auth);

// Get all conversations for the current user
router.get('/conversations', auth,  async (req, res) => {
  try {
    // Find all conversations where the user is a participant
    const conversations = await Conversation.find({
      participants: req.user._id
    })
    .populate('participants', 'name email')
    .sort({ updatedAt: -1 });
    
    // Format the response to include the other user and unread count
    const formattedConversations = await Promise.all(conversations.map(async (conversation) => {
      const otherUser = conversation.participants.find(
        participant => participant.toString() !== req.user._id.toString()
      );
      
      // Get unread count for current user
      const unreadCount = conversation.unreadCount.get(req.user._id.toString()) || 0;
      
      return {
        _id: conversation._id,
        otherUser: {
          _id: otherUser._id,
          name: otherUser.name,
          email: otherUser.email,
          isOnline: false // This would be updated with socket.io
        },
        lastMessage: conversation.lastMessage,
        unreadCount,
        updatedAt: conversation.updatedAt
      };
    }));
    
    res.json(formattedConversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Error fetching conversations', error: error.message });
  }
});

// Get messages for a specific conversation
router.get('/conversations/:id', async (req, res) => {
  try {
    const conversationId = req.params.id;
    
    // Validate conversation exists and user is a participant
    const conversation = await Conversation.findById(conversationId)
      .populate('participants', 'name email');
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    if (!conversation.participants.some(p => p._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized to view this conversation' });
    }
    
    // Get the other user in the conversation
    const otherUser = conversation.participants.find(
      participant => participant._id.toString() !== req.user._id.toString()
    );
    const otherInfo = User.findById(otherUser);
    
    // Get messages
    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name')
      .sort({ createdAt: 1 });
    
    // Mark messages as read
    if (messages.length > 0) {
      await Message.updateMany(
        { 
          conversation: conversationId,
          sender: { $ne: req.user._id },
          isRead: false
        },
        { isRead: true }
      );
      
      // Reset unread count for this user
      conversation.unreadCount.set(req.user._id.toString(), 0);
      await conversation.save();
    }
    
    // Format messages to indicate if current user is the sender
    const formattedMessages = messages.map(message => ({
      _id: message._id,
      content: message.content,
      sender: message.sender,
      isCurrentUser: message.sender._id.toString() === req.user._id.toString(),
      createdAt: message.createdAt,
      isRead: message.isRead
    }));
    
    res.json({
      conversation: {
        _id: conversation._id,
        otherUser: {
          _id: otherInfo._id,
          name: otherInfo.name,
          email: otherInfo.email,
          isOnline: false // This would be updated with socket.io
        },
        product: conversation.product
      },
      messages: formattedMessages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
});

// Send a message
router.post('/send', async (req, res) => {
  try {
    const { recipientId, content, productId } = req.body;
    console.log(recipientId,content)
    if (!recipientId || !content) {
      return res.status(400).json({ message: 'Recipient and message content are required' });
    }
    
    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }
    
    // Find existing conversation or create a new one
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, recipientId] }
    });
    
    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        participants: [req.user._id, recipientId],
        lastMessage: {
          content,
          sender: req.user._id,
          createdAt: new Date()
        },
        unreadCount: new Map([[recipientId, 1]]),
        product: productId || null
      });
      
      await conversation.save();
    } else {
      // Update last message and increment unread count
      conversation.lastMessage = {
        content,
        sender: req.user._id,
        createdAt: new Date()
      };
      const currentUnreadCount = conversation.unreadCount.get(recipientId) || 0;
      conversation.unreadCount.set(recipientId, currentUnreadCount + 1);
      await conversation.save();
    }
    
    // Create new message
    const message = new Message({
      conversation: conversation._id,
      sender: req.user._id,
      content,
      isRead: false
    });
    
    await message.save();
    
    // Populate sender info for response
    await message.populate('sender', 'name');
    
    res.status(201).json({
      _id: message._id,
      content: message.content,
      sender: message.sender,
      isCurrentUser: true,
      createdAt: message.createdAt,
      isRead: message.isRead,
      conversationId: conversation._id
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
});

// Mark all messages in a conversation as read
router.patch('/conversations/:id/read', auth, async (req, res) => {
  try {
    const conversationId = req.params.id;
    
    // Validate conversation exists and user is a participant
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    if (!conversation.participants.some(p => p.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized to access this conversation' });
    }
    
    // Mark all messages from other users as read
    await Message.updateMany(
      { 
        conversation: conversationId,
        sender: { $ne: req.user._id },
        isRead: false
      },
      { isRead: true }
    );
    
    // Reset unread count for this user
    conversation.unreadCount.set(req.user._id.toString(), 0);
    await conversation.save();
    
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Error marking messages as read', error: error.message });
  }
});

module.exports = router;