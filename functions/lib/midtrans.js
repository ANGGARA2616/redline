"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.midtransWebhook = void 0;
const https_1 = require("firebase-functions/v2/https");
const adminInit_1 = require("./adminInit");
/**
 * Midtrans Payment Webhook
 *
 * POST https://<region>-<project>.cloudfunctions.net/midtransWebhook
 *
 * Handles payment notifications from Midtrans.
 * On successful payment (settlement/capture), updates the user's
 * subscription tier and expiry date in Firestore.
 *
 * Expected body from Midtrans:
 * {
 *   "order_id": "ORDER-xxx",
 *   "transaction_status": "settlement",
 *   "custom_field1": "<userId>",
 *   "custom_field2": "<tier>"
 * }
 */
exports.midtransWebhook = (0, https_1.onRequest)({ cors: true, region: "asia-southeast2" }, async (req, res) => {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
    try {
        const { order_id, transaction_status, custom_field1, custom_field2 } = req.body;
        const userId = custom_field1;
        const tier = custom_field2;
        console.log("Midtrans webhook received:", {
            order_id,
            transaction_status,
            userId,
            tier,
        });
        // TODO: Verify Midtrans signature for production security
        // const serverKey = process.env.MIDTRANS_SERVER_KEY;
        // const hash = crypto.createHash("sha512")
        //   .update(`${order_id}${statusCode}${grossAmount}${serverKey}`)
        //   .digest("hex");
        if (transaction_status === "settlement" ||
            transaction_status === "capture") {
            const expiresAt = new Date();
            expiresAt.setMonth(expiresAt.getMonth() + 1);
            await adminInit_1.db
                .collection("users")
                .doc(userId)
                .update({
                "subscription.tier": tier,
                "subscription.expiresAt": adminInit_1.Timestamp.fromDate(expiresAt),
                "subscription.midtransOrderId": order_id,
            });
            console.log(`[Midtrans] ✅ Upgraded user ${userId} to ${tier}, expires ${expiresAt.toISOString()}`);
        }
        else if (transaction_status === "expire" ||
            transaction_status === "cancel") {
            console.log(`[Midtrans] ⚠️ Payment ${order_id} status: ${transaction_status}`);
        }
        res.status(200).json({ status: "OK" });
    }
    catch (error) {
        console.error("Midtrans webhook error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
//# sourceMappingURL=midtrans.js.map