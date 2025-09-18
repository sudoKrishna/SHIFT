import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { useConnection } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { PrimaryButton } from "./Button";

export const AddFunds = ({ publicKey }: { publicKey: string }) => {
  const { publicKey: connectedWallet, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [loading, setLoading] = useState(false);
  const [txSig, setTxSig] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(0);

  const handleSendFunds = async () => {
    if (!connectedWallet) {
      alert("Please connect a wallet first");
      return;
    }

    if (!amount || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      const destination = new PublicKey(publicKey);

      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: connectedWallet,
          toPubkey: destination,
          lamports: amount * 1e9, // Convert SOL to lamports
        })
      );

      const sig = await sendTransaction(tx, connection);
      setTxSig(sig);
    } catch (err) {
      console.error("Transaction failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-12">
      {/* Step 1: connect wallet */}
      <WalletMultiButton />

      {/* Step 2: input + quick buttons */}
      {connectedWallet && (
        <div className="mt-6">
          <div className="flex items-center gap-4">
            <div>
              <input
                type="number"
                value={amount || ""}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="Enter SOL amount"
                className="border rounded px-3 py-4 w-200"
              />
            </div>
          </div>

          {/* Step 3: buttons below input */}
          <div className="mt-4 flex gap-50 justify-center">
            {[2, 5, 8].map((val) => (
              <button
                key={val}
                onClick={() => setAmount(val)}
                className="bg-gray-100 px-3 py-1 rounded hover:bg-gray-200"
              >
                {val} SOL
              </button>
            ))}
          </div>

          {/* Step 4: Send SOL button */}
          <div className="mt-6 flex justify-center">
            <PrimaryButton
              onClick={handleSendFunds}
              disabled={loading || amount <= 0}
              className="mt-4"
            >
              {loading ? "Sending..." : `Send ${amount || ""} SOL`}
            </PrimaryButton>
          </div>
        </div>
      )}

      {txSig && (
        <div className="mt-4">
          ✅ Transaction:{" "}
          <a
            href={`https://explorer.solana.com/tx/${txSig}?cluster=devnet`}
            target="_blank"
            rel="noreferrer"
            className="text-blue-500 underline"
          >
            View on Explorer
          </a>
        </div>
      )}
    </div>
  );
};
