
import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import ProfileSetup from './pages/ProfileSetup';
import GameDashboard from './pages/GameDashboard';
import MapDetails from './pages/MapDetails';
import LevelDetails from './pages/LevelDetails';
import AdminDashboard from './pages/AdminDashboard';
import { Profile } from './types';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist yet - this is expected for new signups
          setProfile(null);
        } else if (error.message.includes('relation "profiles" does not exist')) {
          setDbError('DATABASE_NOT_INITIALIZED');
        } else {
          console.error('Profile fetch error:', error);
        }
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('System error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-emerald-500 border-r-4 border-r-transparent"></div>
          <p className="font-gaming text-emerald-500 animate-pulse text-xs tracking-widest">CONNECTING TO ARENA...</p>
        </div>
      </div>
    );
  }

  if (dbError === 'DATABASE_NOT_INITIALIZED') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center">
        <div className="max-w-md glass-morphism p-10 border-t-4 border-red-500">
          <h1 className="text-3xl font-gaming text-red-500 mb-4 uppercase">System Failure</h1>
          <p className="text-slate-400 mb-8 font-mono text-sm">CRITICAL: The required database architecture (profiles table) was not found.</p>
          <p className="text-emerald-400 mb-8 text-sm italic">Admin: Log in and use the Command Center to run the initialization SQL.</p>
          <button onClick={() => window.location.reload()} className="w-full bg-slate-800 text-white font-bold py-3 hover:bg-slate-700 transition-all uppercase text-xs">Retry Connection</button>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={!session ? <LandingPage /> : <Navigate to="/game" />} />
        <Route path="/auth" element={!session ? <AuthPage /> : <Navigate to="/profile-setup" />} />
        
        {/* Protected Routes */}
        <Route path="/profile-setup" element={
          session ? (profile?.onboarding_completed ? <Navigate to="/game" /> : <ProfileSetup user={session.user} />) : <Navigate to="/auth" />
        } />
        
        <Route path="/game" element={
          session ? (profile?.onboarding_completed ? <GameDashboard profile={profile} /> : <Navigate to="/profile-setup" />) : <Navigate to="/auth" />
        } />
        
        <Route path="/map/:mapId" element={
          session && profile?.onboarding_completed ? <MapDetails profile={profile} /> : <Navigate to="/game" />
        } />

        <Route path="/level/:levelId" element={
          session && profile?.onboarding_completed ? <LevelDetails profile={profile} /> : <Navigate to="/game" />
        } />

        <Route path="/admin/*" element={
          profile?.is_admin ? <AdminDashboard /> : <Navigate to="/game" />
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
