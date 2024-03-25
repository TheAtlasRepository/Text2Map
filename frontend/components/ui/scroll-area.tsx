import * as React from "react";
import { cn } from "@/lib/utils";

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> { }

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn("flex flex-col overflow-y-auto scrollbar-hide", className)}
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#888888 #f0f0f0",
        }}
      >
        <div
          style={{ flex: 1 }}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);

export { ScrollArea };
