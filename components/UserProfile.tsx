
import React, { useRef, useState } from 'react';
import { 
  User, 
  Weight, 
  Ruler, 
  Target, 
  ChevronRight, 
  Award, 
  Flame, 
  Footprints, 
  Camera, 
  Trophy, 
  Calendar,
  Zap
} from 'lucide-react';
import { UserProfile as UserProfileType, ActivityLog, PersonalBest } from '../types';

interface Props {
  profile: UserProfileType;
  activities: ActivityLog[];
  streak: number;
  onUpdate: (profile: UserProfileType) => void;
}

const UserProfile: React.FC<Props> = ({ profile, activities, streak, onUpdate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  const bmi = (profile.weight / ((profile.height / 100) ** 2)).toFixed(1);

  const getBMICategory = (bmiVal: number) => {
    if (bmiVal < 18.5) return { label: 'Underweight', color: 'text-blue-500' };
    if (bmiVal < 25) return { label: 'Healthy', color: 'text-green-500' };
    if (bmiVal < 30) return { label: 'Overweight', color: 'text-orange-500' };
    return { label: 'Obese', color: 'text-red-500' };
  };

  const bmiInfo = getBMICategory(parseFloat(bmi));

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate({ ...profile, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Derived Personal Bests
  const personalBests: PersonalBest[] = [
    { label: 'Longest Workout', value: `${Math.max(0, ...activities.map(a => a.duration))} min`, date: Date.now() },
    { label: 'Max Daily Steps', value: '11,000', date: Date.now() },
    { label: 'Calorie Peak', value: `${Math.max(0, ...activities.map(a => a.calories))} kcal`, date: Date.now() },
    { label: 'Max Streak', value: `${streak} Days`, date: Date.now() },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-12">
      <header className="flex flex-col md:flex-row items-center gap-8 bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-slate-100 dark:border-zinc-800 shadow-sm">
        <div className="relative group cursor-pointer" onClick={handlePhotoClick}>
          {profile.avatar ? (
            <img src={profile.avatar} alt="Avatar" className="w-40 h-40 rounded-[48px] object-cover shadow-xl border-4 border-white dark:border-zinc-800" />
          ) : (
            <div className="w-40 h-40 rounded-[48px] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-6xl font-black shadow-xl">
              {profile.name[0]}
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 rounded-[48px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Camera className="text-white" size={32} />
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handlePhotoChange} 
            className="hidden" 
            accept="image/*" 
          />
        </div>
        <div className="text-center md:text-left flex-1">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
            <h2 className="text-4xl font-black text-slate-800 dark:text-zinc-100 tracking-tight">{profile.name}</h2>
            {streak > 0 && (
              <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 w-fit mx-auto md:mx-0">
                <Flame size={12} fill="currentColor" /> {streak} Day Streak
              </div>
            )}
          </div>
          <p className="text-slate-500 dark:text-zinc-400 font-medium mb-4">{profile.email}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-2">
             <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black rounded-lg uppercase tracking-widest border border-indigo-100 dark:border-indigo-500/20">Pro Member</span>
             <button onClick={() => setIsEditing(!isEditing)} className="px-4 py-1.5 bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold rounded-lg uppercase hover:scale-105 transition-transform">
               {isEditing ? 'Save Profile' : 'Edit Settings'}
             </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Detailed Goal Setting */}
          <section className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-slate-100 dark:border-zinc-800 shadow-sm">
             <h3 className="text-xl font-black text-slate-800 dark:text-zinc-100 mb-8 flex items-center gap-3">
               <Target className="text-indigo-600" size={24} />
               Active Performance Goals
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-4">
                 <div className="flex justify-between items-end">
                   <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Weight Target</p>
                   <p className="text-sm font-black text-slate-800 dark:text-zinc-100">{profile.targetWeight} kg</p>
                 </div>
                 <div className="h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 w-[85%] rounded-full" />
                 </div>
                 <p className="text-[10px] text-slate-500 text-right">2.5kg remaining to goal</p>
               </div>
               <div className="space-y-4">
                 <div className="flex justify-between items-end">
                   <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Weekly Sessions</p>
                   <p className="text-sm font-black text-slate-800 dark:text-zinc-100">{profile.weeklyWorkoutGoal} sessions</p>
                 </div>
                 <div className="h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-600 w-[60%] rounded-full" />
                 </div>
                 <p className="text-[10px] text-slate-500 text-right">3 of 5 completed this week</p>
               </div>
             </div>
          </section>

          {/* Personal Bests */}
          <section className="space-y-6">
            <h3 className="text-xl font-black text-slate-800 dark:text-zinc-100 flex items-center gap-3">
              <Trophy className="text-amber-500" size={24} />
              Personal Bests
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {personalBests.map((pb, idx) => (
                 <div key={idx} className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] border border-slate-100 dark:border-zinc-800 shadow-sm text-center">
                    <p className="text-[9px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-2">{pb.label}</p>
                    <p className="text-xl font-black text-slate-800 dark:text-zinc-100">{pb.value}</p>
                 </div>
               ))}
            </div>
          </section>

          {/* Physical Stats Form */}
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-slate-100 dark:border-zinc-800 shadow-sm grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <Ruler size={14} /> Height
              </label>
              <div className="flex items-end gap-1">
                <input 
                  type="number" 
                  readOnly={!isEditing}
                  value={profile.height}
                  onChange={(e) => onUpdate({ ...profile, height: parseInt(e.target.value) || 0 })}
                  className={`text-3xl font-black text-slate-800 dark:text-zinc-100 bg-transparent border-none p-0 w-24 focus:ring-0 ${isEditing ? 'border-b-2 border-indigo-600' : ''}`}
                />
                <span className="text-slate-400 font-bold pb-1">cm</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <Weight size={14} /> Weight
              </label>
              <div className="flex items-end gap-1">
                <input 
                  type="number" 
                  readOnly={!isEditing}
                  value={profile.weight}
                  onChange={(e) => onUpdate({ ...profile, weight: parseInt(e.target.value) || 0 })}
                  className={`text-3xl font-black text-slate-800 dark:text-zinc-100 bg-transparent border-none p-0 w-24 focus:ring-0 ${isEditing ? 'border-b-2 border-indigo-600' : ''}`}
                />
                <span className="text-slate-400 font-bold pb-1">kg</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Achievements */}
        <aside className="space-y-6">
          <div className="bg-slate-900 rounded-[40px] p-8 text-white flex flex-col shadow-2xl">
            <div className="flex items-center gap-3 mb-8">
               <Award className="text-amber-400" size={28} />
               <h3 className="text-xl font-bold">Hall of Fame</h3>
            </div>
            <div className="space-y-4 flex-1">
               {[
                 { name: 'Early Bird', icon: '☀️', desc: '5 workouts before 8 AM' },
                 { name: 'Hydration Hero', icon: '💧', desc: 'Met water goal 7 days' },
                 { name: 'Peak Performer', icon: '🏔️', desc: '15k steps in one day' },
                 { name: 'Streak Master', icon: '🔥', desc: 'Maintained 7 day streak' },
               ].map((badge, i) => (
                 <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="text-2xl">{badge.icon}</div>
                    <div>
                      <p className="text-sm font-bold">{badge.name}</p>
                      <p className="text-[10px] text-white/50">{badge.desc}</p>
                    </div>
                    <ChevronRight size={14} className="ml-auto opacity-30" />
                 </div>
               ))}
            </div>
            <button className="mt-8 w-full py-4 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-bold text-sm transition-all shadow-xl shadow-indigo-900/40">
              View Collection
            </button>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-slate-100 dark:border-zinc-800 shadow-sm space-y-6">
             <div className="flex items-center gap-3">
               <Zap className="text-indigo-600" size={24} />
               <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100">Vitality Index</h3>
             </div>
             <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-zinc-800 rounded-3xl">
               <div>
                  <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase">Current BMI</p>
                  <p className="text-2xl font-black text-slate-800 dark:text-zinc-100">{bmi}</p>
               </div>
               <div className="text-right">
                  <p className={`text-sm font-black ${bmiInfo.color}`}>{bmiInfo.label}</p>
               </div>
             </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default UserProfile;
