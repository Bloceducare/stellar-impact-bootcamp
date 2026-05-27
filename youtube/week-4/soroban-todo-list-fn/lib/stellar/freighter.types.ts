/**
 * Type shims for @stellar/freighter-api
 * The package has evolved its return type shapes; these cover both old and new.
 */

export interface SignTransactionParams {
  networkPassphrase?: string;
  network?: string;
  accountToSign?: string;
}

export interface FreighterModule {
  isConnected: () => Promise<boolean>;
  requestAccess: () => Promise<{
    address?: string;
    error?: string;
  }>;
  getAddress: () => Promise<{ address?: string; error?: string }>;
  getNetwork: () => Promise<{
    network?: string;
    networkPassphrase?: string;
    error?: string;
  }>;
  signTransaction: (
    xdr: string,
    params?: SignTransactionParams
  ) => Promise<{
    signedTxXdr?: string;
    signedTransactionXdr?: string; // older versions
    error?: string;
  }>;
}
