import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { autoDetectPackage } from "@/lib/autoDetect";
import type { Package, Jalur } from "@/types";
import { Timestamp } from "firebase-admin/firestore";

/**
 * POST /api/webhook/sociabuzz?username=<streamer_username>
 *
 * Receives donation notifications from Sociabuzz and automatically
 * adds entries to the streamer's active queue session.
 *
 * Entry HANYA dibuat jika semua kondisi terpenuhi:
 *   1. Currency adalah IDR
 *   2. Pesan mengandung ML ID (angka)
 *   3. Nominal cocok dengan salah satu paket streamer
 *
 * Jika salah satu kondisi tidak terpenuhi → return 200 OK dengan
 * { skipped: true, reason: "..." } agar Sociabuzz tidak retry.
 *
 * ──────────────────────────────────────────────
 * Query param:
 *   ?username=jessnolimit
 *
 * Expected request body (Sociabuzz format):
 * {
 *   "amount": 10000,
 *   "currency": "IDR",
 *   "supporter": "Budi",
 *   "message": "166047234 gas kak mau bareng",
 *   ... (fields lain dari Sociabuzz diabaikan)
 * }
 * ──────────────────────────────────────────────
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const streamer_username = searchParams.get("username");

    if (!streamer_username) {
      return NextResponse.json(
        { error: "Missing query param: username" },
        { status: 400 }
      );
    }

    // ── Parse body (JSON or form-urlencoded) ──
    let body: Record<string, unknown> = {};
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      body = await request.json();
    } else if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      formData.forEach((value, key) => { body[key] = value.toString(); });
    } else {
      try {
        body = await request.json();
      } catch {
        const formData = await request.formData();
        formData.forEach((value, key) => { body[key] = value.toString(); });
      }
    }

    const nominal_raw = body["amount"];
    const currency = (body["currency"] as string) || "IDR";
    const donor_name = (body["supporter"] as string) || "Anonymous";
    const message = body["message"] as string;

    // ── Validate required fields ──
    if (!nominal_raw || !message) {
      return NextResponse.json(
        { error: "Missing required fields: amount, message" },
        { status: 400 }
      );
    }

    // ── Skip non-IDR currency ──
    if (currency.toUpperCase() !== "IDR") {
      return NextResponse.json({
        skipped: true,
        reason: `Currency ${currency} bukan IDR, tidak diproses`,
      });
    }

    const nominal = Number(nominal_raw);
    if (isNaN(nominal) || nominal <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    // ── Skip jika tidak ada ML ID di pesan ──
    const mlIdMatch = message.trim().match(/(\d+)/);
    if (!mlIdMatch) {
      return NextResponse.json({
        skipped: true,
        reason: "Pesan tidak mengandung ML ID",
      });
    }
    const mlId = mlIdMatch[1];

    // ── Look up streamer via Admin SDK ──
    const slug = streamer_username.toLowerCase();
    const usernameSnap = await adminDb.collection("usernames").doc(slug).get();

    if (!usernameSnap.exists) {
      return NextResponse.json(
        { error: `Streamer "${streamer_username}" not found` },
        { status: 404 }
      );
    }

    const streamerId = usernameSnap.data()!.uid;

    // ── Find active session ──
    const sessSnap = await adminDb
      .collection("sessions")
      .where("streamerId", "==", streamerId)
      .where("status", "==", "active")
      .limit(1)
      .get();

    if (sessSnap.empty) {
      return NextResponse.json(
        { error: "Streamer does not have an active session" },
        { status: 409 }
      );
    }

    const sessionId = sessSnap.docs[0].id;

    // ── Get streamer profile (packages + subscription) ──
    const userSnap = await adminDb.collection("users").doc(streamerId).get();
    let packages: Package[] = [];

    if (userSnap.exists) {
      const userData = userSnap.data()!;
      packages = (userData.packages || []) as Package[];

      // ── Gate: webhook hanya untuk Pro dan Pro+ ──
      const tier: string = userData.subscription?.tier ?? "expired";
      if (tier === "starter" || tier === "expired") {
        return NextResponse.json({
          skipped: true,
          reason: `Tier ${tier} tidak mendukung webhook otomatis. Upgrade ke Pro untuk mengaktifkan fitur ini.`,
        });
      }
    }

    // ── Auto-detect package from nominal ──
    const detectResult = autoDetectPackage(nominal, packages);

    // ── Skip jika nominal tidak cocok paket manapun ──
    if (!detectResult.matched) {
      return NextResponse.json({
        skipped: true,
        reason: `Nominal Rp ${nominal.toLocaleString("id-ID")} tidak cocok dengan paket manapun`,
      });
    }

    const jalur: Jalur = detectResult.jalur;
    const totalGames = detectResult.gameCount;

    // ── Create queue entry ──
    const now = Timestamp.now();
    const entryRef = await adminDb.collection("queueEntries").add({
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
      approvalType: "auto",
      nominalDonasi: nominal,
    });

    return NextResponse.json({
      success: true,
      entryId: entryRef.id,
      mlId,
      jalur,
      totalGames,
      donor_name,
      detected: `Auto-detected: ${totalGames} game ${jalur === "fast_track" ? "Fast Track" : "Normal"}`,
    });
  } catch (error) {
    console.error("Sociabuzz webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
