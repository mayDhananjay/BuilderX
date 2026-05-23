"use client"

import { cn } from "@/lib/utils"

interface GridBackgroundProps {
  className?: string
  children?: React.ReactNode
}

export function GridBackground({ className, children }: GridBackgroundProps) {
  return (
    <div
      className={cn(
        "relative w-full bg-background",
        className
      )}
    >
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"
        style={{
          maskImage: "radial-gradient(ellipse 80% 50% at 50% 0%, #000 70%, transparent 110%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 50% at 50% 0%, #000 70%, transparent 110%)",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export function DotBackground({ className, children }: GridBackgroundProps) {
  return (
    <div
      className={cn(
        "relative w-full bg-background",
        className
      )}
    >
      <div
        className="absolute inset-0 bg-[radial-gradient(#80808020_1px,transparent_1px)] bg-[size:16px_16px]"
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
