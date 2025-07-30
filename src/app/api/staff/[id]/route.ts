import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/auth";
import {
  StaffService,
  UpdateStaffData,
} from "@/services/staffService";

// Helper function to get user ID from session
async function getUserIdFromSession(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id || null;
}

// GET endpoint to retrieve a specific staff member
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserIdFromSession();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const staff = await StaffService.getStaffById(params.id);

    return NextResponse.json(staff);
  } catch (error) {
    console.error("Error fetching staff member:", error);
    if (error instanceof Error && error.message === "Staff member not found") {
      return NextResponse.json(
        { error: "Staff member not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT endpoint to update a staff member
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserIdFromSession();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: UpdateStaffData = await request.json();

    const staff = await StaffService.updateStaff(params.id, body);

    return NextResponse.json(staff);
  } catch (error) {
    console.error("Error updating staff member:", error);
    if (error instanceof Error && error.message === "Staff member not found") {
      return NextResponse.json(
        { error: "Staff member not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE endpoint to deactivate a staff member
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserIdFromSession();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await StaffService.deactivateStaff(params.id);

    return NextResponse.json({ message: "Staff member deactivated successfully" });
  } catch (error) {
    console.error("Error deactivating staff member:", error);
    if (error instanceof Error && error.message === "Staff member not found") {
      return NextResponse.json(
        { error: "Staff member not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 