
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Droplets, 
  Moon, 
  Activity as ActivityIcon,
  Flame,
  ChevronRight,
  Wind,
  AlertCircle,
  MapPin,
  ShieldCheck,
  RefreshCw,
  Watch,
  Zap,
  LayoutDashboard,
  CheckCircle2,
  CalendarDays
} from 'lucide-react';
import { 
  XAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';
import { UserStats, ActivityLog, AQIStatus, UserProfile } from '../types';
import { getAQIAdvice } from '../services/geminiService';
import { syncWearableData } from '../services/wearableService';

const chartData = [
  { name: 'Mon', steps: 6200, calories: 1800, hr: 72 },
  { name: 'Tue', steps: 7800, calories: 2100, hr: 68 },
  { name: 'Wed', steps: 4500, calories: 1600, hr: 75 },
  { name: 'Thu', steps: 9100, calories: 2400, hr: 70 },
  { name: 'Fri', steps: 8420, calories: 2200, hr: 71 },
  { name: 'Sat', steps: 11000, calories: 2900, hr: 65 },
  { name: 'Sun', steps: 5200, calories: 1750, hr: 74 },
];

interface Props {
  stats: UserStats;
  activities: ActivityLog[];
  streak: number;
  onBulkSync: (data: ActivityLog[]) => void;
  profile: UserProfile;
}

const Dashboard: React.FC<Props> = ({ stats, activities, streak, onBulkSync, profile }) => {
  const [aqiData, setAqiData] = useState<AQIStatus | null>(null);
  const [locationName, setLocationName] = useState<string>('Detecting location...');
  const [loadingAqi, setLoadingAqi] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [chartType, setChartType] = useState<'steps' | 'calories'>('steps');

  useEffect(() => {
    const fetchLocationAndAqi = async () => {
      setLoadingAqi(true);
      try {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            const data = await getAQIAdvice(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
            setAqiData(data);
            setLocationName("Current Location");
            setLoadingAqi(false);
          }, async (error) => {
            const data = await getAQIAdvice("San Francisco");
            setAqiData(data);
            setLocationName("San Francisco");
            setLoadingAqi(false);
          });
        }
      } catch (err) {
        setLoadingAqi(false);
      }
    };
    fetchLocationAndAqi();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const newData = await syncWearableData();
      onBulkSync(newData);
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(false);
    }
  };

  const activeDays = useMemo(() => {
    const today = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateString = d.toDateString();
      const hasActivity = activities.some(a => new Date(a.timestamp).toDateString() === dateString);
      days.push({
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        active: hasActivity,
        isToday: i === 0
      });
    }
    return days;
  }, [activities]);

  const progress = Math.min(100, Math.round((stats.steps / profile.dailyStepGoal) * 100));
  const flameSize = Math.min(64, 24 + (streak * 4));

  return (
    <div className="space-y-6 pb-12 md:pb-0">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
             <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                <LayoutDashboard size={28} />
             </div>
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-zinc-100 tracking-tight">Performance Summary</h2>
            <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium">Hello, {profile.name.split(' ')[0]}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 px-4 py-2 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm text-xs font-bold text-slate-600 dark:text-zinc-300">
            <MapPin size={14} className="text-indigo-500" />
            {locationName}
          </div>
          <button 
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-2xl font-bold text-xs hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none disabled:opacity-50"
          >
            {syncing ? <RefreshCw className="animate-spin" size={14} /> : <Watch size={14} />}
            {syncing ? 'Syncing...' : 'Sync Wearable'}
          </button>
        </div>
      </header>

      {/* Streak Journey Component */}
      <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-8 border border-slate-100 dark:border-zinc-800 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10 dark:opacity-5 pointer-events-none">
          <Flame size={120} className="text-orange-500 animate-pulse" />
        </div>
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          <div className="flex items-center gap-6">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-24 h-24 bg-orange-100 dark:bg-orange-500/10 rounded-full animate-ping opacity-20" />
              <div 
                className="bg-orange-500 text-white rounded-[24px] flex items-center justify-center shadow-xl shadow-orange-500/30 transition-all duration-500"
                style={{ width: `${flameSize + 20}px`, height: `${flameSize + 20}px` }}
              >
                <Flame size={flameSize} fill="currentColor" />
              </div>
            </div>
            <div>
              <p className="text-4xl font-black text-slate-800 dark:text-zinc-100">{streak}</p>
              <p className="text-xs font-bold text-orange-500 uppercase tracking-widest">Day Streak</p>
            </div>
          </div>
          
          <div className="flex-1 w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <CalendarDays size={16} /> Activity Calendar
              </h3>
              <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">Last 7 Days</p>
            </div>
            <div className="flex justify-between items-center gap-2">
              {activeDays.map((day, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                  <div className={`w-full aspect-square max-w-[48px] rounded-2xl flex items-center justify-center transition-all duration-300 border ${
                    day.active 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none' 
                    : day.isToday
                    ? 'bg-white dark:bg-zinc-800 border-indigo-200 dark:border-zinc-700 text-indigo-200 animate-pulse'
                    : 'bg-slate-50 dark:bg-zinc-800 border-slate-100 dark:border-zinc-800 text-slate-300'
                  }`}>
                    {day.active ? <CheckCircle2 size={20} /> : <div className="w-2 h-2 rounded-full bg-current opacity-20" />}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-tighter ${day.isToday ? 'text-indigo-600' : 'text-slate-400'}`}>
                    {day.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="hidden lg:block w-px h-16 bg-slate-100 dark:bg-zinc-800" />
          
          <div className="text-center lg:text-left">
            <p className="text-sm font-bold text-slate-800 dark:text-zinc-200 mb-1">
              {streak === 0 ? "Start your journey!" : streak < 3 ? "Off to a great start!" : "You're on fire!"}
            </p>
            <p className="text-xs text-slate-400 dark:text-zinc-500 leading-relaxed max-w-[200px]">
              {streak === 0 ? "Complete a workout today to start your first streak." : `Keep it up! You've been active for ${streak} days in a row.`}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-purple-800 dark:from-indigo-700 dark:to-purple-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-100 dark:shadow-none">
          <div className="relative z-10 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <Wind size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold">Air Quality Index</h3>
                <p className="text-indigo-100 text-xs opacity-80 uppercase tracking-widest font-black">Environment Report</p>
              </div>
            </div>

            {loadingAqi ? (
              <div className="flex-1 flex items-center gap-4 animate-pulse">
                <div className="h-14 w-40 bg-white/10 rounded-2xl"></div>
                <div className="h-4 w-48 bg-white/10 rounded-full"></div>
              </div>
            ) : aqiData ? (
              <div className="space-y-6 flex-1 flex flex-col justify-end">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="text-5xl font-black mb-1">Live</span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Status Analyzed</span>
                  </div>
                  <div className="h-12 w-px bg-white/20" />
                  <div className="flex-1">
                    <p className="text-lg font-bold flex items-center gap-2 mb-1">
                      <ShieldCheck size={20} className="text-emerald-400" />
                      Outdoor Safety
                    </p>
                    <p className="text-indigo-50/70 text-sm line-clamp-2 leading-relaxed">
                      {aqiData.recommendation.split('\n')[0]}
                    </p>
                  </div>
                </div>
                <div className="pt-2">
                   <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl font-bold text-xs transition-all border border-white/10 backdrop-blur-md">
                    Personalized Training Guide
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-indigo-100">
                <AlertCircle size={20} />
                <p>Environment data unavailable.</p>
              </div>
            )}
          </div>
          <Wind size={280} className="absolute -bottom-20 -right-20 text-white opacity-[0.03] rotate-12 pointer-events-none" />
        </div>

        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-slate-100 dark:border-zinc-800 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="relative w-40 h-40 mb-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="14" fill="transparent" className="text-slate-50 dark:text-zinc-800" />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="14"
                fill="transparent"
                strokeDasharray={440}
                strokeDashoffset={440 - (440 * (progress / 100))}
                strokeLinecap="round"
                className="text-indigo-600 dark:text-indigo-500 transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-slate-800 dark:text-zinc-100">{progress}%</span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Steps</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="font-bold text-slate-800 dark:text-zinc-200">Daily Milestone</p>
            <p className="text-xs text-slate-400 dark:text-zinc-500 font-medium">{stats.steps.toLocaleString()} / {profile.dailyStepGoal.toLocaleString()} steps</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Energy', value: `${(stats.steps * 0.04).toFixed(0)} kcal`, icon: Flame, color: 'bg-orange-50 dark:bg-orange-500/5 text-orange-600 dark:text-orange-400' },
          { label: 'Hydration', value: `${stats.water}L`, icon: Droplets, color: 'bg-blue-50 dark:bg-blue-500/5 text-blue-600 dark:text-blue-400' },
          { label: 'Rest Time', value: `${stats.sleep}h`, icon: Moon, color: 'bg-purple-50 dark:bg-purple-500/5 text-purple-600 dark:text-purple-400' },
          { label: 'Weight', value: `${profile.weight} kg`, icon: ActivityIcon, color: 'bg-emerald-50 dark:bg-emerald-500/5 text-emerald-600 dark:text-emerald-400' },
        ].map((item, idx) => (
          <div key={idx} className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-sm hover:translate-y-[-4px] transition-all group">
            <div className={`w-12 h-12 ${item.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <item.icon size={22} />
            </div>
            <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.2em] mb-1">{item.label}</p>
            <p className="text-2xl font-black text-slate-800 dark:text-zinc-100">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-slate-100 dark:border-zinc-800 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h3 className="font-black text-slate-800 dark:text-zinc-100 uppercase tracking-widest text-sm">Activity Analytics</h3>
            <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl">
               <button onClick={() => setChartType('steps')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${chartType === 'steps' ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-400'}`}>Steps</button>
               <button onClick={() => setChartType('calories')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${chartType === 'calories' ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-400'}`}>Energy</button>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'steps' ? (
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:opacity-10" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={10} />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', background: '#1e293b', color: '#fff'}}
                    itemStyle={{color: '#fff', fontSize: '12px', fontWeight: 'bold'}}
                  />
                  <Area type="monotone" dataKey="steps" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorSteps)" />
                </AreaChart>
              ) : (
                <BarChart data={chartData}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:opacity-10" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={10} />
                   <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', background: '#1e293b', color: '#fff'}}
                  />
                   <Bar dataKey="calories" fill="#f97316" radius={[6, 6, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-slate-100 dark:border-zinc-800 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-slate-800 dark:text-zinc-100 uppercase tracking-widest text-sm">Recent Activity</h3>
            <button className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest">History</button>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-300 dark:text-zinc-700">
                <Watch size={48} className="mb-4 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest">No Device Data</p>
              </div>
            ) : (
              activities.map((act) => (
                <div key={act.id} className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-11 h-11 rounded-xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <ActivityIcon size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-slate-800 dark:text-zinc-100">{act.type}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] text-slate-500 font-bold uppercase">{act.duration} min</p>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <p className="text-[10px] text-indigo-500 font-bold uppercase">{act.heartRateAvg || '85'} BPM</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-200 group-hover:text-slate-400 transition-colors" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
