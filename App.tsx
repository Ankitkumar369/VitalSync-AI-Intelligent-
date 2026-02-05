
import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Utensils, 
  AlertTriangle, 
  Wind, 
  LayoutDashboard, 
  Heart,
  User,
  Moon,
  Sun,
  Globe,
  LogOut,
  Image as ImageIcon,
  Video,
  Map as MapIcon
} from 'lucide-react';
import { ActivityLog, UserStats, UserProfile as UserProfileType } from './types';
import Dashboard from './components/Dashboard';
import ActivityLogger from './components/ActivityLogger';
import DietPlan from './components/DietPlan';
import HealthMonitor from './components/HealthMonitor';
import AQIAdvisor from './components/AQIAdvisor';
import WellnessCenter from './components/WellnessCenter';
import UserProfile from './components/UserProfile';
import NewsFeed from './components/NewsFeed';
import Auth from './components/Auth';
import ImageLab from './components/ImageLab';
import VideoStudio from './components/VideoStudio';
import FacilityFinder from './components/FacilityFinder';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'activity' | 'diet' | 'health' | 'aqi' | 'wellness' | 'profile' | 'news' | 'image-lab' | 'video-studio' | 'facilities'>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [streak, setStreak] = useState(0);
  const [profile, setProfile] = useState<UserProfileType>({
    name: "Alex Johnson",
    email: "alex.j@example.com",
    age: 28,
    height: 175,
    weight: 72,
    goal: 'Maintain',
    dailyStepGoal: 10000,
    dailyCalorieGoal: 2400,
    targetWeight: 70,
    weeklyWorkoutGoal: 5
  });

  const [stats, setStats] = useState<UserStats>({
    steps: 8420,
    water: 1.8,
    sleep: 7.5,
    weight: 72
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (activities.length === 0) {
      setStreak(0);
      return;
    }
    const dates = activities.map(a => new Date(a.timestamp).toDateString());
    const uniqueDates = [...new Set(dates)];
    setStreak(uniqueDates.length);
  }, [activities]);

  const addActivity = (activity: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const newActivity = {
      ...activity,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    };
    setActivities([newActivity, ...activities]);
    setStats(prev => ({ 
      ...prev, 
      steps: prev.steps + (activity.type.includes('Walking') ? 2000 : 500) 
    }));
  };

  const addBulkActivities = (newActivities: ActivityLog[]) => {
    setActivities(prev => [...newActivities, ...prev]);
    const extraSteps = newActivities.reduce((acc, act) => acc + (act.duration * 50), 0);
    setStats(prev => ({ ...prev, steps: prev.steps + extraSteps }));
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'facilities', label: 'Find Gyms', icon: MapIcon },
    { id: 'news', label: 'Health News', icon: Globe },
    { id: 'image-lab', label: 'Image Lab', icon: ImageIcon },
    { id: 'video-studio', label: 'Veo Video', icon: Video },
    { id: 'wellness', label: 'Wellness', icon: Heart },
    { id: 'health', label: 'Health AI', icon: AlertTriangle },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  if (!isLoggedIn) {
    return <Auth onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen pb-24 md:pb-0 md:pl-64 flex flex-col bg-slate-50 dark:bg-zinc-950 transition-colors duration-500">
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 fixed h-screen left-0 top-0 z-20">
        <div className="p-6 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Activity size={24} />
            </div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-zinc-100 tracking-tight">VitalSync AI</h1>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-semibold' 
                : 'text-slate-500 dark:text-zinc-500 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-slate-800 dark:hover:text-zinc-200'
              }`}
            >
              <item.icon size={20} />
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-100 dark:border-zinc-800 space-y-2">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span className="text-sm font-medium">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button onClick={() => setIsLoggedIn(false)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all">
            <LogOut size={20} />
            <span className="text-sm font-medium">Log Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
        {activeTab === 'dashboard' && <Dashboard stats={stats} activities={activities} streak={streak} onBulkSync={addBulkActivities} profile={profile} />}
        {activeTab === 'news' && <NewsFeed />}
        {activeTab === 'image-lab' && <ImageLab />}
        {activeTab === 'video-studio' && <VideoStudio />}
        {activeTab === 'facilities' && <FacilityFinder />}
        {activeTab === 'wellness' && <WellnessCenter />}
        {activeTab === 'health' && <HealthMonitor activities={activities} />}
        {activeTab === 'profile' && <UserProfile profile={profile} activities={activities} streak={streak} onUpdate={setProfile} />}
      </main>

      <nav className="md:hidden fixed bottom-4 left-4 right-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-lg border border-slate-200 dark:border-zinc-800 rounded-3xl px-2 py-2 flex justify-around items-center z-30 shadow-2xl">
        {navItems.slice(0, 5).map((item) => (
          <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`flex flex-col items-center p-3 rounded-2xl transition-all ${activeTab === item.id ? 'bg-indigo-600 text-white' : 'text-slate-400 dark:text-zinc-500'}`}>
            <item.icon size={20} />
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
