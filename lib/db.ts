import { createClient } from '@supabase/supabase-js';

// Environment variables check
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables!');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test connection function
export async function testConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Database connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Database connected successfully!');
    return true;
  } catch (err) {
    console.error('Connection error:', err);
    return false;
  }
}