
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vmrsxpfmnxmnhuokomnc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtcnN4cGZtbnhtbmh1b2tvbW5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3ODUxOTksImV4cCI6MjA4NTM2MTE5OX0.aX8wN3CZQzIBghsC8UXIutXj2Z2HZSd2VYXfQLcTXnw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
