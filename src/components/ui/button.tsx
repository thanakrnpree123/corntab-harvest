
import * as React from "react"
import { Button as MuiButton } from "@mui/material"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Map shadcn/ui variants to MUI variants
    let muiVariant: "contained" | "text" | "outlined" | undefined = "contained";
    let muiColor: "primary" | "secondary" | "success" | "error" | "info" | "warning" | "inherit" | undefined = "primary";
    
    // Map variant to MUI variant and color
    if (variant === "outline") {
      muiVariant = "outlined";
    } else if (variant === "ghost") {
      muiVariant = "text";
    } else if (variant === "link") {
      muiVariant = "text";
    } else if (variant === "destructive") {
      muiColor = "error";
    } else if (variant === "secondary") {
      muiColor = "secondary";
    }
    
    // Map size to material-ui size
    let muiSize: "small" | "medium" | "large" | undefined = "medium";
    if (size === "sm") {
      muiSize = "small";
    } else if (size === "lg") {
      muiSize = "large";
    }
    
    // For custom styling that isn't easily mapped, we continue to use the original classes
    if (asChild) {
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        />
      );
    }
    
    return (
      <MuiButton
        className={cn(buttonVariants({ variant, size, className }))}
        variant={muiVariant}
        color={muiColor}
        size={muiSize}
        {...props}
      />
    );
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
