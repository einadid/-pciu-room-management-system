import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';
import { ApiResponse } from '@/types';

// Get schedules
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const day = searchParams.get('day');
    const room_id = searchParams.get('room_id');
    const department = searchParams.get('department');
    const batch_name = searchParams.get('batch_name');
    const section_name = searchParams.get('section_name');

    let query = supabase
      .from('schedules')
      .select(`
        *,
        rooms (id, room_name, building),
        time_slots (id, start_time, end_time, slot_name),
        users (id, name)
      `)
      .order('day_of_week')
      .order('time_slot_id');

    if (day) query = query.eq('day_of_week', day);
    if (room_id) query = query.eq('room_id', parseInt(room_id));
    if (department) query = query.eq('department', department);
    if (batch_name) query = query.eq('batch_name', batch_name);
    if (section_name) query = query.eq('section_name', section_name);

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
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// Create schedule
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
    if (!payload) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid token'
      }, { status: 401 });
    }

    const body = await request.json();
    const {
      room_id,
      course_name,
      course_code,
      teacher_name,
      department,
      day_of_week,
      time_slot_id,
      batch_name,
      section_name,
    } = body;

    // Validation
    if (!room_id || !course_name || !department || !day_of_week || !time_slot_id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Check for conflicts
    const { data: existing } = await supabase
      .from('schedules')
      .select('id')
      .eq('room_id', room_id)
      .eq('day_of_week', day_of_week)
      .eq('time_slot_id', time_slot_id)
      .single();

    if (existing) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Room is already booked for this time slot'
      }, { status: 409 });
    }

    // Insert
    const { data, error } = await supabase
      .from('schedules')
      .insert([{
        room_id,
        course_name,
        course_code,
        teacher_name,
        department,
        day_of_week,
        time_slot_id,
        batch_name,
        section_name,
        created_by: payload.userId
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
      data,
      message: 'Schedule created successfully'
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}