import { NextResponse } from "next/server";

export async function GET() {
  // In production these would come from the database. Return empty for now
  // — real notifications fire when orders ship, consultations update, etc.
  return NextResponse.json({ notifications: [] });
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    // In production this would update the database.
    console.log("Mark notifications read:", body);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
