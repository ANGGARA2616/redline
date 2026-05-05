import type { ReactNode } from "react";

/**
 * Overlay layout — minimal wrapper, no navigation chrome.
 * The page component handles adding the transparent body class.
 */
export default function OverlayLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
