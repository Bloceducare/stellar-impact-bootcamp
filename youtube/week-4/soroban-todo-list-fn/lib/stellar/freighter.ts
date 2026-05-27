/**
 * Freighter Wallet Adapter
 *
 * Integrates with the Freighter browser extension (https://freighter.app)
 * which is the canonical Stellar wallet for web dApps.
 *
 * Install: pnpm add @stellar/freighter-api
 */

import type {
  FreighterModule,
  SignTransactionParams,
} from "./freighter.types";

// Dynamic import to avoid SSR issues in Next.js
let freighterApi: FreighterModule | null = null;

async function getFreighter(): Promise<FreighterModule> {
  if (freighterApi) return freighterApi;
  const mod = await import("@stellar/freighter-api");
  freighterApi = mod as unknown as FreighterModule;
  return freighterApi;
}

// ── Detection ─────────────────────────────────────────────────────────────────

export async function isFreighterInstalled(): Promise<boolean> {
  try {
    const f = await getFreighter();
    return await f.isConnected();
  } catch {
    return false;
  }
}

// ── Connection ────────────────────────────────────────────────────────────────

export interface WalletAccount {
  publicKey: string;
  network: string;
  networkPassphrase: string;
}

export async function connectFreighter(): Promise<WalletAccount> {
  const f = await getFreighter();

  // Request access (shows Freighter popup)
  const accessResult = await f.requestAccess();
  if (accessResult.error) {
    throw new Error(accessResult.error);
  }

  const publicKey = accessResult.address;
  if (!publicKey) throw new Error("Freighter returned empty address");

  const networkResult = await f.getNetwork();
  if (networkResult.error) {
    throw new Error(networkResult.error);
  }

  return {
    publicKey,
    network: networkResult.network ?? "TESTNET",
    networkPassphrase:
      networkResult.networkPassphrase ??
      "Test SDF Network ; September 2015",
  };
}

export async function getConnectedAccount(): Promise<string | null> {
  try {
    const f = await getFreighter();
    const connected = await f.isConnected();
    if (!connected) return null;

    const result = await f.getAddress();
    return result.address ?? null;
  } catch {
    return null;
  }
}

// ── Signing ───────────────────────────────────────────────────────────────────

export interface SignedTransaction {
  signedTxXdr: string;
}

export async function signTransaction(
  unsignedXdr: string,
  networkPassphrase: string
): Promise<SignedTransaction> {
  const f = await getFreighter();

  const result = await f.signTransaction(unsignedXdr, {
    networkPassphrase,
  } as SignTransactionParams);

  if (result.error) {
    throw new Error(result.error);
  }

  return { signedTxXdr: result.signedTxXdr ?? result.signedTransactionXdr ?? "" };
}
