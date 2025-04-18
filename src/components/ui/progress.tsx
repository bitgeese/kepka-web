import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, ...props }, ref) => {
    const percentage = value != null ? Math.min(Math.max(value, 0), max) : null

    return (
      <div
        ref={ref}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
          className
        )}
        {...props}
      >
        {value != null && (
          <div
            className="h-full w-full flex-1 bg-primary transition-all"
            style={{
              transform: `translateX(-${100 - (percentage || 0)}%)`,
            }}
          />
        )}
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress } 