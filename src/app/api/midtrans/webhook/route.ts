import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

/**
 * POST /api/midtrans/webhook
 *
 * Handles payment notifications from Midtrans.
 * Uses Firebase Admin SDK for reliable server-side Firestore updates.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { order_id, transaction_status, custom_field1, custom_field2 } = body;
    const userId = custom_field1;
    const tier = custom_field2;

    console.log("Webhook received:", { order_id, transaction_status, userId, tier });

    if (transaction_status === "settlement" || transaction_status === "capture") {
      const db = getAdminDb();
      const userRef = db.collection("users").doc(userId);

      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      await userRef.update({
        "subscription.tier": tier,
        "subscription.expiresAt": Timestamp.fromDate(expiresAt),
        "subscription.midtransOrderId": order_id,
      });

      console.log(`[Webhook] Success: Upgraded user ${userId} to ${tier}`);
    }

    return NextResponse.json({ status: "OK" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
