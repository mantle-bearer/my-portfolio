import type { ReactNode } from "react";

type SpeechBubbleProps = {
  tone: "orange" | "blue";
  pointer?: "left" | "right" | "bottom";
  className?: string;
  children: ReactNode;
};

export function SpeechBubble({ tone, pointer = "left", className = "", children }: SpeechBubbleProps) {
  return (
    <div className={`speech-bubble speech-bubble-${tone} speech-pointer-${pointer} ${className}`.trim()}>
      {children}
    </div>
  );
}
