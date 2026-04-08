import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { generateToken } from '@/lib/auth';
import { ApiResponse, LoginResponse, User } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token_id } = body;

    console.log('🔐 Login attempt with token:', token_id); // Debug

    // Validate input
    if (!token_id || token_id.trim() === '') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Token ID is required'
      }, { status: 400 });
    }

    const cleanToken = token_id.trim().toUpperCase();
    console.log('🔍 Searching for token:', cleanToken); // Debug

    // Find user by token_id
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('token_id', cleanToken)
      .single();

    console.log('📊 Supabase response:', { user, error }); // Debug

    if (error) {
      console.error('❌ Supabase error:', error);
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid token ID'
      }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User not found'
      }, { status: 401 });
    }

    // Generate JWT
    const access_token = generateToken(user as User);

    console.log('✅ Login successful for:', user.name); // Debug

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