// app/api/login/route.ts

import { NextResponse } from 'next/server'
import { serialize } from 'cookie'

export async function POST(req: Request) {
  const { password } = await req.json()
  const sitePassword = process.env.SITE_PASSWORD

  if (!sitePassword) {
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 })
  }

  if (password === sitePassword) {
    // Set a cookie indicating authenticated
    const token = 'authenticated' // For simplicity, using a static token.

    const cookie = serialize('auth', token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 1 day
    })

    return NextResponse.json({ success: true }, { headers: { 'Set-Cookie': cookie } })
  } else {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }
}
