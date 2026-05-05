/**
 * Auto-detect logic for matching donation nominal to a package.
 * Duplicated from src/lib/autoDetect.ts for Firebase Functions isolation.
 */

interface Package {
  id: string;
  name: string;
  jalur: "normal" | "fast_track";
  nominal: number;
  gameCount: number;
  isBundle: boolean;
}

type Jalur = "normal" | "fast_track";

interface DetectResult {
  type: "bundle" | "fast_track" | "normal" | "anomaly";
  package?: Package;
  jalur: Jalur;
  gameCount: number;
  matched: boolean;
}

export function autoDetectPackage(
  nominal: number,
  packages: Package[]
): DetectResult {
  if (nominal <= 0) {
    return { type: "anomaly", jalur: "normal", gameCount: 0, matched: false };
  }

  // Step 1: Exact match with bundle packages
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

  // Step 2: Exact match with any package
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

  // Step 3: Divisible by fast-track unit price
  const fastTrackUnits = packages.filter(
    (p) => p.jalur === "fast_track" && p.gameCount === 1 && !p.isBundle
  );
  for (const ft of fastTrackUnits) {
    if (ft.nominal > 0 && nominal % ft.nominal === 0) {
      return {
        type: "fast_track",
        package: ft,
        jalur: "fast_track",
        gameCount: nominal / ft.nominal,
        matched: true,
      };
    }
  }

  // Step 4: Divisible by normal unit price
  const normalUnits = packages.filter(
    (p) => p.jalur === "normal" && p.gameCount === 1 && !p.isBundle
  );
  for (const nu of normalUnits) {
    if (nu.nominal > 0 && nominal % nu.nominal === 0) {
      return {
        type: "normal",
        package: nu,
        jalur: "normal",
        gameCount: nominal / nu.nominal,
        matched: true,
      };
    }
  }

  // Step 5: Anomaly
  return { type: "anomaly", jalur: "normal", gameCount: 0, matched: false };
}
