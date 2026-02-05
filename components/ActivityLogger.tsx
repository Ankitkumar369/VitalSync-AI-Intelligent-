
import React, { useState } from 'react';
import { Plus, Search, Activity as ActivityIcon, Clock, Zap } from 'lucide-react';
import { ActivityLog } from '../types';

interface Props {
  activities: ActivityLog[];
  onAdd: (activity: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
}

const ActivityLogger: React.FC<Props> = ({ activities, onAdd }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Running',
    duration: 30,
    calories: 300
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    setShowAdd(false);
  };

  const activityPresets = [
    { type: 'Running', icon: '🏃', calPerMin: 10 },
    { type: 'Walking', icon: '🚶', calPerMin: 4 },
    { type: 'Cycling', icon: '🚴', calPerMin: 8 },
    { type: 'Swimming', icon: '🏊', calPerMin: 11 },
    { type: 'Yoga', icon: '🧘', calPerMin: 3 },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Activity Tracking</h2>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-2xl font-semibold flex items-center gap-2 shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
        >
          {showAdd ? 'Close' : <><Plus size={20} /> Log Activity</>}
        </button>
      </div>

      {showAdd && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Exercise Type</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-indigo-500"
              >
                {activityPresets.map(p => <option key={p.type} value={p.type}>{p.icon} {p.type}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Duration (min)</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="number" 
                  value={formData.duration}
                  onChange={(e) => {
                    const dur = parseInt(e.target.value) || 0;
                    const preset = activityPresets.find(p => p.type === formData.type);
                    setFormData({ ...formData, duration: dur, calories: dur * (preset?.calPerMin || 0) });
                  }}
                  className="w-full bg-slate-50 border-none rounded-xl pl-12 pr-4 py-3 text-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Calories Burned</label>
              <div className="relative">
                <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="number" 
                  value={formData.calories}
                  onChange={(e) => setFormData({ ...formData, calories: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border-none rounded-xl pl-12 pr-4 py-3 text-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="md:col-span-3">
              <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100">
                Log Exercise
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Activity</th>
              <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Duration</th>
              <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Intensity</th>
              <th className="text-right py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Burned</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {activities.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-slate-400 text-sm">No exercises logged for today yet. Start moving!</td>
              </tr>
            ) : (
              activities.map((act) => (
                <tr key={act.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                        {act.type[0]}
                      </div>
                      <span className="font-semibold text-slate-800">{act.type}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-600">{act.duration} mins</td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight ${
                      act.duration > 45 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                    }`}>
                      {act.duration > 45 ? 'High Intensity' : 'Moderate'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right font-bold text-orange-600">{act.calories} kcal</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActivityLogger;
