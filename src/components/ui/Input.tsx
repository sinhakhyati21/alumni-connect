import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = "", ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-slate-700">
            {label}
            {props.required && (
              <span className="ml-1 text-red-500">*</span>
            )}
          </label>
        )}

        <div
          className={`
            flex items-center gap-3
            rounded-2xl
            border
            bg-slate-50/80
            px-4
            py-3
            transition-all
            duration-200
            ${
              error
                ? "border-red-300 focus-within:border-red-500 focus-within:ring-red-100"
                : "border-slate-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100"
            }
          `}
        >
          {icon && (
            <span className="text-slate-400">
              {icon}
            </span>
          )}

          <input
            ref={ref}
            {...props}
            className={`
              w-full
              bg-transparent
              text-sm
              text-slate-800
              placeholder:text-slate-400
              outline-none
              ${className}
            `}
          />
        </div>

        {error && (
          <p className="text-sm text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;