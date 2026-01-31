
export interface Profile {
  id: string;
  username: string;
  age: number | null;
  avatar_url: string | null;
  is_admin: boolean;
  onboarding_completed: boolean;
}

export interface Map {
  id: string;
  name: string;
  description: string;
  order_index: number;
}

export interface Level {
  id: string;
  map_id: string;
  name: string;
  description: string;
  order_index: number;
}

export interface Exercise {
  id: string;
  level_id: string;
  name: string;
  description: string;
  video_url: string;
  order_index: number;
}

export interface UserProgress {
  id: string;
  user_id: string;
  map_id: string;
  level_id: string;
  exercise_id: string;
  completed_at: string;
}
