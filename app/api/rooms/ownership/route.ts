import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { ApiResponse } from '@/types';

// ✅ Get rooms that belong to specific departments
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const department = searchParams.get('department');

    let query = supabase
      .from('room_ownership')
      .select(`
        *,
        rooms (
          id,
          room_name,
          building,
          capacity,
          room_types (
            type_name
          )
        )
      `);

    if (department) {
      query = query.eq('department', department);
    }

    const { data, error } = await query;

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
    console.error('Get ownership error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// ✅ Assign room to department
export async function POST(request: NextRequest) {
  try {
    const { room_id, department } = await request.json();

    if (!room_id || !department) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Room ID and department are required'
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('room_ownership')
      .insert([{ room_id, department }])
      .select();

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data,
      message: 'Room assigned successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Assign ownership error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}