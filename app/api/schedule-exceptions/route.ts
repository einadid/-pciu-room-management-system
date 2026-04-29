import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';
import { ApiResponse } from '@/types';

// GET: Fetch exceptions for a date range or specific date
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');           // YYYY-MM-DD
    const schedule_id = searchParams.get('schedule_id');
    const department = searchParams.get('department');
    const batch_name = searchParams.get('batch_name');
    const section_name = searchParams.get('section_name');

    let query = supabase
      .from('schedule_exceptions')
      .select(`
        *,
        schedules (
          id,
          course_name,
          course_code,
          teacher_name,
          department,
          day_of_week,
          time_slot_id,
          room_id,
          batch_name,
          section_name
        )
      `)
      .order('exception_date', { ascending: false });

    if (date) {
      query = query.eq('exception_date', date);
    }

    if (schedule_id) {
      query = query.eq('schedule_id', parseInt(schedule_id));
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    // Filter by department/batch/section if provided
    let filtered = data || [];
    if (department || batch_name || section_name) {
      filtered = filtered.filter((ex: any) => {
        const s = ex.schedules;
        if (!s) return false;
        if (department && s.department !== department) return false;
        if (batch_name && s.batch_name !== batch_name) return false;
        if (section_name && s.section_name !== section_name) return false;
        return true;
      });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: filtered
    }, { status: 200 });

  } catch (error) {
    console.error('Get exceptions error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// POST: Create new exception (cancel class or add notice)
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

    const {
      schedule_id,
      exception_date,
      exception_type,
      reason,
      notice_text
    } = await request.json();

    // Validation
    if (!schedule_id || !exception_date || !exception_type) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'schedule_id, exception_date, and exception_type are required'
      }, { status: 400 });
    }

    if (!['cancelled', 'notice'].includes(exception_type)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'exception_type must be cancelled or notice'
      }, { status: 400 });
    }

    // Check if exception already exists for this date
    const { data: existing } = await supabase
      .from('schedule_exceptions')
      .select('id, exception_type')
      .eq('schedule_id', schedule_id)
      .eq('exception_date', exception_date)
      .single();

    if (existing) {
      // Update existing exception
      const { data, error } = await supabase
        .from('schedule_exceptions')
        .update({
          exception_type,
          reason: reason || null,
          notice_text: notice_text || null,
        })
        .eq('id', existing.id)
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
        message: 'Exception updated successfully'
      }, { status: 200 });
    }

    // Create new exception
    const { data, error } = await supabase
      .from('schedule_exceptions')
      .insert([{
        schedule_id,
        exception_date,
        exception_type,
        reason: reason || null,
        notice_text: notice_text || null,
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
      data: data[0],
      message: `Class ${exception_type === 'cancelled' ? 'cancelled' : 'notice added'} successfully`
    }, { status: 201 });

  } catch (error) {
    console.error('Create exception error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}