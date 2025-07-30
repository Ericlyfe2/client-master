import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { StaffService } from "@/services/staffService";

// Helper function to get user ID from session
async function getUserIdFromSession(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id || null;
}

// GET endpoint to retrieve staff availability for a specific date
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromSession();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        { error: "Date is required" },
        { status: 400 }
      );
    }

    const availability = await StaffService.getStaffAvailability(new Date(date));

    return NextResponse.json(availability);
  } catch (error) {
    console.error("Error fetching staff availability:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST endpoint to generate shifts from schedules for a date range
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromSession();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { startDate, endDate } = body;

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Start date and end date are required" },
        { status: 400 }
      );
    }

    const shifts = await StaffService.generateShiftsFromSchedules(
      new Date(startDate),
      new Date(endDate)
    );

    return NextResponse.json({
      message: "Shifts generated successfully",
      count: shifts.length,
      shifts,
    });
  } catch (error) {
    console.error("Error generating shifts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 