// app/api/signup/route.ts

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Define a schema for validation using Zod
const signUpSchema = z.object({
  email: z.string().email(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = signUpSchema.parse(body)

    // Check if the email already exists
    const existingSubscriber = await prisma.subscriber.findUnique({
      where: { email },
    })

    if (existingSubscriber) {
      return NextResponse.json(
        { message: 'Email already subscribed.' },
        { status: 400 }
      )
    }

    // Create a new subscriber
    await prisma.subscriber.create({
      data: { email },
    })

    return NextResponse.json(
      { message: 'Successfully subscribed!' },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid email address.' },
        { status: 422 }
      )
    }
    console.error('Error subscribing user:', error)
    return NextResponse.json(
      { message: 'Internal Server Error.' },
      { status: 500 }
    )
  }
}
