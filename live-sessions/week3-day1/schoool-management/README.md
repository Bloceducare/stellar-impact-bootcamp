# Soroban Project

## Project Structure

This repository uses the recommended structure for a Soroban project:

```text
.
├── contracts
│   └── hello_world
│       ├── src
│       │   ├── lib.rs
│       │   └── test.rs
│       └── Cargo.toml
├── Cargo.toml
└── README.md
```

- New Soroban contracts can be put in `contracts`, each in their own directory. There is already a `hello_world` contract in there to get you started.
- If you initialized this project with any other example contracts via `--with-example`, those contracts will be in the `contracts` directory as well.
- Contracts should have their own `Cargo.toml` files that rely on the top-level `Cargo.toml` workspace for their dependencies.
- Frontend libraries can be added to the top-level directory as well. If you initialized this project with a frontend template via `--frontend-template` you will have those files already included.

# School Management Smart Contract

A simple school management system built on the Stellar Soroban smart contract platform using Rust and the Soroban SDK.

## Features Added

### 1. Update Student Class
Allows updating a student's class after registration.

#### Function
```rust
update_student_class(env, student_id, new_class)
```

#### What it does
- Fetches the student from storage
- Updates the student's class
- Saves the updated record back to blockchain storage

---

### 2. Get Student Payment History
Retrieves all payment records made by a student.

#### Function
```rust
get_payment_history(env, student_id)
```

#### What it does
- Fetches the student's payment vector from persistent storage
- Returns all payment records including:
  - student ID
  - amount paid
  - payment timestamp

---

### 3. Remove Student (Soft Delete)
Marks a student as inactive instead of permanently deleting data.

#### Function
```rust
remove_student(env, student_id)
```

#### What it does
- Updates `is_registered` to `false`
- Preserves student payment history and audit records
- Prevents permanent data loss

---

# Tests Added

## test_update_student_class
Verifies that:
- a student can be registered
- the student's class can be updated
- updated data persists correctly

---

## test_get_payment_history
Verifies that:
- payment records are stored correctly
- payment history retrieval works
- stored payment data matches expected values

---

## test_remove_student
Verifies that:
- a student can be soft deleted
- `is_registered` changes to `false`
- student data remains accessible after removal

---

# Concepts Learned

This project demonstrates:
- Soroban smart contract development
- Persistent blockchain storage
- Authentication with `require_auth()`
- Token transfers using Soroban token contracts
- Event publishing
- Vector storage and retrieval
- Smart contract testing in Rust
- Soft delete design pattern
- Role-based data management concepts

---

# Tech Stack

- Rust
- Soroban SDK
- Stellar Blockchain

---

# Running Tests

```bash
cargo test
```