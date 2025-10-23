import NextAuth, { DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verifyPassword } from "@/utils/password";
import { getUserByUsername } from "@/utils/db";
import { prisma } from "@/lib/prisma";

// Extend the built-in session types
declare module "next-auth" {
  interface User {
    id: string;
    username: string;
    role: string;
    name?: string;
  }

  interface Session {
    user: {
      id: string;
      username: string;
      role: string;
      name?: string;
    } & DefaultSession["user"];
  }
}

export const { handlers, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-here-change-in-production",
  debug: process.env.NODE_ENV === "development",
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: {},
        email: {},
        password: {},
        licenseNumber: {},
        role: {},
      },
      authorize: async (credentials) => {
        console.log("🔐 NextAuth authorize called with credentials:", {
          role: credentials?.role,
          username: credentials?.username,
          email: credentials?.email,
          hasPassword: !!credentials?.password,
          hasLicense: !!credentials?.licenseNumber
        });

        // Check if credentials exist
        if (!credentials) {
          console.error("❌ No credentials provided");
          throw new Error("No credentials provided");
        }

        const { username, email, password, licenseNumber, role } = credentials;

        // For development/testing, allow a simple login without database
        if (
          process.env.NODE_ENV === "development" &&
          credentials.username === "admin" &&
          credentials.password === "admin"
        ) {
          console.log("✅ Development admin login successful");
          return {
            id: "dev-admin",
            username: "admin",
            email: "admin@example.com",
            role: "ADMIN",
            name: "Development Admin",
          };
        }

        // Handle different login types
        if (role === "PHARMACY") {
          console.log("💊 Processing pharmacist login");
          
          // Pharmacist login with email, password, and license number
          if (!email || !password || !licenseNumber) {
            const errorMsg = "Email, password, and license number required for pharmacist login";
            console.error("❌", errorMsg);
            throw new Error(errorMsg);
          }

          const trimmedEmail = (email as string).trim();
          const trimmedPassword = (password as string).trim();
          const trimmedLicenseNumber = (licenseNumber as string).trim();

          // Validate inputs
          if (!trimmedEmail || !trimmedPassword || !trimmedLicenseNumber) {
            throw new Error("Email, password, or license number is empty");
          }

          // Get user from database by email
          let dbUser;
          try {
            dbUser = await prisma.user.findFirst({
              where: { email: trimmedEmail },
            });
            console.log("🔍 Database query result:", dbUser ? "User found" : "User not found");
          } catch (error) {
            console.error("❌ Database connection error:", error);
            throw new Error("Database connection error");
          }

          if (!dbUser) {
            console.error("❌ Pharmacist not found for email:", trimmedEmail);
            throw new Error("Pharmacist not found");
          }

          // Verify the user is a pharmacist
          if (dbUser.role !== "PHARMACY") {
            console.error("❌ User is not a pharmacist, role:", dbUser.role);
            throw new Error("User is not a pharmacist");
          }

          // Check if user is verified
          if (dbUser.isVerified === false) {
            console.error("❌ Pharmacist account not verified");
            throw new Error("Pharmacist account not verified");
          }

          // Verify password
          console.log("🔑 Verifying password for pharmacist:", dbUser.email);
          const isValidPassword = await verifyPassword(
            trimmedPassword,
            dbUser.passwordHash!
          );

          if (!isValidPassword) {
            console.error("❌ Invalid password for pharmacist:", dbUser.email);
            throw new Error("Invalid password");
          }
          console.log("✅ Password verification successful for pharmacist:", dbUser.email);

          // Check if license number matches stored license OR verify new license
          if (dbUser.licenseNumber !== trimmedLicenseNumber) {
            console.log("🔍 License number doesn't match, verifying new license");
            try {
              const verificationResponse = await fetch(
                `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/auth/verify-license`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    licenseNumber: trimmedLicenseNumber,
                    email: trimmedEmail,
                    isSignIn: true,
                  }),
                }
              );

              const verificationData = await verificationResponse.json();

              if (!verificationData.isValid) {
                console.error("❌ Invalid license number provided:", trimmedLicenseNumber);
                throw new Error("Invalid license number provided");
              }

              // Update user's license number in database
              await prisma.user.update({
                where: { id: dbUser.id },
                data: { licenseNumber: trimmedLicenseNumber },
              });

              console.log(`✅ Pharmacist ${trimmedEmail} updated license to ${trimmedLicenseNumber}`);
            } catch (error) {
              console.error("❌ License verification failed:", error);
              throw new Error("License verification failed");
            }
          }

          // Return pharmacist user object
          const user = {
            id: dbUser.id,
            username: dbUser.username,
            email: dbUser.email,
            role: dbUser.role,
            name: `${(dbUser as any).firstName} ${(dbUser as any).lastName}`,
          };

          console.log(`✅ Pharmacist ${user.email} authenticated successfully`);
          return user;
        } else {
          console.log("👤 Processing regular user login (CLIENT/ADMIN)");
          
          // Regular login with username and password (CLIENT or ADMIN)
          if (!username || !password) {
            console.error("❌ Username and password required for regular login");
            throw new Error("Username and password required for regular login");
          }

          // Trim whitespace from inputs
          const trimmedUsername = (username as string).trim();
          const trimmedPassword = (password as string).trim();

          // Check for empty strings after trimming
          if (!trimmedUsername || !trimmedPassword) {
            throw new Error("Username or password is empty");
          }

          // Basic validation
          if (trimmedUsername.length < 3) {
            throw new Error("Username too short");
          }

          if (trimmedUsername.length > 50) {
            throw new Error("Username too long");
          }

          if (trimmedPassword.length < 6) {
            throw new Error("Password too short");
          }

          if (trimmedPassword.length > 128) {
            throw new Error("Password too long");
          }

          // Get user from database by username
          let dbUser;
          try {
            dbUser = await getUserByUsername(trimmedUsername);
            console.log("🔍 Database query result:", dbUser ? "User found" : "User not found");
          } catch (error) {
            console.error("❌ Database connection error:", error);
            throw new Error("Database connection error");
          }

          if (!dbUser) {
            console.error("❌ User not found for username:", trimmedUsername);
            throw new Error("Invalid username or password");
          }

          // Check if user is verified (if required)
          if (dbUser.isVerified === false) {
            console.error("❌ Account not verified for user:", trimmedUsername);
            throw new Error("Account not verified");
          }

          // Verify password
          console.log("🔑 Verifying password for user:", dbUser.username);
          const isValidPassword = await verifyPassword(
            trimmedPassword,
            dbUser.passwordHash!
          );

          if (!isValidPassword) {
            console.error("❌ Invalid password for user:", dbUser.username);
            throw new Error("Invalid username or password");
          }
          
          console.log("✅ Password verification successful for user:", dbUser.username);

          // Return user object without password hash
          const user = {
            id: dbUser.id,
            username: dbUser.username,
            email: dbUser.email,
            role: dbUser.role,
            name: dbUser.name || `${(dbUser as any).firstName} ${(dbUser as any).lastName}`,
          };

          // Validate returned user object
          if (!user.id || !user.username || !user.role) {
            console.error("❌ Invalid user data returned:", user);
            throw new Error("Invalid user data");
          }

          console.log(`✅ User ${user.username} authenticated successfully`);
          return user;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth",
    error: "/auth",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});