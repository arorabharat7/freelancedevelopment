// components/Chat.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Message {
  id: string;
  userId: string;
  content: string;
  timestamp: Date;
}

interface ChatProps {
  userId: string; // The user you are chatting with
  loggedInUserId: string | null; // The currently logged-in user
  onClose: () => void;
}

const Chat: React.FC<ChatProps> = ({ userId, loggedInUserId, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    // Fetch initial messages between the current user and the chat user
    const fetchMessages = async () => {
      try {
        const response = await axios.get('/api/chat/messages', {
          params: { userId: loggedInUserId, chatUserId: userId },
        });
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    if (loggedInUserId) {
      fetchMessages();
    }
  }, [userId, loggedInUserId]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '' || !loggedInUserId) return;

    const message = {
      userId: loggedInUserId,
      content: newMessage,
    };

    
    try {
      // Send the message to the serverless function
      const response = await axios.post('/api/chat/messages', {
        user1: loggedInUserId,
        user2: userId,
        message,
      });

      // Clear the input field
      setNewMessage('');

      // Update the local state with the new message
      setMessages((prevMessages) => [
        ...prevMessages,
        { ...response.data, id: Date.now().toString(), timestamp: new Date() },
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '1rem' }}>
      <div>
        {messages.map((msg) => (
          <div key={msg.id}>
            <strong>{msg.userId === loggedInUserId ? 'You' : userId}</strong>: {msg.content}{' '}
            <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type your message..."
      />
      <button onClick={handleSendMessage}>Send</button>
      <button onClick={onClose}>Close Chat</button>
    </div>
  );
};

export default Chat;
