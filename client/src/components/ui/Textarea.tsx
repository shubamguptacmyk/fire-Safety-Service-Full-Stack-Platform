import React from "react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = "", id, rows = 3, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs font-semibold text-slate-700 mb-1.5"
          >
            {label}
            {props.required && <span className="text-red-600 ml-0.5">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-dark placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed resize-y ${
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-slate-300 hover:border-slate-400"
          } ${className}`}
          {...props}
        />
        {error ? (
          <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
export default Textarea;
