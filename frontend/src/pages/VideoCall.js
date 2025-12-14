import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { authService } from '../services/authService';
import './VideoCall.css';

const VideoCall = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const [isInCall, setIsInCall] = useState(false);
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [localStream, setLocalStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const signalingIntervalRef = useRef(null);
  const currentUserId = authService.getUser()?.userId;
  const processedOfferRef = useRef(false);
  const processedAnswerRef = useRef(false);

  useEffect(() => {
    fetchMeetingDetails();
    return () => {
      // Cleanup: Stop all tracks when component unmounts
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (signalingIntervalRef.current) {
        clearInterval(signalingIntervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId]);

  // Auto-start video call when meeting is loaded and user hasn't started it yet
  useEffect(() => {
    if (meeting && !isInCall && !loading && currentUserId) {
      console.log('✅ Meeting loaded, auto-starting video call...');
      console.log('Meeting details:', {
        meetingId: meeting.meetingId,
        organizerId: meeting.organizerId,
        participantId: meeting.participantId,
        currentUserId: currentUserId
      });
      // Small delay to ensure everything is ready
      const timer = setTimeout(() => {
        startVideoCall();
      }, 500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meeting, loading, isInCall]);

  const fetchMeetingDetails = async () => {
    console.log('Fetching meeting details for:', meetingId);
    try {
      // meetingId is the external GUID from the URL
      // Use the new endpoint to get meeting by external ID
      const response = await api.get(`/meetings/by-external/${meetingId}`);
      console.log('Meeting details response:', response.data);
      if (response.data.success) {
        setMeeting(response.data.meeting);
        console.log('Meeting loaded:', response.data.meeting);
        setLoading(false);
      } else {
        console.error('Meeting not found in response');
        toast.error('Meeting not found');
        navigate('/messages');
      }
    } catch (error) {
      console.error('Error fetching meeting:', error);
      if (error.response?.status === 404) {
        toast.error('Meeting not found or you do not have access');
      } else {
        toast.error('Failed to load meeting details');
      }
      navigate('/messages');
    }
  };

  const setupPeerConnection = (stream = null) => {
    console.log('=== SETUP PEER CONNECTION ===');
    console.log('Stream provided:', !!stream, 'State localStream:', !!localStream);
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ]
    };

    console.log('Creating RTCPeerConnection...');
    const pc = new RTCPeerConnection(configuration);
    peerConnectionRef.current = pc;
    console.log('RTCPeerConnection created');

    // Add local stream tracks to peer connection
    // Use provided stream first, then fallback to state
    const streamToUse = stream || localStream;
    if (streamToUse) {
      console.log('Adding tracks from stream...');
      streamToUse.getTracks().forEach(track => {
        pc.addTrack(track, streamToUse);
        console.log('Added local track:', track.kind, track.id, track.enabled, track.readyState);
      });
      console.log('Total tracks added:', streamToUse.getTracks().length);
    } else {
      console.warn('No local stream available when setting up peer connection');
    }

    // Handle remote stream
    pc.ontrack = (event) => {
      console.log('=== 📹 REMOTE TRACK RECEIVED ===');
      console.log('Track kind:', event.track.kind);
      console.log('Track id:', event.track.id);
      console.log('Track enabled:', event.track.enabled);
      console.log('Track readyState:', event.track.readyState);
      console.log('Streams count:', event.streams?.length || 0);
      
      if (event.streams && event.streams[0]) {
        const remoteStream = event.streams[0];
        const tracks = remoteStream.getTracks();
        console.log('Remote stream tracks:', tracks.map(t => ({
          kind: t.kind,
          id: t.id,
          enabled: t.enabled,
          readyState: t.readyState
        })));
        
        if (remoteVideoRef.current) {
          console.log('🎥 Setting remote video srcObject...');
          console.log('Remote stream tracks before assignment:', remoteStream.getTracks().map(t => ({
            kind: t.kind,
            enabled: t.enabled,
            readyState: t.readyState,
            muted: t.muted
          })));
          
          // Set srcObject first
          remoteVideoRef.current.srcObject = remoteStream;
          console.log('✅ Remote video srcObject set');
          
          // Ensure video element has proper attributes
          remoteVideoRef.current.muted = false; // Don't mute remote video
          remoteVideoRef.current.volume = 1.0;
          
          // Handle AbortError gracefully - it happens when srcObject changes during play()
          const playPromise = remoteVideoRef.current.play();
          
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log('✅✅✅ Remote video playing successfully!');
                console.log('Remote video element state:', {
                  paused: remoteVideoRef.current.paused,
                  muted: remoteVideoRef.current.muted,
                  volume: remoteVideoRef.current.volume,
                  readyState: remoteVideoRef.current.readyState,
                  videoWidth: remoteVideoRef.current.videoWidth,
                  videoHeight: remoteVideoRef.current.videoHeight
                });
                setIsConnected(true);
                toast.success('✅ Video and audio connected!');
              })
              .catch(err => {
                // AbortError is expected when srcObject changes - ignore it
                if (err.name === 'AbortError') {
                  console.log('⚠️ Video play interrupted (expected when stream changes), retrying...');
                  // Try playing again after a short delay
                  setTimeout(() => {
                    if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
                      remoteVideoRef.current.play()
                        .then(() => {
                          console.log('✅✅✅ Remote video playing after retry!');
                          setIsConnected(true);
                          toast.success('✅ Video and audio connected!');
                        })
                        .catch(retryErr => {
                          if (retryErr.name !== 'AbortError') {
                            console.error('❌ Error playing remote video after retry:', retryErr);
                          }
                        });
                    }
                  }, 200);
                } else {
                  console.error('❌ Error playing remote video:', err);
                  console.error('Error details:', err.name, err.message);
                  // Only show error for non-AbortError cases
                  if (err.name !== 'NotAllowedError') {
                    toast.error('Error playing remote video: ' + err.message);
                  }
                }
              });
          } else {
            // play() returned undefined, try to play manually
            console.log('⚠️ play() returned undefined, trying manual play...');
            setTimeout(() => {
              if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
                remoteVideoRef.current.play()
                  .then(() => {
                    console.log('✅✅✅ Remote video playing manually!');
                    setIsConnected(true);
                    toast.success('✅ Video and audio connected!');
                  })
                  .catch(err => {
                    if (err.name !== 'AbortError') {
                      console.error('❌ Error in manual play:', err);
                    }
                  });
              }
            }, 100);
          }
        } else {
          console.error('❌ Remote video element not found!');
        }
      } else {
        console.warn('⚠️ No streams in track event');
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = async (event) => {
      if (event.candidate && meeting && meeting.meetingId) {
        try {
          console.log('ICE candidate generated:', {
            candidate: event.candidate.candidate?.substring(0, 50),
            sdpMLineIndex: event.candidate.sdpMLineIndex,
            sdpMid: event.candidate.sdpMid
          });
          await api.post(`/meetings/${meeting.meetingId}/ice-candidate`, {
            candidate: JSON.stringify(event.candidate),
            userId: currentUserId
          });
          console.log('ICE candidate sent to backend');
        } catch (error) {
          console.error('Error sending ICE candidate:', error);
        }
      } else if (event.candidate === null) {
        console.log('ICE candidate gathering complete (null candidate)');
      } else {
        console.log('Skipping ICE candidate - missing meeting data');
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      console.log('=== 🔄 CONNECTION STATE CHANGE ===', state);
      console.log('Signaling state:', pc.signalingState);
      console.log('ICE connection state:', pc.iceConnectionState);
      console.log('ICE gathering state:', pc.iceGatheringState);
      
      if (state === 'connected') {
        setIsConnected(true);
        toast.success('✅ Connected!');
        console.log('✅✅✅ CONNECTED - Video and audio should work now!');
      } else if (state === 'connecting') {
        console.log('🔄 CONNECTING - Establishing connection...');
      } else if (state === 'disconnected') {
        setIsConnected(false);
        console.log('⚠️ DISCONNECTED - Connection lost');
        toast.warning('Connection lost. Trying to reconnect...');
      } else if (state === 'failed') {
        setIsConnected(false);
        console.log('❌ FAILED - Connection failed');
        toast.error('Connection failed. Please check your network.');
      } else if (state === 'closed') {
        console.log('🔒 CLOSED - Connection closed');
      }
    };

    // Handle ICE connection state changes
    pc.oniceconnectionstatechange = () => {
      const iceState = pc.iceConnectionState;
      console.log('=== 🧊 ICE CONNECTION STATE CHANGE ===', iceState);
      console.log('Connection state:', pc.connectionState);
      console.log('Signaling state:', pc.signalingState);
      
      if (iceState === 'connected') {
        console.log('✅ ICE CONNECTED');
      } else if (iceState === 'checking') {
        console.log('🔄 ICE CHECKING - Finding connection path...');
      } else if (iceState === 'failed') {
        console.log('❌ ICE FAILED - Could not establish connection');
        toast.error('Connection failed. Please check your network.');
      } else if (iceState === 'disconnected') {
        console.log('⚠️ ICE DISCONNECTED');
      } else if (iceState === 'closed') {
        console.log('🔒 ICE CLOSED');
      } else if (iceState === 'completed') {
        console.log('✅ ICE COMPLETED');
        setIsConnected(true);
      }
    };
    
    pc.onicegatheringstatechange = () => {
      console.log('🧊 ICE gathering state:', pc.iceGatheringState);
    };

    return pc;
  };

  const startSignalingPolling = () => {
    console.log('=== START SIGNALING POLLING ===');
    if (signalingIntervalRef.current) {
      clearInterval(signalingIntervalRef.current);
    }

    signalingIntervalRef.current = setInterval(async () => {
      if (!meeting || !meeting.meetingId || !peerConnectionRef.current) {
        console.log('Polling skipped - missing data:', { 
          meeting: !!meeting, 
          meetingId: meeting?.meetingId, 
          pc: !!peerConnectionRef.current 
        });
        return;
      }
      
      console.log('🔄 Polling for signaling data...');

      try {
        // Get signaling data from backend
        const response = await api.get(`/meetings/${meeting.meetingId}/signaling`);
        
        if (response.data.success && response.data.signaling) {
          const signaling = response.data.signaling;
          const pc = peerConnectionRef.current;
          
          console.log('📡 Signaling data received:', {
            hasOffer: !!signaling.offer,
            hasAnswer: !!signaling.answer,
            iceCandidatesCount: signaling.iceCandidates?.length || 0,
            currentSignalingState: pc?.signalingState,
            currentConnectionState: pc?.connectionState,
            currentIceState: pc?.iceConnectionState
          });

          // Handle answer (first participant receives answer from second participant)
          if (signaling.answer) {
            console.log('📥 ANSWER FOUND in signaling data!', {
              answerLength: signaling.answer.length,
              signalingState: pc.signalingState,
              expectedState: 'have-local-offer',
              alreadyProcessed: processedAnswerRef.current,
              remoteDescriptionSet: pc.remoteDescription !== null
            });
            
            if (pc.signalingState === 'have-local-offer' && !processedAnswerRef.current) {
              try {
                console.log('✅✅✅ Processing answer - setting remote description...');
                const answer = JSON.parse(signaling.answer);
                console.log('✅ Parsed answer type:', answer.type);
                console.log('✅ Answer SDP length:', answer.sdp?.length || 0);
                
                if (pc.remoteDescription === null) {
                  console.log('Setting remote description (answer)');
                  await pc.setRemoteDescription(new RTCSessionDescription(answer));
                  console.log('✅✅✅ Remote description set successfully (answer)');
                  processedAnswerRef.current = true; // Mark as processed
                } else {
                  console.log('⚠️ Remote description already set, but marking as processed');
                  processedAnswerRef.current = true; // Mark as processed
                }
              } catch (error) {
                console.error('❌ Error setting remote description (answer):', error);
                console.error('Error details:', error.message, error.stack);
              }
            } else if (processedAnswerRef.current) {
              console.log('✅ Answer already processed, skipping');
            } else {
              console.log('⚠️ Answer exists but signaling state is:', pc.signalingState, '(expected: have-local-offer)');
              // Try to set it anyway if remote description is null
              if (pc.remoteDescription === null && pc.signalingState !== 'stable') {
                try {
                  console.log('⚠️ Attempting to set answer despite signaling state mismatch...');
                  const answer = JSON.parse(signaling.answer);
                  await pc.setRemoteDescription(new RTCSessionDescription(answer));
                  console.log('✅✅✅ Answer set despite state mismatch!');
                  processedAnswerRef.current = true;
                } catch (error) {
                  console.error('❌ Failed to set answer:', error);
                }
              }
            }
          } else {
            // No answer yet
            if (pc.signalingState === 'have-local-offer') {
              console.log('⏳ Waiting for answer... (signaling state: have-local-offer)');
            }
          }

          // Handle offer (second participant receives offer from first participant)
          if (signaling.offer && pc.signalingState === 'stable' && !processedOfferRef.current) {
            try {
              console.log('✅ Found offer, creating answer...');
              const offer = JSON.parse(signaling.offer);
              console.log('Parsed offer type:', offer.type);
              await pc.setRemoteDescription(new RTCSessionDescription(offer));
              console.log('✅ Remote description set (offer)');
              const answer = await pc.createAnswer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true
              });
              console.log('✅ Answer created:', answer.type);
              await pc.setLocalDescription(answer);
              console.log('✅ Local description set (answer)');
              
              await api.post(`/meetings/${meeting.meetingId}/answer`, {
                answer: JSON.stringify(answer),
                userId: currentUserId
              });
              console.log('✅ Answer sent to backend');
              processedOfferRef.current = true; // Mark as processed
            } catch (error) {
              console.error('❌ Error handling offer:', error);
              console.error('Error details:', error.message, error.stack);
            }
          } else if (signaling.offer && processedOfferRef.current) {
            // Offer already processed, skip
            console.log('✅ Offer already processed, skipping');
          } else if (signaling.offer) {
            console.log('⚠️ Offer exists but signaling state is:', pc.signalingState, '(expected: stable)');
          }

          // Handle ICE candidates
          if (signaling.iceCandidates && Array.isArray(signaling.iceCandidates)) {
            console.log('🧊 Processing ICE candidates:', signaling.iceCandidates.length);
            let addedCount = 0;
            for (const candidateData of signaling.iceCandidates) {
              if (candidateData.userId !== currentUserId) {
                try {
                  const candidate = JSON.parse(candidateData.candidate);
                  // Add candidate even if remote description is not set yet (will be queued)
                  await pc.addIceCandidate(new RTCIceCandidate(candidate));
                  addedCount++;
                  console.log('✅ Added ICE candidate from other participant:', candidate.candidate?.substring(0, 50));
                } catch (error) {
                  // Ignore errors for duplicate candidates or invalid candidates
                  if (error.name !== 'OperationError' && error.name !== 'TypeError') {
                    console.error('❌ Error adding ICE candidate:', error, candidateData);
                  } else {
                    console.log('⚠️ Skipped duplicate/invalid ICE candidate');
                  }
                }
              } else {
                console.log('⚠️ Skipping own ICE candidate');
              }
            }
            console.log(`✅ Processed ${addedCount} ICE candidates from other participant`);
          } else {
            console.log('⚠️ No ICE candidates in signaling data');
          }
        }
      } catch (error) {
        console.error('Error polling signaling data:', error);
      }
    }, 2000); // Poll every 2 seconds
  };

  const startVideoCall = async () => {
    console.log('=== START VIDEO CALL FUNCTION CALLED ===');
    console.log('Meeting:', meeting);
    console.log('Current User ID:', currentUserId);
    console.log('Meeting ID:', meeting?.meetingId);
    console.log('Organizer ID:', meeting?.organizerId);
    console.log('Participant ID:', meeting?.participantId);
    console.log('Am I the organizer?', currentUserId === meeting?.organizerId);
    console.log('Am I the participant?', currentUserId === meeting?.participantId);
    
    try {
      // Check browser support
      console.log('Checking browser support...');
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('Browser does not support getUserMedia');
        toast.error('Your browser does not support video calling. Please use a modern browser.');
        return;
      }

      if (!window.RTCPeerConnection) {
        console.error('WebRTC not supported');
        toast.error('WebRTC is not supported in your browser.');
        return;
      }
      
      console.log('Browser support check passed');

      // Request camera and microphone access
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

      setLocalStream(stream);

      // Display local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch(err => {
          console.error('Error playing local video:', err);
        });
      }

      setIsInCall(true);
      console.log('isInCall set to true');
      
      // Setup peer connection WITH stream directly
      // This ensures stream is available when adding tracks (React state is async)
      console.log('Setting up peer connection with stream...');
      const pc = setupPeerConnection(stream);
      console.log('Peer connection created');
      
      // Verify tracks are added
      console.log('Verifying tracks in peer connection...');
      const senders = pc.getSenders();
      console.log('Total senders:', senders.length);
      senders.forEach((sender, index) => {
        console.log(`Sender ${index}:`, {
          kind: sender.track?.kind,
          id: sender.track?.id,
          enabled: sender.track?.enabled,
          readyState: sender.track?.readyState
        });
      });
      
      if (senders.length === 0) {
        console.error('No tracks added to peer connection! Adding manually...');
        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream);
          console.log('Manually added track:', track.kind);
        });
      }

      // Check if there's already an offer from the other participant
      // If yes, we're the second participant - create answer
      // If no, we're the first participant - create offer
      if (!meeting || !meeting.meetingId) {
        console.error('Meeting or meetingId is missing!', meeting);
        toast.error('Meeting information is missing. Please refresh the page.');
        return;
      }
      
      console.log('Checking for existing offer/answer...');
      try {
        const signalingResponse = await api.get(`/meetings/${meeting.meetingId}/signaling`);
        console.log('Signaling response:', signalingResponse.data);
        
        if (signalingResponse.data.success && signalingResponse.data.signaling?.offer && !processedOfferRef.current) {
          // There's already an offer, we're the second participant
          console.log('✅✅✅ FOUND EXISTING OFFER - We are Participant 2, creating answer...');
          const offer = JSON.parse(signalingResponse.data.signaling.offer);
          console.log('Parsed offer:', offer.type);
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          console.log('Remote description set (offer)');
          const answer = await pc.createAnswer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
          });
          console.log('Answer created:', answer.type);
          await pc.setLocalDescription(answer);
          console.log('Local description set (answer)');
          
          await api.post(`/meetings/${meeting.meetingId}/answer`, {
            answer: JSON.stringify(answer),
            userId: currentUserId
          });
          console.log('✅ Answer sent to backend');
          processedOfferRef.current = true; // Mark as processed
        } else if (signalingResponse.data.success && signalingResponse.data.signaling?.offer && processedOfferRef.current) {
          console.log('✅ Offer already processed in initial check, skipping');
        } else {
          // No offer yet, we're the first participant - create offer
          console.log('✅✅✅ NO EXISTING OFFER - We are Participant 1, creating offer...');
          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
          });
          console.log('Offer created:', offer.type);
          await pc.setLocalDescription(offer);
          console.log('Local description set (offer)');
          
          await api.post(`/meetings/${meeting.meetingId}/offer`, {
            offer: JSON.stringify(offer),
            userId: currentUserId
          });
          console.log('✅ Offer sent to backend');
          processedOfferRef.current = true; // Mark as processed
        }

        // Start polling for answer and ICE candidates
        console.log('Starting signaling polling...');
        startSignalingPolling();
      } catch (error) {
        console.error('Error in signaling setup:', error);
        console.error('Error details:', error.response?.data || error.message);
        toast.error('Failed to establish connection. Please try again.');
      }

      // Update meeting status to InProgress
      try {
        await api.put(`/meetings/${meeting.meetingId}/status`, {
          status: 'InProgress'
        });
      } catch (error) {
        console.error('Error updating meeting status:', error);
        // Don't show error to user, it's not critical
      }

      toast.success('Video call started! Connecting to other participant...');

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
    }
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = isVideoOff;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const endCall = async () => {
    // Stop polling
    if (signalingIntervalRef.current) {
      clearInterval(signalingIntervalRef.current);
      signalingIntervalRef.current = null;
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    // Clear video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    setIsConnected(false);

    // Update meeting status to Completed
    if (meeting && meeting.meetingId) {
      try {
        await api.put(`/meetings/${meeting.meetingId}/status`, {
          status: 'Completed'
        });
      } catch (error) {
        console.error('Error updating meeting status:', error);
        // Don't show error to user, it's not critical
      }
    }

    setIsInCall(false);
    toast.info('Video call ended');
    navigate('/messages');
  };

  if (loading) {
    return (
      <div className="video-call-page">
        <div className="video-call-loading">
          <div className="loading-spinner"></div>
          <p>Loading meeting...</p>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="video-call-page">
        <div className="video-call-error">
          <h2>Meeting Not Found</h2>
          <p>The meeting you're looking for doesn't exist or has been cancelled.</p>
          <button onClick={() => navigate('/messages')} className="btn-back">
            Back to Messages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="video-call-page">
      <div className="video-call-container-full">
        <div className="video-call-header-full">
          <div className="call-info">
            <h2>Video Call</h2>
            <p>{meeting.title || 'Video Call'}</p>
            {meeting.participantEmail && (
              <span className="participant-info">With: {meeting.participantEmail}</span>
            )}
          </div>
          <button className="end-call-btn-full" onClick={endCall}>
            End Call
          </button>
        </div>

        <div className="video-call-content-full">
          {/* Remote video (other participant) */}
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline
            className="remote-video-full" 
          />
          
          {/* Local video (self) */}
          <video 
            ref={localVideoRef} 
            autoPlay 
            muted 
            playsInline
            className="local-video-full" 
          />

          {!isInCall && (
            <div className="video-call-waiting-full">
              <div className="waiting-content">
                <h3>Ready to join the call?</h3>
                <p>Click the button below to start the video call</p>
                <button className="btn-start-call" onClick={startVideoCall}>
                  📹 Start Video Call
                </button>
              </div>
            </div>
          )}

          {isInCall && !isConnected && (
            <div className="video-call-waiting-full">
              <div className="waiting-content">
                <p>Connecting to participant...</p>
                <p className="waiting-hint">Please wait while we establish the connection</p>
              </div>
            </div>
          )}
        </div>

        {isInCall && (
          <div className="video-call-controls">
            <button 
              className={`control-btn ${isMuted ? 'muted' : ''}`}
              onClick={toggleMute}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? '🔇' : '🎤'}
            </button>
            <button 
              className={`control-btn ${isVideoOff ? 'video-off' : ''}`}
              onClick={toggleVideo}
              title={isVideoOff ? 'Turn on video' : 'Turn off video'}
            >
              {isVideoOff ? '📵' : '📹'}
            </button>
            <button 
              className="control-btn end-call"
              onClick={endCall}
              title="End call"
            >
              📞
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCall;

