import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { UserRole } from "@prisma/client";

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "CLIENT" | "PHARMACY";
  organization?: string;
  pharmacyName?: string;
  licenseNumber?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organization?: string;
  pharmacyName?: string;
  licenseNumber?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Password validation helper
function isValidPassword(password: string): boolean {
  // At least 8 characters, one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

// Email validation helper
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Sign up with email and password
export const signUp = async (data: SignUpData): Promise<UserProfile> => {
  try {
    const { email, password, ...profileData } = data;

    // Validate email format
    if (!isValidEmail(email)) {
      throw new Error("Please provide a valid email address");
    }

    // Validate password strength
    if (!isValidPassword(password)) {
      throw new Error(
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number"
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new Error("An account with this email already exists");
    }

    // Validate required fields based on role
    if (data.role === "CLIENT") {
      if (!data.organization?.trim()) {
        throw new Error("Organization name is required for client accounts");
      }
    } else if (data.role === "PHARMACY") {
      if (
        !data.pharmacyName?.trim() ||
        !data.licenseNumber?.trim() ||
        !data.address?.trim() ||
        !data.city?.trim() ||
        !data.state?.trim() ||
        !data.zipCode?.trim()
      ) {
        throw new Error(
          "All pharmacy information (name, license number, address, city, state, zip code) is required"
        );
      }

      // Validate license number format (basic validation)
      if (data.licenseNumber && data.licenseNumber.length < 5) {
        throw new Error("Please provide a valid license number");
      }
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName: profileData.firstName.trim(),
        lastName: profileData.lastName.trim(),
        role: profileData.role,
        organization: profileData.organization?.trim(),
        pharmacyName: profileData.pharmacyName?.trim(),
        licenseNumber: profileData.licenseNumber?.trim(),
        phone: profileData.phone?.trim(),
        address: profileData.address?.trim(),
        city: profileData.city?.trim(),
        state: profileData.state?.trim(),
        zipCode: profileData.zipCode?.trim(),
        isVerified: false, // Should require email verification
      },
    });

    // Return user profile without password
    const { password: _, ...userProfile } = user;
    return userProfile;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to create account");
  }
};

// Sign in with email and password
export const signIn = async (data: SignInData): Promise<UserProfile> => {
  try {
    const { email, password } = data;

    // Validate email format
    if (!isValidEmail(email)) {
      throw new Error("Please provide a valid email address");
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new Error("No account found with this email");
    }

    // Check if user is verified (optional - you might want to allow unverified users to sign in)
    if (!user.isVerified) {
      throw new Error("Please verify your email address before signing in");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Incorrect password");
    }

    // Return user profile without password
    const { password: _, ...userProfile } = user;
    return userProfile;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to sign in");
  }
};

// Get user profile by ID
export const getUserProfile = async (
  userId: string
): Promise<UserProfile | null> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }

    // Return user profile without password
    const { password: _, ...userProfile } = user;
    return userProfile;
  } catch (error: unknown) {
    console.error("Error getting user profile:", error);
    return null;
  }
};

// Get user profile by email
export const getUserProfileByEmail = async (
  email: string
): Promise<UserProfile | null> => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return null;
    }

    // Return user profile without password
    const { password: _, ...userProfile } = user;
    return userProfile;
  } catch (error: unknown) {
    console.error("Error getting user profile by email:", error);
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (
  userId: string,
  updates: Partial<
    Omit<UserProfile, "id" | "email" | "createdAt" | "updatedAt">
  >
): Promise<UserProfile> => {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: updates,
    });

    // Return user profile without password
    const { password: _, ...userProfile } = user;
    return userProfile;
  } catch (error: unknown) {
    throw new Error("Failed to update user profile");
  }
};

// Change password
export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  try {
    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      throw new Error("Current password is incorrect");
    }

    // Validate new password
    if (!isValidPassword(newPassword)) {
      throw new Error(
        "New password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number"
      );
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to change password");
  }
};

// Verify email
export const verifyEmail = async (userId: string): Promise<void> => {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isVerified: true },
    });
  } catch (error: unknown) {
    throw new Error("Failed to verify email");
  }
};

// Delete user account
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    await prisma.user.delete({
      where: { id: userId },
    });
  } catch (error: unknown) {
    throw new Error("Failed to delete user account");
  }
};

// Get all users (for admin purposes)
export const getAllUsers = async (): Promise<UserProfile[]> => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Return user profiles without passwords
    return users.map(({ password: _, ...user }) => user);
  } catch (error: unknown) {
    throw new Error("Failed to get users");
  }
};
