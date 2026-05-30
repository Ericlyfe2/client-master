import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/Auth/SessionProvider";
import { ThemeProvider } from "@/context/ThemeContext";
import NavButtons from "@/components/Common/NavButtons";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SafeMeds - Healthcare Management Platform",
  icons: {
    icon: "/favicon.ico",
  },
  description:
    "Secure healthcare management platform with role-based access for clients and pharmacies",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.className} antialiased`}>
        <ThemeProvider>
          <SessionProvider>
            <NavButtons />
            {children}
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
