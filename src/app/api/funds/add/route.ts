import { NextResponse } from "next/server";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

// POST /api/funds/add
export async function POST(req: Request) {
  try {
    const { publicKey } = await req.json();
    if (!publicKey) {
      return NextResponse.json({ error: "Missing publicKey" }, { status: 400 });
    }

    const connection = new Connection("https://api.devnet.solana.com", "confirmed");

    // Airdrop 1 SOL for testing
    const signature = await connection.requestAirdrop(
      new PublicKey(publicKey),
      1 * LAMPORTS_PER_SOL
    );

    return NextResponse.json({ txSig: signature });
  } catch (err: any) {
    console.error("Error in /api/funds/add", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
