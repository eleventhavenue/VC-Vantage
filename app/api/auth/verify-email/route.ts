// app/api/auth/verify-email/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { randomBytes } from 'crypto';
import { sendEmail } from '@/lib/email';

// Validation schema for request body
const verificationSchema = z.object({
  token: z.string().optional(),
  email: z.string().email().optional(),
});

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        { message: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Find user with this verification token
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        emailVerified: null,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Update user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
      },
    });

    // Redirect to success page
    return NextResponse.redirect(
      new URL('/auth/verification-success', req.url)
    );
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { message: 'An error occurred during email verification' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = verificationSchema.parse(body);

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { message: 'Email is already verified' },
        { status: 400 }
      );
    }

    // Generate verification token
    const verificationToken = randomBytes(32).toString('hex');
    
    // Update user with verification token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
      },
    });

    // Create verification URL
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${verificationToken}`;

    // Send verification email
    await sendEmail({
      to: email,
      subject: 'Verify your email address',
      html: `
        <h1>Welcome to VC Vantage!</h1>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
        <p>If you didn't create an account with us, you can safely ignore this email.</p>
      `,
    });

    return NextResponse.json({
      message: 'Verification email sent successfully',
    });
  } catch (error) {
    console.error('Send verification email error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: 'An error occurred while sending verification email' },
      { status: 500 }
    );
  }
}