// frontend/src/pages/MyInterviews.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import schedulingApi from '../api/schedulingApi';
import toast from 'react-hot-toast';
import { format, isBefore, isWithinInterval, addMinutes } from 'date-fns';
import { 
  Calendar, Clock, User, Briefcase, MessageSquare, XCircle, 
  CheckCircle2, ArrowLeft, Users, CalendarCheck, Timer, Sparkles 
} from 'lucide-react';

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
      const response = await schedulingApi.getMyInterviews(role, filter === 'all' ? null : filter, filter === 'upcoming');
      if (response.success) setInterviews(response.interviews);
    } catch (error) {
      toast.error('Failed to load interviews');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelInterview = async (id) => {
    if (!window.confirm('Cancel this interview?')) return;
    try {
      const response = await schedulingApi.cancelInterview(id);
      if (response.success) {
        toast.success('Interview cancelled');
        fetchInterviews();
      }
    } catch (error) {
      toast.error('Failed to cancel');
    }
  };

  const handleJoinInterview = (roomId) => {
    navigate(`/session/${roomId}`);
  };

  const canJoinNow = (scheduledTime) => {
    const interviewTime = new Date(scheduledTime);
    const now = new Date();
    const fiveMinutesBefore = addMinutes(interviewTime, -5);
    return isWithinInterval(now, { start: fiveMinutesBefore, end: addMinutes(interviewTime, 60) });
  };

  // 12-HOUR FORMAT FUNCTION — ADDED HERE
  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusBadge = (status) => {
    const badges = {
      scheduled: { icon: CalendarCheck, color: 'from-cyan-500 to-blue-600', label: 'Scheduled' },
      completed: { icon: CheckCircle2, color: 'from-green-500 to-emerald-600', label: 'Completed' },
      cancelled: { icon: XCircle, color: 'from-red-500 to-rose-600', label: 'Cancelled' },
      'no-show': { icon: Timer, color: 'from-orange-500 to-amber-600', label: 'No Show' },
      rescheduled: { icon: Calendar, color: 'from-purple-500 to-pink-600', label: 'Rescheduled' }
    };
    const badge = badges[status] || badges.scheduled;
    const Icon = badge.icon;
    return (
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${badge.color} text-white font-bold text-xs shadow-lg`}>
        <Icon className="w-4 h-4" />
        {badge.label}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* Back Button */}
      <div className="p-4 md:p-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-lg transition-all duration-300 group text-sm md:text-base"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>
      </div>

      {/* Header */}
      <div className="text-center mb-8 px-4">
        <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-2">
          My Interviews
        </h1>
        <p className="text-lg md:text-xl text-base-content/70">View and manage your mock interview schedule</p>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-4 mb-8">
        <div className="bg-base-100 rounded-2xl shadow-xl p-6 border border-base-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-lg font-bold text-base-content mb-3">
                <Users className="w-6 h-6 text-primary" />
                View as
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setRole('candidate')}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all ${role === 'candidate' 
                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg' 
                    : 'bg-base-200 text-base-content/70 hover:bg-base-300'}`}
                >
                  Candidate
                </button>
                <button
                  onClick={() => setRole('interviewer')}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all ${role === 'interviewer' 
                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg' 
                    : 'bg-base-200 text-base-content/70 hover:bg-base-300'}`}
                >
                  Interviewer
                </button>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-lg font-bold text-base-content mb-3">
                <Calendar className="w-6 h-6 text-primary" />
                Filter by
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-5 py-3 bg-base-200 border border-base-300 rounded-xl text-base-content focus:outline-none focus:border-primary transition-all"
              >
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="all">All Interviews</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Interviews Grid */}
      <div className="max-w-6xl mx-auto px-4 pb-8">
        {loading ? (
          <div className="text-center py-24">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-6"></div>
            <p className="text-2xl font-bold text-primary">Loading interviews...</p>
          </div>
        ) : interviews.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-8xl mb-6">📭</div>
            <p className="text-3xl font-bold text-base-content/60 mb-4">No interviews found</p>
            <p className="text-xl text-base-content/50 mb-8">
              {filter === 'upcoming' ? 'No upcoming interviews' : 'No interviews match this filter'}
            </p>
            {role === 'candidate' && (
              <button
                onClick={() => navigate('/interviewers')}
                className="px-10 py-4 bg-gradient-to-r from-primary to-accent text-white text-xl font-bold rounded-xl hover:shadow-xl transition-all flex items-center gap-3 mx-auto"
              >
                <Sparkles className="w-6 h-6" />
                Find Interviewers
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {interviews.map((interview) => {
              const isPast = isBefore(new Date(interview.scheduledTime), new Date());
              const canJoin = canJoinNow(interview.scheduledTime);

              return (
                <div
                  key={interview._id}
                  className="bg-base-100 rounded-2xl shadow-xl border border-base-300 hover:border-primary transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-2xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-1">
                          {role === 'interviewer' ? interview.candidateName : interview.interviewerName}
                        </h3>
                        <p className="text-base-content/70">
                          {role === 'interviewer' ? interview.candidateEmail : interview.interviewerEmail}
                        </p>
                      </div>
                      {getStatusBadge(interview.status)}
                    </div>

                    <div className="space-y-5 mb-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-r from-primary via-secondary to-accent rounded-xl shadow-lg">
                          <Calendar className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <p className="text-xl font-bold text-base-content">
                            {format(new Date(interview.scheduledTime), 'EEEE, MMMM d, yyyy')}
                          </p>
                          <p className="text-base-content/70">
                            {formatTime(interview.scheduledTime.split('T')[1].slice(0, 5))} - {formatTime(interview.endTime.split('T')[1].slice(0, 5))}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-r from-primary via-secondary to-accent rounded-xl shadow-lg">
                          <Briefcase className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <p className="text-xl font-bold text-base-content capitalize">{interview.interviewType} Interview</p>
                          <p className="text-base-content/70">{interview.duration} minutes</p>
                        </div>
                      </div>

                      {interview.notes && (
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-gradient-to-r from-primary via-secondary to-accent rounded-xl shadow-lg">
                            <MessageSquare className="w-8 h-8 text-white" />
                          </div>
                          <p className="text-base-content/80">{interview.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-4">
                      {interview.status === 'scheduled' && !isPast && (
                        <>
                          {canJoin ? (
                            <button
                              onClick={() => handleJoinInterview(interview.roomId)}
                              className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-3"
                            >
                              <CheckCircle2 className="w-6 h-6" />
                              JOIN NOW
                            </button>
                          ) : (
                            <button disabled className="flex-1 py-4 bg-base-300 text-base-content/60 font-bold text-lg rounded-xl cursor-not-allowed flex items-center justify-center gap-3">
                              <Timer className="w-6 h-6" />
                              Opens 5 min before
                            </button>
                          )}
                          <button
                            onClick={() => handleCancelInterview(interview._id)}
                            className="px-8 py-4 bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold text-lg rounded-xl hover:shadow-xl transition-all"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
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

export default MyInterviews;