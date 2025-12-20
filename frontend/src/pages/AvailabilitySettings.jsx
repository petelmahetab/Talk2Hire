// frontend/src/pages/AvailabilitySettings.jsx
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import schedulingApi from '../api/schedulingApi';
import toast from 'react-hot-toast';
import { ArrowLeft, Clock, Calendar, Sun, Moon, Coffee, CheckCircle2, Trash2 } from 'lucide-react';

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
    startHour: '09',
    startMinute: '00',
    startPeriod: 'AM',
    endHour: '05',
    endMinute: '00',
    endPeriod: 'PM',
    breakStartHour: '',
    breakStartMinute: '',
    breakStartPeriod: 'AM',
    breakEndHour: '',
    breakEndMinute: '',
    breakEndPeriod: 'PM',
    interviewDuration: 60,
    bufferMinutes: 15,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  // Generate hours (1-12) and minutes (00, 15, 30, 45) - easier for users
  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minutes = ['00', '15', '30', '45']; // Changed to 15-min intervals

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

  // Convert 12-hour to 24-hour format (FIXED)
  const convertTo24Hour = (hour, minute, period) => {
    let h = parseInt(hour);
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${minute}`;
  };

  // Convert 24-hour to 12-hour format for display (FIXED)
  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleSaveAvailability = async () => {
    // Validation
    if (!formData.startHour || !formData.startMinute || !formData.endHour || !formData.endMinute) {
      toast.error('Please select start and end times');
      return;
    }

    setSaving(true);
    try {
      const startTime = convertTo24Hour(formData.startHour, formData.startMinute, formData.startPeriod);
      const endTime = convertTo24Hour(formData.endHour, formData.endMinute, formData.endPeriod);
      
      // Validate that end time is after start time
      const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
      const endMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
      
      if (endMinutes <= startMinutes) {
        toast.error('End time must be after start time');
        setSaving(false);
        return;
      }

      let breakTime = { start: null, end: null };
      if (formData.breakStartHour && formData.breakEndHour && formData.breakStartMinute && formData.breakEndMinute) {
        breakTime = {
          start: convertTo24Hour(formData.breakStartHour, formData.breakStartMinute, formData.breakStartPeriod),
          end: convertTo24Hour(formData.breakEndHour, formData.breakEndMinute, formData.breakEndPeriod)
        };
      }

      const availabilityData = {
        interviewerId: user.id,
        interviewerName: user.fullName,
        dayOfWeek: formData.dayOfWeek,
        startTime,
        endTime,
        breakTime,
        interviewDuration: parseInt(formData.interviewDuration),
        bufferMinutes: parseInt(formData.bufferMinutes),
        timezone: formData.timezone,
        isActive: true // Explicitly set to true
      };

      console.log('📤 Sending availability data:', availabilityData);

      const response = await schedulingApi.setAvailability(availabilityData);
      if (response.success) {
        toast.success('✅ Availability saved successfully!');
        fetchAvailabilities();
        
        // Reset break times only
        setFormData({ 
          ...formData, 
          breakStartHour: '',
          breakStartMinute: '',
          breakEndHour: '',
          breakEndMinute: ''
        });
      }
    } catch (error) {
      console.error('❌ Save error:', error);
      toast.error('Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAvailability = async (id) => {
    if (!window.confirm('Delete this availability slot?')) return;
    try {
      const response = await schedulingApi.deleteAvailability(id);
      if (response.success) {
        toast.success('✅ Slot deleted');
        fetchAvailabilities();
      }
    } catch (error) {
      toast.error('❌ Failed to delete');
    }
  };

  const TimeSelector = ({ label, hourValue, minuteValue, periodValue, onHourChange, onMinuteChange, onPeriodChange, icon: Icon }) => (
    <div>
      <label className="text-lg font-bold text-base-content mb-3 block flex items-center gap-2">
        {Icon && <Icon className="w-5 h-5 text-primary" />}
        {label}
      </label>
      <div className="flex gap-2">
        <select
          value={hourValue}
          onChange={(e) => onHourChange(e.target.value)}
          className="flex-1 px-4 py-3 bg-base-200 border border-base-300 rounded-xl text-base-content text-lg focus:outline-none focus:border-primary transition-all"
        >
          <option value="">HH</option>
          {hours.map(h => <option key={h} value={h}>{h}</option>)}
        </select>
        <span className="flex items-center text-2xl font-bold">:</span>
        <select
          value={minuteValue}
          onChange={(e) => onMinuteChange(e.target.value)}
          className="flex-1 px-4 py-3 bg-base-200 border border-base-300 rounded-xl text-base-content text-lg focus:outline-none focus:border-primary transition-all"
        >
          <option value="">MM</option>
          {minutes.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select
          value={periodValue}
          onChange={(e) => onPeriodChange(e.target.value)}
          className="px-4 py-3 bg-base-200 border border-base-300 rounded-xl text-base-content text-lg font-bold focus:outline-none focus:border-primary transition-all"
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    </div>
  );

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

      <div className="max-w-6xl mx-auto px-4 pb-12">
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
                        className={`py-4 rounded-xl font-bold transition-all ${formData.dayOfWeek === day.value 
                          ? 'bg-gradient-to-r from-primary via-secondary to-accent text-white shadow-xl' 
                          : 'bg-base-200 text-base-content/70 hover:bg-base-300'}`}
                      >
                        <Icon className="w-6 h-6 mx-auto mb-2" />
                        <span className="text-xs">{day.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <TimeSelector
                label="Start Time"
                icon={Clock}
                hourValue={formData.startHour}
                minuteValue={formData.startMinute}
                periodValue={formData.startPeriod}
                onHourChange={(val) => setFormData({...formData, startHour: val})}
                onMinuteChange={(val) => setFormData({...formData, startMinute: val})}
                onPeriodChange={(val) => setFormData({...formData, startPeriod: val})}
              />

              <TimeSelector
                label="End Time"
                icon={Clock}
                hourValue={formData.endHour}
                minuteValue={formData.endMinute}
                periodValue={formData.endPeriod}
                onHourChange={(val) => setFormData({...formData, endHour: val})}
                onMinuteChange={(val) => setFormData({...formData, endMinute: val})}
                onPeriodChange={(val) => setFormData({...formData, endPeriod: val})}
              />

              {/* Preview */}
              <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
                <p className="text-sm font-bold text-primary mb-1">Preview:</p>
                <p className="text-lg font-bold">
                  {formData.startHour && formData.startMinute ? 
                    `${formData.startHour}:${formData.startMinute} ${formData.startPeriod}` : '--:-- --'} 
                  {' → '}
                  {formData.endHour && formData.endMinute ? 
                    `${formData.endHour}:${formData.endMinute} ${formData.endPeriod}` : '--:-- --'}
                </p>
                <p className="text-sm text-base-content/70 mt-1">
                  Stored as: {formData.startHour && formData.startMinute ? 
                    convertTo24Hour(formData.startHour, formData.startMinute, formData.startPeriod) : '--:--'} 
                  {' to '}
                  {formData.endHour && formData.endMinute ? 
                    convertTo24Hour(formData.endHour, formData.endMinute, formData.endPeriod) : '--:--'}
                </p>
              </div>

              <div>
                <label className="text-xl font-bold text-base-content mb-3 block flex items-center gap-2">
                  <Coffee className="w-6 h-6 text-accent" />
                  Break Time (Optional)
                </label>
                <div className="space-y-4">
                  <TimeSelector
                    label="Break Start"
                    hourValue={formData.breakStartHour}
                    minuteValue={formData.breakStartMinute}
                    periodValue={formData.breakStartPeriod}
                    onHourChange={(val) => setFormData({...formData, breakStartHour: val})}
                    onMinuteChange={(val) => setFormData({...formData, breakStartMinute: val})}
                    onPeriodChange={(val) => setFormData({...formData, breakStartPeriod: val})}
                  />
                  <TimeSelector
                    label="Break End"
                    hourValue={formData.breakEndHour}
                    minuteValue={formData.breakEndMinute}
                    periodValue={formData.breakEndPeriod}
                    onHourChange={(val) => setFormData({...formData, breakEndHour: val})}
                    onMinuteChange={(val) => setFormData({...formData, breakEndMinute: val})}
                    onPeriodChange={(val) => setFormData({...formData, breakEndPeriod: val})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-lg font-bold text-base-content mb-3 block">Interview Duration</label>
                  <select value={formData.interviewDuration} onChange={(e) => setFormData({...formData, interviewDuration: e.target.value})} className="w-full px-4 py-3 bg-base-200 border border-base-300 rounded-xl text-base-content text-lg focus:border-primary">
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                  </select>
                </div>
                <div>
                  <label className="text-lg font-bold text-base-content mb-3 block">Buffer Time</label>
                  <select value={formData.bufferMinutes} onChange={(e) => setFormData({...formData, bufferMinutes: e.target.value})} className="w-full px-4 py-3 bg-base-200 border border-base-300 rounded-xl text-base-content text-lg focus:border-primary">
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
                className="w-full py-4 bg-gradient-to-r from-primary via-secondary to-accent text-white font-black text-xl rounded-2xl hover:shadow-2xl hover:shadow-primary/50 transition-all duration-300 flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : (
                  <>
                    <CheckCircle2 className="w-7 h-7" />
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
                <p className="text-2xl font-bold text-base-content/60">No availability set yet</p>
                <p className="text-base-content/50 mt-2">Add your first slot to get started!</p>
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
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-base-content">{day.label}</h3>
                      </div>
                      <div className="space-y-3 ml-14">
                        {dayAvail.map(avail => (
                          <div key={avail._id} className="bg-base-100 rounded-xl p-4 border border-base-300 hover:border-primary transition-all">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Clock className="w-6 h-6 text-primary" />
                                <div>
                                  <span className="text-lg font-bold text-base-content">
                                    {formatTime(avail.startTime)} - {formatTime(avail.endTime)}
                                  </span>
                                  <p className="text-sm text-base-content/60">
                                    {avail.interviewDuration} min sessions · {avail.bufferMinutes} min buffer
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteAvailability(avail._id)}
                                className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-xl transition-all"
                              >
                                <Trash2 className="w-5 h-5 text-red-400" />
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
