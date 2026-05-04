import React from "react";

type ButtonVariant =
  | "primary"
  | "neutral"
  | "secondary"
  | "ghost"
  | "danger"
  | "nav-pill"
  | "nav-link";

type ButtonSize = "sm" | "md" | "lg" | "xl";
type ButtonShape = "pill" | "rounded" | "square";

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  children: React.ReactNode;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50",
  neutral: "bg-stone-900 text-white hover:bg-stone-700 disabled:opacity-50",
  secondary: "border border-stone-300 text-stone-600 hover:bg-stone-100 disabled:opacity-40",
  ghost: "text-stone-500 hover:text-stone-700",
  danger: "text-red-400 hover:text-red-600 disabled:opacity-50",
  "nav-pill": "bg-black/20 text-white hover:bg-black/30 disabled:opacity-50",
  "nav-link": "text-orange-200 hover:text-white",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-2.5 text-sm font-medium",
  xl: "py-4 text-lg",
};

const shapeClasses: Record<ButtonShape, string> = {
  pill: "rounded-full",
  rounded: "rounded-lg",
  square: "rounded-xl",
};

export const Button: React.FC<ButtonProps> = ({
  variant = "secondary",
  size = "md",
  shape,
  disabled,
  type = "button",
  onClick,
  className,
  children,
}) => {
  const classes = [
    "transition-colors",
    variantClasses[variant],
    sizeClasses[size],
    shape ? shapeClasses[shape] : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} disabled={disabled} onClick={onClick} className={classes}>
      {children}
    </button>
  );
};
