import React from 'react';
import * as FaIcons from 'react-icons/fa6';
import { Icon, LoadingSpinner } from "./index";

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';
type IconPosition = 'left' | 'right';
type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  iconName?: keyof typeof FaIcons;
  iconPosition?: IconPosition;
  fullWidth?: boolean;
  tooltip?: string;
  tooltipPosition?: TooltipPosition;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    loadingText = '',
    iconName,
    iconPosition = 'left',
    fullWidth = false,
    tooltip,
    tooltipPosition = 'top',
    className = '',
    disabled,
    ...props
  }, ref) => {

    // ── Base ──────────────────────────────────────────────────────────────
    const base = [
      "group relative inline-flex items-center justify-center",
      "font-['Fredoka',sans-serif] font-medium tracking-wide",
      "rounded-xl transition-all duration-150",
      "active:scale-[0.97] disabled:opacity-45 disabled:cursor-not-allowed disabled:active:scale-100",
      "gap-2 overflow-hidden select-none",
    ].join(' ');

    // ── Variants ──────────────────────────────────────────────────────────
    const variants: Record<ButtonVariant, string> = {
      primary:   "bg-[#E8640A] text-white hover:bg-[#D05500] border-0",
      secondary: "bg-[#F5962A] text-white hover:bg-[#E07810] border-0",
      danger:    "bg-[#C0392B] text-white hover:bg-[#A93226] border-0",
      outline:   "bg-transparent text-[#E8640A] border-2 border-[#E8640A] hover:bg-[#FFF0DC]",
      ghost:     "bg-transparent text-[#B07030] border border-[#F0D9B0] hover:bg-[#FFF8EE]",
    };

    // ── Sizes ─────────────────────────────────────────────────────────────
    const sizes: Record<ButtonSize, string> = {
      sm: "px-3.5 py-1.5 text-[13px] min-h-[32px]",
      md: "px-5    py-2.5 text-[15px] min-h-[44px]",
      lg: "px-7    py-3.5 text-[17px] min-h-[56px]",
    };

    // ── Tooltip positions ─────────────────────────────────────────────────
    const tooltipPositions: Record<TooltipPosition, string> = {
      top:    "bottom-full left-1/2 -translate-x-1/2 mb-2",
      bottom: "top-full    left-1/2 -translate-x-1/2 mt-2",
      left:   "right-full  top-1/2  -translate-y-1/2 mr-2",
      right:  "left-full   top-1/2  -translate-y-1/2 ml-2",
    };

    const spinnerSizeMap: Record<ButtonSize, "sm" | "md"> = {
      sm: "sm", md: "sm", lg: "md",
    };

    // Spinner tint: white on filled variants, orange on outline/ghost
    const spinnerClass =
      variant === 'outline' || variant === 'ghost'
        ? '[&_.spinner-ring]:border-[#E8640A] [&_.spinner-dot]:bg-[#E8640A]'
        : '[&_.spinner-ring]:border-white [&_.spinner-dot]:bg-white';

    const iconSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 17;

    const classes = [
      base,
      variants[variant],
      sizes[size],
      fullWidth ? 'w-full' : '',
      className,
    ].filter(Boolean).join(' ');

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || isLoading}
        {...props}
      >
        {/* Tooltip */}
        {tooltip && !disabled && (
          <span
            className={[
              "absolute z-50 px-2.5 py-1",
              "text-[10px] font-bold uppercase tracking-wider",
              "text-white bg-[#3D1C00] rounded-lg",
              "opacity-0 group-hover:opacity-100 pointer-events-none",
              "transition-opacity duration-200 whitespace-nowrap",
              tooltipPositions[tooltipPosition],
            ].join(' ')}
          >
            {tooltip}
          </span>
        )}

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-inherit z-10">
            <LoadingSpinner
              size={spinnerSizeMap[size]}
              className={spinnerClass}
              text={loadingText}
            />
          </div>
        )}

        {/* Content */}
        <div
          className={[
            "flex items-center gap-2 transition-opacity duration-150",
            isLoading ? "invisible" : "",
          ].join(' ')}
        >
          {iconPosition === 'left' && iconName && (
            <Icon iconName={iconName} size={iconSize} className="text-current shrink-0" />
          )}

          {children && (
            <span className="leading-none">{children}</span>
          )}

          {iconPosition === 'right' && iconName && (
            <Icon iconName={iconName} size={iconSize} className="text-current shrink-0" />
          )}
        </div>

        {/* Subtle inner highlight on hover for filled variants */}
        {(variant === 'primary' || variant === 'secondary' || variant === 'danger') && (
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200" />
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;