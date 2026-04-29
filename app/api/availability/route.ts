import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { ApiResponse, RoomAvailability } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { day, time_slot_id, room_type, building, check_date } = await request.json();

    if (!day || !time_slot_id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Day and time slot are required'
      }, { status: 400 });
    }

    // Get all rooms
    let roomQuery = supabase
      .from('rooms')
      .select(`*, room_types (type_name)`)
      .eq('is_active', true);

    if (building) roomQuery = roomQuery.eq('building', building);

    const { data: rooms, error: roomError } = await roomQuery;
    if (roomError) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: roomError.message
      }, { status: 500 });
    }

    // Get schedules for this day and time slot
    const { data: schedules, error: scheduleError } = await supabase
      .from('schedules')
      .select(`*, rooms (id, room_name)`)
      .eq('day_of_week', day)
      .eq('time_slot_id', time_slot_id);

    if (scheduleError) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: scheduleError.message
      }, { status: 500 });
    }

    // Check exceptions for specific date (if provided)
    let cancelledScheduleIds: Set<number> = new Set();
    let noticeMap: Map<number, string> = new Map();

    if (check_date && schedules && schedules.length > 0) {
      const scheduleIds = schedules.map((s: any) => s.id);

      const { data: exceptions } = await supabase
        .from('schedule_exceptions')
        .select('*')
        .in('schedule_id', scheduleIds)
        .eq('exception_date', check_date);

      if (exceptions) {
        exceptions.forEach((ex: any) => {
          if (ex.exception_type === 'cancelled') {
            cancelledScheduleIds.add(ex.schedule_id);
          } else if (ex.exception_type === 'notice' && ex.notice_text) {
            noticeMap.set(ex.schedule_id, ex.notice_text);
          }
        });
      }
    }

    // Get room ownership
    const { data: ownerships } = await supabase
      .from('room_ownership')
      .select('*');

    // Filter by room_type (client-side since join filter is tricky)
    let filteredRooms = rooms || [];
    if (room_type) {
      filteredRooms = filteredRooms.filter(
        (r: any) => r.room_types?.type_name === room_type
      );
    }

    // Build availability
    const availability: RoomAvailability[] = filteredRooms.map((room: any) => {
      // Find schedule for this room
      const occupiedSchedule = schedules?.find(
        (s: any) => s.room_id === room.id
      );

      // If schedule exists but cancelled → room is FREE
      const isCancelled = occupiedSchedule
        ? cancelledScheduleIds.has(occupiedSchedule.id)
        : false;

      const notice = occupiedSchedule
        ? noticeMap.get(occupiedSchedule.id)
        : undefined;

      const roomOwners = (ownerships || [])
        .filter((o: any) => o.room_id === room.id)
        .map((o: any) => o.department);

      const isActuallyOccupied = occupiedSchedule && !isCancelled;

      return {
        room: {
          id: room.id,
          room_name: room.room_name,
          building: room.building,
          capacity: room.capacity,
          type_id: room.type_id,
          is_active: room.is_active
        },
        status: isActuallyOccupied ? 'occupied' : 'free',
        current_class: isActuallyOccupied ? {
          course_name: occupiedSchedule.course_name,
          teacher_name: occupiedSchedule.teacher_name,
          department: occupiedSchedule.department,
          ...(notice && { notice }),
        } : undefined,
        // If cancelled, show that info
        cancelled_class: isCancelled && occupiedSchedule ? {
          course_name: occupiedSchedule.course_name,
          department: occupiedSchedule.department,
          reason: schedules?.find((s: any) => s.id === occupiedSchedule.id)
            ? 'Class cancelled for today'
            : undefined,
        } : undefined,
        owned_by: roomOwners.length > 0 ? roomOwners : undefined,
        is_exclusive: roomOwners.length === 1
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