import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/lib/prisma-client";
import { auth } from "@/app/auth";

const prisma = new PrismaClient();

// GET - Fetch specific consultation
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const consultation = await prisma.consultation.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        assignedPharmacist: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        messages: {
          orderBy: { createdAt: "asc" },
        },
        prescriptions: {
          include: {
            medication: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!consultation) {
      return NextResponse.json(
        { error: "Consultation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ consultation });
  } catch (error) {
    console.error("Error fetching consultation:", error);
    return NextResponse.json(
      { error: "Failed to fetch consultation" },
      { status: 500 }
    );
  }
}

// PUT - Update consultation (assign pharmacist, update status, etc.)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      status,
      assignedPharmacistId,
      description,
      symptoms,
      medications,
      allergies,
    } = body;

    // Check if consultation exists
    const existingConsultation = await prisma.consultation.findUnique({
      where: { id: params.id },
    });

    if (!existingConsultation) {
      return NextResponse.json(
        { error: "Consultation not found" },
        { status: 404 }
      );
    }

    // Update consultation
    const updatedConsultation = await prisma.consultation.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(assignedPharmacistId && { assignedPharmacistId }),
        ...(description && { description }),
        ...(symptoms && { symptoms }),
        ...(medications && { medications }),
        ...(allergies && { allergies }),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        assignedPharmacist: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        messages: {
          orderBy: { createdAt: "asc" },
        },
        prescriptions: {
          include: {
            medication: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return NextResponse.json({
      consultation: updatedConsultation,
      message: "Consultation updated successfully",
    });
  } catch (error) {
    console.error("Error updating consultation:", error);
    return NextResponse.json(
      { error: "Failed to update consultation" },
      { status: 500 }
    );
  }
}

// DELETE - Delete consultation (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.consultation.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: "Consultation deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting consultation:", error);
    return NextResponse.json(
      { error: "Failed to delete consultation" },
      { status: 500 }
    );
  }
}
