import React from "react";

type SpinnerSize = "sm" | "md" | "lg" | "xlg" | "custom";

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  customSize?: string;
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

const sizeMap: Record<Exclude<SpinnerSize, "custom">, { ring: string; dot: string; icon: string }> = {
  sm:  { ring: "w-7 h-7 border-[3px]",  dot: "w-[7px] h-[7px]",   icon: "hidden" },
  md:  { ring: "w-12 h-12 border-[4px]", dot: "w-3 h-3",           icon: "text-sm" },
  lg:  { ring: "w-[72px] h-[72px] border-[5px]", dot: "w-[18px] h-[18px]", icon: "text-xl" },
  xlg: { ring: "w-24 h-24 border-[6px]", dot: "w-6 h-6",           icon: "text-2xl" },
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  customSize = "48px",
  text = "",
  className = "",
  fullScreen = false,
}) => {
  const sizes = size === "custom" ? null : sizeMap[size];

  const ring = (
    <div
      className={[
        "rounded-full border-solid",
        "border-[#F0D9B0]",
        "border-t-[#E8640A] border-r-[#F5962A]",
        "animate-spin",
        sizes ? `${sizes.ring}` : "",
      ].join(" ")}
      style={
        size === "custom"
          ? { width: customSize, height: customSize, borderWidth: "4px" }
          : undefined
      }
    />
  );

  const pulse = (
    <div
      className={[
        "absolute rounded-full bg-[#E8640A] opacity-20 animate-pulse",
        sizes ? sizes.dot : "w-3 h-3",
      ].join(" ")}
    />
  );

  const kitchenIcon = size !== "sm" && (
    <i
      className={[
        "ti ti-tools-kitchen-2 absolute text-[#C05818] opacity-70 animate-pulse",
        sizes ? sizes.icon : "text-sm",
      ].join(" ")}
      aria-hidden="true"
    />
  );

  const textBlock = text && (
    <div className="flex flex-col items-center gap-1.5">
      <span
        className="font-['Fredoka',sans-serif] text-[13px] font-medium tracking-widest uppercase text-[#C05818]"
      >
        {text}
      </span>
      <div className="flex gap-1.5">
        {["-0.3s", "-0.15s", "0s"].map((delay, i) => (
          <span
            key={i}
            className="w-1.25 h-1.25 rounded-full bg-[#E8640A] inline-block animate-bounce"
            style={{ animationDelay: delay }}
          />
        ))}
      </div>
    </div>
  );

  const content = (
    <div
      className={[
        "flex flex-col items-center justify-center gap-4",
        className,
      ].join(" ")}
    >
      <div className="relative flex items-center justify-center">
        {ring}
        {pulse}
        {kitchenIcon}
      </div>
      {textBlock}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2B1800]/80 backdrop-blur-sm">
        {/* Override ring colors for dark overlay */}
        <div
          className="flex flex-col items-center justify-center gap-4"
          style={{ "--tw-ring-color": "transparent" } as React.CSSProperties}
        >
          <div className="relative flex items-center justify-center">
            <div
              className={[
                "rounded-full border-solid animate-spin",
                "border-[rgba(240,217,176,0.25)]",
                "border-t-[#FFA040] border-r-[#FFD080]",
                size === "custom" ? "" : sizes ? sizes.ring : "w-12 h-12 border-4",
              ].join(" ")}
              style={
                size === "custom"
                  ? { width: customSize, height: customSize, borderWidth: "4px" }
                  : undefined
              }
            />
            <div className="absolute rounded-full bg-[#FFA040] opacity-20 animate-pulse w-4.5 h-4.5" />
            <i className="ti ti-tools-kitchen-2 absolute text-[#FFD080] opacity-80 animate-pulse text-xl" aria-hidden="true" />
          </div>
          {text && (
            <div className="flex flex-col items-center gap-1.5">
              <span className="font-['Fredoka',sans-serif] text-[13px] font-medium tracking-widest uppercase text-[#FFD080]">
                {text}
              </span>
              <div className="flex gap-1.5">
                {["-0.3s", "-0.15s", "0s"].map((delay, i) => (
                  <span
                    key={i}
                    className="w-1.25 h-1.25 rounded-full bg-[#FFA040] inline-block animate-bounce"
                    style={{ animationDelay: delay }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;