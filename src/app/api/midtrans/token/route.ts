import { NextResponse } from "next/server";
// @ts-expect-error No type definitions for midtrans-client
import midtransClient from "midtrans-client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tier, price, userId, email, name } = body;

    if (!tier || !price || !userId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY || "",
      clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "",
    });

    const orderId = `SUB-${userId}-${Date.now()}`;

    const parameters = {
      transaction_details: {
        order_id: orderId,
        gross_amount: price,
      },
      customer_details: {
        first_name: name || "Streamer",
        email: email || "streamer@example.com",
      },
      item_details: [
        {
          id: tier,
          price: price,
          quantity: 1,
          name: `QueueBareng ${tier.charAt(0).toUpperCase() + tier.slice(1)} Subscription`,
        },
      ],
      custom_field1: userId,
      custom_field2: tier,
    };

    const transaction = await snap.createTransaction(parameters);

    return NextResponse.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    });
  } catch (error: any) {
    console.error("Midtrans Snap Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
