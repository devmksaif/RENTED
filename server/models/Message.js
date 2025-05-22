const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Update conversation's last message when a new message is created
messageSchema.post('save', async function() {
  const Conversation = mongoose.model('Conversation');
  
  try {
    const conversation = await Conversation.findById(this.conversation);
    
    if (conversation) {
      // Update last message
      conversation.lastMessage = {
        content: this.content,
        sender: this.sender,
        createdAt: this.createdAt
      };
      
      // Increment unread count for all participants except sender
      conversation.participants.forEach(participant => {
        if (participant.toString() !== this.sender.toString()) {
          const currentCount = conversation.unreadCount.get(participant.toString()) || 0;
          conversation.unreadCount.set(participant.toString(), currentCount + 1);
        }
      });
      
      await conversation.save();
    }
  } catch (error) {
    console.error('Error updating conversation:', error);
  }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;