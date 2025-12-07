import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './Messages.css';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchConversations();
    fetchUnreadCount();
    
    // Poll for new messages every 10 seconds
    const interval = setInterval(() => {
      if (selectedConversation) {
        fetchMessages(selectedConversation.otherUserId);
      }
      fetchUnreadCount();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Handle URL params after conversations are loaded
  useEffect(() => {
    const userIdParam = searchParams.get('userId');
    if (userIdParam && conversations.length >= 0) {
      const userId = parseInt(userIdParam);
      const existingConv = conversations.find(c => c.otherUserId === userId);
      
      if (existingConv) {
        if (!selectedConversation || selectedConversation.otherUserId !== userId) {
          handleSelectConversation(existingConv);
        }
        navigate('/messages', { replace: true });
      } else if (userIdParam && !selectedConversation) {
        // Create new conversation object for new conversation
        const newConv = {
          otherUserId: userId,
          otherUserName: 'User',
          otherUserEmail: '',
          lastMessage: { messageText: '', createdAt: new Date().toISOString(), isFromMe: false },
          unreadCount: 0
        };
        setSelectedConversation(newConv);
        fetchMessages(userId);
        navigate('/messages', { replace: true });
      }
    }
  }, [conversations, searchParams]);

  useEffect(() => {
    // Handle URL params after conversations are loaded
    const userIdParam = searchParams.get('userId');
    if (userIdParam) {
      const userId = parseInt(userIdParam);
      
      if (conversations.length > 0) {
        const existingConv = conversations.find(c => c.otherUserId === userId);
        if (existingConv && (!selectedConversation || selectedConversation.otherUserId !== userId)) {
          handleSelectConversation(existingConv);
          navigate('/messages', { replace: true });
        } else if (!existingConv && (!selectedConversation || selectedConversation.otherUserId !== userId)) {
          // Create new conversation object for new conversation
          const newConv = {
            otherUserId: userId,
            otherUserName: 'User',
            otherUserEmail: '',
            lastMessage: { messageText: '', createdAt: new Date().toISOString(), isFromMe: false },
            unreadCount: 0
          };
          setSelectedConversation(newConv);
          fetchMessages(userId);
          navigate('/messages', { replace: true });
        }
      }
    }
  }, [conversations, searchParams]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/messages/conversations');
      if (response.data.success) {
        setConversations(response.data.conversations || []);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (otherUserId) => {
    try {
      const response = await api.get(`/messages/conversation/${otherUserId}`);
      if (response.data.success) {
        setMessages(response.data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/messages/unread-count');
      if (response.data.success) {
        setUnreadCount(response.data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.otherUserId);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSending(true);
      const applicationId = searchParams.get('applicationId');
      await api.post('/messages', {
        receiverId: selectedConversation.otherUserId,
        messageText: newMessage.trim(),
        subject: null,
        applicationId: applicationId ? parseInt(applicationId) : null
      });
      
      setNewMessage('');
      await fetchMessages(selectedConversation.otherUserId);
      await fetchConversations();
      await fetchUnreadCount();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="messages-page">
      <div className="messages-container">
        <div className="conversations-sidebar">
          <div className="messages-header">
            <h2>Messages</h2>
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount}</span>
            )}
          </div>
          
          {loading ? (
            <LoadingSpinner message="Loading conversations..." />
          ) : conversations.length === 0 ? (
            <div className="empty-conversations">
              <p>No conversations yet</p>
              <p className="empty-hint">Start a conversation from an application or job posting</p>
            </div>
          ) : (
            <div className="conversations-list">
              {conversations.map((conv) => (
                <div
                  key={conv.otherUserId}
                  className={`conversation-item ${selectedConversation?.otherUserId === conv.otherUserId ? 'active' : ''}`}
                  onClick={() => handleSelectConversation(conv)}
                >
                  <div className="conversation-info">
                    <h4>{conv.otherUserName}</h4>
                    <p className="last-message-preview">
                      {conv.lastMessage.isFromMe ? 'You: ' : ''}
                      {conv.lastMessage.messageText?.substring(0, 50)}
                      {conv.lastMessage.messageText?.length > 50 ? '...' : ''}
                    </p>
                    <span className="conversation-time">
                      {formatTime(conv.lastMessage.createdAt)}
                    </span>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="conversation-unread">{conv.unreadCount}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="messages-main">
          {selectedConversation ? (
            <>
              <div className="messages-header-bar">
                <h3>{selectedConversation.otherUserName}</h3>
                <span className="user-email">{selectedConversation.otherUserEmail}</span>
              </div>

              <div className="messages-list" id="messages-list">
                {messages.map((msg) => (
                  <div
                    key={msg.messageId}
                    className={`message-item ${msg.isFromMe ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">
                      <p>{msg.messageText}</p>
                      <span className="message-time">{formatTime(msg.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="message-input-form">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="message-input"
                  disabled={sending}
                />
                <button type="submit" className="send-button" disabled={sending || !newMessage.trim()}>
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </form>
            </>
          ) : (
            <div className="no-conversation-selected">
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;

