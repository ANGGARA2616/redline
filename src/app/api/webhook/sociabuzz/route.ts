import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { autoDetectPackage } from "@/lib/autoDetect";
import type { Package, Jalur } from "@/types";
import { Timestamp } from "firebase-admin/firestore";

/**
 * POST /api/webhook/sociabuzz?username=<streamer_username>
 *
 * Urutan pengecekan (penting — tier dicek lebih awal agar tidak bisa dibypass):
 *   1. Query param username ada
 *   2. Body valid (amount + message)
 *   3. Streamer ditemukan di Firestore
 *   4. Tier streamer adalah Pro atau Pro+ (gate utama)
 *   5. Currency IDR
 *   6. Pesan mengandung ML ID
 *   7. Sesi aktif tersedia
 *   8. Nominal cocok dengan paket
 *   9. Buat queue entry
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

    if (!nominal_raw || !message) {
      return NextResponse.json(
        { error: "Missing required fields: amount, message" },
        { status: 400 }
      );
    }

    // ── Look up streamer (dilakukan lebih awal agar tier bisa dicek) ──
    const slug = streamer_username.toLowerCase();
    const usernameSnap = await adminDb.collection("usernames").doc(slug).get();

    if (!usernameSnap.exists) {
      return NextResponse.json(
        { error: `Streamer "${streamer_username}" not found` },
        { status: 404 }
      );
    }

    const streamerId = usernameSnap.data()!.uid;

    // ── Get streamer profile ──
    const userSnap = await adminDb.collection("users").doc(streamerId).get();
    let packages: Package[] = [];

    if (userSnap.exists) {
      const userData = userSnap.data()!;
      packages = (userData.packages || []) as Package[];

      // ── Gate: webhook hanya untuk Pro dan Pro+ ──
      const tier: string = userData.subscription?.tier ?? "expired";
      if (tier !== "pro" && tier !== "pro_plus" && tier !== "trial") {
        return NextResponse.json(
          { error: "Fitur webhook tidak tersedia pada paket ini. Upgrade ke Pro untuk mengaktifkan." },
          { status: 403 }
        );
      }
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

    // ── Auto-detect package from nominal ──
    const detectResult = autoDetectPackage(nominal, packages);

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
