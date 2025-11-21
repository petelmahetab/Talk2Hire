import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import schedulingApi from '../api/schedulingApi';
import { format, isBefore, isWithinInterval, addMinutes } from 'date-fns';

const MyInterviews = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState([]);
  const [filter, setFilter] = useState('upcoming');
  const [role, setRole] = useState('candidate');

  useEffect(() => {
    fetchInterviews();
  }, [filter, role]);

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const response = await schedulingApi.getMyInterviews(
        role,
        filter === 'all' ? null : filter,
        filter === 'upcoming'
      );

      if (response.success) {
        setInterviews(response.interviews);
      }
    } catch (error) {
      console.error('Error fetching interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelInterview = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this interview?')) {
      return;
    }

    try {
      const response = await schedulingApi.cancelInterview(id, 'Cancelled by user');
      if (response.success) {
        alert('Interview cancelled successfully');
        fetchInterviews();
      }
    } catch (error) {
      console.error('Error cancelling interview:', error);
      alert('Failed to cancel interview');
    }
  };

  const handleJoinInterview = (roomId) => {
    navigate(`/room/${roomId}`);
  };

  const canJoinNow = (scheduledTime) => {
    const interviewTime = new Date(scheduledTime);
    const now = new Date();
    const fiveMinutesBefore = addMinutes(interviewTime, -5);
    
    return isWithinInterval(now, {
      start: fiveMinutesBefore,
      end: addMinutes(interviewTime, 60)
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      scheduled: { bg: 'bg-blue-100', text: 'text-blue-800', label: '📅 Scheduled' },
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: '✅ Completed' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: '❌ Cancelled' },
      'no-show': { bg: 'bg-orange-100', text: 'text-orange-800', label: '⚠️ No Show' },
      rescheduled: { bg: 'bg-purple-100', text: 'text-purple-800', label: '🔄 Rescheduled' }
    };

    const badge = badges[status] || badges.scheduled;

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const InterviewCard = ({ interview }) => {
    const isPast = isBefore(new Date(interview.scheduledTime), new Date());
    const canJoin = canJoinNow(interview.scheduledTime);

    return (
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-100">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {role === 'interviewer' ? interview.candidateName : interview.interviewerName}
            </h3>
            <p className="text-gray-600 text-sm">
              {role === 'interviewer' ? interview.candidateEmail : interview.interviewerEmail}
            </p>
          </div>
          {getStatusBadge(interview.status)}
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-gray-700">
            <span className="text-2xl">📅</span>
            <div>
              <p className="font-medium">
                {format(new Date(interview.scheduledTime), 'EEEE, MMMM d, yyyy')}
              </p>
              <p className="text-sm text-gray-500">
                {format(new Date(interview.scheduledTime), 'h:mm a')} - {format(new Date(interview.endTime), 'h:mm a')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-gray-700">
            <span className="text-2xl">💼</span>
            <div>
              <p className="font-medium capitalize">{interview.interviewType}</p>
              <p className="text-sm text-gray-500">{interview.duration} minutes</p>
            </div>
          </div>

          {interview.notes && (
            <div className="flex items-start gap-3 text-gray-700">
              <span className="text-2xl">📝</span>
              <div>
                <p className="text-sm">{interview.notes}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          {interview.status === 'scheduled' && !isPast && (
            <>
              {canJoin && (
                <button
                  onClick={() => handleJoinInterview(interview.roomId)}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <span>🚀</span>
                  <span>Join Now</span>
                </button>
              )}
              {!canJoin && (
                <button
                  disabled
                  className="flex-1 px-4 py-3 bg-gray-300 text-gray-600 rounded-lg font-semibold cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <span>⏰</span>
                  <span>Opens 5 min before</span>
                </button>
              )}
              <button
                onClick={() => handleCancelInterview(interview._id)}
                className="px-4 py-3 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors"
              >
                Cancel
              </button>
            </>
          )}

          {interview.status === 'completed' && role === 'interviewer' && !interview.feedback && (
            <button
              onClick={() => navigate(`/feedback/${interview._id}`)}
              className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Add Feedback
            </button>
          )}

          {interview.meetingLink && (
            <button
              onClick={() => window.open(interview.meetingLink, '_blank')}
              className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              📎 Copy Link
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📋 My Interviews
          </h1>
          <p className="text-lg text-gray-600">
            Manage your upcoming and past interviews
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                View as:
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setRole('candidate')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    role === 'candidate'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  👤 Candidate
                </button>
                <button
                  onClick={() => setRole('interviewer')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    role === 'interviewer'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  👔 Interviewer
                </button>
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by:
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="upcoming">🔜 Upcoming</option>
                <option value="completed">✅ Completed</option>
                <option value="cancelled">❌ Cancelled</option>
                <option value="all">📋 All Interviews</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
          </div>
        ) : interviews.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-400 text-6xl mb-4">📭</div>
            <p className="text-gray-600 text-xl mb-2">No interviews found</p>
            <p className="text-gray-500 mb-6">
              {filter === 'upcoming' ? 'You have no upcoming interviews' : 'No interviews match this filter'}
            </p>
            {role === 'candidate' && (
              <button
                onClick={() => navigate('/schedule')}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                📅 Schedule an Interview
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {interviews.map((interview) => (
              <InterviewCard key={interview._id} interview={interview} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyInterviews;