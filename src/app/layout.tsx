import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vision Public School — School Management System",
  description:
    "Professional school management portal: report cards, ID cards, attendance, fees — role-based access for Super Admin, Admin and Students.",
};

/** Theme boot — first paint se pehle saved theme lagao (flash nahi aayega) */
const themeScript = `
(function () {
  try {
    var t = localStorage.getItem("vps-theme");
    if (t === "dark") document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col bg-paper font-sans text-slate-900 dark:text-slate-200">
        {children}
      </body>
    </html>
  );
}
