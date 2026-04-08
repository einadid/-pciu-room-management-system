import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { ApiResponse, RoomWithType } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type'); // Filter by type
    const building = searchParams.get('building'); // Filter by building

    let query = supabase
      .from('rooms')
      .select(`
        *,
        room_types (
          id,
          type_name
        )
      `)
      .eq('is_active', true)
      .order('room_name', { ascending: true });

    // Apply filters
    if (type) {
      query = query.eq('room_types.type_name', type);
    }

    if (building) {
      query = query.eq('building', building);
    }

    const { data: rooms, error } = await query;

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    return NextResponse.json<ApiResponse<RoomWithType[]>>({
      success: true,
      data: rooms as RoomWithType[]
    }, { status: 200 });

  } catch (error) {
    console.error('Get rooms error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}