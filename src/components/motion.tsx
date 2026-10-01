import { cn } from "@/lib/utils";

/**
 * Server-safe motion primitives (pure CSS animations, zero JS).
 * delay prop se staggered entrances banti hain — koi client component nahi chahiye!
 */

interface RevealProps {
  children: React.ReactNode;
  delay?: number; // ms
  className?: string;
}

export function Reveal({ children, delay = 0, className }: RevealProps) {
  return (
    <div className={cn("animate-fade-up", className)} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export function ScaleIn({ children, delay = 0, className }: RevealProps) {
  return (
    <div className={cn("animate-scale-in", className)} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}
