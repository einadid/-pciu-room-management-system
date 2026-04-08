import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { verifyToken, extractTokenFromHeader, isAdmin } from '@/lib/auth';
import { ApiResponse } from '@/types';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !isAdmin(payload)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Admin access required'
      }, { status: 403 });
    }

    // Prevent deleting yourself
    if (userId === payload.userId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Cannot delete your own account'
      }, { status: 400 });
    }

    // Delete user
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'User deleted successfully'
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}