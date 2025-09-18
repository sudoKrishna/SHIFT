import { TokenDetails } from "@/app/lib/tokens";
import axios from "axios";
import { useEffect, useState } from "react";

export interface TokenWithbalance extends TokenDetails {
  balance: number;
  usdBalance: number;
  price?: number;
}

export function useTokens(address: string) {
  const [tokenBalances, setTokenBalances] = useState<{
    totalBalance: number;
    tokens: TokenWithbalance[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  if (!address) return;

  setLoading(true);

  axios
    .get(`/api/tokens?address=${address}`)
    .then((res) => {
      const data = res.data;

      const tokens = (data.tokens || []).map((t: any): TokenWithbalance => ({
        name: t.name ?? "Unknown",
        mint: t.mint ?? "",
        native: t.native ?? false,
        image: t.image ?? "/default-token.png",
        decimals: t.decimals ?? 0,
        balance: Number(t.balance) || 0,
        usdBalance: Number(t.usdBalance) || 0,
        price: Number(t.price) || 0,
      }));

      setTokenBalances({
        totalBalance: Number(data.totalBalance) || 0,
        tokens,
      });
    })
    .catch((err) => {
      console.error("Failed to fetch tokens:", err);
      setTokenBalances({ totalBalance: 0, tokens: [] });
    })
    .finally(() => setLoading(false));
}, [address]);   // 👈 fix here


  return { loading, tokenBalances };
}
