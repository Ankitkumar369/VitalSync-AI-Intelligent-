
import React, { useState, useEffect } from 'react';
import { Globe, RefreshCw, ExternalLink, Bookmark, Share2 } from 'lucide-react';
import { getGlobalHealthNews } from '../services/geminiService';
import { NewsItem } from '../types';

const NewsFeed: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const data = await getGlobalHealthNews();
      setNews(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-zinc-100 tracking-tight">Global Health Pulse</h2>
          <p className="text-slate-500 dark:text-zinc-400 font-medium text-sm">Latest breakthroughs from around the world.</p>
        </div>
        <button 
          onClick={fetchNews}
          disabled={loading}
          className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 px-5 py-2.5 rounded-2xl text-sm font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all shadow-sm"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Check for Updates
        </button>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-64 bg-slate-200 dark:bg-zinc-800 rounded-[32px] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {news.map((item, idx) => (
            <div key={idx} className="bg-white dark:bg-zinc-900 rounded-[32px] border border-slate-100 dark:border-zinc-800 overflow-hidden group shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all">
              <div className="p-6 md:p-8 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-lg">
                    {item.source}
                  </span>
                  <div className="flex gap-2">
                    <button className="p-2 bg-slate-50 dark:bg-zinc-800 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors"><Bookmark size={14} /></button>
                    <button className="p-2 bg-slate-50 dark:bg-zinc-800 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors"><Share2 size={14} /></button>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100 mb-3 leading-tight group-hover:text-indigo-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-500 leading-relaxed mb-6 line-clamp-3">
                  {item.summary}
                </p>
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50 dark:border-zinc-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.timestamp}</span>
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-2 text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Read Full Story
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hero Highlight */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[40px] p-10 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-2 mb-4 bg-white/20 w-fit px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em]">
            <Globe size={14} /> Global Insight
          </div>
          <h3 className="text-3xl font-black mb-4">Your Health is Universal.</h3>
          <p className="text-indigo-100/80 leading-relaxed mb-8">
            VitalSync tracks real-time global medical journals and wellness trends to bring you insights that matter to your specific physiology.
          </p>
          <button className="bg-white text-indigo-700 px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-indigo-900/40 hover:scale-105 transition-transform">
            Configure Topic Filters
          </button>
        </div>
        <Globe size={300} className="absolute -bottom-24 -right-24 text-white opacity-[0.05] rotate-12" />
      </div>
    </div>
  );
};

export default NewsFeed;
