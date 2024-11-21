// app/api/auth/register/route.ts

import { NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth';
import { createUser, getUserByEmail } from '@/lib/user';
import prisma from '@/lib/prisma'; // Ensure prisma is imported

// Define the expected structure of the request body
interface RegisterRequestBody {
  email: string;
  password: string;
}

// Define the structure of the API response
interface RegisterResponse {
  message: string;
  user?: {
    id: string;
    email: string;
  };
}

export async function POST(request: Request) {
  try {
    // Parse the JSON body
    const { email, password } = (await request.json()) as RegisterRequestBody;

    // **1. Input Validation**
    if (!email || !email.includes('@') || !password || password.length < 6) {
      const invalidInputResponse: RegisterResponse = { message: 'Invalid input.' };
      return NextResponse.json(invalidInputResponse, { status: 400 });
    }

    // **2. Check for Existing User**
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      const userExistsResponse: RegisterResponse = { message: 'User already exists.' };
      return NextResponse.json(userExistsResponse, { status: 409 });
    }

    // **3. Hash Password and Create User**
    const hashedPassword = await hashPassword(password);
    const user = await createUser(email, hashedPassword);

    // **4. Create Account Record for CredentialsProvider**
    await prisma.account.create({
      data: {
        userId: user.id,
        type: 'credentials',
        provider: 'credentials',
        providerAccountId: email, // Using email as providerAccountId
      },
    });

    const successResponse: RegisterResponse = {
      message: 'User created successfully.',
      user: { id: user.id, email: user.email },
    };
    return NextResponse.json(successResponse, { status: 201 });
  } catch (err: unknown) { // Changed from 'any' to 'unknown'
    // **4. Handle Unexpected Errors**
    console.error('Registration Error:', err);
    const errorResponse: RegisterResponse = { message: 'An unexpected error occurred.' };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
