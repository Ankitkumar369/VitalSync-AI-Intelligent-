
import React, { useState, useEffect } from 'react';
import { Utensils, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';
import { ActivityLog, MealRecommendation } from '../types';
import { getDietRecommendation } from '../services/geminiService';

interface Props {
  activities: ActivityLog[];
}

const DietPlan: React.FC<Props> = ({ activities }) => {
  const [recommendations, setRecommendations] = useState<MealRecommendation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const recs = await getDietRecommendation(activities);
      setRecommendations(recs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Personalized Nutrition</h2>
        <button 
          onClick={fetchRecommendations}
          disabled={loading}
          className="flex items-center gap-2 text-indigo-600 font-semibold text-sm hover:underline disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh AI Plan
        </button>
      </div>

      <div className="bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-2 mb-4 bg-white/20 w-fit px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} />
            AI Synced for You
          </div>
          <h3 className="text-3xl font-bold mb-2">Today's Optimal Fuel</h3>
          <p className="text-indigo-100 mb-6">Based on your activity levels today, we've optimized your macronutrient intake to ensure maximum recovery and energy.</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 p-3 rounded-2xl text-center">
              <p className="text-[10px] opacity-70 uppercase font-bold">Protein</p>
              <p className="text-lg font-bold">140g</p>
            </div>
            <div className="bg-white/10 p-3 rounded-2xl text-center">
              <p className="text-[10px] opacity-70 uppercase font-bold">Carbs</p>
              <p className="text-lg font-bold">220g</p>
            </div>
            <div className="bg-white/10 p-3 rounded-2xl text-center">
              <p className="text-[10px] opacity-70 uppercase font-bold">Fats</p>
              <p className="text-lg font-bold">65g</p>
            </div>
          </div>
        </div>
        <Utensils size={180} className="absolute -bottom-10 -right-10 opacity-10 rotate-12" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 bg-slate-100 rounded-3xl animate-pulse"></div>
          ))
        ) : (
          recommendations.map((item, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col group hover:border-indigo-200 transition-all">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold text-indigo-600 px-2 py-1 bg-indigo-50 rounded-lg">
                  {idx === 0 ? 'Breakfast' : idx === 1 ? 'Lunch' : 'Dinner'}
                </span>
                <span className="text-xs font-medium text-slate-400">{item.calories} kcal</span>
              </div>
              <h4 className="text-xl font-bold text-slate-800 mb-2">{item.meal}</h4>
              <p className="text-sm text-slate-500 mb-6 line-clamp-3">{item.reason}</p>
              <div className="mt-auto space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <CheckCircle2 size={14} className="text-green-500" />
                  {item.protein} Protein
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <CheckCircle2 size={14} className="text-blue-500" />
                  {item.carbs} Carbs
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DietPlan;
