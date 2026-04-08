import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';
import { ApiResponse } from '@/types';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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

    const scheduleId = parseInt(id);

    // Get schedule to check ownership
    const { data: schedule } = await supabase
      .from('schedules')
      .select('*')
      .eq('id', scheduleId)
      .single();

    if (!schedule) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Schedule not found'
      }, { status: 404 });
    }

    // Only allow deletion if user created it or is admin
    if (payload.role !== 'admin' && payload.role !== 'superadmin' && schedule.created_by !== payload.userId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Not authorized to delete this schedule'
      }, { status: 403 });
    }

    // Delete schedule
    const { error } = await supabase
      .from('schedules')
      .delete()
      .eq('id', scheduleId);

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Schedule deleted successfully'
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}