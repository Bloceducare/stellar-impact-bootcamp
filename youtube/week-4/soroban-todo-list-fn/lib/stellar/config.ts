// Stellar / Soroban network configuration
// Update CONTRACT_ID after deploying your contract

export const NETWORK_CONFIG = {
  networkPassphrase: "Test SDF Network ; September 2015",
  rpcUrl: "https://soroban-testnet.stellar.org",
  network: "testnet" as const,
  horizonUrl: "https://horizon-testnet.stellar.org",
} as const;

export const CONTRACT_ID =
  process.env.NEXT_PUBLIC_CONTRACT_ID ||
  "CC4GRK6BISUK3LPKQJLZVFHDQNL2WE4FCILTINRYGFCYPUL2WHFMRSPZ";

export const STELLAR_EXPERT_URL = `https://stellar.expert/explorer/testnet`;
export const STELLAR_EXPERT_CONTRACT_URL = `${STELLAR_EXPERT_URL}/contract/${CONTRACT_ID}`;
