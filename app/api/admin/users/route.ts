import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { verifyToken, extractTokenFromHeader, isAdmin } from '@/lib/auth';
import { ApiResponse } from '@/types';

// Get all users
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !isAdmin(payload)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Admin access required'
      }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        role,
        department,
        token_id,
        batch_name,
        section_name,
        created_at
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// Create new user
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !isAdmin(payload)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Admin access required'
      }, { status: 403 });
    }

    const { name, email, department, token_id, role, batch_name, section_name } = await request.json();

    // Validation
    if (!name || !email || !department || !token_id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Name, email, department, and token are required'
      }, { status: 400 });
    }

    // Check if token already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('token_id', token_id.toUpperCase())
      .single();

    if (existing) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Token ID already exists'
      }, { status: 409 });
    }

    // Create user
    const { data, error } = await supabase
      .from('users')
      .insert([{
        name,
        email,
        department,
        token_id: token_id.toUpperCase(),
        role: role || 'cr',
        batch_name: batch_name || null,
        section_name: section_name || null,
      }])
      .select();

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: data[0],
      message: 'User created successfully'
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}