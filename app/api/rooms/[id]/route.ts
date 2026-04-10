import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';
import { ApiResponse } from '@/types';

// DELETE: Delete a room (Admin only)
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

    // Only admin or superadmin can delete rooms
    if (payload.role !== 'admin' && payload.role !== 'superadmin') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Forbidden: Admin access required'
      }, { status: 403 });
    }

    const roomId = parseInt(id);

    // Check if room has any schedules
    const { data: schedules } = await supabase
      .from('schedules')
      .select('id')
      .eq('room_id', roomId)
      .limit(1);

    if (schedules && schedules.length > 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Cannot delete room: It has scheduled classes. Delete schedules first.'
      }, { status: 400 });
    }

    // Delete room
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', roomId);

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Room deleted successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE /api/rooms/[id] error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// PUT: Update a room (Admin only)
export async function PUT(
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

    if (payload.role !== 'admin' && payload.role !== 'superadmin') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Forbidden: Admin access required'
      }, { status: 403 });
    }

    const roomId = parseInt(id);
    const body = await request.json();
    const { room_name, building, capacity } = body;

    const { data, error } = await supabase
      .from('rooms')
      .update({
        room_name,
        building,
        capacity: capacity || null,
      })
      .eq('id', roomId)
      .select()
      .single();

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data,
      message: 'Room updated successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('PUT /api/rooms/[id] error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}