import React, { useEffect, useRef } from "react";
import * as FaIcons from "react-icons/fa6";
import { Button, type ButtonVariant } from "./index";
import { useOnClickOutside } from "../../hooks/useOnClickOutside";

interface ModalAction {
  label: string;
  onClick: () => void | Promise<void>;
  isLoading?: boolean;
  loadingText?: string;
  variant?: ButtonVariant;
  iconName?: keyof typeof FaIcons;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  headerIcon?: keyof typeof FaIcons;
  children: React.ReactNode;
  primaryAction?: ModalAction;
  secondaryAction?: ModalAction;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "custom";
  customSize?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  headerIcon,
  children,
  primaryAction,
  secondaryAction,
  footer,
  size = "md",
  customSize,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(modalRef, () => {
    if (!primaryAction?.isLoading) onClose();
  });

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !primaryAction?.isLoading) onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, primaryAction?.isLoading]);

  if (!isOpen) return null;

  const sizeClasses: Record<Exclude<typeof size, "custom">, string> = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  // Resolve the header icon component if provided
  const HeaderIcon = headerIcon ? FaIcons[headerIcon] as React.ElementType : null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">

      {/* Overlay */}
      <div className="fixed inset-0 bg-[#2B1800]/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        ref={modalRef}
        className={[
          "relative w-full flex flex-col overflow-hidden",
          "bg-[#FDF6ED] border border-[#F0D9B0]",
          "rounded-3xl",
          size !== "custom" ? sizeClasses[size] : "",
        ].join(" ")}
        style={size === "custom" && customSize ? { maxWidth: customSize } : undefined}
      >
        {/* Header */}
        <div className="bg-[#E8640A] px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Icon box */}
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white text-lg shrink-0">
              {HeaderIcon ? (
                <HeaderIcon />
              ) : (
                // Default kitchen icon
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 2h1v7a3 3 0 0 0 6 0V2h1M7 2v4M15 2c0 0 4 2 4 8h-8c0-6 4-8 4-8zM11 10v12M19 10v12" />
                </svg>
              )}
            </div>

            <div>
              <h2 className="font-['Fredoka',sans-serif] text-[1.2rem] font-semibold text-white leading-tight tracking-wide">
                {title}
              </h2>
              {subtitle && (
                <p className="text-[0.72rem] text-white/70 mt-0.5 font-['Nunito',sans-serif]">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            disabled={primaryAction?.isLoading}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors disabled:opacity-50"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="1" y1="1" x2="13" y2="13" />
              <line x1="13" y1="1" x2="1" y2="13" />
            </svg>
          </button>
        </div>

        {/* Orange-to-amber accent strip */}
        <div className="h-1 bg-linear-to-r from-[#F5962A] via-[#FFC96B] to-[#F5962A]" />

        {/* Content */}
        <div className="px-6 py-6 max-h-[65vh] overflow-y-auto flex-1 text-[#3D1C00] font-['Nunito',sans-serif]">
          {children}
        </div>

        {/* Footer */}
        {(footer || primaryAction || secondaryAction) && (
          <div className="px-6 py-4 bg-[#FFF8EE] border-t border-[#F0D9B0] flex items-center justify-end gap-3">
            {footer ? (
              footer
            ) : (
              <>
                {secondaryAction && (
                  <Button
                    variant={secondaryAction.variant ?? "secondary"}
                    onClick={secondaryAction.onClick}
                    size="md"
                    disabled={primaryAction?.isLoading}
                    className="
                      bg-transparent border border-[#F0D9B0] rounded-xl
                      text-[#B07030] font-['Nunito',sans-serif] font-semibold
                      hover:bg-[#FFF0DC] transition-colors
                    "
                  >
                    {secondaryAction.label}
                  </Button>
                )}

                {primaryAction && (
                  <Button
                    variant={primaryAction.variant ?? "primary"}
                    onClick={primaryAction.onClick}
                    isLoading={primaryAction.isLoading}
                    loadingText={primaryAction.loadingText}
                    iconName={primaryAction.iconName}
                    size="md"
                    className="
                      bg-[#E8640A] hover:bg-[#D05500] border-none rounded-xl
                      text-white font-['Fredoka',sans-serif] tracking-wide
                      transition-colors
                    "
                  >
                    {primaryAction.label}
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;