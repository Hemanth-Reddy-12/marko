import * as React from "react"
import { cn } from "@/lib/utils"

const Switch = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input type="checkbox" ref={ref} className={cn("peer inline-flex h-5 w-9 shrink-0 cursor-pointer appearance-none items-center rounded-full border-2 border-transparent bg-input transition-colors checked:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 after:content-[''] after:inline-block after:h-4 after:w-4 after:rounded-full after:bg-background after:transition-transform after:checked:translate-x-4", className)} {...props} />
))
Switch.displayName = "Switch"
export { Switch }