import { useEffect, useState } from "react";

/**
 * Returns responsive row and list heights for virtualized lists.
 * Adjusts based on viewport size, with sensible min/max values.
 */
export function useResponsiveListDimensions() {
  const getHeights = () => {
    // Row height: 8-10% of viewport height, min 56px, max 100px
    const vh = window.innerHeight;
    const rowHeight = Math.max(56, Math.min(100, Math.round(vh * 0.09)));
    // List height: 60% of viewport height, min 320px, max 700px
    const listHeight = Math.max(320, Math.min(700, Math.round(vh * 0.6)));
    return { rowHeight, listHeight };
  };

  const [dimensions, setDimensions] = useState(getHeights());

  useEffect(() => {
    const handleResize = () => setDimensions(getHeights());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return dimensions;
}
