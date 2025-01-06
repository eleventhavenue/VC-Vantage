// app/api/auth/reset-password/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { validatePassword, checkRateLimit } from '@/lib/password-utils';

// Enhanced schema with password validation
const resetSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .refine((password) => {
      const validation = validatePassword(password);
      return validation.isStrong;
    }, {
      message: "Password does not meet strength requirements"
    }),
});

export async function PUT(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    
    // Rate limiting
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { message: 'Too many attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { token, password } = resetSchema.parse(body);

    // Find user by reset token and ensure it hasn't expired
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Check if password matches any of the last 3 passwords
    if (user.previousPasswords) {
      const previousPasswords = JSON.parse(user.previousPasswords);
      for (const oldPassword of previousPasswords) {
        const matches = await bcrypt.compare(password, oldPassword);
        if (matches) {
          return NextResponse.json(
            { message: 'Please choose a password you haven\'t used recently' },
            { status: 400 }
          );
        }
      }
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Store the current password in previous passwords
    const previousPasswords = user.previousPasswords 
      ? JSON.parse(user.previousPasswords)
      : [];
    
    if (user.password) {
      previousPasswords.unshift(user.password);
    }
    
    // Keep only last 3 passwords
    while (previousPasswords.length > 3) {
      previousPasswords.pop();
    }

    // Update user's password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        previousPasswords: JSON.stringify(previousPasswords),
        resetToken: null,
        resetTokenExpiry: null,
        lastPasswordChange: new Date(),
      },
    });

    return NextResponse.json({
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    console.error('Password reset error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'An error occurred while resetting your password' },
      { status: 500 }
    );
  }
}