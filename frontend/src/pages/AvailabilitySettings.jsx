// frontend/src/pages/AvailabilitySettings.jsx
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import schedulingApi from '../api/schedulingApi';
import toast from 'react-hot-toast';
import { ArrowLeft, Clock, Calendar, Sun, Moon, Coffee, CheckCircle2, Trash2, Sparkles } from 'lucide-react';

const AvailabilitySettings = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availabilities, setAvailabilities] = useState([]);

  const daysOfWeek = [
    { value: 0, label: 'Sunday', icon: Sun },
    { value: 1, label: 'Monday', icon: Calendar },
    { value: 2, label: 'Tuesday', icon: Calendar },
    { value: 3, label: 'Wednesday', icon: Calendar },
    { value: 4, label: 'Thursday', icon: Calendar },
    { value: 5, label: 'Friday', icon: Calendar },
    { value: 6, label: 'Saturday', icon: Moon }
  ];

  const [formData, setFormData] = useState({
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '17:00',
    breakStart: '',
    breakEnd: '',
    interviewDuration: 60,
    bufferMinutes: 15,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  useEffect(() => {
    if (user) fetchAvailabilities();
  }, [user]);

  const fetchAvailabilities = async () => {
  setLoading(true);
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    const response = await schedulingApi.getAvailability(user.id);
    if (response.success) setAvailabilities(response.availabilities);
  } catch (error) {
    toast.error('Failed to load availability');
  } finally {
    setLoading(false);
  }
};

  const handleSaveAvailability = async () => {
    setSaving(true);
    try {
      const availabilityData = {
        interviewerId: user.id,
        interviewerName: user.fullName,
        dayOfWeek: formData.dayOfWeek,
        startTime: formData.startTime,
        endTime: formData.endTime,
        breakTime: {
          start: formData.breakStart || null,
          end: formData.breakEnd || null
        },
        interviewDuration: parseInt(formData.interviewDuration),
        bufferMinutes: parseInt(formData.bufferMinutes),
        timezone: formData.timezone
      };

      const response = await schedulingApi.setAvailability(availabilityData);
      if (response.success) {
        toast.success('Availability saved successfully!');
        fetchAvailabilities();
        setFormData({ ...formData, dayOfWeek: (formData.dayOfWeek + 1) % 7 });
      }
    } catch (error) {
      toast.error('Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAvailability = async (id) => {
    if (!window.confirm('Delete this slot?')) return;
    try {
      const response = await schedulingApi.deleteAvailability(id);
      if (response.success) {
        toast.success('Slot deleted');
        fetchAvailabilities();
      }
    } catch (error) {
      toast.error('Failed to delete');
    }
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
          Set Your Availability
        </h1>
        <p className="text-lg md:text-xl text-base-content/70">Let candidates know when you're free to interview</p>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Slot Form */}
          <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 p-6 md:p-8">
            <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-8 flex items-center gap-3">
              <Calendar className="w-10 h-10" />
              Add Availability Slot
            </h2>

            <div className="space-y-6">
              <div>
                <label className="text-xl font-bold text-base-content mb-4 block">Day of Week</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {daysOfWeek.map(day => {
                    const Icon = day.icon;
                    return (
                      <button
                        key={day.value}
                        onClick={() => setFormData({...formData, dayOfWeek: day.value})}
                        className={`py-5 rounded-xl font-bold transition-all ${formData.dayOfWeek === day.value 
                          ? 'bg-gradient-to-r from-primary via-secondary to-accent text-white shadow-xl' 
                          : 'bg-base-200 text-base-content/70 hover:bg-base-300'}`}
                      >
                        <Icon className="w-8 h-8 mx-auto mb-2" />
                        <span className="text-sm">{day.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xl font-bold text-base-content mb-3 block flex items-center gap-2">
                    <Clock className="w-6 h-6 text-primary" />
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    className="w-full px-5 py-4 bg-base-200 border border-base-300 rounded-xl text-base-content text-lg focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="text-xl font-bold text-base-content mb-3 block">End Time</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    className="w-full px-5 py-4 bg-base-200 border border-base-300 rounded-xl text-base-content text-lg focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xl font-bold text-base-content mb-3 block flex items-center gap-2">
                  <Coffee className="w-6 h-6 text-accent" />
                  Break Time (Optional)
                </label>
                <div className="grid grid-cols-2 gap-6">
                  <input type="time" placeholder="Start" value={formData.breakStart} onChange={(e) => setFormData({...formData, breakStart: e.target.value})} className="px-5 py-4 bg-base-200 border border-base-300 rounded-xl text-base-content text-lg focus:border-accent" />
                  <input type="time" placeholder="End" value={formData.breakEnd} onChange={(e) => setFormData({...formData, breakEnd: e.target.value})} className="px-5 py-4 bg-base-200 border border-base-300 rounded-xl text-base-content text-lg focus:border-accent" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xl font-bold text-base-content mb-3 block">Interview Duration</label>
                  <select value={formData.interviewDuration} onChange={(e) => setFormData({...formData, interviewDuration: e.target.value})} className="w-full px-5 py-4 bg-base-200 border border-base-300 rounded-xl text-base-content text-lg focus:border-primary">
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                  </select>
                </div>
                <div>
                  <label className="text-xl font-bold text-base-content mb-3 block">Buffer Time</label>
                  <select value={formData.bufferMinutes} onChange={(e) => setFormData({...formData, bufferMinutes: e.target.value})} className="w-full px-5 py-4 bg-base-200 border border-base-300 rounded-xl text-base-content text-lg focus:border-primary">
                    <option value="0">No buffer</option>
                    <option value="10">10 minutes</option>
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleSaveAvailability}
                disabled={saving}
                className="w-full py-5 bg-gradient-to-r from-primary via-secondary to-accent text-white font-black text-2xl rounded-2xl hover:shadow-2xl hover:shadow-primary/50 transition-all duration-300 flex items-center justify-center gap-4"
              >
                {saving ? 'Saving...' : (
                  <>
                    <CheckCircle2 className="w-8 h-8" />
                    SAVE AVAILABILITY
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Weekly Schedule */}
          <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 p-6 md:p-8">
            <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-8">
              Your Weekly Schedule
            </h2>
            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-primary mx-auto"></div>
              </div>
            ) : availabilities.length === 0 ? (
              <div className="text-center py-20">
                <Calendar className="w-24 h-24 mx-auto mb-6 text-base-content/30" />
                <p className="text-3xl font-bold text-base-content/60">No availability set yet</p>
              </div>
            ) : (
              <div className="space-y-6">
                {daysOfWeek.map(day => {
                  const dayAvail = availabilities.filter(a => a.dayOfWeek === day.value);
                  if (dayAvail.length === 0) return null;

                  const Icon = day.icon;
                  return (
                    <div key={day.value} className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-6 border border-primary/20">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-gradient-to-r from-primary via-secondary to-accent rounded-xl shadow-xl">
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-base-content">{day.label}</h3>
                      </div>
                      <div className="space-y-4 ml-14">
                        {dayAvail.map(avail => (
                          <div key={avail._id} className="bg-base-100 rounded-xl p-5 border border-base-300 hover:border-primary transition-all">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <Clock className="w-7 h-7 text-primary" />
                                <span className="text-xl font-bold text-base-content">
                                  {formatTime(avail.startTime)} - {formatTime(avail.endTime)}
                                </span>
                                <span className="text-base-content/70">
                                  ({avail.interviewDuration} min)
                                </span>
                              </div>
                              <button
                                onClick={() => handleDeleteAvailability(avail._id)}
                                className="p-3 bg-red-500/20 hover:bg-red-500/40 rounded-xl transition-all"
                              >
                                <Trash2 className="w-6 h-6 text-red-400" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailabilitySettings;
