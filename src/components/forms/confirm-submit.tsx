"use client";

import { cn } from "@/lib/utils";

/** Submit button jo pehle browser confirm dikhata hai (destructive actions ke liye) */
export function ConfirmSubmit({
  message,
  children,
  className,
}: {
  message: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="submit"
      className={cn("cursor-pointer", className)}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
