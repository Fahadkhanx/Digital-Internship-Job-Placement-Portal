import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { authService } from '../services/authService';
import LoadingSpinner from '../components/LoadingSpinner';
import './MyMeetings.css';

const MyMeetings = () => {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, past, cancelled

  useEffect(() => {
    fetchMeetings();
  }, [filter]);

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/meetings');
      if (response.data.success) {
        let meetingsList = response.data.meetings || [];
        
        // Filter meetings based on selected filter
        const now = new Date();
        if (filter === 'upcoming') {
          meetingsList = meetingsList.filter(m => {
            const scheduledAt = new Date(m.scheduledAt);
            return scheduledAt > now && m.status !== 'Cancelled' && m.status !== 'Completed';
          });
        } else if (filter === 'past') {
          meetingsList = meetingsList.filter(m => {
            const scheduledAt = new Date(m.scheduledAt);
            return scheduledAt <= now || m.status === 'Completed';
          });
        } else if (filter === 'cancelled') {
          meetingsList = meetingsList.filter(m => m.status === 'Cancelled');
        }
        
        // Sort by scheduled time (upcoming first)
        meetingsList.sort((a, b) => {
          const dateA = new Date(a.scheduledAt);
          const dateB = new Date(b.scheduledAt);
          return dateA - dateB;
        });
        
        setMeetings(meetingsList);
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
      toast.error('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Scheduled':
        return 'status-scheduled';
      case 'InProgress':
        return 'status-in-progress';
      case 'Completed':
        return 'status-completed';
      case 'Cancelled':
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  };

  const handleJoinMeeting = (meeting) => {
    if (meeting.meetingLink) {
      navigate(meeting.meetingLink);
    } else {
      toast.error('Meeting link not available');
    }
  };

  const handleCancelMeeting = async (meetingId) => {
    if (!window.confirm('Are you sure you want to cancel this meeting?')) {
      return;
    }

    try {
      const response = await api.put(`/meetings/${meetingId}/cancel`);
      if (response.data.success) {
        toast.success('Meeting cancelled successfully');
        fetchMeetings();
      }
    } catch (error) {
      console.error('Error cancelling meeting:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel meeting');
    }
  };

  const currentUserId = authService.getUser()?.userId;

  if (loading) {
    return (
      <div className="my-meetings-page">
        <LoadingSpinner message="Loading meetings..." />
      </div>
    );
  }

  return (
    <div className="my-meetings-page">
      <div className="container">
        <div className="meetings-header">
          <h1>My Meetings</h1>
          <div className="filter-buttons">
            <button
              className={filter === 'all' ? 'active' : ''}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={filter === 'upcoming' ? 'active' : ''}
              onClick={() => setFilter('upcoming')}
            >
              Upcoming
            </button>
            <button
              className={filter === 'past' ? 'active' : ''}
              onClick={() => setFilter('past')}
            >
              Past
            </button>
            <button
              className={filter === 'cancelled' ? 'active' : ''}
              onClick={() => setFilter('cancelled')}
            >
              Cancelled
            </button>
          </div>
        </div>

        {meetings.length === 0 ? (
          <div className="no-meetings">
            <p>No meetings found</p>
            <p className="no-meetings-hint">
              {filter === 'upcoming' 
                ? 'You have no upcoming meetings scheduled.'
                : filter === 'past'
                ? 'You have no past meetings.'
                : filter === 'cancelled'
                ? 'You have no cancelled meetings.'
                : 'Schedule a meeting from the Messages page to get started.'}
            </p>
          </div>
        ) : (
          <div className="meetings-list">
            {meetings.map((meeting) => {
              const isOrganizer = meeting.organizerId === currentUserId;
              const isUpcoming = new Date(meeting.scheduledAt) > new Date() && 
                                 meeting.status !== 'Cancelled' && 
                                 meeting.status !== 'Completed';
              
              return (
                <div key={meeting.meetingId} className="meeting-card">
                  <div className="meeting-header">
                    <h3>{meeting.title}</h3>
                    <span className={`status-badge ${getStatusBadgeClass(meeting.status)}`}>
                      {meeting.status}
                    </span>
                  </div>
                  
                  <div className="meeting-details">
                    <div className="meeting-info">
                      <p className="meeting-label">With:</p>
                      <p className="meeting-value">
                        {isOrganizer ? meeting.participantEmail : meeting.organizerEmail}
                      </p>
                    </div>
                    
                    <div className="meeting-info">
                      <p className="meeting-label">Scheduled:</p>
                      <p className="meeting-value">{formatDateTime(meeting.scheduledAt)}</p>
                    </div>
                    
                    <div className="meeting-info">
                      <p className="meeting-label">Duration:</p>
                      <p className="meeting-value">{meeting.durationMinutes} minutes</p>
                    </div>
                    
                    {meeting.description && (
                      <div className="meeting-info">
                        <p className="meeting-label">Description:</p>
                        <p className="meeting-value">{meeting.description}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="meeting-actions">
                    {isUpcoming && meeting.meetingLink && (
                      <button
                        className="btn-join"
                        onClick={() => handleJoinMeeting(meeting)}
                      >
                        📹 Join Meeting
                      </button>
                    )}
                    
                    {isUpcoming && isOrganizer && meeting.status !== 'Cancelled' && (
                      <button
                        className="btn-cancel"
                        onClick={() => handleCancelMeeting(meeting.meetingId)}
                      >
                        Cancel Meeting
                      </button>
                    )}
                    
                    {meeting.meetingLink && (
                      <button
                        className="btn-link"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${window.location.origin}${meeting.meetingLink}`
                          );
                          toast.success('Meeting link copied to clipboard!');
                        }}
                      >
                        📋 Copy Link
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyMeetings;

