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
 * Uses Firebase Admin SDK (server-side) to bypass security rules.
 *
 * ──────────────────────────────────────────────
 * Query param:
 *   ?username=jessnolimit
 *
 * Expected request body (Sociabuzz format):
 * {
 *   "nominal": 51000,
 *   "Nama Pendukung": "Budi",
 *   "Pesan dari Pendukung": "166047234 gas kak mau bareng"
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
    let body: Record<string, string> = {};
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      body = await request.json();
    } else if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      formData.forEach((value, key) => { body[key] = value.toString(); });
    } else {
      // fallback: coba JSON dulu, kalau gagal coba form
      try {
        body = await request.json();
      } catch {
        const formData = await request.formData();
        formData.forEach((value, key) => { body[key] = value.toString(); });
      }
    }

    const nominal_raw = body["nominal"];
    const donor_name = body["Nama Pendukung"] || "Anonymous";
    const message = body["Pesan dari Pendukung"];

    // ── Validate required fields ──
    if (!nominal_raw || !message) {
      return NextResponse.json(
        {
          error: "Missing required fields: nominal, Pesan dari Pendukung",
          received_fields: Object.keys(body),
          received_body: body,
          content_type: contentType,
        },
        { status: 400 }
      );
    }

    const nominal = Number(nominal_raw);
    if (isNaN(nominal) || nominal <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    // ── Extract ML ID from message ──
    const mlIdMatch = message.trim().match(/^(\d+)/);
    if (!mlIdMatch) {
      return NextResponse.json(
        {
          error: "Could not extract ML ID from message. Message must start with a numeric ML ID.",
          message_received: message,
        },
        { status: 400 }
      );
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

    // ── Get streamer's packages for auto-detect ──
    const userSnap = await adminDb.collection("users").doc(streamerId).get();
    let packages: Package[] = [];

    if (userSnap.exists) {
      packages = (userSnap.data()!.packages || []) as Package[];
    }

    // ── Auto-detect package from nominal ──
    const detectResult = autoDetectPackage(nominal, packages);

    let jalur: Jalur = detectResult.jalur;
    let totalGames = detectResult.gameCount;
    let approvalType: "auto" | "manual" = "auto";

    if (!detectResult.matched) {
      jalur = "normal";
      totalGames = 1;
      approvalType = "manual";
    }

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
      approvalType,
      nominalDonasi: nominal,
    });

    return NextResponse.json({
      success: true,
      entryId: entryRef.id,
      mlId,
      jalur,
      totalGames,
      approvalType,
      detected: detectResult.matched
        ? `Auto-detected: ${totalGames} game ${jalur === "fast_track" ? "Fast Track" : "Normal"}`
        : `Anomaly: nominal Rp ${nominal.toLocaleString("id-ID")} tidak cocok dengan paket manapun. Ditambahkan sebagai 1 game Normal (manual review).`,
      donor_name,
    });
  } catch (error) {
    console.error("Sociabuzz webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
