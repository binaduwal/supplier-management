import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  pending?: boolean;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-[#1e4e8c] text-white hover:bg-[#163e6c] disabled:bg-[#1e4e8c]/50",
  secondary:
    "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 disabled:bg-slate-50",
  danger: "bg-red-700 text-white hover:bg-red-800 disabled:bg-red-700/50",
};

export function Button({
  variant = "primary",
  pending = false,
  disabled,
  className = "",
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || pending}
      className={`inline-flex min-h-10 cursor-pointer items-center justify-center rounded-lg px-3 py-2 text-sm font-medium disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
