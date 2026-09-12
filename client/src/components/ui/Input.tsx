import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = "", id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-slate-700 mb-1.5"
          >
            {label}
            {props.required && <span className="text-red-600 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-dark placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed ${
              leftIcon ? "pl-9" : ""
            } ${rightIcon ? "pr-9" : ""} ${
              error
                ? "border-red-500 focus:ring-red-500"
                : "border-slate-300 hover:border-slate-400"
            } ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-slate-400 flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
