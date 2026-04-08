import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { generateToken } from '@/lib/auth';
import { ApiResponse, LoginResponse, User } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token_id } = body;

    console.log('🔐 Login attempt with token:', token_id);

    // Validate input
    if (!token_id || token_id.trim() === '') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Token ID is required'
      }, { status: 400 });
    }

    const cleanToken = token_id.trim().toUpperCase();
    console.log('🔍 Searching for token:', cleanToken);

    // Find user by token_id
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('token_id', cleanToken);

    console.log('📊 Supabase response:', { 
      usersFound: users?.length || 0, 
      error: error?.message || null 
    });

    if (error) {
      console.error('❌ Supabase error:', error);
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Database error: ' + error.message
      }, { status: 500 });
    }

    if (!users || users.length === 0) {
      console.log('❌ No user found with token:', cleanToken);
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid token ID. Please check and try again.'
      }, { status: 401 });
    }

    const user = users[0];

    // Generate JWT
    const access_token = generateToken(user as User);

    console.log('✅ Login successful for:', user.name);

    return NextResponse.json<ApiResponse<LoginResponse>>({
      success: true,
      data: {
        user: user as User,
        access_token
      }
    }, { status: 200 });

  } catch (error) {
    console.error('💥 Login error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}