import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { ApiResponse } from '@/types';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'All fields are required'
      }, { status: 400 });
    }

    // Save to database
    const { data, error } = await supabase
      .from('feedback')
      .insert([{ name, email, subject, message }])
      .select();

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    // Send email notification to admin
    if (process.env.RESEND_API_KEY && process.env.ADMIN_EMAIL) {
      try {
        await resend.emails.send({
          from: 'PCIU Room System <onboarding@resend.dev>',
          to: [process.env.ADMIN_EMAIL],
          subject: `📬 New Contact: ${subject}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0;">📬 New Contact Message</h1>
              </div>
              
              <div style="padding: 30px; background: #f9fafb;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                      <strong>From:</strong>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                      ${name}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                      <strong>Email:</strong>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                      <a href="mailto:${email}">${email}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                      <strong>Subject:</strong>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                      ${subject}
                    </td>
                  </tr>
                </table>
                
                <div style="margin-top: 20px; padding: 20px; background: white; border-radius: 8px; border: 1px solid #e5e7eb;">
                  <strong>Message:</strong>
                  <p style="margin-top: 10px; line-height: 1.6; color: #374151;">
                    ${message.replace(/\n/g, '<br>')}
                  </p>
                </div>
                
                <div style="margin-top: 30px; text-align: center;">
                  <a href="mailto:${email}?subject=Re: ${subject}" 
                     style="display: inline-block; padding: 12px 24px; background: #1e40af; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    Reply to ${name}
                  </a>
                </div>
              </div>
              
              <div style="padding: 20px; background: #1f2937; text-align: center;">
                <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                  PCIU Room Management System
                </p>
              </div>
            </div>
          `,
        });
        console.log('✅ Email notification sent');
      } catch (emailError) {
        console.error('❌ Failed to send email:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data,
      message: 'Feedback submitted successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Feedback error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}