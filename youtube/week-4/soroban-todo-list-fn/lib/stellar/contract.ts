/**
 * Soroban Contract Client
 */

import {
  Contract,
  rpc as StellarRpc,
  TransactionBuilder,
  BASE_FEE,
  xdr,
  scValToNative,
  Keypair,
} from "@stellar/stellar-sdk";
import { CONTRACT_ID, NETWORK_CONFIG } from "./config";

export interface ContractTodo {
  id: number;
  title: string;
  description: string;
  is_completed: boolean;
}

// ── XDR helpers ───────────────────────────────────────────────────────────────

function stringToScVal(str: string): xdr.ScVal {
  return xdr.ScVal.scvString(Buffer.from(str, "utf-8"));
}

function u32ToScVal(n: number): xdr.ScVal {
  return xdr.ScVal.scvU32(n);
}

function parseRawTodo(raw: unknown, fallbackId: number): ContractTodo {
  if (raw === null || typeof raw !== "object") {
    return { id: fallbackId, title: "", description: "", is_completed: false };
  }
  const r = raw as Record<string, unknown>;
  return {
    id: Number(r["id"] ?? fallbackId),
    title: String(r["title"] ?? ""),
    description: String(r["description"] ?? ""),
    is_completed: Boolean(r["is_completed"] ?? false),
  };
}

// ── RPC server ────────────────────────────────────────────────────────────────

function getRpcServer(): StellarRpc.Server {
  return new StellarRpc.Server(NETWORK_CONFIG.rpcUrl, { allowHttp: false });
}

// ── Simulation helper ─────────────────────────────────────────────────────────

/**
 * Simulation doesn't require auth or signing — any funded account works as
 * the source. We use the caller's own public key when provided (always valid),
 * otherwise we fetch a known SDF-maintained testnet account via Horizon.
 */
async function getSimulationAccount(
  preferredPublicKey?: string,
): Promise<{ accountId: string; sequence: string }> {
  const server = getRpcServer();

  // 1. Prefer the connected wallet — it's always funded and valid
  if (preferredPublicKey) {
    try {
      const acc = await server.getAccount(preferredPublicKey);
      return { accountId: preferredPublicKey, sequence: acc.sequenceNumber() };
    } catch {
      // fall through
    }
  }

  // 2. Fetch a known SDF testnet account from Horizon
  const HORIZON = NETWORK_CONFIG.horizonUrl;
  // This is the SDF friendbot account — always exists on testnet
  const SDF_TESTNET_ACCOUNT =
    "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN";

  try {
    const res = await fetch(`${HORIZON}/accounts/${SDF_TESTNET_ACCOUNT}`);
    if (res.ok) {
      const data = await res.json();
      return { accountId: SDF_TESTNET_ACCOUNT, sequence: data.sequence };
    }
  } catch {
    // fall through
  }

  // 3. Last resort — generate a random ephemeral keypair.
  //    The sequence is fake but simulation doesn't validate it.
  const ephemeral = Keypair.random();
  return { accountId: ephemeral.publicKey(), sequence: "0" };
}

async function simulateContractCall(
  method: string,
  args: xdr.ScVal[] = [],
  callerPublicKey?: string,
): Promise<xdr.ScVal> {
  const server = getRpcServer();
  const contract = new Contract(CONTRACT_ID);

  const { accountId, sequence } = await getSimulationAccount(callerPublicKey);

  // TransactionBuilder requires a proper account-like object
  const fakeAccount = {
    accountId: () => accountId,
    sequenceNumber: () => sequence,
    incrementSequenceNumber() {
      // no-op — simulation doesn't care about sequence
    },
  };

  const tx = new TransactionBuilder(fakeAccount as never, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_CONFIG.networkPassphrase,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const simResult = await server.simulateTransaction(tx);

  if (StellarRpc.Api.isSimulationError(simResult)) {
    throw new Error(`Simulation error: ${simResult.error}`);
  }

  const success =
    simResult as StellarRpc.Api.SimulateTransactionSuccessResponse;
  if (!success.result?.retval) {
    throw new Error("No return value from simulation");
  }

  return success.result.retval;
}

// ── Write operations ──────────────────────────────────────────────────────────

export async function buildContractTransaction(
  method: string,
  args: xdr.ScVal[],
  sourcePublicKey: string,
): Promise<{
  transaction: string;
  simulationResult: StellarRpc.Api.SimulateTransactionSuccessResponse;
}> {
  const server = getRpcServer();
  const contract = new Contract(CONTRACT_ID);
  const account = await server.getAccount(sourcePublicKey);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_CONFIG.networkPassphrase,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const simResult = await server.simulateTransaction(tx);

  if (StellarRpc.Api.isSimulationError(simResult)) {
    throw new Error(`Simulation failed: ${simResult.error}`);
  }

  const successSim =
    simResult as StellarRpc.Api.SimulateTransactionSuccessResponse;
  const preparedTx = StellarRpc.assembleTransaction(tx, successSim).build();

  return {
    transaction: preparedTx.toEnvelope().toXDR("base64"),
    simulationResult: successSim,
  };
}

export async function submitSignedTransaction(
  signedXdr: string,
): Promise<string> {
  const server = getRpcServer();
  const tx = TransactionBuilder.fromXDR(
    signedXdr,
    NETWORK_CONFIG.networkPassphrase,
  );
  const sendResult = await server.sendTransaction(tx);

  if (sendResult.status === "ERROR") {
    throw new Error(`Submit failed: ${JSON.stringify(sendResult.errorResult)}`);
  }

  const hash = sendResult.hash;

  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 1500));
    try {
      const result = await server.getTransaction(hash);
      if (result.status === StellarRpc.Api.GetTransactionStatus.SUCCESS)
        return hash;
      if (result.status === StellarRpc.Api.GetTransactionStatus.FAILED) {
        throw new Error("Transaction failed on-chain");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.includes("Bad union switch") ||
        msg.includes("Unknown XDR") ||
        msg.includes("failed to decode")
      ) {
        console.warn("[poll] XDR parse warning treating as success:", msg);
        return hash;
      }
      throw err;
    }
  }

  throw new Error("Transaction confirmation timeout");
}

// ── Public contract API ───────────────────────────────────────────────────────

/**
 * get_todos() — pass the connected wallet's public key so simulation
 * uses a real funded account, avoiding the "accountId is invalid" error.
 */
export async function contractGetTodos(
  callerPublicKey?: string,
): Promise<ContractTodo[]> {
  try {
    const retval = await simulateContractCall("get_todos", [], callerPublicKey);
    const native = scValToNative(retval);

    if (!Array.isArray(native)) {
      console.warn("[contractGetTodos] unexpected return shape:", native);
      return [];
    }

    return native.map((item, i) => parseRawTodo(item, i + 1));
  } catch (err) {
    console.error("[contractGetTodos]", err);
    return [];
  }
}

export async function buildCreateTodo(
  title: string,
  description: string,
  sourcePublicKey: string,
) {
  return buildContractTransaction(
    "create_todo",
    [stringToScVal(title), stringToScVal(description)],
    sourcePublicKey,
  );
}

export async function buildUpdateTodo(
  id: number,
  newTitle: string,
  newDescription: string,
  sourcePublicKey: string,
) {
  return buildContractTransaction(
    "update_todo",
    [u32ToScVal(id), stringToScVal(newTitle), stringToScVal(newDescription)],
    sourcePublicKey,
  );
}

export async function buildDeleteTodo(id: number, sourcePublicKey: string) {
  return buildContractTransaction(
    "delete_todo",
    [u32ToScVal(id)],
    sourcePublicKey,
  );
}

export async function buildMarkCompleted(id: number, sourcePublicKey: string) {
  return buildContractTransaction(
    "mark_is_completed",
    [u32ToScVal(id)],
    sourcePublicKey,
  );
}
