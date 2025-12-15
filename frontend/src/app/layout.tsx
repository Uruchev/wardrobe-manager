import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fashion Advisor",
  description: "AI Personal Stylist - Web версия",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bg">
      <body>{children}</body>
    </html>
  );
}
