import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { verifyToken, extractTokenFromHeader, isAdmin } from '@/lib/auth';
import { ApiResponse } from '@/types';

// Update feedback status
export async function PATCH(
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
    if (!payload || !isAdmin(payload)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Admin access required'
      }, { status: 403 });
    }

    const { status } = await request.json();
    const feedbackId = parseInt(id);

    const { data, error } = await supabase
      .from('feedback')
      .update({ status })
      .eq('id', feedbackId)
      .select();

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: data[0]
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// Delete feedback
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
    if (!payload || !isAdmin(payload)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Admin access required'
      }, { status: 403 });
    }

    const feedbackId = parseInt(id);

    const { error } = await supabase
      .from('feedback')
      .delete()
      .eq('id', feedbackId);

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Feedback deleted successfully'
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}