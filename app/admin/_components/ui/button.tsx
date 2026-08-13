import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    const base = "inline-flex items-center justify-center font-medium rounded-full transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer";

    const variants = {
      default: "bg-black text-white hover:bg-black/80 shadow-sm",
      outline: "border border-black/15 bg-white text-black hover:bg-black/5",
      secondary: "bg-[#F0EEED] text-black hover:bg-[#E5E3E2]",
      ghost: "text-black hover:bg-black/5",
      destructive: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm",
    };

    const sizes = {
      default: "h-10 px-5 py-2 text-sm",
      sm: "h-8 px-3 text-xs",
      lg: "h-12 px-8 text-base",
      icon: "h-9 w-9 p-0 rounded-full",
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
