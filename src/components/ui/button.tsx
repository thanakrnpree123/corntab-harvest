
import { forwardRef } from "react";
import { Button as MuiButton, ButtonProps as MuiButtonProps } from "@mui/material";
import { styled } from "@mui/material/styles";

// Create a variant type that includes MUI variants plus our custom ones
export type ButtonVariants = 
  | "default" 
  | "destructive" 
  | "outline" 
  | "secondary" 
  | "ghost" 
  | "link" 
  | "contained" 
  | "text" 
  | "outlined";

export type ButtonSizes = "default" | "sm" | "lg" | "icon" | "small" | "medium" | "large";

// Extended props to include our custom variants
export interface ButtonProps extends Omit<MuiButtonProps, "variant" | "size"> {
  variant?: ButtonVariants;
  size?: ButtonSizes;
  asChild?: boolean;
}

// Map our variants to MUI variants
const mapVariantToMui = (variant: ButtonVariants): MuiButtonProps["variant"] => {
  switch (variant) {
    case "default":
    case "destructive":
      return "contained";
    case "outline":
      return "outlined";
    case "secondary":
    case "ghost":
    case "link":
      return "text";
    default:
      return variant as MuiButtonProps["variant"];
  }
};

// Map our sizes to MUI sizes
const mapSizeToMui = (size: ButtonSizes): MuiButtonProps["size"] => {
  switch (size) {
    case "sm":
    case "small":
      return "small";
    case "lg":
    case "large":
      return "large";
    case "default":
    case "medium":
    default:
      return "medium";
  }
};

// Styled MUI button to handle our custom variants
const StyledMuiButton = styled(MuiButton, {
  shouldForwardProp: (prop) => prop !== "variant" && prop !== "size" && prop !== "asChild",
})<ButtonProps>(({ theme, variant, size }) => ({
  // Common styles
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  borderRadius: "0.375rem",
  fontWeight: 500,
  
  // Variant specific styles
  ...(variant === "destructive" && {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    "&:hover": {
      backgroundColor: theme.palette.error.dark,
    },
  }),
  
  ...(variant === "ghost" && {
    backgroundColor: "transparent",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  }),
  
  ...(variant === "link" && {
    color: theme.palette.primary.main,
    textDecoration: "underline",
    textUnderlineOffset: "4px",
    backgroundColor: "transparent",
    "&:hover": {
      textDecoration: "underline",
      backgroundColor: "transparent",
    },
  }),
  
  // Icon button size
  ...(size === "icon" && {
    width: "40px",
    height: "40px",
    minWidth: "auto",
    padding: 0,
  }),
}));

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "default", size = "default", asChild = false, className, ...props }, ref) => {
    const muiVariant = mapVariantToMui(variant);
    const muiSize = mapSizeToMui(size);
    
    return (
      <StyledMuiButton
        ref={ref}
        variant={muiVariant}
        size={muiSize}
        disableElevation
        className={className}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
