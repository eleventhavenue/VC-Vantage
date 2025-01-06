// app/api/auth/forgot-password/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { sendEmail } from '@/lib/email';
import { z } from 'zod';

// Validation schema for request body
const requestSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = requestSchema.parse(body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Generate reset token regardless of whether user exists (prevent email enumeration)
    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    if (user) {
      // Update user with reset token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiry,
        },
      });

      // Create reset URL
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

      // Email template
      const emailContent = `
        <h1>Password Reset Request</h1>
        <p>You requested to reset your password. Click the link below to reset it:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `;

      // Send email
      await sendEmail({
        to: email,
        subject: 'Password Reset Request',
        html: emailContent,
      });
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      message: 'If an account exists with this email, you will receive password reset instructions.',
    });
    
  } catch (error) {
    console.error('Password reset error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid email address' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}