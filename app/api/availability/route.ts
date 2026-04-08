import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { ApiResponse, RoomAvailability, DayOfWeek } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { day, time_slot_id, room_type, building } = await request.json();

    // Validate input
    if (!day || !time_slot_id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Day and time slot are required'
      }, { status: 400 });
    }

    // Get all rooms with optional filters
    let roomQuery = supabase
      .from('rooms')
      .select(`
        *,
        room_types (
          type_name
        )
      `)
      .eq('is_active', true);

    if (room_type) {
      roomQuery = roomQuery.eq('room_types.type_name', room_type);
    }

    if (building) {
      roomQuery = roomQuery.eq('building', building);
    }

    const { data: rooms, error: roomError } = await roomQuery;

    if (roomError) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: roomError.message
      }, { status: 500 });
    }

    // Get all schedules for this day and time slot
    const { data: schedules, error: scheduleError } = await supabase
      .from('schedules')
      .select(`
        *,
        rooms (
          id,
          room_name
        )
      `)
      .eq('day_of_week', day)
      .eq('time_slot_id', time_slot_id);

    if (scheduleError) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: scheduleError.message
      }, { status: 500 });
    }

    // Get room ownership data
    const { data: ownerships, error: ownershipError } = await supabase
      .from('room_ownership')
      .select('*');

    if (ownershipError) {
      console.error('Ownership fetch error:', ownershipError);
    }

    // Build availability map
    const availability: RoomAvailability[] = rooms.map((room: any) => {
      const occupiedSchedule = schedules?.find(
        (s: any) => s.room_id === room.id
      );

      // Get departments that use this room
      const roomOwners = ownerships
        ?.filter((o: any) => o.room_id === room.id)
        .map((o: any) => o.department) || [];

      const isExclusive = roomOwners.length === 1;

      return {
        room: {
          id: room.id,
          room_name: room.room_name,
          building: room.building,
          capacity: room.capacity,
          type_id: room.type_id,
          is_active: room.is_active
        },
        status: occupiedSchedule ? 'occupied' : 'free',
        current_class: occupiedSchedule ? {
          course_name: occupiedSchedule.course_name,
          teacher_name: occupiedSchedule.teacher_name,
          department: occupiedSchedule.department
        } : undefined,
        owned_by: roomOwners.length > 0 ? roomOwners : undefined,
        is_exclusive: isExclusive
      };
    });

    return NextResponse.json<ApiResponse<RoomAvailability[]>>({
      success: true,
      data: availability
    }, { status: 200 });

  } catch (error) {
    console.error('Availability check error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}