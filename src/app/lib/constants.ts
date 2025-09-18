import { Connection } from "@solana/web3.js";
import axios from "axios";
import { SUPPORTED_TOKENS, TokenDetails } from "./tokens";

let LAST_UPDATED: number | null = null;
let prices: Record<string, number> = {}; // store tokenName → price

const TOKEN_PRICE_REFRESH_INTERVAL = 60 * 1000; // every 60s

// Use devnet while testing, switch to mainnet later
export const connection = new Connection("https://api.devnet.solana.com", "confirmed");

export async function getSupportedTokens(): Promise<TokenDetails[]> {
    const now = Date.now();

    // Refresh prices only if cache expired
    if (!LAST_UPDATED || now - LAST_UPDATED > TOKEN_PRICE_REFRESH_INTERVAL) {
        try {
            const response = await axios.get(
                "https://price.jup.ag/v6/price?ids=SOL,USDC,USDT"
            );

            // Example response: { data: { SOL: { price: 180.3 }, USDC: { price: 1.0 }, ... } }
            const fetchedPrices = response.data.data;

            // Save normalized into our `prices` object
            prices = {
                SOL: fetchedPrices.SOL?.price ?? 0,
                USDC: fetchedPrices.USDC?.price ?? 0,
                USDT: fetchedPrices.USDT?.price ?? 0,
            };

            LAST_UPDATED = now;
        } catch (e) {
            console.error("❌ Failed to fetch Jupiter prices:", e);
        }
    }

    // Merge supported tokens with live (or fallback) prices
    return SUPPORTED_TOKENS.map((token) => ({
        ...token,
        price: prices[token.name] || Number(token.price), // fallback to static price
    }));
}
