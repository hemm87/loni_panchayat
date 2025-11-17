import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium transition-all duration-200",
          "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-semibold file:text-primary",
          "placeholder:text-muted-foreground/60",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:border-primary shadow-sm focus-visible:shadow-md",
          "hover:border-primary/40 hover:shadow-sm",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
