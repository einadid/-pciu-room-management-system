import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';
import { ApiResponse } from '@/types';
import { randomUUID } from 'crypto';

// GET: Fetch schedules with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Check for single schedule by ID first
    const id = searchParams.get('id');
    if (id) {
      const { data, error } = await supabase
        .from('schedules')
        .select(`
          *,
          rooms (id, room_name, building),
          time_slots (id, start_time, end_time, slot_name),
          users (id, name)
        `)
        .eq('id', parseInt(id));

      if (error) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: error.message
        }, { status: 500 });
      }

      return NextResponse.json<ApiResponse>({
        success: true,
        data: data || []
      }, { status: 200 });
    }

    // Continue with existing filters
    const day = searchParams.get('day');
    const room_id = searchParams.get('room_id');
    const department = searchParams.get('department');
    const batch_name = searchParams.get('batch_name');
    const section_name = searchParams.get('section_name');
    const sub_section = searchParams.get('sub_section');
    const session_id = searchParams.get('session_id');

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

    // Apply filters
    if (day) query = query.eq('day_of_week', day);
    if (room_id) query = query.eq('room_id', parseInt(room_id));
    if (department) query = query.eq('department', department);
    if (batch_name) query = query.eq('batch_name', batch_name);
    if (section_name) query = query.eq('section_name', section_name);
    if (sub_section) query = query.eq('sub_section', sub_section);
    if (session_id) query = query.eq('session_id', session_id);

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
    console.error('GET /api/schedules error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// POST: Create new schedule (supports multi-slot classes like 3-hour labs)
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
      sub_section,
      class_type,
      duration_slots,
    } = body;

    // Basic validation
    if (!room_id || !course_name || !department || !day_of_week || !time_slot_id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Missing required fields: room_id, course_name, department, day_of_week, time_slot_id'
      }, { status: 400 });
    }

    // Calculate slots to book
    const slotsToBook = Math.max(1, Number(duration_slots || 1));
    const startSlot = Number(time_slot_id);
    
    // Generate array of slot IDs to book
    const slotIds = Array.from({ length: slotsToBook }, (_, i) => startSlot + i);

    // Validate that slots don't exceed max slot number
    const MAX_SLOTS_PER_DAY = 6;
    if (slotIds.some(s => s < 1 || s > MAX_SLOTS_PER_DAY)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: `Invalid slot range. Slots must be between 1 and ${MAX_SLOTS_PER_DAY}. Requested slots: ${slotIds.join(', ')}`
      }, { status: 400 });
    }

    // Check for conflicts in ALL required slots
    const { data: conflicts, error: conflictError } = await supabase
      .from('schedules')
      .select('id, time_slot_id, course_name, sub_section, class_type, session_id')
      .eq('room_id', room_id)
      .eq('day_of_week', day_of_week)
      .in('time_slot_id', slotIds);

    if (conflictError) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: conflictError.message
      }, { status: 500 });
    }

    // Handle conflicts
    if (conflicts && conflicts.length > 0) {
      const conflictSlot = conflicts[0];
      
      return NextResponse.json<ApiResponse>({
        success: false,
        error: `Room is already booked for Slot ${conflictSlot.time_slot_id} (${conflictSlot.course_name}${conflictSlot.sub_section ? ' - ' + conflictSlot.sub_section : ''}). Please choose a different room or time.`
      }, { status: 409 });
    }

    // Generate a unique session_id for this booking
    const session_id = randomUUID();

    // Create schedule entries for all required slots
    const newSchedules = slotIds.map(slotId => ({
      room_id: Number(room_id),
      course_name,
      course_code: course_code || null,
      teacher_name: teacher_name || null,
      department,
      day_of_week,
      time_slot_id: slotId,
      batch_name: batch_name || null,
      section_name: section_name || null,
      sub_section: sub_section || null,
      class_type: class_type || 'Theory',
      created_by: payload.userId,
      session_id: session_id,
    }));

    // Insert all schedule entries
    const { data, error } = await supabase
      .from('schedules')
      .insert(newSchedules)
      .select(`
        *,
        rooms (id, room_name, building),
        time_slots (id, start_time, end_time, slot_name)
      `);

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data,
      message: `Schedule created successfully${slotsToBook > 1 ? ` (${slotsToBook} slots booked)` : ''}`
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/schedules error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}