"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  connectFreighter,
  getConnectedAccount,
  isFreighterInstalled,
  signTransaction,
  type WalletAccount,
} from "@/lib/stellar/freighter";
import { NETWORK_CONFIG } from "@/lib/stellar/config";

// ── Types ─────────────────────────────────────────────────────────────────────

export type WalletStatus =
  | "idle"
  | "checking"
  | "not_installed"
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

export interface WalletContextValue {
  status: WalletStatus;
  account: WalletAccount | null;
  error: string | null;

  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  signTx: (unsignedXdr: string) => Promise<string>;
}

// ── Context ───────────────────────────────────────────────────────────────────

const WalletContext = createContext<WalletContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<WalletStatus>("idle");
  const [account, setAccount] = useState<WalletAccount | null>(null);
  const [error, setError] = useState<string | null>(null);

  // On mount: check if already connected
  useEffect(() => {
    let cancelled = false;

    async function init() {
      setStatus("checking");
      const installed = await isFreighterInstalled();
      if (!installed) {
        if (!cancelled) setStatus("not_installed");
        return;
      }

      const pubKey = await getConnectedAccount();
      if (pubKey && !cancelled) {
        setAccount({
          publicKey: pubKey,
          network: "TESTNET",
          networkPassphrase: NETWORK_CONFIG.networkPassphrase,
        });
        setStatus("connected");
      } else if (!cancelled) {
        setStatus("disconnected");
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  const connect = useCallback(async () => {
    setStatus("connecting");
    setError(null);
    try {
      const acc = await connectFreighter();
      setAccount(acc);
      setStatus("connected");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Connection failed";
      setError(message);
      setStatus("error");
    }
  }, []);

  const disconnect = useCallback(() => {
    setAccount(null);
    setStatus("disconnected");
  }, []);

  const signTx = useCallback(
    async (unsignedXdr: string): Promise<string> => {
      if (!account) throw new Error("Wallet not connected");
      const { signedTxXdr } = await signTransaction(
        unsignedXdr,
        account.networkPassphrase
      );
      return signedTxXdr;
    },
    [account]
  );

  return (
    <WalletContext.Provider
      value={{ status, account, error, connect, disconnect, signTx }}
    >
      {children}
    </WalletContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside <WalletProvider>");
  return ctx;
}
