// app/api/fetchLinkedInProfile/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Instead of new URL(req.url):
  // We can directly use req.nextUrl, which is already a URL object
  const { searchParams } = req.nextUrl;

  const linkedinProfileUrl = searchParams.get('linkedinProfileUrl');
  if (!linkedinProfileUrl) {
    return NextResponse.json(
      { error: 'Missing linkedinProfileUrl query param' },
      { status: 400 }
    );
  }

  try {
    // your existing Proxycurl fetch code:
    const apiKey = process.env.PROXYCURL_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Server missing PROXYCURL_API_KEY' },
        { status: 500 }
      );
    }

    const proxycurlUrl = new URL('https://nubela.co/proxycurl/api/v2/linkedin');
    proxycurlUrl.searchParams.set('linkedin_profile_url', linkedinProfileUrl);
    proxycurlUrl.searchParams.set('use_cache', 'if-present');
    proxycurlUrl.searchParams.set('fallback_to_cache', 'on-error');

    const resp = await fetch(proxycurlUrl.toString(), {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      return NextResponse.json(
        { error: 'Proxycurl Error', details: errorText },
        { status: resp.status }
      );
    }

    const data = await resp.json();
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('Error in Proxycurl route:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
