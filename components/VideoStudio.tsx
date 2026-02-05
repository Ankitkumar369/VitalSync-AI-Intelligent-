
import React, { useState, useRef } from 'react';
import { Video, Sparkles, Loader2, Upload, Play, AlertCircle } from 'lucide-react';
import { generateVideoVeo } from '../services/geminiService';

const VideoStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [ratio, setRatio] = useState<'16:9' | '9:16'>('16:9');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadImg, setUploadImg] = useState<{ bytes: string, mime: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    if (!prompt && !uploadImg) return;
    setLoading(true);
    setError(null);
    try {
      const res = await generateVideoVeo(prompt, ratio, uploadImg || undefined);
      setVideoUrl(res);
    } catch (e) {
      setError("Veo requires a paid API key and credit. Please check your billing.");
      // @ts-ignore
      if (window.aistudio?.openSelectKey) window.aistudio.openSelectKey();
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setUploadImg({ bytes: reader.result as string, mime: file.type });
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-zinc-100 tracking-tight">Veo Video Studio</h2>
          <p className="text-slate-500 dark:text-zinc-400 font-medium">Cinematic workout visuals powered by Google Veo.</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl">
           <button onClick={() => setRatio('16:9')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${ratio === '16:9' ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-400'}`}>Landscape</button>
           <button onClick={() => setRatio('9:16')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${ratio === '9:16' ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-400'}`}>Portrait</button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-slate-100 dark:border-zinc-800 shadow-sm space-y-8">
          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Video Scenario</label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A slow-motion sequence of a marathon runner crossing the finish line in a futuristic city..."
              className="w-full h-40 bg-slate-50 dark:bg-zinc-800 border-none rounded-2xl p-4 text-sm text-slate-800 dark:text-zinc-200 focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Starting Frame (Optional)</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative group cursor-pointer border-2 border-dashed border-slate-200 dark:border-zinc-700 rounded-3xl h-32 flex items-center justify-center overflow-hidden hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all"
            >
              {uploadImg ? (
                <img src={uploadImg.bytes} className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-slate-400">
                  <Upload size={24} className="mx-auto mb-2" />
                  <p className="text-[10px] font-bold uppercase">Click to upload frame</p>
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-3xl font-black flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : <><Sparkles size={24} /> Animate Workout</>}
          </button>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl flex gap-3 items-center text-red-600">
               <AlertCircle size={18} />
               <p className="text-xs font-bold">{error}</p>
            </div>
          )}
        </div>

        <div className="bg-black rounded-[40px] flex items-center justify-center overflow-hidden shadow-2xl relative min-h-[500px]">
          {loading ? (
            <div className="text-center space-y-6">
               <Loader2 className="animate-spin text-indigo-500 mx-auto" size={48} />
               <p className="text-xs font-bold text-white uppercase tracking-[0.3em] animate-pulse">Generating Cinematic Sequence...</p>
               <div className="max-w-[200px] mx-auto space-y-2">
                 <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 animate-progress-indefinite w-1/3 rounded-full" />
                 </div>
                 <p className="text-[10px] text-white/40 italic">This usually takes about 30-60 seconds.</p>
               </div>
            </div>
          ) : videoUrl ? (
            <video 
              src={videoUrl} 
              className="w-full h-full object-contain" 
              controls 
              autoPlay 
              loop 
            />
          ) : (
            <div className="text-center p-8 space-y-4 opacity-30">
              <Video size={80} className="mx-auto text-white" />
              <p className="text-sm font-bold text-white uppercase tracking-widest">Video Studio Output</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoStudio;
