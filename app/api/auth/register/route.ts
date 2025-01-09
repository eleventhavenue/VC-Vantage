// app/api/auth/register/route.ts

import { NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth';
import { getUserByEmail } from '@/lib/user';
import prisma from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { sendEmail } from '@/lib/email';

interface RegisterRequestBody {
  email: string;
  password: string;
}


export async function POST(request: Request) {
  try {
    const { email, password } = (await request.json()) as RegisterRequestBody;

    // Input Validation
    if (!email || !email.includes('@') || !password || password.length < 6) {
      return NextResponse.json(
        { message: 'Invalid input.' },
        { status: 400 }
      );
    }

    // Check for Existing User
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists.' },
        { status: 409 }
      );
    }

    // Generate verification token
    const verificationToken = randomBytes(32).toString('hex');

    // Hash Password and Create User
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        verificationToken,
      },
    });

    // Generate verification URL
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${verificationToken}`;

    // Send verification email
    await sendEmail({
      to: email,
      subject: 'Verify your VC Vantage account',
      html: `
        <h1>Welcome to VC Vantage!</h1>
        <p>Thank you for registering. Please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
        <p>If you didn't create an account with us, you can safely ignore this email.</p>
        <p>This link will expire in 24 hours.</p>
      `,
    });

    // Create Account Record
    await prisma.account.create({
      data: {
        userId: user.id,
        type: 'credentials',
        provider: 'credentials',
        providerAccountId: email,
      },
    });

    return NextResponse.json({
      message: 'Registration successful. Please check your email to verify your account.',
      user: { id: user.id, email: user.email },
    }, { status: 201 });

  } catch (err: unknown) {
    console.error('Registration Error:', err);
    return NextResponse.json(
      { message: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}