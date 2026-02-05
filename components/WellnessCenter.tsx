

import React, { useState, useEffect, useRef } from 'react';
import { 
  Wind, 
  Sun, 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  MapPin, 
  RefreshCw, 
  Move, 
  ExternalLink, 
  AlertCircle, 
  Brain, 
  Focus, 
  CloudLightning,
  ChevronRight,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { getWeatherBasedActivities, getMentalHealthAdvice } from '../services/geminiService';
import { WeatherActivitySuggestion, BreathingPattern, MentalExercise } from '../types';

const BREATHING_PATTERNS: BreathingPattern[] = [
  { name: 'Box Breathing', inhale: 4, hold1: 4, exhale: 4, hold2: 4 },
  { name: '4-7-8 Relax', inhale: 4, hold1: 7, exhale: 8, hold2: 0 },
  { name: 'Deep Calm', inhale: 5, hold1: 0, exhale: 5, hold2: 0 },
];

const WellnessCenter: React.FC = () => {
  const [activeWellness, setActiveWellness] = useState<'breathing' | 'weather' | 'focus'>('breathing');
  
  // Breathing States
  const [pattern, setPattern] = useState(BREATHING_PATTERNS[0]);
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Pause'>('Inhale');
  const [timeLeft, setTimeLeft] = useState(pattern.inhale);
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const breathingTimerRef = useRef<number | null>(null);

  // Weather States
  const [location, setLocation] = useState('New York');
  const [weatherData, setWeatherData] = useState<WeatherActivitySuggestion | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  // Mental Health States
  const [mentalExercises, setMentalExercises] = useState<MentalExercise[]>([]);
  const [loadingMental, setLoadingMental] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<'Focus' | 'Stress' | 'Concentration'>('Focus');
  const [focusTimer, setFocusTimer] = useState(25 * 60); // 25 mins in seconds
  const [isFocusTimerActive, setIsFocusTimerActive] = useState(false);
  const focusTimerRef = useRef<number | null>(null);

  // Breathing Logic
  useEffect(() => {
    if (isBreathingActive) {
      breathingTimerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            switch (phase) {
              case 'Inhale':
                if (pattern.hold1 > 0) { setPhase('Hold'); return pattern.hold1; }
                setPhase('Exhale'); return pattern.exhale;
              case 'Hold':
                setPhase('Exhale'); return pattern.exhale;
              case 'Exhale':
                if (pattern.hold2 > 0) { setPhase('Pause'); return pattern.hold2; }
                setPhase('Inhale'); return pattern.inhale;
              case 'Pause':
                setPhase('Inhale'); return pattern.inhale;
              default:
                return pattern.inhale;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (breathingTimerRef.current !== null) {
        window.clearInterval(breathingTimerRef.current);
        breathingTimerRef.current = null;
      }
    }
    return () => { if (breathingTimerRef.current !== null) window.clearInterval(breathingTimerRef.current); };
  }, [isBreathingActive, phase, pattern]);

  // Focus Timer Logic
  useEffect(() => {
    if (isFocusTimerActive && focusTimer > 0) {
      focusTimerRef.current = window.setInterval(() => {
        setFocusTimer(prev => prev - 1);
      }, 1000);
    } else {
      if (focusTimerRef.current !== null) {
        window.clearInterval(focusTimerRef.current);
        focusTimerRef.current = null;
      }
      if (focusTimer === 0) setIsFocusTimerActive(false);
    }
    return () => { if (focusTimerRef.current !== null) window.clearInterval(focusTimerRef.current); };
  }, [isFocusTimerActive, focusTimer]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const fetchMentalExercises = async () => {
    setLoadingMental(true);
    try {
      const data = await getMentalHealthAdvice(selectedGoal);
      setMentalExercises(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMental(false);
    }
  };

  useEffect(() => {
    if (activeWellness === 'focus') fetchMentalExercises();
  }, [activeWellness, selectedGoal]);

  const fetchWeatherActivities = async () => {
    setLoadingWeather(true);
    try {
      const result = await getWeatherBasedActivities(location);
      setWeatherData(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingWeather(false);
    }
  };

  useEffect(() => {
    if (activeWellness === 'weather' && !weatherData) fetchWeatherActivities();
  }, [activeWellness]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Mind & Body Wellness</h2>
          <p className="text-slate-500">Holistic tools for your health and focus.</p>
        </div>
        <div className="inline-flex bg-slate-100 p-1 rounded-2xl self-start overflow-x-auto max-w-full">
          {[
            { id: 'breathing', label: 'Breathing' },
            { id: 'focus', label: 'Mental Focus' },
            { id: 'weather', label: 'Weather Training' }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveWellness(tab.id as any)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeWellness === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {activeWellness === 'breathing' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col items-center justify-center p-12 min-h-[500px]">
            <div className="relative flex items-center justify-center mb-12">
              <div className={`absolute w-64 h-64 bg-indigo-50 rounded-full transition-all duration-1000 ease-in-out ${isBreathingActive && phase === 'Inhale' ? 'scale-150 opacity-100' : isBreathingActive && phase === 'Exhale' ? 'scale-100 opacity-60' : isBreathingActive && phase === 'Hold' ? 'scale-150 opacity-80' : 'scale-100 opacity-40'}`} />
              <div className={`z-10 w-48 h-48 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex flex-col items-center justify-center text-white shadow-2xl transition-all duration-1000 ease-in-out ${isBreathingActive && phase === 'Inhale' ? 'scale-125' : isBreathingActive && phase === 'Exhale' ? 'scale-100' : isBreathingActive && phase === 'Hold' ? 'scale-125' : 'scale-100'}`}>
                <p className="text-2xl font-bold mb-1">{isBreathingActive ? phase : 'Ready?'}</p>
                <p className="text-4xl font-black">{isBreathingActive ? timeLeft : pattern.inhale}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setIsBreathingActive(!isBreathingActive)} className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-all ${isBreathingActive ? 'bg-slate-800 hover:bg-slate-900' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}`}>
                {isBreathingActive ? <Pause size={28} fill="currentColor" /> : <Play size={28} className="ml-1" fill="currentColor" />}
              </button>
              <button onClick={() => { setIsBreathingActive(false); setPhase('Inhale'); setTimeLeft(pattern.inhale); }} className="w-16 h-16 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-all">
                <RotateCcw size={24} />
              </button>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4">Breathing Patterns</h3>
              <div className="space-y-3">
                {BREATHING_PATTERNS.map((p) => (
                  <button key={p.name} onClick={() => { setPattern(p); setIsBreathingActive(false); setPhase('Inhale'); setTimeLeft(p.inhale); }} className={`w-full p-4 rounded-2xl border text-left transition-all ${pattern.name === p.name ? 'border-indigo-200 bg-indigo-50/50 ring-2 ring-indigo-100' : 'border-slate-50 hover:bg-slate-50'}`}>
                    <p className="font-bold text-slate-800 text-sm">{p.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{p.inhale}-{p.hold1}-{p.exhale}-{p.hold2} Rhythm</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeWellness === 'focus' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="lg:col-span-2 space-y-8">
            {/* Focus Timer Card */}
            <div className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm flex flex-col md:flex-row items-center gap-12">
              <div className="relative w-48 h-48 shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-indigo-50" />
                  <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={553} strokeDashoffset={553 - (553 * (focusTimer / (25 * 60)))} className="text-indigo-600 transition-all duration-1000 linear" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-slate-800">{formatTime(focusTimer)}</span>
                  <span className="text-[10px] font-bold text-indigo-500 uppercase">Focus Phase</span>
                </div>
              </div>
              <div className="flex-1 space-y-4 text-center md:text-left">
                <h3 className="text-2xl font-bold text-slate-800 flex items-center justify-center md:justify-start gap-2">
                  <Focus className="text-indigo-600" size={24} />
                  Deep Concentration Mode
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">Boost your productivity with timed focus blocks. This method helps maintain high cognitive concentration and reduces mental fatigue.</p>
                <div className="flex gap-3 justify-center md:justify-start">
                  <button onClick={() => setIsFocusTimerActive(!isFocusTimerActive)} className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                    {isFocusTimerActive ? 'Pause Session' : 'Start Focus'}
                  </button>
                  <button onClick={() => { setIsFocusTimerActive(false); setFocusTimer(25 * 60); }} className="p-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200">
                    <RotateCcw size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Goal-based Exercises */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">Mind Training Exercises</h3>
                <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
                  {['Focus', 'Concentration', 'Stress'].map((g) => (
                    <button key={g} onClick={() => setSelectedGoal(g as any)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedGoal === g ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {loadingMental ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2].map(i => <div key={i} className="h-48 bg-slate-100 rounded-3xl animate-pulse" />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mentalExercises.map((ex, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 hover:border-indigo-200 transition-all group">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          <Brain size={20} />
                        </div>
                        <h4 className="font-bold text-slate-800">{ex.title}</h4>
                      </div>
                      <p className="text-xs text-slate-500 mb-4 line-clamp-2">{ex.description}</p>
                      <div className="space-y-2 mb-6">
                        {ex.steps.slice(0, 2).map((step, sidx) => (
                          <div key={sidx} className="flex gap-2 text-[10px] text-slate-600">
                            <CheckCircle2 size={12} className="text-green-500 shrink-0" />
                            {step}
                          </div>
                        ))}
                      </div>
                      <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded">{ex.benefit}</span>
                        <ChevronRight size={14} className="text-slate-300" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-8 rounded-[40px] text-white">
              <CloudLightning className="text-yellow-400 mb-4" size={32} />
              <h4 className="text-xl font-bold mb-2">Immediate Stress Relief</h4>
              <p className="text-indigo-200/70 text-sm mb-6">Try the 5-4-3-2-1 Technique: Acknowledge 5 things you see, 4 you feel, 3 you hear, 2 you smell, and 1 you taste.</p>
              <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-sm font-bold transition-all border border-white/10">Read More Strategies</button>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-800">Mindful Stats</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-600">Avg. Focus Time</span>
                  </div>
                  <span className="text-sm font-black text-indigo-600">42 min</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Sparkles size={16} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-600">Daily Mindfulness</span>
                  </div>
                  <span className="text-sm font-black text-indigo-600">12 min</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeWellness === 'weather' && (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
                  <Sun size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Weather-Synced Training</h3>
                  <p className="text-slate-500 text-sm">Smart workout suggestions based on current conditions.</p>
                </div>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="bg-slate-50 border-none rounded-xl pl-10 pr-4 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 w-full" placeholder="Location..." />
                </div>
                <button onClick={fetchWeatherActivities} className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                  <RefreshCw size={18} className={loadingWeather ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>
            {loadingWeather ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-100 border-t-indigo-600" />
                <p className="font-medium">Analyzing local conditions...</p>
              </div>
            ) : weatherData && (
              <div className="space-y-8">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <h4 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><Move size={20} className="text-indigo-500" />Recommended Activities for {location}</h4>
                  <div className="prose prose-sm prose-slate max-w-none text-slate-600 leading-relaxed mb-6">
                    {weatherData.recommendation.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                  </div>
                </div>
                {weatherData.sources.length > 0 && (
                  <div className="border-t border-slate-100 pt-6">
                    <h5 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><AlertCircle size={16} className="text-indigo-600" />Weather Sources</h5>
                    <div className="flex flex-wrap gap-3">
                      {weatherData.sources.map((source, i) => (
                        <a key={i} href={source.uri} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 rounded-xl text-xs font-semibold text-slate-600 hover:border-indigo-200 hover:text-indigo-600 transition-all">{source.title.substring(0, 30)}...<ExternalLink size={12} /></a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WellnessCenter;
