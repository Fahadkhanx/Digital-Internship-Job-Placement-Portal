import React, { useState, useEffect, useRef } from 'react';
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
  const fileInputRef = useRef(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    description: '',
    scheduledAt: '',
    durationMinutes: 30
  });
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [isInCall, setIsInCall] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const lastMessageCountRef = useRef(0);
  const shouldAutoScrollRef = useRef(true);

  useEffect(() => {
    fetchConversations();
    fetchUnreadCount();
    
    // Real-time polling: Check for new messages every 2 seconds (WhatsApp-like)
    const interval = setInterval(() => {
      if (selectedConversation) {
        // Check scroll position before fetching - don't scroll if user scrolled up
        const wasAtBottom = isNearBottom();
        shouldAutoScrollRef.current = wasAtBottom;
        // Don't force scroll during polling - only fetch messages
        // Auto-scroll will happen automatically via useEffect if user is at bottom and new messages arrive
        fetchMessages(selectedConversation.otherUserId, false);
      }
      fetchUnreadCount();
      fetchConversations(); // Update conversation list for new messages indicator
    }, 2000); // 2 seconds for real-time feel

    return () => clearInterval(interval);
  }, [selectedConversation]);

  // Check if user is near bottom of messages
  const isNearBottom = () => {
    if (!messagesContainerRef.current) return true;
    const container = messagesContainerRef.current;
    const threshold = 150; // 150px from bottom
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    return distanceFromBottom < threshold;
  };

  // Handle scroll events to track if user is at bottom
  const handleScroll = () => {
    shouldAutoScrollRef.current = isNearBottom();
  };

  useEffect(() => {
    // Only auto-scroll if user explicitly wants it (at bottom) AND new messages arrived
    const currentMessageCount = messages.length;
    const hadNewMessages = currentMessageCount > lastMessageCountRef.current;
    
    // Only scroll if:
    // 1. This is the first load (lastMessageCountRef is 0), OR
    // 2. User is at bottom AND new messages arrived
    if (lastMessageCountRef.current === 0) {
      // First load - always scroll to bottom
      requestAnimationFrame(() => {
        scrollToBottom(true);
        shouldAutoScrollRef.current = true;
      });
    } else if (hadNewMessages && shouldAutoScrollRef.current) {
      // New messages arrived and user is at bottom - scroll
      requestAnimationFrame(() => {
        scrollToBottom(true);
      });
    }
    
    lastMessageCountRef.current = currentMessageCount;
  }, [messages]);

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

  const scrollToBottom = (instant = false) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: instant ? 'instant' : 'smooth' });
    }
  };

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

  const fetchMessages = async (otherUserId, shouldScroll = false) => {
    try {
      const response = await api.get(`/messages/conversation/${otherUserId}`);
      if (response.data.success) {
        const newMessages = response.data.messages || [];
        const previousCount = messages.length;
        const hasNewMessages = newMessages.length > previousCount;
        
        // Always update messages - useEffect will handle scrolling intelligently
        setMessages(newMessages);
        
        // Only manually scroll if explicitly requested (e.g., when user sends message)
        if (shouldScroll) {
          shouldAutoScrollRef.current = true;
          requestAnimationFrame(() => {
            scrollToBottom(true);
          });
        }
        // Otherwise, let useEffect handle scrolling based on scroll position
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
    shouldAutoScrollRef.current = true; // Reset when selecting new conversation
    lastMessageCountRef.current = 0; // Reset message count for new conversation
    fetchMessages(conversation.otherUserId, true); // Scroll when selecting conversation
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB');
      return;
    }

    try {
      setUploadingFile(true);
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await api.post('/messages/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (uploadResponse.data.success) {
        const { fileUrl, fileName, fileType, fileSize, messageType } = uploadResponse.data;
        
        // Send message with file
        const applicationId = searchParams.get('applicationId');
        await api.post('/messages', {
          receiverId: selectedConversation.otherUserId,
          messageText: `📎 ${fileName}`,
          subject: null,
          applicationId: applicationId ? parseInt(applicationId) : null,
          messageType: messageType,
          fileUrl: fileUrl,
          fileName: fileName,
          fileType: fileType,
          fileSize: fileSize
        });

        toast.success('File sent successfully');
        shouldAutoScrollRef.current = true; // User sent file, scroll to bottom
        await fetchMessages(selectedConversation.otherUserId, true);
        await fetchConversations();
        await fetchUnreadCount();
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      // Use the best supported MIME type
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        mimeType = 'audio/ogg;codecs=opus';
      }
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType,
        audioBitsPerSecond: 128000 // 128 kbps for good quality
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      const streamRef = stream; // Store stream reference

      // Collect data every 100ms to ensure all data is captured
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log('Audio chunk received:', event.data.size, 'bytes');
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('Recording stopped. Total chunks:', audioChunksRef.current.length);
        
        // Wait a bit for any remaining data to be collected
        await new Promise(resolve => setTimeout(resolve, 200));
        
        if (audioChunksRef.current.length === 0) {
          toast.error('No audio recorded. Please try again.');
          streamRef.getTracks().forEach(track => track.stop());
          return;
        }
        
        // Verify chunks have data
        const totalSize = audioChunksRef.current.reduce((sum, chunk) => sum + chunk.size, 0);
        console.log('Total chunks size:', totalSize, 'bytes');
        
        if (totalSize === 0) {
          toast.error('No audio data recorded. Please try again.');
          streamRef.getTracks().forEach(track => track.stop());
          audioChunksRef.current = [];
          return;
        }
        
        // Create blob with all chunks
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        console.log('Audio blob created:', audioBlob.size, 'bytes', 'Type:', mimeType);
        
        // Verify blob is not empty and has reasonable size
        if (audioBlob.size < 500) {
          toast.error('Recording too short or empty. Please record again.');
          streamRef.getTracks().forEach(track => track.stop());
          audioChunksRef.current = [];
          return;
        }
        
        // Test if blob is valid by creating an object URL
        const testUrl = URL.createObjectURL(audioBlob);
        const testAudio = new Audio(testUrl);
        
        testAudio.onerror = () => {
          console.error('Invalid audio blob detected');
          URL.revokeObjectURL(testUrl);
          toast.error('Recording failed. Please try again.');
          streamRef.getTracks().forEach(track => track.stop());
          audioChunksRef.current = [];
        };
        
        testAudio.onloadedmetadata = async () => {
          URL.revokeObjectURL(testUrl);
          console.log('Audio blob is valid, duration:', testAudio.duration, 'seconds');
          
          await sendVoiceMessage(audioBlob, mimeType);
          
          // Stop all tracks
          streamRef.getTracks().forEach(track => track.stop());
          audioChunksRef.current = [];
        };
        
        // If metadata doesn't load within 2 seconds, proceed anyway (some formats don't support metadata)
        setTimeout(async () => {
          if (testAudio.readyState === 0) {
            URL.revokeObjectURL(testUrl);
            console.log('Proceeding with upload (metadata check timeout)');
            try {
              await sendVoiceMessage(audioBlob, mimeType);
            } finally {
              streamRef.getTracks().forEach(track => track.stop());
              audioChunksRef.current = [];
            }
          }
        }, 2000);
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        toast.error('Recording error occurred');
        streamRef.getTracks().forEach(track => track.stop());
        setIsRecording(false);
      };

      // Start recording with timeslice to ensure data is collected regularly
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      toast.info('Recording started... Release to send');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Failed to access microphone. Please allow microphone access.');
      setIsRecording(false);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        // Request final data before stopping
        if (mediaRecorderRef.current.state === 'recording') {
          // Request data multiple times to ensure all data is captured
          mediaRecorderRef.current.requestData();
          setTimeout(() => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
              mediaRecorderRef.current.requestData();
            }
          }, 50);
        }
        
        // Small delay before stopping to ensure data is collected
        setTimeout(() => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
          }
          setIsRecording(false);
          toast.info('Processing voice message...');
        }, 100);
      } catch (error) {
        console.error('Error stopping recording:', error);
        setIsRecording(false);
      }
    }
  };

  const sendVoiceMessage = async (audioBlob, mimeType = 'audio/webm') => {
    if (!selectedConversation) return;

    try {
      setUploadingFile(true);
      const formData = new FormData();
      
      // Determine file extension based on MIME type
      let extension = 'webm';
      if (mimeType.includes('mp4')) extension = 'm4a';
      else if (mimeType.includes('ogg')) extension = 'ogg';
      else if (mimeType.includes('wav')) extension = 'wav';
      
      const audioFile = new File([audioBlob], `voice_${Date.now()}.${extension}`, { type: mimeType });
      formData.append('file', audioFile);
      
      console.log('Uploading voice file:', audioFile.name, audioFile.size, 'bytes', audioFile.type);
      
      // Verify file size before upload
      if (audioFile.size < 1000) {
        toast.error('Recording is too short. Please record again.');
        setUploadingFile(false);
        return;
      }

      const uploadResponse = await api.post('/messages/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (uploadResponse.data.success) {
        const { fileUrl, fileName, fileType, fileSize, messageType } = uploadResponse.data;
        
        const applicationId = searchParams.get('applicationId');
        await api.post('/messages', {
          receiverId: selectedConversation.otherUserId,
          messageText: '🎤 Voice message',
          subject: null,
          applicationId: applicationId ? parseInt(applicationId) : null,
          messageType: messageType,
          fileUrl: fileUrl,
          fileName: fileName,
          fileType: fileType,
          fileSize: fileSize
        });

        toast.success('Voice message sent');
        shouldAutoScrollRef.current = true; // User sent voice, scroll to bottom
        await fetchMessages(selectedConversation.otherUserId, true);
        await fetchConversations();
        await fetchUnreadCount();
      }
    } catch (error) {
      console.error('Error sending voice message:', error);
      toast.error('Failed to send voice message');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !uploadingFile) || !selectedConversation) return;

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
      shouldAutoScrollRef.current = true; // User sent message, scroll to bottom
      await fetchMessages(selectedConversation.otherUserId, true);
      await fetchConversations();
      await fetchUnreadCount();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleScheduleMeeting = async (e) => {
    e.preventDefault();
    if (!selectedConversation) return;

    try {
      // Validate form
      if (!meetingForm.title.trim()) {
        toast.error('Meeting title is required');
        return;
      }

      if (!meetingForm.scheduledAt) {
        toast.error('Date and time is required');
        return;
      }

      // Convert local datetime to ISO string
      const scheduledDate = new Date(meetingForm.scheduledAt);
      if (isNaN(scheduledDate.getTime())) {
        toast.error('Invalid date format');
        return;
      }

      // Check if date is in the future (allow 1 minute buffer for instant meetings)
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60000);
      if (scheduledDate < oneMinuteAgo) {
        toast.error('Meeting time must be in the future');
        return;
      }

      const applicationId = searchParams.get('applicationId');
      const response = await api.post('/meetings', {
        participantId: selectedConversation.otherUserId,
        title: meetingForm.title.trim(),
        description: meetingForm.description?.trim() || null,
        scheduledAt: scheduledDate.toISOString(),
        durationMinutes: parseInt(meetingForm.durationMinutes) || 30,
        applicationId: applicationId ? parseInt(applicationId) : null
      });

      if (response.data.success) {
        const meetingId = response.data.data.meetingId;
        
        // Generate meeting link for scheduled meeting
        try {
          const linkResponse = await api.post(`/meetings/${meetingId}/generate-link`);
          if (linkResponse.data.success) {
            const meetingLink = linkResponse.data.meetingLink;
            const fullMeetingLink = `${window.location.origin}${meetingLink}`;
            
            // Send meeting link as message
            try {
              await api.post('/messages', {
                receiverId: selectedConversation.otherUserId,
                messageText: `📅 Meeting scheduled: "${response.data.data.title}"\n📆 Date: ${new Date(response.data.data.scheduledAt).toLocaleString()}\n⏱️ Duration: ${response.data.data.durationMinutes} minutes\n\nJoin here: ${fullMeetingLink}`,
                subject: 'Meeting Scheduled',
                applicationId: searchParams.get('applicationId') ? parseInt(searchParams.get('applicationId')) : null,
                messageType: 'Meeting'
              });
            } catch (msgError) {
              console.error('Error sending meeting link message:', msgError);
              // Continue even if message sending fails
            }
          }
        } catch (linkError) {
          console.error('Error generating meeting link:', linkError);
          // Continue even if link generation fails
        }
        
        toast.success('Meeting scheduled successfully');
        setShowMeetingModal(false);
        setMeetingForm({
          title: '',
          description: '',
          scheduledAt: '',
          durationMinutes: 30
        });
        // Refresh messages to show meeting notification (don't scroll)
        await fetchMessages(selectedConversation.otherUserId, false);
      }
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      const errorMessage = error.response?.data?.message || 'Failed to schedule meeting';
      toast.error(errorMessage);
    }
  };

  const handleStartVideoCall = async () => {
    if (!selectedConversation) return;
    
    try {
      // Check browser support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error('Your browser does not support video calling. Please use a modern browser.');
        return;
      }

      // Generate meeting link for instant video call
      // Use current time + 1 minute to ensure it's not rejected as past time
      const scheduledTime = new Date(Date.now() + 60000).toISOString();
      
      const response = await api.post('/meetings', {
        participantId: selectedConversation.otherUserId,
        title: 'Video Call',
        description: 'Instant video call',
        scheduledAt: scheduledTime,
        durationMinutes: 60,
        applicationId: searchParams.get('applicationId') ? parseInt(searchParams.get('applicationId')) : null
      });

      if (response.data.success) {
        const meetingId = response.data.data.meetingId;
        const linkResponse = await api.post(`/meetings/${meetingId}/generate-link`);
        
        if (linkResponse.data.success) {
          const meetingLink = linkResponse.data.meetingLink;
          const meetingIdExternal = linkResponse.data.meetingIdExternal;
          const fullMeetingLink = `${window.location.origin}${meetingLink}`;
          
          console.log('✅ Video call meeting created:', {
            meetingId,
            meetingIdExternal,
            meetingLink,
            fullMeetingLink
          });
          
          // Send meeting link as message
          try {
            await api.post('/messages', {
              receiverId: selectedConversation.otherUserId,
              messageText: `📹 Video call started. Click to join: ${fullMeetingLink}`,
              subject: 'Video Call Invitation',
              applicationId: searchParams.get('applicationId') ? parseInt(searchParams.get('applicationId')) : null,
              messageType: 'Meeting'
            });
            console.log('✅ Meeting link sent as message');
          } catch (msgError) {
            console.error('Error sending meeting link message:', msgError);
            // Continue even if message sending fails
          }

          // Navigate to video call page immediately
          console.log('🚀 Navigating to video call page:', meetingLink);
          navigate(meetingLink);
          
          // OLD CODE - Keep for reference but don't use
          // Start video call UI
          // setShowVideoCall(true);
          // setIsInCall(true);
          
          // Initialize video after UI is ready
          setTimeout(() => {
            initializeVideoCall();
          }, 100);
          
          // Refresh messages (don't scroll for video call)
          await fetchMessages(selectedConversation.otherUserId, false);
        } else {
          toast.error('Failed to generate meeting link');
        }
      } else {
        toast.error('Failed to create meeting');
      }
    } catch (error) {
      console.error('Error starting video call:', error);
      toast.error(error.response?.data?.message || 'Failed to start video call');
      setShowVideoCall(false);
      setIsInCall(false);
    }
  };

  const initializeVideoCall = async () => {
    try {
      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error('Your browser does not support video calling.');
        setShowVideoCall(false);
        setIsInCall(false);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch(err => {
          console.error('Error playing local video:', err);
        });
      }

      // Store stream for cleanup
      window.currentVideoStream = stream;

      toast.info('Video call started. Share the meeting link from chat to invite participant.');
      
    } catch (error) {
      console.error('Error accessing camera/microphone:', error);
      let errorMessage = 'Failed to access camera/microphone.';
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera/microphone access denied. Please allow access in browser settings.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera/microphone found. Please connect a device.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera/microphone is being used by another application.';
      }
      toast.error(errorMessage);
      setShowVideoCall(false);
      setIsInCall(false);
    }
  };

  const handleEndCall = () => {
    // Stop local video stream
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject;
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped track:', track.kind);
      });
      localVideoRef.current.srcObject = null;
    }
    
    // Stop remote video stream
    if (remoteVideoRef.current?.srcObject) {
      const stream = remoteVideoRef.current.srcObject;
      stream.getTracks().forEach(track => track.stop());
      remoteVideoRef.current.srcObject = null;
    }
    
    // Stop any stored stream
    if (window.currentVideoStream) {
      window.currentVideoStream.getTracks().forEach(track => track.stop());
      window.currentVideoStream = null;
    }
    
    setShowVideoCall(false);
    setIsInCall(false);
    toast.info('Video call ended');
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

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getFileIcon = (messageType, fileType) => {
    if (messageType === 'image') return '🖼️';
    if (messageType === 'video') return '🎥';
    if (messageType === 'voice') return '🎤';
    return '📄';
  };

  const renderMessageAttachment = (msg) => {
    if (!msg.fileUrl) return null;

    const apiBaseUrl = 'http://localhost:5000';
    const fullUrl = msg.fileUrl.startsWith('http') ? msg.fileUrl : `${apiBaseUrl}${msg.fileUrl}`;

    // Normalize messageType to lowercase for comparison
    const messageType = (msg.messageType || '').toLowerCase();

    // Also check fileType and fileName for voice messages (fallback)
    const isVoiceMessage = messageType === 'voice' || 
                          (msg.fileType && msg.fileType.toLowerCase().startsWith('audio/')) ||
                          (msg.fileName && (msg.fileName.toLowerCase().includes('voice') || 
                                           msg.fileName.toLowerCase().endsWith('.webm') ||
                                           msg.fileName.toLowerCase().endsWith('.m4a') ||
                                           msg.fileName.toLowerCase().endsWith('.ogg') ||
                                           msg.fileName.toLowerCase().endsWith('.wav')));

    // Debug logging for voice messages
    if (msg.fileName && msg.fileName.toLowerCase().includes('voice')) {
      console.log('Voice message detected:', {
        messageType: msg.messageType,
        fileType: msg.fileType,
        fileName: msg.fileName,
        isVoiceMessage: isVoiceMessage,
        normalizedMessageType: messageType
      });
    }

    if (messageType === 'image' || (msg.fileType && msg.fileType.toLowerCase().startsWith('image/'))) {
      return (
        <div className="message-attachment image-preview">
          <img 
            src={fullUrl} 
            alt={msg.fileName || 'Image'} 
            className="attachment-image"
            onClick={() => {
              // Open image in modal for full view
              const modal = document.createElement('div');
              modal.className = 'image-modal-overlay';
              modal.innerHTML = `
                <div class="image-modal-content">
                  <button class="image-modal-close" onclick="this.closest('.image-modal-overlay').remove()">×</button>
                  <img src="${fullUrl}" alt="${msg.fileName || 'Image'}" />
                </div>
              `;
              document.body.appendChild(modal);
              modal.onclick = (e) => {
                if (e.target === modal) modal.remove();
              };
            }}
          />
          {msg.fileName && (
            <div className="image-info">
              <span>{msg.fileName}</span>
              {msg.fileSize && (
                <span className="image-size">({(msg.fileSize / 1024).toFixed(1)} KB)</span>
              )}
            </div>
          )}
        </div>
      );
    }

    if (messageType === 'video' || (msg.fileType && msg.fileType.toLowerCase().startsWith('video/'))) {
      return (
        <div className="message-attachment video-preview">
          <video 
            src={fullUrl} 
            controls 
            className="attachment-video"
            preload="metadata"
            playsInline
          >
            Your browser does not support video playback.
          </video>
          <div className="video-info">
            <span className="video-icon">🎥</span>
            <span className="video-label">{msg.fileName || 'Video'}</span>
            {msg.fileSize && (
              <span className="video-size">({(msg.fileSize / (1024 * 1024)).toFixed(2)} MB)</span>
            )}
          </div>
        </div>
      );
    }

    if (isVoiceMessage) {
      return (
        <div 
          className="message-attachment voice-message-whatsapp"
          onContextMenu={(e) => {
            // Prevent right-click menu
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <div className="voice-player-container">
            <button 
              className="voice-play-button"
              type="button"
              style={{
                display: 'flex',
                visibility: 'visible',
                opacity: 1,
                zIndex: 100
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const audio = e.target.closest('.voice-message-whatsapp').querySelector('audio');
                if (audio) {
                  if (audio.paused) {
                    audio.play().catch(err => {
                      console.error('Error playing audio:', err);
                      toast.error('Failed to play voice message');
                    });
                    const button = e.target.closest('.voice-play-button');
                    if (button) button.textContent = '⏸️';
                  } else {
                    audio.pause();
                    const button = e.target.closest('.voice-play-button');
                    if (button) button.textContent = '▶️';
                  }
                }
              }}
            >
              ▶️
            </button>
            <audio 
              src={fullUrl} 
              className="voice-audio-hidden"
              preload="metadata"
              controlsList="nodownload nofullscreen noremoteplayback"
              controls={false}
              playsInline
              onContextMenu={(e) => {
                e.preventDefault(); // Prevent right-click menu
                e.stopPropagation();
                return false;
              }}
              onDoubleClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                return false;
              }}
              onAuxClick={(e) => {
                // Prevent middle-click or right-click navigation
                e.preventDefault();
                e.stopPropagation();
                return false;
              }}
              onTimeUpdate={(e) => {
                const audio = e.target;
                const container = audio.closest('.voice-message-whatsapp');
                const progress = container?.querySelector('.voice-progress');
                const duration = container?.querySelector('.voice-duration');
                if (progress && audio.duration) {
                  const percent = (audio.currentTime / audio.duration) * 100;
                  progress.style.width = `${percent}%`;
                }
                if (duration && audio.duration) {
                  const current = formatDuration(audio.currentTime);
                  const total = formatDuration(audio.duration);
                  duration.textContent = `${current} / ${total}`;
                }
              }}
              onEnded={(e) => {
                const container = e.target.closest('.voice-message-whatsapp');
                const button = container?.querySelector('.voice-play-button');
                if (button) button.textContent = '▶️';
                const progress = container?.querySelector('.voice-progress');
                if (progress) progress.style.width = '0%';
              }}
              onLoadedMetadata={(e) => {
                const container = e.target.closest('.voice-message-whatsapp');
                const duration = container?.querySelector('.voice-duration');
                if (duration && e.target.duration) {
                  duration.textContent = `0:00 / ${formatDuration(e.target.duration)}`;
                }
              }}
              onError={(e) => {
                console.error('Audio playback error:', e);
                toast.error('Failed to load voice message');
              }}
              onPlay={(e) => {
                const container = e.target.closest('.voice-message-whatsapp');
                const button = container?.querySelector('.voice-play-button');
                if (button) button.textContent = '⏸️';
              }}
              onPause={(e) => {
                const container = e.target.closest('.voice-message-whatsapp');
                const button = container?.querySelector('.voice-play-button');
                if (button) button.textContent = '▶️';
              }}
            />
            <div className="voice-waveform">
              <div className="voice-progress-bar">
                <div className="voice-progress"></div>
              </div>
              <div className="voice-info">
                <span className="voice-duration">0:00 / 0:00</span>
                {msg.fileSize && (
                  <span className="voice-size">{(msg.fileSize / 1024).toFixed(1)} KB</span>
                )}
              </div>
            </div>
          </div>
          {/* Download button - download only, no navigation */}
          <button
            type="button"
            className="voice-download-link"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Create temporary link for download (no new tab)
              const link = document.createElement('a');
              link.href = fullUrl;
              link.download = msg.fileName || 'voice-message.webm';
              // Don't use target="_blank" to prevent new tab
              document.body.appendChild(link);
              link.click();
              setTimeout(() => {
                document.body.removeChild(link);
              }, 100);
            }}
            title="Download voice message"
          >
            ⬇️
          </button>
        </div>
      );
    }

    return (
      <div className="message-attachment">
        <div className="attachment-document">
          <span className="attachment-icon">{getFileIcon(msg.messageType, msg.fileType)}</span>
          <div className="attachment-info">
            <span className="attachment-name">{msg.fileName || 'Document'}</span>
            {msg.fileSize && (
              <span className="attachment-size">{(msg.fileSize / 1024).toFixed(2)} KB</span>
            )}
          </div>
          <button
            type="button"
            className="attachment-download-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Create temporary link for download (no new tab)
              const link = document.createElement('a');
              link.href = fullUrl;
              link.download = msg.fileName || 'document';
              document.body.appendChild(link);
              link.click();
              setTimeout(() => {
                document.body.removeChild(link);
              }, 100);
            }}
            title="Download document"
          >
            ⬇️
          </button>
        </div>
      </div>
    );
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
                <div className="header-info">
                  <h3>{selectedConversation.otherUserName}</h3>
                  <span className="user-email">{selectedConversation.otherUserEmail}</span>
                </div>
                <div className="header-actions">
                  <button 
                    className="action-btn video-call-btn" 
                    onClick={handleStartVideoCall}
                    title="Start Video Call"
                  >
                    📹 Video Call
                  </button>
                  <button 
                    className="action-btn meeting-btn" 
                    onClick={() => setShowMeetingModal(true)}
                    title="Schedule Meeting"
                  >
                    📅 Schedule Meeting
                  </button>
                </div>
              </div>

              <div 
                className="messages-list" 
                id="messages-list"
                ref={messagesContainerRef}
                onScroll={handleScroll}
              >
                {messages.map((msg) => (
                  <div
                    key={msg.messageId}
                    className={`message-item ${msg.isFromMe ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">
                      {msg.messageText && <p>{msg.messageText}</p>}
                      {renderMessageAttachment(msg)}
                      <span className="message-time">{formatTime(msg.createdAt)}</span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="message-input-form">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
                />
                <div className="message-input-actions">
                  <button
                    type="button"
                    className="attach-button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingFile || isRecording}
                    title="Attach File (Documents, Images, Videos)"
                  >
                    {uploadingFile ? '⏳' : '📎'}
                  </button>
                  <button
                    type="button"
                    className={`voice-button ${isRecording ? 'recording' : ''}`}
                    onMouseDown={startVoiceRecording}
                    onMouseUp={stopVoiceRecording}
                    onTouchStart={startVoiceRecording}
                    onTouchEnd={stopVoiceRecording}
                    disabled={uploadingFile}
                    title={isRecording ? 'Release to send voice message' : 'Hold to record voice'}
                  >
                    {isRecording ? '🔴' : '🎤'}
                  </button>
                </div>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="message-input"
                  disabled={sending || uploadingFile || isRecording}
                />
                <button type="submit" className="send-button" disabled={sending || (!newMessage.trim() && !uploadingFile)}>
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

      {/* Meeting Schedule Modal */}
      {showMeetingModal && (
        <div className="modal-overlay" onClick={() => setShowMeetingModal(false)}>
          <div className="modal-content meeting-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Schedule Meeting</h2>
            <form onSubmit={handleScheduleMeeting}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={meetingForm.title}
                  onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={meetingForm.description}
                  onChange={(e) => setMeetingForm({ ...meetingForm, description: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Date & Time *</label>
                <input
                  type="datetime-local"
                  value={meetingForm.scheduledAt}
                  onChange={(e) => setMeetingForm({ ...meetingForm, scheduledAt: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Duration (minutes)</label>
                <input
                  type="number"
                  value={meetingForm.durationMinutes}
                  onChange={(e) => setMeetingForm({ ...meetingForm, durationMinutes: parseInt(e.target.value) || 30 })}
                  min="15"
                  max="240"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowMeetingModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Schedule Meeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Call Modal */}
      {showVideoCall && (
        <div className="video-call-overlay">
          <div className="video-call-container">
            <div className="video-call-header">
              <h3>Video Call with {selectedConversation?.otherUserName}</h3>
              <button className="end-call-btn" onClick={handleEndCall}>End Call</button>
            </div>
            <div className="video-call-content">
              <video 
                ref={remoteVideoRef} 
                autoPlay 
                playsInline
                className="remote-video" 
              />
              <video 
                ref={localVideoRef} 
                autoPlay 
                muted 
                playsInline
                className="local-video" 
              />
              {!remoteVideoRef.current?.srcObject && (
                <div className="video-call-waiting">
                  <p>Waiting for participant to join...</p>
                  <p className="video-call-hint">Share the meeting link from the chat to invite them</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
