import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';
import { ApiResponse } from '@/types';

// Update Schedule
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const token = extractTokenFromHeader(request.headers.get('authorization'));
    if (!token) return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json<ApiResponse>({ success: false, error: 'Invalid token' }, { status: 401 });

    const scheduleId = Number(id);
    const body = await request.json();

    const { data: schedule, error: findErr } = await supabase
      .from('schedules')
      .select('*')
      .eq('id', scheduleId)
      .single();

    if (findErr || !schedule) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Schedule not found' }, { status: 404 });
    }

    const isPrivileged = payload.role === 'admin' || payload.role === 'superadmin';
    if (!isPrivileged && schedule.created_by !== payload.userId) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const sessionId = schedule.session_id ?? null;

    // Data to update for all related schedules
    const updatePayload = {
      course_name: body.course_name,
      course_code: body.course_code || null,
      teacher_name: body.teacher_name || null,
    };

    const query = sessionId
      ? supabase.from('schedules').update(updatePayload).eq('session_id', sessionId)
      : supabase.from('schedules').update(updatePayload).eq('id', scheduleId);
      
    // Additionally update single schedule info (if changed)
    const singleUpdatePayload = {
      ...updatePayload,
      room_id: body.room_id,
      day_of_week: body.day_of_week,
      time_slot_id: body.time_slot_id
    };

    const { data, error } = await supabase
      .from('schedules')
      .update(singleUpdatePayload)
      .eq('id', scheduleId)
      .select();

    if (error) {
      return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json<ApiResponse>({ success: true, data }, { status: 200 });

  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Internal server error' }, { status: 500 });
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

    if (!token) return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json<ApiResponse>({ success: false, error: 'Invalid token' }, { status: 401 });

    const scheduleId = parseInt(id);

    const { data: schedule } = await supabase.from('schedules').select('*').eq('id', scheduleId).single();
    if (!schedule) return NextResponse.json<ApiResponse>({ success: false, error: 'Schedule not found' }, { status: 404 });

    const isPrivileged = payload.role === 'admin' || payload.role === 'superadmin';
    if (!isPrivileged && schedule.created_by !== payload.userId) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    
    // Delete all schedules with the same session_id
    const sessionId = schedule.session_id;
    
    const query = sessionId 
      ? supabase.from('schedules').delete().eq('session_id', sessionId)
      : supabase.from('schedules').delete().eq('id', scheduleId);

    const { error } = await query;
    if (error) return NextResponse.json<ApiResponse>({ success: false, error: error.message }, { status: 500 });

    return NextResponse.json<ApiResponse>({ success: true, message: 'Schedule deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}