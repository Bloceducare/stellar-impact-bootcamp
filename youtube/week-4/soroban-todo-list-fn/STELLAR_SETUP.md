# Soroban Todo — Stellar dApp Frontend

A decentralized todo app powered by a Soroban smart contract on Stellar testnet.

## Stack

- **Next.js 16** (App Router)
- **@stellar/stellar-sdk** — transaction building, XDR encoding, RPC calls
- **@stellar/freighter-api** — Freighter browser wallet integration
- **Tailwind CSS v4** + shadcn/ui components

---

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and set your deployed contract ID:

```
NEXT_PUBLIC_CONTRACT_ID=C...your...contract...id
```

### 3. Install Freighter wallet

Install the [Freighter browser extension](https://freighter.app), create a wallet,
and switch it to **Testnet** mode (Settings → Network → Testnet).

Fund your testnet account at: https://laboratory.stellar.org/#account-creator

### 4. Run

```bash
pnpm dev
```

---

## Architecture

```
lib/stellar/
  config.ts            ← network config, contract ID
  contract.ts          ← Soroban contract client (build/simulate/submit tx)
  freighter.ts         ← Freighter wallet adapter (connect/sign)
  freighter.types.ts   ← type shims
  wallet-context.tsx   ← React context + WalletProvider

hooks/
  use-get-todos.ts     ← read todos from chain (simulation, no wallet)
  use-create-todo.ts   ← build → sign → submit: create_todo()
  use-update-todo.ts   ← build → sign → submit: update_todo()
  use-delete-todo.ts   ← build → sign → submit: delete_todo()

components/
  wallet-connect.tsx   ← connect/disconnect button + address display
  tx-status-badge.tsx  ← building/signing/submitting/success/error badge
  todo-input.tsx       ← create task form (wired to useCreateTodo)
  todo-item.tsx        ← todo row with inline edit (useUpdateTodo, useDeleteTodo)
  todo-list.tsx        ← main list container (useGetTodos + all hooks)
```

## Transaction flow

Every write operation follows this pattern:

```
1. Build unsigned tx (simulate on RPC to get fee/auth)
2. Request Freighter to sign → user approves in extension popup
3. Submit signed XDR to Soroban RPC
4. Poll getTransaction until SUCCESS or FAILED
5. Refresh todo list from chain
```

## Contract reference

```rust
pub fn create_todo(env: &Env, title: String, description: String) -> Todo
pub fn update_todo(env: &Env, id: u32, new_title: String, new_description: String) -> bool
pub fn delete_todo(env: &Env, id: u32) -> bool
pub fn get_todos(env: &Env) -> Vec<Todo>
pub fn get_next_id(env: &Env) -> u32
```
