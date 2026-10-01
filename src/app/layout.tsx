import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vision Public School — School Management System",
  description:
    "Professional school management portal: report cards, ID cards, attendance, fees — role-based access for Super Admin, Admin and Students.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 font-sans text-slate-900">
        {children}
      </body>
    </html>
  );
}
