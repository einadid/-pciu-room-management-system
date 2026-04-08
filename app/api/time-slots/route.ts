import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { ApiResponse, TimeSlot } from '@/types';

export async function GET() {
  try {
    const { data: slots, error } = await supabase
      .from('time_slots')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    return NextResponse.json<ApiResponse<TimeSlot[]>>({
      success: true,
      data: slots as TimeSlot[]
    }, { status: 200 });

  } catch (error) {
    console.error('Get time slots error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}