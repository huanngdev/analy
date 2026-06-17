import type {
  ForwardRefExoticComponent,
  HTMLAttributes,
  RefAttributes,
} from "react";

// Shared shape for the lucide-animated icon components (copied in from
// https://lucide-animated.com). Each one exposes an imperative handle so the
// animation can be driven from a parent (e.g. hovering a whole sidebar row)
// instead of only when the icon itself is hovered.
export type AnimatedIconHandle = {
  startAnimation: () => void;
  stopAnimation: () => void;
};

export type AnimatedIcon = ForwardRefExoticComponent<
  HTMLAttributes<HTMLDivElement> & {
    size?: number;
  } & RefAttributes<AnimatedIconHandle>
>;
