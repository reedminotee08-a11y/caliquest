
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'maps' | 'levels' | 'exercises' | 'sql'>('maps');
  const [maps, setMaps] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Forms
  const [mapForm, setMapForm] = useState({ name: '', description: '', order_index: 0 });
  const [levelForm, setLevelForm] = useState({ map_id: '', name: '', description: '', order_index: 0 });
  const [exerciseForm, setExerciseForm] = useState({ level_id: '', name: '', description: '', video_file: null as File | null, order_index: 0 });
  const [uploadingVideo, setUploadingVideo] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: m } = await supabase.from('maps').select('*').order('order_index');
      const { data: l } = await supabase.from('levels').select('*').order('order_index');
      const { data: e } = await supabase.from('exercises').select('*').order('order_index');
      setMaps(m || []);
      setLevels(l || []);
      setExercises(e || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMapSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('maps').insert([mapForm]);
    if (error) alert("Error: " + error.message);
    else {
      setMapForm({ name: '', description: '', order_index: maps.length + 1 });
      fetchData();
    }
  };

  const handleLevelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('levels').insert([levelForm]);
    if (error) alert("Error: " + error.message);
    else {
      setLevelForm({ map_id: '', name: '', description: '', order_index: levels.length + 1 });
      fetchData();
    }
  };

  const handleExerciseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!exerciseForm.video_file) {
      alert('الرجاء اختيار ملف فيديو أولاً');
      return;
    }

    setUploadingVideo(true);
    
    try {
      // Upload video to Supabase Storage
      const fileExt = exerciseForm.video_file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `exercises/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('exercises')
        .upload(filePath, exerciseForm.video_file);
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('exercises')
        .getPublicUrl(filePath);
      
      // Insert exercise with video URL
      const { error } = await supabase.from('exercises').insert([{
        level_id: exerciseForm.level_id,
        name: exerciseForm.name,
        description: exerciseForm.description,
        video_url: publicUrl,
        order_index: exerciseForm.order_index
      }]);
      
      if (error) throw error;
      
      // Reset form
      setExerciseForm({ 
        level_id: '', 
        name: '', 
        description: '', 
        video_file: null, 
        order_index: exercises.length + 1 
      });
      
      // Reset file input
      const fileInput = document.getElementById('video-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      fetchData();
      alert('تم رفع الفيديو وإضافة التمرين بنجاح!');
      
    } catch (err: any) {
      console.error('Upload error:', err);
      alert('فشل رفع الفيديو: ' + err.message);
    } finally {
      setUploadingVideo(false);
    }
  };

  const deleteItem = async (table: string, id: string) => {
    const confirmation = window.confirm(`⚠️ تحذير: هل أنت متأكد من حذف هذا العنصر؟ سيتم حذف جميع البيانات المرتبطة به تلقائياً (Cascading Delete).`);
    if (confirmation) {
      try {
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) throw error;
        // Optimization: filter local state immediately for snappy UI
        if (table === 'maps') setMaps(maps.filter(x => x.id !== id));
        if (table === 'levels') setLevels(levels.filter(x => x.id !== id));
        if (table === 'exercises') setExercises(exercises.filter(x => x.id !== id));
        
        // Full refresh to ensure consistency
        await fetchData();
      } catch (err: any) {
        alert('فشل الحذف: ' + err.message);
      }
    }
  };

  const sqlCode = `
-- CALIQUEST STORAGE BUCKETS & SCHEMA SETUP (FINAL VERSION) --

-- 1. Create Buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true), ('exercises', 'exercises', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Policies
CREATE POLICY "Public Read Avatars" ON storage.objects FOR SELECT TO public USING (bucket_id = 'avatars');
CREATE POLICY "Public Read Exercises" ON storage.objects FOR SELECT TO public USING (bucket_id = 'exercises');

CREATE POLICY "Admin All Exercises" ON storage.objects FOR ALL TO authenticated 
USING (bucket_id = 'exercises');

CREATE POLICY "User Own Avatars" ON storage.objects FOR ALL TO authenticated 
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 3. Core Schema with ON DELETE CASCADE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  age INTEGER,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.maps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.levels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  map_id UUID REFERENCES public.maps(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  level_id UUID REFERENCES public.levels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  map_id UUID REFERENCES public.maps(id) ON DELETE CASCADE,
  level_id UUID REFERENCES public.levels(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, level_id)
);
`;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8 font-gaming">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div>
            <h1 className="text-5xl font-black text-emerald-500 italic uppercase tracking-tighter">Command Center</h1>
            <p className="text-slate-500 text-xs font-bold tracking-[0.4em] uppercase">Tactical Management Interface</p>
          </div>
          <button onClick={() => window.location.href = '#/game'} className="px-8 py-3 border border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-slate-900 transition-all uppercase text-sm font-bold skew-x-[-12deg]">
            <span className="inline-block skew-x-[12deg]">Exit Terminal</span>
          </button>
        </div>

        <div className="flex overflow-x-auto space-x-2 border-b border-slate-800 mb-8">
          {['maps', 'levels', 'exercises', 'sql'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-10 py-5 font-black uppercase tracking-widest text-sm transition-all relative ${activeTab === tab ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {tab}
              {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500"></div>}
            </button>
          ))}
        </div>

        {loading && <div className="text-emerald-500 animate-pulse mb-4">SYNCHRONIZING DATABASE...</div>}

        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
          {activeTab === 'sql' && (
            <div className="glass-morphism p-12 border-l-8 border-emerald-500 shadow-2xl">
              <h2 className="text-3xl mb-6 text-emerald-400 uppercase italic font-gaming">Storage & Schema Injector</h2>
              <p className="text-slate-400 mb-8 font-sans leading-relaxed">انسخ هذا الكود وقم بتشغيله في Supabase SQL Editor لإنشاء الـ Buckets وإعداد الجداول مع خاصية الحذف المتسلسل (Cascade).</p>
              <div className="relative group">
                <pre className="bg-black/90 p-10 rounded border border-slate-700 overflow-x-auto text-xs text-emerald-500 font-mono leading-loose max-h-[600px] shadow-inner">
                  {sqlCode}
                </pre>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(sqlCode);
                    alert('SQL CODE COPIED.');
                  }}
                  className="absolute top-6 right-6 px-6 py-3 bg-emerald-500 text-slate-900 text-xs font-black hover:bg-emerald-400 shadow-lg active:scale-95 transition-transform"
                >
                  COPY SQL SCRIPT
                </button>
              </div>
            </div>
          )}

          {activeTab === 'maps' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <form onSubmit={handleMapSubmit} className="lg:col-span-1 glass-morphism p-10 space-y-8 border-t-4 border-emerald-500 shadow-xl">
                <h3 className="text-emerald-400 font-black uppercase italic text-xl tracking-tight">Deploy New Map</h3>
                <input type="text" placeholder="REGION NAME" className="w-full bg-slate-950 p-4 border border-slate-800 focus:border-emerald-500 outline-none" value={mapForm.name} onChange={e => setMapForm({...mapForm, name: e.target.value})} required />
                <textarea placeholder="MISSION BRIEFING" className="w-full bg-slate-950 p-4 border border-slate-800 h-32 focus:border-emerald-500 outline-none" value={mapForm.description} onChange={e => setMapForm({...mapForm, description: e.target.value})} />
                <input type="number" placeholder="ORDER INDEX" className="w-full bg-slate-950 p-4 border border-slate-800 focus:border-emerald-500 outline-none" value={mapForm.order_index} onChange={e => setMapForm({...mapForm, order_index: parseInt(e.target.value)})} />
                <button type="submit" className="w-full bg-emerald-500 text-slate-900 font-black py-5 uppercase hover:bg-emerald-400 transition-all">INITIALIZE DEPLOYMENT</button>
              </form>
              <div className="lg:col-span-2 space-y-4">
                {maps.length === 0 ? <p className="text-slate-600 italic p-10 text-center border-2 border-dashed border-slate-800">No active maps detected.</p> : maps.map(m => (
                  <div key={m.id} className="p-6 bg-slate-800/20 border border-slate-700 flex justify-between items-center group hover:border-emerald-500">
                    <div>
                      <span className="text-white font-black italic text-xl uppercase">{m.name}</span>
                      <p className="text-[10px] text-slate-500">INDEX: {m.order_index}</p>
                    </div>
                    <button onClick={() => deleteItem('maps', m.id)} className="text-red-500 hover:text-white hover:bg-red-500 transition-all font-black uppercase text-xs px-6 py-2 border border-red-500">DELETE MAP</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'levels' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <form onSubmit={handleLevelSubmit} className="lg:col-span-1 glass-morphism p-10 space-y-8 border-t-4 border-emerald-500 shadow-xl">
                <h3 className="text-emerald-400 font-black uppercase italic text-xl">Deploy New Stage</h3>
                <select className="w-full bg-slate-950 p-4 border border-slate-800 focus:border-emerald-500 outline-none" value={levelForm.map_id} onChange={e => setLevelForm({...levelForm, map_id: e.target.value})} required>
                  <option value="">SELECT PARENT MAP</option>
                  {maps.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                <input type="text" placeholder="STAGE NAME" className="w-full bg-slate-950 p-4 border border-slate-800 focus:border-emerald-500 outline-none" value={levelForm.name} onChange={e => setLevelForm({...levelForm, name: e.target.value})} required />
                <textarea placeholder="STAGE DESCRIPTION" className="w-full bg-slate-950 p-4 border border-slate-800 h-24 focus:border-emerald-500 outline-none" value={levelForm.description} onChange={e => setLevelForm({...levelForm, description: e.target.value})} />
                <input type="number" placeholder="ORDER INDEX" className="w-full bg-slate-950 p-4 border border-slate-800 focus:border-emerald-500 outline-none" value={levelForm.order_index} onChange={e => setLevelForm({...levelForm, order_index: parseInt(e.target.value)})} />
                <button type="submit" className="w-full bg-emerald-500 text-slate-900 font-black py-5 uppercase hover:bg-emerald-400 transition-all">DEPLOY STAGE</button>
              </form>
              <div className="lg:col-span-2 space-y-4">
                {levels.length === 0 ? <p className="text-slate-600 italic p-10 text-center border-2 border-dashed border-slate-800">No levels found.</p> : levels.map(l => (
                  <div key={l.id} className="p-6 bg-slate-800/20 border border-slate-700 flex justify-between items-center group hover:border-emerald-500">
                    <div>
                      <span className="text-white font-black italic text-xl uppercase">{l.name}</span>
                      <p className="text-[10px] text-slate-500">MAP: {maps.find(m => m.id === l.map_id)?.name}</p>
                    </div>
                    <button onClick={() => deleteItem('levels', l.id)} className="text-red-500 hover:text-white hover:bg-red-500 transition-all font-black uppercase text-xs px-6 py-2 border border-red-500">DELETE STAGE</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'exercises' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <form onSubmit={handleExerciseSubmit} className="lg:col-span-1 glass-morphism p-10 space-y-8 border-t-4 border-emerald-500 shadow-xl">
                <h3 className="text-emerald-400 font-black uppercase italic text-xl">Deploy New Drill</h3>
                <select className="w-full bg-slate-950 p-4 border border-slate-800 focus:border-emerald-500 outline-none" value={exerciseForm.level_id} onChange={e => setExerciseForm({...exerciseForm, level_id: e.target.value})} required>
                  <option value="">SELECT TARGET STAGE</option>
                  {levels.map(l => <option key={l.id} value={l.id}>{l.name} ({maps.find(m => m.id === l.map_id)?.name})</option>)}
                </select>
                <input type="text" placeholder="DRILL NAME" className="w-full bg-slate-950 p-4 border border-slate-800 focus:border-emerald-500 outline-none" value={exerciseForm.name} onChange={e => setExerciseForm({...exerciseForm, name: e.target.value})} required />
                <textarea placeholder="INSTRUCTIONS" className="w-full bg-slate-950 p-4 border border-slate-800 h-24 focus:border-emerald-500 outline-none" value={exerciseForm.description} onChange={e => setExerciseForm({...exerciseForm, description: e.target.value})} />
                <div className="space-y-2">
                  <label className="text-emerald-400 text-xs font-black uppercase tracking-widest">TRAINING VIDEO (MP4)</label>
                  <input 
                    id="video-upload"
                    type="file" 
                    accept="video/mp4,video/webm,video/quicktime" 
                    className="w-full bg-slate-950 p-4 border border-slate-800 focus:border-emerald-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-sm file:font-semibold file:bg-emerald-500 file:text-slate-900 hover:file:bg-emerald-400 cursor-pointer" 
                    onChange={e => setExerciseForm({...exerciseForm, video_file: e.target.files?.[0] || null})} 
                    required 
                  />
                  {exerciseForm.video_file && (
                    <div className="text-xs text-slate-400">
                      <p>الملف المحدد: {exerciseForm.video_file.name}</p>
                      <p>الحجم: {(exerciseForm.video_file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  )}
                </div>
                <input type="number" placeholder="ORDER INDEX" className="w-full bg-slate-950 p-4 border border-slate-800 focus:border-emerald-500 outline-none" value={exerciseForm.order_index} onChange={e => setExerciseForm({...exerciseForm, order_index: parseInt(e.target.value)})} />
                <button 
                  type="submit" 
                  className={`w-full font-black py-5 uppercase transition-all ${
                    uploadingVideo 
                      ? 'bg-slate-600 text-slate-400 cursor-not-allowed' 
                      : 'bg-emerald-500 text-slate-900 hover:bg-emerald-400'
                  }`}
                  disabled={uploadingVideo}
                >
                  {uploadingVideo ? 'UPLOADING VIDEO...' : 'DEPLOY DRILL'}
                </button>
              </form>
              <div className="lg:col-span-2 space-y-4">
                {exercises.length === 0 ? <p className="text-slate-600 italic p-10 text-center border-2 border-dashed border-slate-800">No exercises found.</p> : exercises.map(ex => (
                  <div key={ex.id} className="p-6 bg-slate-800/20 border border-slate-700 flex justify-between items-center group hover:border-emerald-500">
                    <div>
                      <span className="text-white font-black italic text-xl uppercase">{ex.name}</span>
                      <p className="text-[10px] text-slate-500">STAGE: {levels.find(l => l.id === ex.level_id)?.name}</p>
                    </div>
                    <button onClick={() => deleteItem('exercises', ex.id)} className="text-red-500 hover:text-white hover:bg-red-500 transition-all font-black uppercase text-xs px-6 py-2 border border-red-500">DELETE DRILL</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
