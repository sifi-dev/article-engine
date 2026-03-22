---
title: Writing Pure Functions in TypeScript
date: 2026-03-01
---

A pure function does exactly two things: it takes inputs and returns an output, with no side effects and no dependence on external state. The same arguments always produce the same result.

That constraint sounds limiting. In practice, it makes code much easier to reason about, test, and refactor.

## What Makes a Function Pure

Two rules:

1. **Deterministic** — identical inputs always produce identical outputs
2. **No side effects** — no mutation, no I/O, no reading from external state

```typescript
// Impure: depends on external state
let taxRate = 0.2;
const calculateTax = (amount: number) => amount * taxRate;

// Pure: all inputs are explicit
const calculateTax = (amount: number, rate: number): number => amount * rate;
```

The pure version is immediately testable with no setup.

## Immutability as a Natural Companion

Purity and immutability reinforce each other. When you avoid mutating inputs, functions become composable by default.

```typescript
// Impure: mutates its argument
const addItem = (cart: string[], item: string): void => {
  cart.push(item);
};

// Pure: returns a new array
const addItem = (cart: readonly string[], item: string): readonly string[] => [
  ...cart,
  item,
];
```

Using `readonly` in TypeScript makes the intent explicit and lets the compiler enforce it.

## When to Allow Impurity

Not everything can be pure. Reading from a database, writing to a file, generating a random number — these are inherently impure. The goal is not to eliminate impurity, but to contain it.

Push side effects to the edges of your system. Keep the business logic in pure functions. The impure parts become thin wrappers that call into a pure core.

This structure makes the pure core trivially testable and the impure edges easy to swap out.
