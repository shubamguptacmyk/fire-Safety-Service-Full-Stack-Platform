import React from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "accent" | "danger" | "white";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      className = "",
      type = "button",
      asChild = false,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

    const sizeClasses = {
      sm: "px-3 py-1.5 text-xs gap-1.5",
      md: "px-4 py-2 text-sm gap-2",
      lg: "px-6 py-3 text-base gap-2.5 font-semibold",
    };

    const variantClasses = {
      primary:
        "bg-primary-700 hover:bg-primary-800 text-white shadow-sm hover:shadow focus-visible:ring-primary-600 active:bg-primary-900",
      secondary:
        "bg-dark hover:bg-dark-secondary text-white shadow-sm focus-visible:ring-dark",
      outline:
        "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 focus-visible:ring-slate-400",
      ghost:
        "text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-300",
      accent:
        "bg-accent hover:bg-accent-hover text-white shadow-sm focus-visible:ring-accent",
      danger:
        "bg-red-600 hover:bg-red-700 text-white shadow-sm focus-visible:ring-red-500",
      white:
        "bg-white text-dark hover:bg-slate-100 shadow-sm focus-visible:ring-white",
    };

    const combinedClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<any>;
      return React.cloneElement(child, {
        className: `${combinedClasses} ${child.props.className || ""}`,
        ref,
        ...props,
      });
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={combinedClasses}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
