// frontend/src/pages/InterviewersPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import schedulingApi from '../api/schedulingApi';
import { Calendar, Clock, Globe, UserCheck, Sparkles, Users, CalendarDays, CheckCircle2 } from 'lucide-react';

const InterviewersPage = () => {
  const navigate = useNavigate();
  const [interviewers, setInterviewers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterviewers();
  }, []);

  const fetchInterviewers = async () => {
    try {
      const response = await schedulingApi.getInterviewers();
      if (response.success) {
        setInterviewers(response.interviewers);
      }
    } catch (error) {
      console.error('Error fetching interviewers:', error);
      alert('Failed to load interviewers');
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (dayNum) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNum];
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-primary mb-6"></div>
          <p className="text-2xl font-bold text-primary">Loading Interviewers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <div className="bg-base-100 border-b border-base-300">
        <div className="max-w-7xl mx-auto px-6 py-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-primary via-secondary to-accent rounded-2xl shadow-2xl">
              <Users className="w-16 h-16 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-4">
            Meet Your Interviewers
          </h1>
          <p className="text-xl text-base-content/70 max-w-3xl mx-auto">
            Book 1-on-1 mock interviews with experienced developers
          </p>
        </div>
      </div>

      {/* Interviewers Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {interviewers.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-3xl text-base-content/60 mb-4">No interviewers available yet</p>
            <p className="text-xl text-base-content/50">Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {interviewers.map((interviewer) => (
              <div
                key={interviewer.interviewerId}
                className="bg-base-100 rounded-2xl shadow-xl border border-base-300 hover:border-primary transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20"
              >
                <div className="p-8">
                  {/* Avatar + Name */}
                  <div className="flex items-center gap-5 mb-6">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-xl">
                        {interviewer.name?.charAt(0) || '?'}
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-base-100 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-base-content">
                        {interviewer.name || 'Interviewer'}
                      </h3>
                      <div className="flex items-center gap-2 text-primary mt-1">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm font-medium">Verified Interviewer</span>
                      </div>
                    </div>
                  </div>

                  {/* REAL AVAILABILITY FROM DB */}
                  <div className="space-y-5 mb-8">
                    <div>
                      <div className="flex items-center gap-3 text-base-content/80 mb-3">
                        <CalendarDays className="w-6 h-6 text-primary" />
                        <span className="font-bold text-lg">Available Schedule</span>
                      </div>

                      {interviewer.schedules && interviewer.schedules.length > 0 ? (
                        <div className="space-y-3">
                          {interviewer.schedules.map((slot, index) => (
                            <div
                              key={index}
                              className="bg-primary/5 border border-primary/20 rounded-xl p-4 hover:bg-primary/10 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Calendar className="w-5 h-5 text-primary" />
                                  <span className="font-semibold text-base-content">
                                    {getDayName(slot.dayOfWeek)}
                                  </span>
                                </div>
                                <span className="text-sm text-base-content/70">
                                  {slot.interviewDuration} min sessions
                                </span>
                              </div>
                              <div className="flex items-center gap-3 mt-2 ml-8">
                                <Clock className="w-5 h-5 text-secondary" />
                                <span className="font-medium">
                                  {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                </span>
                              </div>
                              {slot.breakTime?.start && (
                                <div className="text-xs text-base-content/60 mt-2 ml-8">
                                  ☕ Break: {formatTime(slot.breakTime.start)} - {formatTime(slot.breakTime.end)}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-base-content/60 ml-8">No availability set</p>
                      )}
                    </div>

                    {/* Timezone */}
                    {interviewer.timezone && (
                      <div className="flex items-center gap-3 text-base-content/70 pt-4 border-t border-base-300">
                        <Globe className="w-5 h-5 text-accent" />
                        <span className="text-sm font-medium">{interviewer.timezone}</span>
                      </div>
                    )}
                  </div>

                  {/* Book Button */}
                  <button
                    onClick={() => navigate(`/book-interview/${interviewer.interviewerId}`)}
                    className="w-full py-5 bg-gradient-to-r from-primary via-secondary to-accent text-white font-bold text-xl rounded-2xl hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 flex items-center justify-center gap-4 group"
                  >
                    <Calendar className="w-7 h-7 group-hover:scale-110 transition-transform" />
                    Book Mock Interview
                    <Sparkles className="w-7 h-7 group-hover:rotate-12 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewersPage;