"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sociabuzzWebhook = void 0;
const https_1 = require("firebase-functions/v2/https");
const adminInit_1 = require("./adminInit");
const autoDetect_1 = require("./autoDetect");
/**
 * Sociabuzz Donation Webhook
 *
 * POST https://<region>-<project>.cloudfunctions.net/sociabuzzWebhook
 *
 * Receives donation notifications and auto-adds queue entries
 * to the streamer's active session.
 *
 * Expected body:
 * {
 *   "streamer_username": "jessnolimit",
 *   "amount": 51000,
 *   "message": "166047234 gas kak mau bareng",
 *   "donor_name": "Budi"
 * }
 */
exports.sociabuzzWebhook = (0, https_1.onRequest)({ cors: true, region: "asia-southeast2" }, async (req, res) => {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
    try {
        const { streamer_username, amount, message, donor_name } = req.body;
        // ── Validate ──
        if (!streamer_username || !amount || !message) {
            res.status(400).json({
                error: "Missing required fields: streamer_username, amount, message",
            });
            return;
        }
        const nominal = Number(amount);
        if (isNaN(nominal) || nominal <= 0) {
            res.status(400).json({ error: "Invalid amount" });
            return;
        }
        // ── Extract ML ID ──
        const mlIdMatch = String(message).trim().match(/^(\d+)/);
        if (!mlIdMatch) {
            res.status(400).json({
                error: "Could not extract ML ID from message. Must start with numeric ML ID.",
                message_received: message,
            });
            return;
        }
        const mlId = mlIdMatch[1];
        // ── Look up streamer ──
        const slug = String(streamer_username).toLowerCase();
        const usernameSnap = await adminInit_1.db.collection("usernames").doc(slug).get();
        if (!usernameSnap.exists) {
            res
                .status(404)
                .json({ error: `Streamer "${streamer_username}" not found` });
            return;
        }
        const streamerId = usernameSnap.data().uid;
        // ── Find active session ──
        const sessSnap = await adminInit_1.db
            .collection("sessions")
            .where("streamerId", "==", streamerId)
            .where("status", "==", "active")
            .limit(1)
            .get();
        if (sessSnap.empty) {
            res
                .status(409)
                .json({ error: "Streamer does not have an active session" });
            return;
        }
        const sessionId = sessSnap.docs[0].id;
        // ── Get packages for auto-detect ──
        const userSnap = await adminInit_1.db.collection("users").doc(streamerId).get();
        const packages = userSnap.exists
            ? (userSnap.data().packages || [])
            : [];
        // ── Auto-detect ──
        const detectResult = (0, autoDetect_1.autoDetectPackage)(nominal, packages);
        let jalur = detectResult.jalur;
        let totalGames = detectResult.gameCount;
        let approvalType = "auto";
        if (!detectResult.matched) {
            jalur = "normal";
            totalGames = 1;
            approvalType = "manual";
        }
        // ── Create queue entry ──
        const now = adminInit_1.Timestamp.now();
        const entryRef = await adminInit_1.db.collection("queueEntries").add({
            sessionId,
            streamerId,
            mlId,
            jalur,
            totalGames,
            gamesPlayed: 0,
            gamesRemaining: totalGames,
            status: "waiting",
            createdAt: now,
            orderedAt: now,
            isCarryOver: false,
            approvalType,
            nominalDonasi: nominal,
        });
        console.log(`[Sociabuzz] ✅ Added ${mlId} → ${totalGames} game ${jalur} (${approvalType})`);
        res.status(200).json({
            success: true,
            entryId: entryRef.id,
            mlId,
            jalur,
            totalGames,
            approvalType,
            detected: detectResult.matched
                ? `Auto-detected: ${totalGames} game ${jalur === "fast_track" ? "Fast Track" : "Normal"}`
                : `Anomaly: nominal Rp ${nominal.toLocaleString("id-ID")} — manual review`,
            donor_name: donor_name || "Anonymous",
        });
    }
    catch (error) {
        console.error("Sociabuzz webhook error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
//# sourceMappingURL=sociabuzz.js.map