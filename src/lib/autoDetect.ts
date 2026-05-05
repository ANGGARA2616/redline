import type { Package, Jalur, DetectResult } from "@/types";

/**
 * Auto-detect which package matches a given donation nominal.
 *
 * Priority order (per PRD US-06):
 *   1. Exact match with a bundle package
 *   2. Divisible by fast-track unit price (exact, remainder 0)
 *   3. Divisible by normal unit price (exact, remainder 0)
 *   4. Anomaly — no match found
 */
export function autoDetectPackage(
  nominal: number,
  packages: Package[]
): DetectResult {
  if (nominal <= 0) {
    return { type: "anomaly", jalur: "normal", gameCount: 0, matched: false };
  }

  // ── Step 1: Exact match with bundle packages ──
  const bundles = packages.filter((p) => p.isBundle);
  for (const bundle of bundles) {
    if (bundle.nominal === nominal) {
      return {
        type: "bundle",
        package: bundle,
        jalur: bundle.jalur,
        gameCount: bundle.gameCount,
        matched: true,
      };
    }
  }

  // ── Step 2: Exact match with ANY package (non-bundle too) ──
  for (const pkg of packages) {
    if (pkg.nominal === nominal) {
      return {
        type: pkg.jalur === "fast_track" ? "fast_track" : "normal",
        package: pkg,
        jalur: pkg.jalur,
        gameCount: pkg.gameCount,
        matched: true,
      };
    }
  }

  // ── Step 3: Divisible by fast-track unit price ──
  const fastTrackUnits = packages.filter(
    (p) => p.jalur === "fast_track" && p.gameCount === 1 && !p.isBundle
  );
  for (const ft of fastTrackUnits) {
    if (ft.nominal > 0 && nominal % ft.nominal === 0) {
      const count = nominal / ft.nominal;
      return {
        type: "fast_track",
        package: ft,
        jalur: "fast_track",
        gameCount: count,
        matched: true,
      };
    }
  }

  // ── Step 4: Divisible by normal unit price ──
  const normalUnits = packages.filter(
    (p) => p.jalur === "normal" && p.gameCount === 1 && !p.isBundle
  );
  for (const nu of normalUnits) {
    if (nu.nominal > 0 && nominal % nu.nominal === 0) {
      const count = nominal / nu.nominal;
      return {
        type: "normal",
        package: nu,
        jalur: "normal",
        gameCount: count,
        matched: true,
      };
    }
  }

  // ── Step 5: No match — anomaly ──
  return { type: "anomaly", jalur: "normal", gameCount: 0, matched: false };
}

/**
 * Get a human-readable summary of the detect result.
 */
export function describeDetectResult(result: DetectResult): string {
  if (!result.matched) return "Nominal tidak dikenal";

  const jalurLabel =
    result.jalur === "fast_track" ? "Fast Track" : "Normal";

  if (result.type === "bundle" && result.package) {
    return `${result.package.name} (${result.gameCount} game ${jalurLabel})`;
  }

  return `${result.gameCount} game ${jalurLabel}`;
}
