export type PlanTier = "trial" | "starter" | "pro" | "pro_plus" | "expired";

export interface PlanLimits {
  maxQueuePerSession: number | null; // null = unlimited
  webhookEnabled: boolean;
  obsOverlayEnabled: boolean;
}

export function getPlanLimits(tier: PlanTier): PlanLimits {
  switch (tier) {
    case "trial":    return { maxQueuePerSession: null, webhookEnabled: true,  obsOverlayEnabled: true  };
    case "starter":  return { maxQueuePerSession: 20,   webhookEnabled: false, obsOverlayEnabled: false };
    case "pro":      return { maxQueuePerSession: 100,  webhookEnabled: true,  obsOverlayEnabled: false };
    case "pro_plus": return { maxQueuePerSession: null, webhookEnabled: true,  obsOverlayEnabled: true  };
    default:         return { maxQueuePerSession: 0,    webhookEnabled: false, obsOverlayEnabled: false };
  }
}
