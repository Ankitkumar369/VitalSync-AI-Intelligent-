
import React, { useState, useRef } from 'react';
import { ImageIcon, Wand2, Download, Upload, Loader2, Maximize, AlertCircle } from 'lucide-react';
import { generateImagePro, editImageNano } from '../services/geminiService';

const ImageLab: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<"1K" | "2K" | "4K">("1K");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadImg, setUploadImg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setError(null);
    try {
      const res = await generateImagePro(prompt, size);
      if (res) setImage(res);
      else setError("Failed to generate image.");
    } catch (e) {
      setError("Model requires an API Key. Please open the selector.");
      // @ts-ignore
      if (window.aistudio?.openSelectKey) window.aistudio.openSelectKey();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!prompt || !uploadImg) return;
    setLoading(true);
    setError(null);
    try {
      const res = await editImageNano(prompt, uploadImg, "image/png");
      if (res) setImage(res);
      else setError("Failed to edit image.");
    } catch (e) {
      setError("Error editing image.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setUploadImg(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <header>
        <h2 className="text-3xl font-black text-slate-800 dark:text-zinc-100 tracking-tight">AI Image Lab</h2>
        <p className="text-slate-500 dark:text-zinc-400 font-medium">Design your fitness vision with Gemini 3 Pro and Nano Banana.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-slate-100 dark:border-zinc-800 shadow-sm space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Vision Prompt</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A high-intensity crossfit gym with neon lighting..."
                className="w-full h-32 bg-slate-50 dark:bg-zinc-800 border-none rounded-2xl p-4 text-sm text-slate-800 dark:text-zinc-200 focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            {!uploadImg ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Image Quality</label>
                  <div className="flex gap-2">
                    {(["1K", "2K", "4K"] as const).map(s => (
                      <button 
                        key={s} 
                        onClick={() => setSize(s)}
                        className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${size === s ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-500'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <button 
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <><Wand2 size={20} /> Generate Fitness Art</>}
                </button>
                <div className="relative pt-4 text-center">
                   <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-slate-100 dark:bg-zinc-800" />
                   <span className="relative bg-white dark:bg-zinc-900 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">or edit photo</span>
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 bg-white dark:bg-zinc-800 border-2 border-dashed border-slate-200 dark:border-zinc-700 text-slate-500 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all"
                >
                  <Upload size={20} /> Upload Photo to Edit
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative group">
                  <img src={uploadImg} className="w-full h-48 object-cover rounded-2xl opacity-80" />
                  <button onClick={() => setUploadImg(null)} className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-lg hover:bg-black/70">Reset</button>
                </div>
                <button 
                  onClick={handleEdit}
                  disabled={loading}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <><Wand2 size={20} /> Apply Edits</>}
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl flex gap-3 items-center text-red-600">
               <AlertCircle size={18} />
               <p className="text-xs font-bold">{error}</p>
            </div>
          )}
        </div>

        <div className="bg-slate-100 dark:bg-zinc-800 rounded-[40px] flex items-center justify-center overflow-hidden border-4 border-white dark:border-zinc-900 shadow-2xl relative min-h-[400px]">
          {image ? (
            <img src={image} className="w-full h-full object-contain animate-in zoom-in duration-500" />
          ) : (
            <div className="text-center p-8 space-y-4 opacity-30">
              <ImageIcon size={64} className="mx-auto" />
              <p className="text-sm font-bold uppercase tracking-widest">Output Studio</p>
            </div>
          )}
          
          {image && (
            <div className="absolute bottom-6 right-6 flex gap-2">
              <button className="p-3 bg-white/20 backdrop-blur-md text-white rounded-xl hover:bg-white/30 transition-all border border-white/20"><Maximize size={18} /></button>
              <a href={image} download="vitalsync-ai.png" className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg"><Download size={18} /></a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageLab;
