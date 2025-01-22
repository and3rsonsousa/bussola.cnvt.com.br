import React from "react";
import { cn } from "~/lib/utils";

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
    rounded?: boolean;
  }
>(({ className, asChild = false, rounded = false, ...props }, ref) => {
  return (
    <button
      className={cn(
        `group relative inline-flex items-center gap-2 ${
          rounded ? "aspect-square rounded-full p-3" : "rounded px-6 py-4"
        } bg-primary text-primary-foreground ring-foreground ring-offset-background leading-none font-bold ring-offset-2 outline-hidden focus:ring-2`,
        className,
      )}
      ref={ref}
      {...props}
    >
      {props.children}
    </button>
  );
});

export default Button;
