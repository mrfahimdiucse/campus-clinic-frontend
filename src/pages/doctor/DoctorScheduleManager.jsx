import React, { useState, useMemo } from 'react';
import {
  Video,
  Building2,
  MapPin,
  Clock,
  Calendar,
  Link as LinkIcon,
  Sparkles,
  Check,
  Save,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const DAYS_OF_WEEK = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const DoctorScheduleManager = () => {
  const [activeTab, setActiveTab] = useState('offline'); // 'offline' | 'online'
  const [isSaved, setIsSaved] = useState(false);

  // Offline Chamber State
  const [offlineSchedule, setOfflineSchedule] = useState({
    chamberLocation: 'Campus Medical Center - Room 204',
    selectedDays: ['Sat', 'Mon', 'Wed'],
    startTime: '09:00',
    endTime: '13:00',
    slotDuration: 20,
  });

  // Online Consultation State
  const [onlineSchedule, setOnlineSchedule] = useState({
    selectedDays: ['Sun', 'Tue', 'Thu'],
    startTime: '17:00',
    endTime: '20:00',
    slotDuration: 15,
    linkType: 'auto', // 'auto' | 'custom'
    customLink: 'https://meet.jit.si/campus-clinic-doc-consult',
  });

  // Handle Day Toggles
  const toggleDay = (day, mode) => {
    if (mode === 'offline') {
      setOfflineSchedule((prev) => ({
        ...prev,
        selectedDays: prev.selectedDays.includes(day)
          ? prev.selectedDays.filter((d) => d !== day)
          : [...prev.selectedDays, day],
      }));
    } else {
      setOnlineSchedule((prev) => ({
        ...prev,
        selectedDays: prev.selectedDays.includes(day)
          ? prev.selectedDays.filter((d) => d !== day)
          : [...prev.selectedDays, day],
      }));
    }
    setIsSaved(false);
  };

  // Generate Slot Time Ranges
  const generateSlots = (startTime, endTime, durationMinutes) => {
    if (!startTime || !endTime || !durationMinutes) return [];
    const slots = [];
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    let current = startH * 60 + startM;
    const endInMin = endH * 60 + endM;

    const formatTime = (totalMin) => {
      let h = Math.floor(totalMin / 60);
      const m = totalMin % 60;
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      const formattedM = m < 10 ? `0${m}` : m;
      return `${h}:${formattedM} ${ampm}`;
    };

    while (current + Number(durationMinutes) <= endInMin) {
      const slotStart = formatTime(current);
      const slotEnd = formatTime(current + Number(durationMinutes));
      slots.push(`${slotStart} - ${slotEnd}`);
      current += Number(durationMinutes);
    }

    return slots;
  };

  // Dynamic slot calculations based on current active tab
  const activeConfig = activeTab === 'offline' ? offlineSchedule : onlineSchedule;
  const generatedSlots = useMemo(
    () => generateSlots(activeConfig.startTime, activeConfig.endTime, activeConfig.slotDuration),
    [activeConfig.startTime, activeConfig.endTime, activeConfig.slotDuration]
  );

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 bg-[#F8FAFC] min-h-screen text-slate-800 font-sans">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Schedule & Availability Manager
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure your offline chamber consultation hours and online telemedicine slots.
          </p>
        </div>

        {isSaved && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm font-medium animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Schedule saved successfully!
          </div>
        )}
      </div>

      {/* Schedule Type Toggle Tabs */}
      <div className="flex border-b border-slate-200 mb-8 bg-white p-1.5 rounded-xl shadow-sm border">
        <button
          type="button"
          onClick={() => {
            setActiveTab('offline');
            setIsSaved(false);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
            activeTab === 'offline'
              ? 'bg-[#5000ff] text-white shadow-md shadow-[#5000ff]/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Offline Chamber</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('online');
            setIsSaved(false);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
            activeTab === 'online'
              ? 'bg-[#5000ff] text-white shadow-md shadow-[#5000ff]/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Online Consultation</span>
        </button>
      </div>

      {/* Main Grid: Form + Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Panel */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          {activeTab === 'offline' ? (
            /* Offline Schedule Configuration */
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Chamber Location
                </label>
                <div className="relative">
                  <MapPin className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={offlineSchedule.chamberLocation}
                    onChange={(e) =>
                      setOfflineSchedule({ ...offlineSchedule, chamberLocation: e.target.value })
                    }
                    placeholder="e.g. Campus Medical Center - Room 204"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5000ff] focus:ring-1 focus:ring-[#5000ff] transition-all"
                    required
                  />
                </div>
              </div>

              {/* Day Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Visiting Days
                </label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = offlineSchedule.selectedDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day, 'offline')}
                        className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-[#5000ff]/10 border-[#5000ff] text-[#5000ff]'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Range Pickers & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={offlineSchedule.startTime}
                    onChange={(e) =>
                      setOfflineSchedule({ ...offlineSchedule, startTime: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5000ff]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={offlineSchedule.endTime}
                    onChange={(e) =>
                      setOfflineSchedule({ ...offlineSchedule, endTime: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5000ff]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Slot Duration
                  </label>
                  <select
                    value={offlineSchedule.slotDuration}
                    onChange={(e) =>
                      setOfflineSchedule({ ...offlineSchedule, slotDuration: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5000ff]"
                  >
                    <option value={10}>10 Mins</option>
                    <option value={15}>15 Mins</option>
                    <option value={20}>20 Mins</option>
                    <option value={30}>30 Mins</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            /* Online Schedule Configuration */
            <div className="space-y-6">
              {/* Day Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Telemedicine Available Days
                </label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = onlineSchedule.selectedDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day, 'online')}
                        className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-[#5000ff]/10 border-[#5000ff] text-[#5000ff]'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Range Pickers & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={onlineSchedule.startTime}
                    onChange={(e) =>
                      setOnlineSchedule({ ...onlineSchedule, startTime: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5000ff]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={onlineSchedule.endTime}
                    onChange={(e) =>
                      setOnlineSchedule({ ...onlineSchedule, endTime: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5000ff]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Slot Duration
                  </label>
                  <select
                    value={onlineSchedule.slotDuration}
                    onChange={(e) =>
                      setOnlineSchedule({ ...onlineSchedule, slotDuration: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5000ff]"
                  >
                    <option value={10}>10 Mins</option>
                    <option value={15}>15 Mins</option>
                    <option value={20}>20 Mins</option>
                    <option value={30}>30 Mins</option>
                  </select>
                </div>
              </div>

              {/* Meeting Link Preferences */}
              <div className="border-t border-slate-100 pt-5 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Meeting Link Preference
                </label>

                <div className="grid grid-cols-1 gap-2">
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      onlineSchedule.linkType === 'auto'
                        ? 'border-[#5000ff] bg-[#5000ff]/5'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="linkType"
                      checked={onlineSchedule.linkType === 'auto'}
                      onChange={() => setOnlineSchedule({ ...onlineSchedule, linkType: 'auto' })}
                      className="mt-0.5 text-[#5000ff] focus:ring-[#5000ff]"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <Sparkles className="w-3.5 h-3.5 text-[#5000ff]" />
                        Auto-Generate Instant Link (Jitsi / Google Meet)
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Creates a unique secure room link per patient appointment automatically.
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      onlineSchedule.linkType === 'custom'
                        ? 'border-[#5000ff] bg-[#5000ff]/5'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="linkType"
                      checked={onlineSchedule.linkType === 'custom'}
                      onChange={() => setOnlineSchedule({ ...onlineSchedule, linkType: 'custom' })}
                      className="mt-0.5 text-[#5000ff] focus:ring-[#5000ff]"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <LinkIcon className="w-3.5 h-3.5 text-slate-600" />
                        Static Custom Call Link
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Use your personal permanent Zoom, Google Meet, or Webex room link.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Custom Link Input Field */}
                {onlineSchedule.linkType === 'custom' && (
                  <div className="mt-3 animate-fade-in">
                    <input
                      type="url"
                      value={onlineSchedule.customLink}
                      onChange={(e) =>
                        setOnlineSchedule({ ...onlineSchedule, customLink: e.target.value })
                      }
                      placeholder="https://meet.jit.si/your-room"
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5000ff]"
                      required
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Save Action Button */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 bg-[#5000ff] hover:bg-[#4000d6] text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-md shadow-[#5000ff]/20 transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Save Schedule Settings</span>
            </button>
          </div>
        </form>

        {/* Right Live Preview Panel */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5 sticky top-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Live Slots Preview
              </span>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mt-0.5">
                {activeTab === 'offline' ? 'Chamber Slots' : 'Telemedicine Slots'}
              </h2>
            </div>
            {/* Cyan Badge */}
            <span className="bg-[#00d2b5]/15 text-[#00a892] border border-[#00d2b5]/30 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1">
              <Check className="w-3 h-3" />
              {generatedSlots.length} Slots Daily
            </span>
          </div>

          {/* Details Overview */}
          <div className="bg-[#F8FAFC] p-4 rounded-xl border border-slate-200/60 space-y-2 text-xs text-slate-600">
            {activeTab === 'offline' ? (
              <p className="flex items-center gap-2 font-medium text-slate-800">
                <MapPin className="w-4 h-4 text-[#5000ff] shrink-0" />
                <span className="truncate">{offlineSchedule.chamberLocation || 'No location set'}</span>
              </p>
            ) : (
              <p className="flex items-center gap-2 font-medium text-slate-800">
                <LinkIcon className="w-4 h-4 text-[#5000ff] shrink-0" />
                <span className="truncate">
                  {onlineSchedule.linkType === 'auto'
                    ? 'Auto-Generated Unique Link'
                    : onlineSchedule.customLink || 'Custom link omitted'}
                </span>
              </p>
            )}

            <div className="flex items-center justify-between pt-1">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Days:
              </span>
              <span className="font-semibold text-slate-800">
                {activeConfig.selectedDays.length > 0
                  ? activeConfig.selectedDays.join(', ')
                  : 'None selected'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Time Interval:
              </span>
              <span className="font-semibold text-slate-800">
                {activeConfig.startTime} - {activeConfig.endTime} ({activeConfig.slotDuration}m per slot)
              </span>
            </div>
          </div>

          {/* Calculated Time Slot Pills */}
          <div>
            <span className="text-xs font-semibold text-slate-500 mb-2 block">
              Generated Patient Slots ({generatedSlots.length}):
            </span>

            {generatedSlots.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs flex flex-col items-center gap-1">
                <AlertCircle className="w-5 h-5 text-slate-300" />
                Invalid time range or duration selected.
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {generatedSlots.map((slot, index) => (
                  <div
                    key={index}
                    className="p-2.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:border-[#5000ff] transition-all flex items-center justify-between"
                  >
                    <span>{slot}</span>
                    <span className="text-[10px] text-slate-400 font-mono">#{index + 1}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorScheduleManager;