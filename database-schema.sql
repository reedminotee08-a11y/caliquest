-- CaliQuest Database Schema for Supabase
-- Complete SQL Schema with all tables, relationships, and functions

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES public.users(id) PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    level INTEGER DEFAULT 1,
    xp_total INTEGER DEFAULT 0,
    xp_current INTEGER DEFAULT 0,
    xp_required INTEGER DEFAULT 1000,
    fitness_level TEXT DEFAULT 'beginner', -- beginner, intermediate, advanced, elite
    height DECIMAL(5,2), -- in cm
    weight DECIMAL(5,2), -- in kg
    age INTEGER,
    gender TEXT, -- male, female, other
    goals TEXT[], -- strength, endurance, flexibility, etc.
    preferred_workout_duration INTEGER DEFAULT 30, -- in minutes
    available_equipment TEXT[], -- bodyweight, pullup_bar, rings, etc.
    workout_frequency INTEGER DEFAULT 3, -- per week
    streak_days INTEGER DEFAULT 0,
    last_workout_date TIMESTAMP WITH TIME ZONE,
    total_workouts INTEGER DEFAULT 0,
    total_calories_burned INTEGER DEFAULT 0,
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Training Paths Table
CREATE TABLE IF NOT EXISTS public.training_paths (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    level_required INTEGER DEFAULT 1,
    category TEXT NOT NULL, -- strength, endurance, flexibility, skills
    difficulty TEXT NOT NULL, -- beginner, intermediate, advanced, elite
    estimated_weeks INTEGER,
    image_url TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercises Table
CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    instructions TEXT[],
    muscle_groups TEXT[], -- chest, back, shoulders, arms, core, legs
    equipment_needed TEXT[],
    difficulty TEXT NOT NULL,
    category TEXT NOT NULL,
    calories_per_minute DECIMAL(4,2),
    image_url TEXT,
    video_url TEXT,
    tips TEXT[],
    common_mistakes TEXT[],
    variations TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout Plans Table
CREATE TABLE IF NOT EXISTS public.workout_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    training_path_id UUID REFERENCES public.training_paths(id),
    difficulty TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    estimated_calories INTEGER,
    exercises JSONB NOT NULL, -- array of exercise objects with reps/sets
    rest_periods JSONB, -- rest periods between exercises
    warmup_exercises JSONB,
    cooldown_exercises JSONB,
    image_url TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Workouts Table
CREATE TABLE IF NOT EXISTS public.user_workouts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    workout_plan_id UUID REFERENCES public.workout_plans(id) NOT NULL,
    training_path_id UUID REFERENCES public.training_paths(id),
    status TEXT NOT NULL DEFAULT 'started', -- started, completed, abandoned
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    calories_burned INTEGER,
    xp_earned INTEGER DEFAULT 0,
    exercises_completed JSONB, -- track which exercises were completed
    performance_notes TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Challenges Table
CREATE TABLE IF NOT EXISTS public.challenges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL, -- weekly, monthly, special, boss
    difficulty TEXT NOT NULL,
    requirements JSONB NOT NULL, -- specific challenge requirements
    xp_reward INTEGER NOT NULL,
    badge_icon TEXT,
    badge_color TEXT,
    image_url TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Challenges Table
CREATE TABLE IF NOT EXISTS public.user_challenges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    challenge_id UUID REFERENCES public.challenges(id) NOT NULL,
    status TEXT NOT NULL DEFAULT 'active', -- active, completed, failed, abandoned
    progress JSONB DEFAULT '{}', -- track challenge progress
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    xp_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements Table
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT NOT NULL,
    color TEXT DEFAULT '#00eeff',
    category TEXT NOT NULL, -- workout, streak, social, special
    type TEXT NOT NULL, -- automatic, manual, hidden
    requirements JSONB NOT NULL, -- conditions to unlock
    xp_reward INTEGER DEFAULT 0,
    badge_url TEXT,
    is_secret BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Achievements Table
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    achievement_id UUID REFERENCES public.achievements(id) NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress JSONB DEFAULT '{}',
    UNIQUE(user_id, achievement_id)
);

-- XP Rewards Store Table
CREATE TABLE IF NOT EXISTS public.xp_rewards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL, -- avatar, badge, theme, workout_plan, equipment
    item_data JSONB NOT NULL, -- specific item data
    xp_cost INTEGER NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    is_limited BOOLEAN DEFAULT FALSE,
    stock_quantity INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Rewards Table
CREATE TABLE IF NOT EXISTS public.user_rewards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    reward_id UUID REFERENCES public.xp_rewards(id) NOT NULL,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_equipped BOOLEAN DEFAULT FALSE,
    is_used BOOLEAN DEFAULT FALSE,
    UNIQUE(user_id, reward_id)
);

-- Leaderboard Table
CREATE TABLE IF NOT EXISTS public.leaderboard (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    rank INTEGER NOT NULL,
    xp_total INTEGER NOT NULL,
    level INTEGER NOT NULL,
    workout_streak INTEGER DEFAULT 0,
    total_workouts INTEGER DEFAULT 0,
    category TEXT DEFAULT 'global', -- global, weekly, monthly, challenge
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Equipment Table
CREATE TABLE IF NOT EXISTS public.equipment (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- basic, intermediate, advanced
    price DECIMAL(10,2),
    image_url TEXT,
    exercises_compatible TEXT[], -- list of exercise IDs
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Nutrition Table
CREATE TABLE IF NOT EXISTS public.nutrition (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    date DATE NOT NULL,
    meals JSONB NOT NULL, -- breakfast, lunch, dinner, snacks
    calories_total INTEGER DEFAULT 0,
    protein DECIMAL(6,2) DEFAULT 0,
    carbs DECIMAL(6,2) DEFAULT 0,
    fats DECIMAL(6,2) DEFAULT 0,
    water_intake DECIMAL(5,2) DEFAULT 0, -- in liters
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Community Posts Table
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    type TEXT NOT NULL, -- text, image, video, achievement, workout_completion
    media_urls TEXT[],
    tags TEXT[],
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES public.community_posts(id) NOT NULL,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    content TEXT NOT NULL,
    parent_comment_id UUID REFERENCES public.comments(id),
    likes_count INTEGER DEFAULT 0,
    is_hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Likes Table (for posts and comments)
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    target_id UUID NOT NULL, -- post_id or comment_id
    target_type TEXT NOT NULL, -- 'post' or 'comment'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, target_id, target_type)
);

-- Followers Table
CREATE TABLE IF NOT EXISTS public.followers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    follower_id UUID REFERENCES public.profiles(id) NOT NULL,
    following_id UUID REFERENCES public.profiles(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK(follower_id != following_id)
);

-- Workout Sessions Table (detailed tracking)
CREATE TABLE IF NOT EXISTS public.workout_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    workout_plan_id UUID REFERENCES public.workout_plans(id) NOT NULL,
    session_data JSONB NOT NULL, -- detailed exercise performance data
    heart_rate_data JSONB, -- heart rate throughout workout
    calories_burned INTEGER DEFAULT 0,
    duration_seconds INTEGER DEFAULT 0,
    quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 10),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL, -- achievement, challenge, social, system
    data JSONB DEFAULT '{}', -- additional notification data
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Settings Table
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    theme TEXT DEFAULT 'dark', -- light, dark, auto
    language TEXT DEFAULT 'ar', -- ar, en
    notifications_enabled BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    workout_reminders BOOLEAN DEFAULT TRUE,
    reminder_time TIME DEFAULT '09:00:00',
    privacy_level TEXT DEFAULT 'public', -- public, friends, private
    units TEXT DEFAULT 'metric', -- metric, imperial
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Storage Buckets Policy
INSERT INTO storage.buckets (id, name, public) VALUES 
('avatars', 'avatars', true),
('exercise_images', 'exercise_images', true),
('workout_videos', 'workout_videos', true),
('achievement_images', 'achievement_images', true),
('equipment_images', 'equipment_images', true),
('community_media', 'community_media', true)
ON CONFLICT (id) DO NOTHING;

-- Row Level Security Policies

-- Users can only see their own profile
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Public read access for training paths, exercises, achievements
ALTER TABLE public.training_paths ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Training paths are publicly viewable" ON public.training_paths FOR SELECT USING (is_public = true);

ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Exercises are publicly viewable" ON public.exercises FOR SELECT USING (true);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Achievements are publicly viewable" ON public.achievements FOR SELECT USING (true);

-- User-specific data policies
ALTER TABLE public.user_workouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own workouts" ON public.user_workouts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workouts" ON public.user_workouts FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own challenges" ON public.user_challenges FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);

-- Community posts policies
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view public posts" ON public.community_posts FOR SELECT USING (is_hidden = false);
CREATE POLICY "Users can manage own posts" ON public.community_posts FOR ALL USING (auth.uid() = user_id);

-- Functions

-- Update user XP and level
CREATE OR REPLACE FUNCTION public.update_user_xp(user_id UUID, xp_amount INTEGER)
RETURNS TABLE(level INTEGER, xp_current INTEGER, xp_required INTEGER) AS $$
BEGIN
    UPDATE public.profiles 
    SET 
        xp_total = xp_total + xp_amount,
        xp_current = xp_current + xp_amount,
        updated_at = NOW()
    WHERE id = update_user_xp.user_id;
    
    -- Check for level up
    UPDATE public.profiles 
    SET 
        level = level + 1,
        xp_current = xp_current - xp_required,
        xp_required = xp_required * 1.2, -- Increase requirement by 20% per level
        updated_at = NOW()
    WHERE id = update_user_xp.user_id 
    AND xp_current >= xp_required;
    
    RETURN QUERY 
    SELECT p.level, p.xp_current, p.xp_required 
    FROM public.profiles p 
    WHERE p.id = update_user_xp.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Redeem reward function
CREATE OR REPLACE FUNCTION public.redeem_reward(user_id UUID, reward_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    reward_xp_cost INTEGER;
    user_current_xp INTEGER;
BEGIN
    -- Get reward cost
    SELECT xp_cost INTO reward_xp_cost
    FROM public.xp_rewards 
    WHERE id = redeem_reward.reward_id AND is_available = true;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Get user XP
    SELECT xp_total INTO user_current_xp
    FROM public.profiles 
    WHERE id = redeem_reward.user_id;
    
    IF user_current_xp < reward_xp_cost THEN
        RETURN FALSE;
    END IF;
    
    -- Deduct XP and create reward record
    UPDATE public.profiles 
    SET xp_total = xp_total - reward_xp_cost,
        updated_at = NOW()
    WHERE id = redeem_reward.user_id;
    
    INSERT INTO public.user_rewards (user_id, reward_id)
    VALUES (redeem_reward.user_id, redeem_reward.reward_id)
    ON CONFLICT (user_id, reward_id) DO NOTHING;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update leaderboard function
CREATE OR REPLACE FUNCTION public.update_leaderboard()
RETURNS VOID AS $$
BEGIN
    -- Update global leaderboard
    DELETE FROM public.leaderboard WHERE category = 'global';
    
    INSERT INTO public.leaderboard (user_id, rank, xp_total, level, workout_streak, total_workouts, category, updated_at)
    SELECT 
        p.id,
        ROW_NUMBER() OVER (ORDER BY p.xp_total DESC, p.level DESC),
        p.xp_total,
        p.level,
        p.streak_days,
        p.total_workouts,
        'global',
        NOW()
    FROM public.profiles p
    WHERE p.xp_total > 0;
    
    -- Update weekly leaderboard
    DELETE FROM public.leaderboard 
    WHERE category = 'weekly' 
    AND period_start < NOW() - INTERVAL '7 days';
    
    INSERT INTO public.leaderboard (user_id, rank, xp_total, level, workout_streak, total_workouts, category, period_start, period_end, updated_at)
    SELECT 
        p.id,
        ROW_NUMBER() OVER (ORDER BY uw.xp_earned DESC, p.level DESC),
        COALESCE(SUM(uw.xp_earned), 0),
        p.level,
        p.streak_days,
        COUNT(uw.id),
        'weekly',
        DATE_TRUNC('week', NOW()),
        DATE_TRUNC('week', NOW()) + INTERVAL '7 days',
        NOW()
    FROM public.profiles p
    LEFT JOIN public.user_workouts uw ON p.id = uw.user_id 
        AND uw.completed_at >= DATE_TRUNC('week', NOW())
    GROUP BY p.id, p.level, p.streak_days
    HAVING COALESCE(SUM(uw.xp_earned), 0) > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check achievements function
CREATE OR REPLACE FUNCTION public.check_achievements(user_id UUID)
RETURNS TABLE(achievement_id UUID, title TEXT, description TEXT) AS $$
DECLARE
    user_record RECORD;
    achievement_record RECORD;
BEGIN
    -- Get user data
    SELECT * INTO user_record 
    FROM public.profiles 
    WHERE id = check_achievements.user_id;
    
    -- Check workout streak achievement
    IF user_record.streak_days >= 7 THEN
        INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at)
        VALUES (check_achievements.user_id, 
                (SELECT id FROM public.achievements WHERE title = 'Week Warrior'),
                NOW())
        ON CONFLICT (user_id, achievement_id) DO NOTHING;
        
        RETURN QUERY SELECT a.id, a.title, a.description 
        FROM public.achievements a 
        WHERE a.title = 'Week Warrior';
    END IF;
    
    -- Check level achievements
    IF user_record.level >= 10 THEN
        INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at)
        VALUES (check_achievements.user_id,
                (SELECT id FROM public.achievements WHERE title = 'Level Master'),
                NOW())
        ON CONFLICT (user_id, achievement_id) DO NOTHING;
        
        RETURN QUERY SELECT a.id, a.title, a.description 
        FROM public.achievements a 
        WHERE a.title = 'Level Master';
    END IF;
    
    -- Check total workouts achievement
    IF user_record.total_workouts >= 100 THEN
        INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at)
        VALUES (check_achievements.user_id,
                (SELECT id FROM public.achievements WHERE title = 'Century Club'),
                NOW())
        ON CONFLICT (user_id, achievement_id) DO NOTHING;
        
        RETURN QUERY SELECT a.id, a.title, a.description 
        FROM public.achievements a 
        WHERE a.title = 'Century Club';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers

-- Update timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_training_paths_updated_at
    BEFORE UPDATE ON public.training_paths
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_workout_plans_updated_at
    BEFORE UPDATE ON public.workout_plans
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_challenges_updated_at
    BEFORE UPDATE ON public.challenges
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_community_posts_updated_at
    BEFORE UPDATE ON public.community_posts
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_comments_updated_at
    BEFORE UPDATE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        NEW.email
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update leaderboard when user XP changes
CREATE OR REPLACE FUNCTION public.on_profile_xp_change()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM public.update_leaderboard();
    PERFORM public.check_achievements(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profile_xp_change_trigger
    AFTER UPDATE OF xp_total, level ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.on_profile_xp_change();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_xp_total ON public.profiles(xp_total DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_level ON public.profiles(level DESC);
CREATE INDEX IF NOT EXISTS idx_user_workouts_user_id ON public.user_workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_workouts_completed_at ON public.user_workouts(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_challenges_user_id ON public.user_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_category ON public.leaderboard(category, rank);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON public.community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id, created_at DESC);

-- Sample Data (optional - for development)
-- This would be removed in production

-- Sample exercises
INSERT INTO public.exercises (name, description, instructions, muscle_groups, equipment_needed, difficulty, category, calories_per_minute) VALUES
('Push-up', 'Classic upper body exercise', ARRAY['Start in plank position', 'Lower body until chest nearly touches ground', 'Push back up to starting position'], ARRAY['chest', 'shoulders', 'triceps'], ARRAY['bodyweight'], 'beginner', 'strength', 8.0),
('Pull-up', 'Upper body pulling exercise', ARRAY['Hang from bar with overhand grip', 'Pull body up until chin clears bar', 'Lower body with control'], ARRAY['back', 'biceps', 'forearms'], ARRAY['pullup_bar'], 'intermediate', 'strength', 10.0),
('Squat', 'Fundamental lower body exercise', ARRAY['Stand with feet shoulder-width apart', 'Lower hips back and down', 'Return to standing position'], ARRAY['quads', 'glutes', 'hamstrings'], ARRAY['bodyweight'], 'beginner', 'strength', 7.0),
('Plank', 'Core stability exercise', ARRAY['Hold push-up position', 'Keep body straight', 'Maintain tension in core'], ARRAY['core', 'shoulders'], ARRAY['bodyweight'], 'beginner', 'core', 5.0);

-- Sample training paths
INSERT INTO public.training_paths (title, description, level_required, category, difficulty, estimated_weeks) VALUES
('Foundation Builder', 'Master the basics of calisthenics', 1, 'strength', 'beginner', 8),
('Strength Progression', 'Build functional strength', 5, 'strength', 'intermediate', 12),
('Advanced Skills', 'Learn complex calisthenics movements', 10, 'skills', 'advanced', 16);

-- Sample achievements
INSERT INTO public.achievements (title, description, icon, category, type, requirements, xp_reward) VALUES
('First Workout', 'Complete your first workout', '🏃', 'workout', 'automatic', '{"workouts_completed": 1}', 50),
('Week Warrior', 'Maintain a 7-day workout streak', '🔥', 'streak', 'automatic', '{"streak_days": 7}', 200),
('Level Master', 'Reach level 10', '⭐', 'workout', 'automatic', '{"level": 10}', 500),
('Century Club', 'Complete 100 workouts', '💯', 'workout', 'automatic', '{"total_workouts": 100}', 1000);

-- Sample challenges
INSERT INTO public.challenges (title, description, type, difficulty, requirements, xp_reward, start_date, end_date) VALUES
('Monthly Push-up Challenge', 'Complete 1000 push-ups this month', 'monthly', 'intermediate', '{"exercise": "push-up", "total_reps": 1000, "period": "monthly"}', 300, DATE_TRUNC('month', NOW()), DATE_TRUNC('month', NOW()) + INTERVAL '1 month'),
('Plank Hold Master', 'Hold plank for 5 minutes straight', 'weekly', 'advanced', '{"exercise": "plank", "duration_seconds": 300}', 150, NOW(), NOW() + INTERVAL '7 days');

-- Sample XP rewards
INSERT INTO public.xp_rewards (title, description, type, item_data, xp_cost) VALUES
('Gold Avatar Frame', 'Premium gold frame for your profile picture', 'avatar', '{"frame": "gold", "rarity": "premium"}', 1000),
('Elite Badge', 'Show off your elite status', 'badge', '{"badge": "elite", "color": "#FFD700"}', 2000),
('Custom Theme', 'Dark theme with blue accents', 'theme', '{"theme": "custom", "colors": {"primary": "#00eeff"}}', 500);

COMMIT;
