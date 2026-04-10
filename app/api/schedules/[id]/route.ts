import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';
import { ApiResponse } from '@/types';

// GET Single Schedule
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const scheduleId = Number(id);

    const { data, error } = await supabase
      .from('schedules')
      .select(`
        *,
        rooms (id, room_name, building, room_type),
        time_slots (id, slot_name, start_time, end_time)
      `)
      .eq('id', scheduleId)
      .single();

    if (error || !data) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Schedule not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({ success: true, data }, { status: 200 });

  } catch (error) {
    console.error('GET schedule error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// Update Schedule
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const token = extractTokenFromHeader(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid token' }, 
        { status: 401 }
      );
    }

    const scheduleId = Number(id);
    const body = await request.json();

    // Get existing schedule
    const { data: schedule, error: findErr } = await supabase
      .from('schedules')
      .select('*')
      .eq('id', scheduleId)
      .single();

    if (findErr || !schedule) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Schedule not found' }, 
        { status: 404 }
      );
    }

    // Check permissions
    const isPrivileged = payload.role === 'admin' || payload.role === 'superadmin';
    if (!isPrivileged && schedule.created_by !== payload.userId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Forbidden' }, 
        { status: 403 }
      );
    }

    // Prepare update data (without updated_at - trigger will handle it)
    const updateData = {
      course_name: body.course_name,
      course_code: body.course_code || null,
      teacher_name: body.teacher_name || null,
      room_id: body.room_id,
      day_of_week: body.day_of_week,
      time_slot_id: body.time_slot_id,
    };

    // Update the schedule
    const { data, error } = await supabase
      .from('schedules')
      .update(updateData)
      .eq('id', scheduleId)
      .select(`
        *,
        rooms (id, room_name, building, room_type),
        time_slots (id, slot_name, start_time, end_time)
      `)
      .single();

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.message }, 
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse>({ success: true, data }, { status: 200 });

  } catch (error) {
    console.error('PATCH schedule error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// Delete Schedule
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid token' }, 
        { status: 401 }
      );
    }

    const scheduleId = parseInt(id);

    const { data: schedule } = await supabase
      .from('schedules')
      .select('*')
      .eq('id', scheduleId)
      .single();

    if (!schedule) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Schedule not found' }, 
        { status: 404 }
      );
    }

    const isPrivileged = payload.role === 'admin' || payload.role === 'superadmin';
    if (!isPrivileged && schedule.created_by !== payload.userId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Forbidden' }, 
        { status: 403 }
      );
    }
    
    // Delete all schedules with the same session_id
    const sessionId = schedule.session_id;
    
    const query = sessionId 
      ? supabase.from('schedules').delete().eq('session_id', sessionId)
      : supabase.from('schedules').delete().eq('id', scheduleId);

    const { error } = await query;
    
    if (error) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.message }, 
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse>(
      { success: true, message: 'Schedule deleted successfully' }, 
      { status: 200 }
    );

  } catch (error) {
    console.error('DELETE schedule error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}