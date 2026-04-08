import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { generateToken } from '@/lib/auth';
import { ApiResponse, LoginResponse, User } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { token_id } = await request.json();

    // Validate input
    if (!token_id || token_id.trim() === '') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Token ID is required'
      }, { status: 400 });
    }

    // Find user by token_id
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('token_id', token_id.toUpperCase())
      .single();

    if (error || !user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid token ID'
      }, { status: 401 });
    }

    // Generate JWT
    const access_token = generateToken(user as User);

    return NextResponse.json<ApiResponse<LoginResponse>>({
      success: true,
      data: {
        user: user as User,
        access_token
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}