import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => {
  return <input ref={ref} className={cn("h-9 w-full rounded-md border border-slate-300 bg-transparent px-3 text-sm outline-none ring-emerald-500 focus:ring-2 dark:border-slate-700", className)} {...props} />;
});
Input.displayName = "Input";
