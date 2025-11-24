import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import schedulingApi from '../api/schedulingApi';

const AvailabilitySettings = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availabilities, setAvailabilities] = useState([]);
  
  const daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
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
    if (user) {
      fetchAvailabilities();
    }
  }, [user]);

  const fetchAvailabilities = async () => {
    setLoading(true);
    try {
      const response = await schedulingApi.getAvailability(user.id);
      if (response.success) {
        setAvailabilities(response.availabilities);
      }
    } catch (error) {
      console.error('Error fetching availabilities:', error);
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
        alert('✅ Availability saved successfully!');
        fetchAvailabilities();
        setFormData({
          ...formData,
          dayOfWeek: formData.dayOfWeek + 1 > 6 ? 1 : formData.dayOfWeek + 1
        });
      }
    } catch (error) {
      console.error('Error saving availability:', error);
      alert('❌ Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAvailability = async (id) => {
    if (!window.confirm('Are you sure you want to delete this availability?')) {
      return;
    }

    try {
      const response = await schedulingApi.deleteAvailability(id);
      if (response.success) {
        alert('✅ Availability deleted');
        fetchAvailabilities();
      }
    } catch (error) {
      console.error('Error deleting availability:', error);
      alert('❌ Failed to delete availability');
    }
  };

  const getDayLabel = (dayOfWeek) => {
    return daysOfWeek.find(d => d.value === dayOfWeek)?.label || 'Unknown';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ⚙️ Availability Settings
          </h1>
          <p className="text-lg text-gray-600">
            Set your weekly availability for interviews
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Add Availability Slot
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Day of Week
                </label>
                <select
                  value={formData.dayOfWeek}
                  onChange={(e) => setFormData({...formData, dayOfWeek: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {daysOfWeek.map(day => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Break Time (Optional)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="time"
                    placeholder="Start"
                    value={formData.breakStart}
                    onChange={(e) => setFormData({...formData, breakStart: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <input
                    type="time"
                    placeholder="End"
                    value={formData.breakEnd}
                    onChange={(e) => setFormData({...formData, breakEnd: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  e.g., Lunch break from 12:00 to 13:00
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interview Duration (minutes)
                </label>
                <select
                  value={formData.interviewDuration}
                  onChange={(e) => setFormData({...formData, interviewDuration: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buffer Between Interviews (minutes)
                </label>
                <select
                  value={formData.bufferMinutes}
                  onChange={(e) => setFormData({...formData, bufferMinutes: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="0">No buffer</option>
                  <option value="10">10 minutes</option>
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Time between interviews for notes and preparation
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <input
                  type="text"
                  value={formData.timezone}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

              <button
                onClick={handleSaveAvailability}
                disabled={saving}
                className="w-full px-6 py-4 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? '⏳ Saving...' : '✅ Save Availability'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Your Weekly Schedule
            </h2>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : availabilities.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-5xl mb-4">📅</div>
                <p className="text-gray-600">No availability set yet</p>
                <p className="text-gray-500 text-sm mt-2">
                  Add your first availability slot to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {daysOfWeek.map(day => {
                  const dayAvailabilities = availabilities.filter(
                    a => a.dayOfWeek === day.value && a.isActive
                  );

                  if (dayAvailabilities.length === 0) return null;

                  return (
                    <div key={day.value} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-bold text-gray-900 mb-3">{day.label}</h3>
                      <div className="space-y-2">
                        {dayAvailabilities.map(availability => (
                          <div
                            key={availability._id}
                            className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 text-sm">
                                <span className="font-medium text-gray-900">
                                  {availability.startTime} - {availability.endTime}
                                </span>
                                <span className="text-gray-500">
                                  ({availability.interviewDuration} min)
                                </span>
                              </div>
                              {availability.breakTime.start && availability.breakTime.end && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Break: {availability.breakTime.start} - {availability.breakTime.end}
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => handleDeleteAvailability(availability._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              🗑️
                            </button>
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

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-blue-900 mb-2">💡 How it works</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Set your available hours for each day of the week</li>
            <li>• Candidates will only see slots during your available times</li>
            <li>• Buffer time ensures you have breaks between interviews</li>
            <li>• Break times are automatically blocked from bookings</li>
            <li>• You can update your availability anytime</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AvailabilitySettings;