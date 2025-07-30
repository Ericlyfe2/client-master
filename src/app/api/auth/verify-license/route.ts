import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/lib/prisma-client";

const prisma = new PrismaClient();

// Simplified license verification function that accepts any license
async function verifyPharmacistLicense(
  licenseNumber: string,
  state?: string
): Promise<{
  isValid: boolean;
  details?: {
    name?: string;
    state?: string;
    expirationDate?: string;
    status?: string;
  };
  error?: string;
}> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Always return valid for any license number
  return {
    isValid: true,
    details: {
      name: `Dr. ${licenseNumber}`, // Use license number as name for demo
      state: state || "CA",
      expirationDate: "2025-12-31",
      status: "ACTIVE",
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { licenseNumber, email, state, isSignIn = false } = body;

    // Validate required fields
    if (!licenseNumber) {
      return NextResponse.json(
        { error: "License number is required" },
        { status: 400 }
      );
    }

    // For sign-in verification, we don't check for existing registration
    // since the user might be using a new license
    if (!isSignIn) {
      // Check if license is already registered to another user (only for signup)
      if (email) {
        const existingUser = await prisma.user.findFirst({
          where: {
            licenseNumber: licenseNumber,
            email: { not: email }, // Exclude current user if updating
          },
        });

        if (existingUser) {
          return NextResponse.json(
            {
              error:
                "This license number is already registered to another account",
            },
            { status: 409 }
          );
        }
      } else {
        // For new registrations, check if license is already used
        const existingUser = await prisma.user.findFirst({
          where: { licenseNumber: licenseNumber },
        });

        if (existingUser) {
          return NextResponse.json(
            { error: "This license number is already registered" },
            { status: 409 }
          );
        }
      }
    }

    // Verify license with external service (now accepts any license)
    const verificationResult = await verifyPharmacistLicense(
      licenseNumber,
      state
    );

    return NextResponse.json({
      isValid: true,
      message: "License verified successfully",
      details: verificationResult.details,
    });
  } catch (error) {
    console.error("License verification error:", error);
    return NextResponse.json(
      { error: "Unable to verify license. Please try again later." },
      { status: 500 }
    );
  }
}

// GET method for real-time license validation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const licenseNumber = searchParams.get("licenseNumber");
    const email = searchParams.get("email");

    if (!licenseNumber) {
      return NextResponse.json(
        { error: "License number parameter is required" },
        { status: 400 }
      );
    }

    // Check if license is already registered
    const existingUser = await prisma.user.findFirst({
      where: {
        licenseNumber: licenseNumber,
        ...(email && { email: { not: email } }),
      },
    });

    if (existingUser) {
      return NextResponse.json({
        isValid: false,
        error: "License number already registered",
      });
    }

    // Always return valid for any license number
    return NextResponse.json({
      isValid: true,
      available: true,
    });
  } catch (error) {
    console.error("License check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
