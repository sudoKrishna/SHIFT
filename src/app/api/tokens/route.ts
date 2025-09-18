import { NextRequest, NextResponse } from "next/server";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import { connection, getSupportedTokens } from "@/app/lib/constants";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const address = searchParams.get("address");
        if (!address) {
            return NextResponse.json({ error: "Missing address" }, { status: 400 });
        }

        const supportedTokens = await getSupportedTokens();
        const balances = await Promise.all(
            supportedTokens.map((token) => getAccountBalance(token, address))
        );

        // Only return tokens that user actually holds (balance > 0)
        const tokens = supportedTokens
            .map((token, index) => ({
                ...token,
                balance: balances[index].toFixed(6),
                usdBalance: (balances[index] * Number(token.price)).toFixed(2),
            }))
            .filter((t) => Number(t.balance) > 0);

        return NextResponse.json({
            tokens,
            totalBalance: tokens.reduce((acc, val) => acc + Number(val.usdBalance), 0).toFixed(2),
        });
    } catch (e: any) {
        console.error("❌ API /tokens error:", e);
        return NextResponse.json({ error: e.message || "Internal server error" }, { status: 500 });
    }
}

async function getAccountBalance(
    token: {
        name: string;
        mint: string;
        native: boolean;
        decimals: number;
    },
    address: string
) {
    try {
        if (token.native) {
            const balance = await connection.getBalance(new PublicKey(address));
            return balance / LAMPORTS_PER_SOL;
        }

        const ata = await getAssociatedTokenAddress(
            new PublicKey(token.mint),
            new PublicKey(address)
        );

        const account = await getAccount(connection, ata);
        return Number(account.amount) / 10 ** token.decimals;
    } catch {
        return 0; // no ATA or empty account
    }
}
