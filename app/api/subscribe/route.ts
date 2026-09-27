import { NextResponse } from "next/server";

const BEEHIIV_BRIDGE = "https://stick-golf-club.bonganimoyo95.workers.dev";
const STICK_ORIGIN = "https://stickgolf.club";

type SubscriptionRequest = {
  email?: unknown;
  firstName?: unknown;
  pageUrl?: unknown;
  startedAt?: unknown;
  company?: unknown;
};

export async function POST(request: Request) {
  let body: SubscriptionRequest;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
  const company = typeof body.company === "string" ? body.company : "";
  const pageUrl = typeof body.pageUrl === "string" ? body.pageUrl : "";
  const startedAt = typeof body.startedAt === "number" ? body.startedAt : Date.now();

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  try {
    const response = await fetch(BEEHIIV_BRIDGE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: STICK_ORIGIN,
      },
      body: JSON.stringify({ email, firstName, pageUrl, startedAt, company }),
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("STICK newsletter bridge error:", error);
    return NextResponse.json({ error: "Subscription service unavailable." }, { status: 502 });
  }
}
