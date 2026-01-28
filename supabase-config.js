// Supabase Configuration for CaliQuest Platform
const SUPABASE_CONFIG = {
    url: 'https://jzclhcbsbahnnmviilga.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6Y2xoY2JzYmFobm5tdmlpbGdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MTk5NTYsImV4cCI6MjA4NTE5NTk1Nn0.6HbT2ZWklpXdBMwGxrWKkMJUNZl1CeKRWNeH8ZUFm0c',
    serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6Y2xoY2JzYmFobm5tdmlpbGdhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYxOTk1NiwiZXhwIjoyMDg1MTk1OTU2fQ.ps0aJKJXo1bMlx43OvC4cHttIuT7GwZdjPYy5nU417w'
};

// Initialize Supabase Client
if (typeof window.supabase === 'undefined') {
    console.error('Supabase script not loaded. Please ensure Supabase CDN is included.');
    throw new Error('Supabase is required but not loaded');
}

const { createClient } = window.supabase;
const supabaseClient = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// Database Schema Constants
const TABLES = {
    USERS: 'users',
    PROFILES: 'profiles',
    TRAINING_PATHS: 'training_paths',
    EXERCISES: 'exercises',
    WORKOUTS: 'workouts',
    USER_WORKOUTS: 'user_workouts',
    CHALLENGES: 'challenges',
    USER_CHALLENGES: 'user_challenges',
    ACHIEVEMENTS: 'achievements',
    USER_ACHIEVEMENTS: 'user_achievements',
    XP_REWARDS: 'xp_rewards',
    USER_REWARDS: 'user_rewards',
    LEADERBOARD: 'leaderboard',
    WORKOUT_PLANS: 'workout_plans',
    EQUIPMENT: 'equipment',
    NUTRITION: 'nutrition',
    COMMUNITY_POSTS: 'community_posts',
    COMMENTS: 'comments'
};

const BUCKETS = {
    AVATARS: 'avatars',
    EXERCISE_IMAGES: 'exercise_images',
    WORKOUT_VIDEOS: 'workout_videos',
    ACHIEVEMENT_IMAGES: 'achievement_images',
    EQUIPMENT_IMAGES: 'equipment_images',
    COMMUNITY_MEDIA: 'community_media'
};

// API Functions
class CaliQuestAPI {
    constructor() {
        if (typeof supabaseClient === 'undefined') {
            throw new Error('Supabase is required but not loaded');
        }
        
        this.supabase = supabaseClient;
        this.currentUser = null;
    }

    // Authentication
    async signUp(email, password, userData) {
        try {
            const { data, error } = await this.supabase.auth.signUp({
                email,
                password,
                options: {
                    data: userData
                }
            });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        }
    }

    async signIn(email, password) {
        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;
            this.currentUser = data.user;
            return data;
        } catch (error) {
            console.error('Signin error:', error);
            throw error;
        }
    }

    async signOut() {
        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;
            this.currentUser = null;
        } catch (error) {
            console.error('Signout error:', error);
            throw error;
        }
    }

    // Profile Management
    async getProfile(userId) {
        try {
            const { data, error } = await this.supabase
                .from(TABLES.PROFILES)
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Get profile error:', error);
            throw error;
        }
    }

    async updateProfile(userId, updates) {
        try {
            const { data, error } = await this.supabase
                .from(TABLES.PROFILES)
                .update(updates)
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        }
    }

    // Training Paths
    async getTrainingPaths() {
        try {
            const { data, error } = await this.supabase
                .from(TABLES.TRAINING_PATHS)
                .select('*')
                .order('level', { ascending: true });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Get training paths error:', error);
            throw error;
        }
    }

    async getUserProgress(userId) {
        try {
            const { data, error } = await this.supabase
                .from(TABLES.USER_WORKOUTS)
                .select(`
                    *,
                    workouts (*),
                    training_paths (*)
                `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Get user progress error:', error);
            throw error;
        }
    }

    // Workouts
    async getWorkouts(pathId = null) {
        try {
            let query = this.supabase.from(TABLES.WORKOUTS).select('*');
            
            if (pathId) {
                query = query.eq('training_path_id', pathId);
            }
            
            const { data, error } = await query.order('difficulty', { ascending: true });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Get workouts error:', error);
            throw error;
        }
    }

    async completeWorkout(userId, workoutId, stats) {
        try {
            const { data, error } = await this.supabase
                .from(TABLES.USER_WORKOUTS)
                .insert({
                    user_id: userId,
                    workout_id: workoutId,
                    completed_at: new Date().toISOString(),
                    ...stats
                })
                .select()
                .single();

            if (error) throw error;
            
            // Update user XP
            await this.updateUserXP(userId, stats.xp_earned || 0);
            
            return data;
        } catch (error) {
            console.error('Complete workout error:', error);
            throw error;
        }
    }

    // Challenges
    async getChallenges() {
        try {
            const { data, error } = await this.supabase
                .from(TABLES.CHALLENGES)
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Get challenges error:', error);
            throw error;
        }
    }

    async acceptChallenge(userId, challengeId) {
        try {
            const { data, error } = await this.supabase
                .from(TABLES.USER_CHALLENGES)
                .insert({
                    user_id: userId,
                    challenge_id: challengeId,
                    status: 'active',
                    started_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Accept challenge error:', error);
            throw error;
        }
    }

    // Leaderboard
    async getLeaderboard(limit = 50) {
        try {
            const { data, error } = await this.supabase
                .from(TABLES.LEADERBOARD)
                .select(`
                    *,
                    profiles!inner (
                        username,
                        avatar_url,
                        level
                    )
                `)
                .order('rank', { ascending: true })
                .limit(limit);

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Get leaderboard error:', error);
            throw error;
        }
    }

    // Achievements
    async getAchievements() {
        try {
            const { data, error } = await this.supabase
                .from(TABLES.ACHIEVEMENTS)
                .select('*')
                .order('required_xp', { ascending: true });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Get achievements error:', error);
            throw error;
        }
    }

    async getUserAchievements(userId) {
        try {
            const { data, error } = await this.supabase
                .from(TABLES.USER_ACHIEVEMENTS)
                .select(`
                    *,
                    achievements (*)
                `)
                .eq('user_id', userId)
                .order('unlocked_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Get user achievements error:', error);
            throw error;
        }
    }

    // XP and Rewards
    async updateUserXP(userId, xpAmount) {
        try {
            const { data, error } = await this.supabase.rpc('update_user_xp', {
                user_id: userId,
                xp_amount: xpAmount
            });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Update user XP error:', error);
            throw error;
        }
    }

    async getRewards() {
        try {
            const { data, error } = await this.supabase
                .from(TABLES.XP_REWARDS)
                .select('*')
                .order('xp_cost', { ascending: true });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Get rewards error:', error);
            throw error;
        }
    }

    async redeemReward(userId, rewardId) {
        try {
            const { data, error } = await this.supabase.rpc('redeem_reward', {
                user_id: userId,
                reward_id: rewardId
            });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Redeem reward error:', error);
            throw error;
        }
    }

    // File Upload
    async uploadFile(bucket, file, path) {
        try {
            const { data, error } = await this.supabase.storage
                .from(bucket)
                .upload(path, file);

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Upload file error:', error);
            throw error;
        }
    }

    async getPublicUrl(bucket, path) {
        try {
            const { data } = this.supabase.storage
                .from(bucket)
                .getPublicUrl(path);

            return data.publicUrl;
        } catch (error) {
            console.error('Get public URL error:', error);
            throw error;
        }
    }
}

// Initialize API immediately when script loads
const api = new CaliQuestAPI();

// Export for global use
window.CaliQuestAPI = api;
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
