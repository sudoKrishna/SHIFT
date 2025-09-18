import { authConfig } from "@/app/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import db from "@/app/db";
import { Connection, Keypair, VersionedTransaction } from "@solana/web3.js";

// Define an interface for the quoteResponse
interface QuoteResponse {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  // Add more fields as needed based on Jupiter's /quote API
}

export async function POST(req: NextRequest) {
  const connection = new Connection("https://mainnet.helius-rpc.com/?api-key=5935eb6e-9c4e-4031-b4b6-f1290106d2d6");

  const data: { quoteResponse: QuoteResponse } = await req.json();

  const session = await getServerSession(authConfig);
  console.log(session);

  if (!session?.user) {
    return NextResponse.json(
      { message: "You are not logged in" },
      { status: 401 }
    );
  }

  const solWallet = await db.solWallet.findFirst({
    where: {
      userId: session.user.uid,
    },
  });

  if (!solWallet) {
    return NextResponse.json(
      { message: "Couldn't find associated Solana wallet" },
      { status: 401 }
    );
  }

  const { swapTransaction } = await (
    await fetch("https://quote-api.jup.ag/v6/swap", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quoteResponse: data.quoteResponse,
        userPublicKey: solWallet.publicKey,
        wrapAndUnwrapSol: true,
      }),
    })
  ).json();

  console.log("Jup returned txn");

  const swapTransactionBuf = Buffer.from(swapTransaction, "base64");
  const transaction = VersionedTransaction.deserialize(swapTransactionBuf); // ✅ const instead of var

  const privateKey = getPrivateKeyFromDb(solWallet.privateKey);
  transaction.sign([privateKey]);

  const latestBlockHash = await connection.getLatestBlockhash();

  const rawTransaction = transaction.serialize();
  const txid = await connection.sendRawTransaction(rawTransaction, {
    skipPreflight: true,
    maxRetries: 2,
  });

  await connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: txid,
  });

  return NextResponse.json({ txid });
}

function getPrivateKeyFromDb(privateKey: string): Keypair {
  const arr = privateKey.split(",").map(Number);
  const privateKeyUintArr = Uint8Array.from(arr);
  return Keypair.fromSecretKey(privateKeyUintArr);
}
