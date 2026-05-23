"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useRef, ElementType, ComponentPropsWithoutRef } from "react"

type MovingBorderProps<T extends ElementType = "button"> = {
  as?: T
  borderRadius?: string
  children: React.ReactNode
  containerClassName?: string
  borderClassName?: string
  duration?: number
  className?: string
} & ComponentPropsWithoutRef<T>

export function MovingBorder<T extends ElementType = "button">({
  as,
  borderRadius = "1.75rem",
  children,
  containerClassName,
  borderClassName,
  duration = 2000,
  className,
  ...otherProps
}: MovingBorderProps<T>) {
  const Component = as || "button"
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <Component
      className={cn(
        "relative p-[1px] overflow-hidden bg-transparent",
        containerClassName
      )}
      style={{ borderRadius }}
      {...otherProps}
    >
      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{ borderRadius }}
      >
        <motion.div
          className={cn(
            "absolute inset-[-100%] bg-[conic-gradient(from_90deg_at_50%_50%,#fff_0%,#000_50%,#fff_100%)]",
            borderClassName
          )}
          animate={{ rotate: 360 }}
          transition={{
            duration: duration / 1000,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
      <div
        className={cn(
          "relative flex items-center justify-center bg-background text-foreground",
          className
        )}
        style={{ borderRadius: `calc(${borderRadius} - 2px)` }}
      >
        {children}
      </div>
    </Component>
  )
}
