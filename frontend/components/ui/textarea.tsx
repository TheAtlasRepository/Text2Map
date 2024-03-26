import React, { useRef, useState } from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.InputHTMLAttributes<HTMLTextAreaElement> {
  rows?: number,
  hiddenState?: number
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, rows = 1, hiddenState = 0, ...props }, ref) => {

    return (
      <textarea
        className={cn(
          hiddenState
            ? "resize-none flex w-full bg-white dark:bg-gray-800 py-2 text-sm ring-offset-0 placeholder:text-gray-400 dark:text-gray-300 focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
            : "flex w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-slate-950 px-3 py-2 text-sm ring-offset-white dark:ring-offset-gray-300 placeholder:text-gray-400 dark:text-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        placeholder="Aa"
        ref={ref}
        rows={rows}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }