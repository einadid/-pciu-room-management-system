import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET() {
  try {
    // Test users
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, name, email, role, token_id');

    // Test feedback
    const { data: feedback, error: feedbackError } = await supabase
      .from('feedback')
      .select('*');

    // Test rooms
    const { data: rooms, error: roomError } = await supabase
      .from('rooms')
      .select('count');

    return NextResponse.json({
      success: true,
      connection: 'OK',
      users: {
        count: users?.length || 0,
        data: users || [],
        error: userError?.message || null
      },
      feedback: {
        count: feedback?.length || 0,
        error: feedbackError?.message || null
      },
      rooms: {
        count: rooms?.length || 0,
        error: roomError?.message || null
      },
      env: {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        urlStart: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) || 'NOT SET'
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: String(error)
    });
  }
}