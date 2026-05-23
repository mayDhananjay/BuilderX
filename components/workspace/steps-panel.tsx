"use client"

import { Check, Circle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useWorkspaceStore } from "@/lib/store"

export function StepsPanel() {
  const { steps, currentStep, isGenerating } = useWorkspaceStore()

  return (
    <div className="flex flex-col gap-1 p-4">
      <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Progress
      </h3>
      {steps.map((step, index) => {
        const isActive = step.id === currentStep
        const isCompleted = step.status === "completed"
        const isPending = step.status === "pending"
        const isCurrentlyGenerating = isActive && isGenerating

        return (
          <div
            key={step.id}
            className={cn(
              "flex items-start gap-3 rounded-lg p-3 transition-colors",
              isActive && "bg-accent"
            )}
          >
            <div
              className={cn(
                "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                isCompleted && "border-foreground bg-foreground text-background",
                isActive && !isCompleted && "border-foreground",
                isPending && "border-muted-foreground/50"
              )}
            >
              {isCurrentlyGenerating ? (
                <Loader2 className="size-3 animate-spin" />
              ) : isCompleted ? (
                <Check className="size-3" />
              ) : (
                <Circle
                  className={cn(
                    "size-2",
                    isActive ? "fill-foreground" : "fill-muted-foreground/50"
                  )}
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-sm font-medium",
                  isPending && "text-muted-foreground"
                )}
              >
                {step.title}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {step.description}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
