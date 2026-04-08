import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

export async function GET() {
  return NextResponse.json<ApiResponse>({
    success: true,
    message: 'Admin API is working'
  }, { status: 200 });
}