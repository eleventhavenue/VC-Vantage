// app/api/test-email/route.ts

import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const result = await sendEmail({
      to: email,
      subject: 'Test Email from VC Vantage',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email to verify your email sending configuration.</p>
        <p>If you received this, everything is working correctly!</p>
      `,
    });

    // Log the result for debugging
    console.log('Email send result:', result);

    if (!result.success) {
      return NextResponse.json(
        { message: 'Failed to send email', error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Email sent successfully',
      id: result.data?.id 
    });

  } catch (error) {
    console.error('Error in test email route:', error);
    return NextResponse.json(
      { message: 'Failed to process request', error: String(error) },
      { status: 500 }
    );
  }
}