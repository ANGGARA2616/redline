import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

/**
 * GET /api/user/[username]
 *
 * Public endpoint that returns uid, username, and displayName
 * for the public queue page and OBS overlay.
 *
 * Uses Firebase Admin SDK to reliably read from Firestore server-side.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const slug = username.toLowerCase();

  try {
    const db = getAdminDb();

    // Try usernames collection first (fast, single doc read)
    const usernameSnap = await db.collection("usernames").doc(slug).get();

    if (usernameSnap.exists) {
      const data = usernameSnap.data()!;
      return NextResponse.json({
        uid: data.uid,
        username: slug,
        displayName: data.displayName || slug,
      });
    }

    // Fallback: query users collection by username field
    const usersSnap = await db
      .collection("users")
      .where("username", "==", slug)
      .limit(1)
      .get();

    if (usersSnap.empty) {
      return NextResponse.json(
        { error: "Streamer tidak ditemukan." },
        { status: 404 }
      );
    }

    const userData = usersSnap.docs[0].data();
    return NextResponse.json({
      uid: usersSnap.docs[0].id,
      username: userData.username,
      displayName: userData.displayName,
    });
  } catch (err) {
    console.error("API /api/user error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
