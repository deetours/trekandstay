import * as React from "react"

import { cn } from "../../utils/cn"

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(
      "relative w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Alert.displayName = "Alert"

export { Alert }
