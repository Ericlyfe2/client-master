import NextAuth, { DefaultSession } from "next-auth";
import { ZodError } from "zod";
import Credentials from "next-auth/providers/credentials";
import { signInSchema } from "@/app/lib/zod";
import { verifyPassword } from "@/utils/password";
import { getUserByUsername } from "@/utils/db";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
  secret:
    process.env.NEXTAUTH_SECRET || "your-secret-key-here-change-in-production",
  providers: [
    Credentials({
      credentials: {
        username: {},
        email: {},
        password: {},
        licenseNumber: {},
        role: {},
      },
      authorize: async (credentials) => {
        try {
          // Check if credentials exist
          if (!credentials) {
            console.error("No credentials provided");
            return null;
          }

          // For development/testing, allow a simple login without database
          if (
            process.env.NODE_ENV === "development" &&
            credentials.username === "admin" &&
            credentials.password === "admin"
          ) {
            return {
              id: "dev-admin",
              username: "admin",
              email: "admin@example.com",
              role: "ADMIN",
              name: "Development Admin",
            };
          }

          const { username, email, password, licenseNumber, role } =
            credentials;

          // Handle different login types
          if (role === "PHARMACY") {
            // Pharmacist login with email, password, and license number
            if (!email || !password || !licenseNumber) {
              console.error(
                "Email, password, and license number required for pharmacist login"
              );
              return null;
            }

            const trimmedEmail = (email as string).trim();
            const trimmedPassword = (password as string).trim();
            const trimmedLicenseNumber = (licenseNumber as string).trim();

            // Validate inputs
            if (!trimmedEmail || !trimmedPassword || !trimmedLicenseNumber) {
              console.error("Email, password, or license number is empty");
              return null;
            }

            // Get user from database by email
            let dbUser;
            try {
              dbUser = await prisma.user.findFirst({
                where: { email: trimmedEmail },
              });
            } catch (error) {
              console.error("Database connection error:", error);
              return null;
            }

            if (!dbUser) {
              console.error("Pharmacist not found");
              return null;
            }

            // Verify the user is a pharmacist
            if (dbUser.role !== "PHARMACY") {
              console.error("User is not a pharmacist");
              return null;
            }

            // Check if user is verified
            if (dbUser.isVerified === false) {
              console.error("Pharmacist account not verified");
              return null;
            }

            // Verify password first
            const isValidPassword = await verifyPassword(
              trimmedPassword,
              dbUser.passwordHash!
            );

            if (!isValidPassword) {
              console.error("Invalid password");
              return null;
            }

            // Check if license number matches stored license OR verify new license
            if (dbUser.licenseNumber !== trimmedLicenseNumber) {
              // License doesn't match stored license, verify if it's a valid new license
              try {
                const verificationResponse = await fetch(
                  `${
                    process.env.NEXTAUTH_URL || "http://localhost:3000"
                  }/api/auth/verify-license`,
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
                  console.error("Invalid license number provided");
                  return null;
                }

                // Update user's license number in database
                await prisma.user.update({
                  where: { id: dbUser.id },
                  data: { licenseNumber: trimmedLicenseNumber },
                });

                console.log(
                  `Pharmacist ${trimmedEmail} updated license to ${trimmedLicenseNumber}`
                );
              } catch (error) {
                console.error("License verification failed:", error);
                return null;
              }
            }

            // Return pharmacist user object
            const user = {
              id: dbUser.id,
              username: dbUser.username,
              email: dbUser.email,
              role: dbUser.role,
              name: `${dbUser.firstName} ${dbUser.lastName}`,
            };

            console.log(`Pharmacist ${user.email} authenticated successfully`);
            return user;
          } else {
            // Regular login with username and password
            if (!username || !password) {
              console.error("Username and password required for regular login");
              return null;
            }

            // Validate input schema
            const { username: validatedUsername, password: validatedPassword } =
              await signInSchema.parseAsync(credentials);

            // Trim whitespace from inputs
            const trimmedUsername = validatedUsername.trim();
            const trimmedPassword = validatedPassword.trim();

            // Check for empty strings after trimming
            if (!trimmedUsername || !trimmedPassword) {
              console.error("Username or password is empty after trimming");
              return null;
            }

            // Check username length
            if (trimmedUsername.length < 3) {
              console.error("Username too short");
              return null;
            }

            if (trimmedUsername.length > 50) {
              console.error("Username too long");
              return null;
            }

            // Check password length
            if (trimmedPassword.length < 6) {
              console.error("Password too short");
              return null;
            }

            if (trimmedPassword.length > 128) {
              console.error("Password too long");
              return null;
            }

            // Check for SQL injection patterns (basic check)
            const sqlInjectionPatterns = [
              /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
              /(--|\/\*|\*\/|;|'|"|`)/,
              /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/i,
            ];

            for (const pattern of sqlInjectionPatterns) {
              if (
                pattern.test(trimmedUsername) ||
                pattern.test(trimmedPassword)
              ) {
                console.error("Potential SQL injection detected");
                return null;
              }
            }

            // Get user from database by username
            let dbUser;
            try {
              dbUser = await getUserByUsername(trimmedUsername);
            } catch (error) {
              console.error("Database connection error:", error);
              return null;
            }

            if (!dbUser) {
              console.error("User not found");
              return null;
            }

            // Check if user is verified (if required)
            if (dbUser.isVerified === false) {
              console.error("User account not verified");
              return null;
            }

            // Verify password
            const isValidPassword = await verifyPassword(
              trimmedPassword,
              dbUser.passwordHash!
            );

            if (!isValidPassword) {
              console.error("Invalid password");
              return null;
            }

            // Return user object without password hash
            const user = {
              id: dbUser.id,
              username: dbUser.username,
              email: dbUser.email,
              role: dbUser.role,
              name: dbUser.name,
            };

            // Validate returned user object
            if (!user.id || !user.username || !user.role) {
              console.error("Invalid user data returned");
              return null;
            }

            console.log(`User ${user.username} authenticated successfully`);
            return user;
          }
        } catch (error) {
          if (error instanceof ZodError) {
            console.error("Zod validation error:", error.message);
            return null;
          }

          if (error instanceof Error) {
            console.error("Authentication error:", error.message);
          } else {
            console.error("Unknown authentication error:", error);
          }

          return null;
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
