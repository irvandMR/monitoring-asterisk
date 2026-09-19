import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login — Asterisk Manager",
  description: "Internal authentication for Asterisk Manager",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
