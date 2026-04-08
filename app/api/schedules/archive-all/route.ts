import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';
import { ApiResponse } from '@/types';

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

    const { department, batch_name, section_name, semester } = await request.json();

    // Get all schedules to archive
    let query = supabase
      .from('schedules')
      .select(`
        *,
        rooms (room_name),
        time_slots (slot_name)
      `)
      .eq('department', department);

    if (batch_name) query = query.eq('batch_name', batch_name);
    if (section_name) query = query.eq('section_name', section_name);

    const { data: schedules, error: fetchError } = await query;

    if (fetchError) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: fetchError.message
      }, { status: 500 });
    }

    if (!schedules || schedules.length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'No schedules found to archive'
      }, { status: 404 });
    }

    // Archive schedules
    const archiveData = schedules.map((s) => ({
      original_id: s.id,
      room_id: s.room_id,
      course_name: s.course_name,
      course_code: s.course_code,
      teacher_name: s.teacher_name,
      department: s.department,
      batch_name: s.batch_name || batch_name,
      section_name: s.section_name || section_name,
      day_of_week: s.day_of_week,
      time_slot_id: s.time_slot_id,
      created_by: s.created_by,
      semester: semester,
    }));

    const { error: archiveError } = await supabase
      .from('archived_schedules')
      .insert(archiveData);

    if (archiveError) {
      console.error('Archive error:', archiveError);
      // Continue anyway to delete
    }

    // Delete original schedules
    let deleteQuery = supabase
      .from('schedules')
      .delete()
      .eq('department', department);

    if (batch_name) deleteQuery = deleteQuery.eq('batch_name', batch_name);
    if (section_name) deleteQuery = deleteQuery.eq('section_name', section_name);

    const { error: deleteError } = await deleteQuery;

    if (deleteError) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: deleteError.message
      }, { status: 500 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      archived_count: schedules.length,
      message: `${schedules.length} schedules archived and deleted`
    }, { status: 200 });

  } catch (error) {
    console.error('Archive error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}