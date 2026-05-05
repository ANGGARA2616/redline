import { onSchedule } from "firebase-functions/v2/scheduler";
import { db, Timestamp } from "./adminInit";

/**
 * Subscription Checker — Cron Job
 *
 * Runs daily at 00:00 WIB (17:00 UTC) to:
 *  1. Mark expired subscriptions as "expired"
 *  2. Set reminder flags for subscriptions expiring in 3 days (H-3)
 *  3. Set reminder flags for subscriptions expiring in 1 day (H-1)
 *
 * Schedule: "0 17 * * *" = Every day at 17:00 UTC = 00:00 WIB
 */
export const checkSubscriptions = onSchedule(
  {
    schedule: "0 17 * * *",
    timeZone: "Asia/Jakarta",
    region: "asia-southeast2",
  },
  async () => {
    const now = new Date();
    console.log(`[Subscription Cron] Running at ${now.toISOString()}`);

    let expiredCount = 0;
    let reminderH3Count = 0;
    let reminderH1Count = 0;

    try {
      const usersSnap = await db.collection("users").get();

      for (const userDoc of usersSnap.docs) {
        const data = userDoc.data();
        const sub = data.subscription;

        if (!sub || !sub.expiresAt) continue;

        // Skip already expired accounts
        if (sub.tier === "expired") continue;

        // Parse expiry date
        let expiresAt: Date;
        if (sub.expiresAt.toDate) {
          expiresAt = sub.expiresAt.toDate();
        } else if (typeof sub.expiresAt === "string") {
          expiresAt = new Date(sub.expiresAt);
        } else {
          continue;
        }

        const msUntilExpiry = expiresAt.getTime() - now.getTime();
        const daysUntilExpiry = msUntilExpiry / (1000 * 60 * 60 * 24);

        // ── Expired ──
        if (daysUntilExpiry <= 0) {
          await userDoc.ref.update({
            "subscription.tier": "expired",
            "subscription.reminderSent": null,
          });
          expiredCount++;
          console.log(
            `[Expired] ${data.displayName} (${data.email}) — was ${sub.tier}`
          );
          continue;
        }

        // ── H-1 Reminder ──
        if (daysUntilExpiry <= 1 && sub.reminderSent !== "h1") {
          await userDoc.ref.update({
            "subscription.reminderSent": "h1",
          });
          reminderH1Count++;
          console.log(
            `[H-1 Reminder] ${data.displayName} (${data.email}) — expires ${expiresAt.toISOString()}`
          );
          // TODO: Send email notification via SendGrid/Resend
          continue;
        }

        // ── H-3 Reminder ──
        if (
          daysUntilExpiry <= 3 &&
          !sub.reminderSent
        ) {
          await userDoc.ref.update({
            "subscription.reminderSent": "h3",
          });
          reminderH3Count++;
          console.log(
            `[H-3 Reminder] ${data.displayName} (${data.email}) — expires ${expiresAt.toISOString()}`
          );
          // TODO: Send email notification via SendGrid/Resend
        }
      }

      console.log(
        `[Subscription Cron] Done: ${expiredCount} expired, ${reminderH3Count} H-3, ${reminderH1Count} H-1`
      );
    } catch (error) {
      console.error("[Subscription Cron] Error:", error);
      throw error; // Re-throw so Firebase marks the execution as failed
    }
  }
);
