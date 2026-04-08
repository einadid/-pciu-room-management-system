import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials missing in .env.local');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Test connection on import
if (supabaseUrl && supabaseAnonKey) {
  supabase
    .from('users')
    .select('count')
    .limit(1)
    .then(({ error }) => {
      if (error) {
        console.error('❌ Supabase connection failed:', error.message);
      } else {
        console.log('✅ Supabase connected successfully');
      }
    });
}

export async function testConnection(): Promise<boolean> {
  if (!supabaseUrl || !supabaseAnonKey) {
    return false;
  }

  try {
    const { error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    return !error;
  } catch {
    return false;
  }
}