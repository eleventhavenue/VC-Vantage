//app/api/fetchLinkedInProfile/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // 1) Read the linkedinProfileUrl from query params
  const { searchParams } = new URL(req.url);
  const linkedinProfileUrl = searchParams.get("linkedinProfileUrl");

  if (!linkedinProfileUrl) {
    return NextResponse.json(
      { error: "Missing linkedinProfileUrl query param" },
      { status: 400 }
    );
  }

  try {
    // 2) Make a request to Proxycurl
    const apiKey = process.env.PROXYCURL_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server missing PROXYCURL_API_KEY" },
        { status: 500 }
      );
    }

    const proxycurlUrl = new URL("https://nubela.co/proxycurl/api/v2/linkedin");
    proxycurlUrl.searchParams.set("linkedin_profile_url", linkedinProfileUrl);
    // Optionally add extra parameters:
    // e.g., proxycurlUrl.searchParams.set("extra", "include");
    proxycurlUrl.searchParams.set("use_cache", "if-present");
    proxycurlUrl.searchParams.set("fallback_to_cache", "on-error");

    const resp = await fetch(proxycurlUrl.toString(), {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      return NextResponse.json(
        { error: "Proxycurl Error", details: errorText },
        { status: resp.status }
      );
    }

    // 3) Proxycurl returns JSON with the person's data
    const data = await resp.json();

    // 4) Return that data to the client
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error in Proxycurl route:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
