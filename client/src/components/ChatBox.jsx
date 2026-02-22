import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';

// Connect to the backend socket server
const socket = io('https://service-finder-app.onrender.com');

const ChatBox = ({ booking, onClose }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 1. Initial Data Load & Socket Connection
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('serviceFinderToken');
        const response = await fetch(`https://service-finder-app.onrender.com/api/chat/${booking._id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();

    // Join the specific real-time room for this booking
    socket.emit('join_chat_room', String(booking._id));

    // Listen for instant incoming messages
    socket.on('receive_message', (incomingMessage) => {
      setMessages((prevMessages) => [...prevMessages, incomingMessage]);
    });

    // Cleanup listener when chat is closed
    return () => {
      socket.off('receive_message');
    };
  }, [booking._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 2. Send Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    const textToSend = newMessage;
    setNewMessage('');

    try {
      const token = localStorage.getItem('serviceFinderToken');
      await fetch('https://service-finder-app.onrender.com/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bookingId: booking._id,
          sender: currentUser.name || currentUser.email.split('@')[0], // FIX 1: ADDED MISSING SENDER FIELD!
          text: textToSend
        })
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const chatPartnerName = currentUser.role === 'customer' ? booking.provider : booking.customerEmail.split('@')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[600px] max-h-[90vh] border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
        
        {/* Chat Header */}
        <div className="bg-primary p-4 flex justify-between items-center text-white shadow-md z-10">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg">
              {chatPartnerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold leading-tight">{chatPartnerName}</h3>
              <p className="text-xs text-blue-100">{booking.service}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-1.5 rounded-full transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-950 space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full text-slate-400">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-full text-slate-400 gap-2">
              <span className="material-symbols-outlined text-4xl">chat_bubble</span>
              <p className="text-sm">No messages yet. Say hello!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              // FIX 2: Correctly checking 'msg.sender' to align bubbles left or right
              const isMe = msg.sender === currentUser.name || msg.sender === currentUser.email.split('@')[0];
              
              return (
                <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] text-slate-400 mb-1 px-1">{msg.sender}</span>
                  <div className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-sm ${
                    isMe 
                      ? 'bg-primary text-white rounded-tr-sm shadow-sm' 
                      : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-tl-sm shadow-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..." 
              className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary dark:text-white outline-none"
            />
            <button 
              type="submit" 
              disabled={!newMessage.trim()}
              className="bg-primary text-white size-10 rounded-full flex items-center justify-center hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px] ml-1">send</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default ChatBox;