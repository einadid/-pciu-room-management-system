import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';
import { ApiResponse, ScheduleWithDetails } from '@/types';

// ✅ Get schedules (with filters)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const day = searchParams.get('day');
    const room_id = searchParams.get('room_id');
    const department = searchParams.get('department');

    let query = supabase
      .from('schedules')
      .select(`
        *,
        rooms (
          id,
          room_name,
          building
        ),
        time_slots (
          id,
          start_time,
          end_time,
          slot_name
        ),
        users (
          id,
          name,
          role
        )
      `)
      .order('day_of_week', { ascending: true })
      .order('time_slot_id', { ascending: true });

    if (day) query = query.eq('day_of_week', day);
    if (room_id) query = query.eq('room_id', parseInt(room_id));
    if (department) query = query.eq('department', department);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    return NextResponse.json<ApiResponse<ScheduleWithDetails[]>>({
      success: true,
      data: data as ScheduleWithDetails[]
    }, { status: 200 });

  } catch (error) {
    console.error('Get schedules error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// ✅ Create new schedule (CR only)
export async function POST(request: NextRequest) {
  try {
    // Authentication
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

    // Get request data
    const scheduleData = await request.json();
    const {
      room_id,
      course_name,
      course_code,
      teacher_name,
      department,
      day_of_week,
      time_slot_id
    } = scheduleData;

    // Validation
    if (!room_id || !course_name || !department || !day_of_week || !time_slot_id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Check for conflicts
    const { data: existingSchedule } = await supabase
      .from('schedules')
      .select('*')
      .eq('room_id', room_id)
      .eq('day_of_week', day_of_week)
      .eq('time_slot_id', time_slot_id)
      .single();

    if (existingSchedule) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Room is already booked for this time slot'
      }, { status: 409 });
    }

    // Insert schedule
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
        created_by: payload.userId
      }])
      .select();

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    // Auto-assign room ownership
    await supabase
      .from('room_ownership')
      .upsert([{ room_id, department }], {
        onConflict: 'room_id,department'
      });

    return NextResponse.json<ApiResponse>({
      success: true,
      data,
      message: 'Schedule created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Create schedule error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}