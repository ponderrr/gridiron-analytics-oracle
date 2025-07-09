import { useEffect, useState } from "react";

export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener
      ? mediaQuery.addEventListener("change", handler)
      : mediaQuery.addListener(handler);
    return () => {
      mediaQuery.removeEventListener
        ? mediaQuery.removeEventListener("change", handler)
        : mediaQuery.removeListener(handler);
    };
  }, []);

  return prefersReducedMotion;
}
