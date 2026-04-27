import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Base: cursor-pointer, leading-none (line-height:1 on button text), rounded-lg everywhere, 200ms transition
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium leading-none cursor-pointer transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary: filled brand color, clear hover shift + shadow lift
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md shadow-sm",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
        // Outline: border + transparent bg, hover fills with brand color
        outline:
          "border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        // sm: 12px top/bottom · 24px left/right (minimum for small)
        sm:      "px-6 py-3 min-h-10 text-sm",
        // default: 14px · 32px
        default: "px-8 py-3.5 min-h-12 text-sm",
        // lg: 16px · 40px
        lg:      "px-10 py-4 min-h-14 text-base",
        // icon: square, no text padding override
        icon:    "min-h-11 min-w-11 p-2.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
