import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';
import { ApiResponse, RoomWithType } from '@/types';

// GET: Fetch all rooms with optional filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type'); // Filter by room type (e.g., 'Lab', 'Classroom')
    const building = searchParams.get('building'); // Filter by building
    const type_id = searchParams.get('type_id'); // Filter by type_id directly
    const active_only = searchParams.get('active_only'); // Filter active only (default true)

    let query = supabase
      .from('rooms')
      .select(`
        *,
        room_types (
          id,
          type_name
        )
      `)
      .order('building', { ascending: true })
      .order('room_name', { ascending: true });

    // Filter by active status (default: only active rooms)
    if (active_only !== 'false') {
      query = query.eq('is_active', true);
    }

    // Filter by building
    if (building) {
      query = query.eq('building', building);
    }

    // Filter by type_id
    if (type_id) {
      query = query.eq('type_id', parseInt(type_id));
    }

    const { data: rooms, error } = await query;

    if (error) {
      console.error('GET /api/rooms error:', error);
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    // Filter by type name if provided (client-side filter since Supabase doesn't support nested filtering directly)
    let filteredRooms = rooms as RoomWithType[];
    
    if (type) {
      filteredRooms = filteredRooms.filter(
        (room) => room.room_types?.type_name?.toLowerCase() === type.toLowerCase()
      );
    }

    return NextResponse.json<ApiResponse<RoomWithType[]>>({
      success: true,
      data: filteredRooms
    }, { status: 200 });

  } catch (error) {
    console.error('GET /api/rooms error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// POST: Create new room (Admin only)
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

    // Only admin or superadmin can add rooms
    if (payload.role !== 'admin' && payload.role !== 'superadmin') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Forbidden: Admin access required'
      }, { status: 403 });
    }

    const body = await request.json();
    const { room_name, building, capacity, type_id, is_active } = body;

    // Validation
    if (!room_name || !building) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Missing required fields: room_name, building'
      }, { status: 400 });
    }

    // Check if room already exists in same building
    const { data: existing } = await supabase
      .from('rooms')
      .select('id')
      .eq('room_name', room_name)
      .eq('building', building)
      .single();

    if (existing) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Room already exists in this building'
      }, { status: 409 });
    }

    // Insert new room
    const { data, error } = await supabase
      .from('rooms')
      .insert({
        room_name,
        building,
        capacity: capacity || null,
        type_id: type_id || null,
        is_active: is_active !== false, // Default to true
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select(`
        *,
        room_types (
          id,
          type_name
        )
      `)
      .single();

    if (error) {
      console.error('POST /api/rooms error:', error);
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data,
      message: 'Room created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/rooms error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}