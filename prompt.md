# Prompt Log

> Every AI interaction is logged here, including rejected or modified answers and the reason.

| # | Date | AI Tool | Stage | Prompt (summary) | Output (summary) | Decision | Reasoning / Changes made |
|---|------|---------|-------|------------------|------------------|----------|--------------------------|
| 1 | 2026-11-22 | Claude | Diagrams | Structured prompt (role, context, constraints, output format, example) asking for the PayLink domain class diagram in PlantUML, with the agreed entities, design decisions and cardinalities. | Complete PlantUML diagram with 7 packages, Strategy pattern for fees, Adapter pattern for billers. | Modified | Removed FK attributes (relationships are shown as associations). Replaced `String` statuses with enums. Fixed dependency direction to `FeeStrategy ..> FeeRule`. Added role names on User-Payment (customer / agent). Added missing Wallet-Hold association. Kept `0..1` on Payment-LedgerEntry because TOP_UP has no payment, and shared this with the ERD owner so `paymentId` is nullable. |
| 2 | YYYY-MM-DD | Tool name | Stage | What I asked | What the AI returned | Accepted / Modified / Rejected | Why, and exactly what I changed |
| 3 | YYYY-MM-DD | Tool name | Stage | What I asked | What the AI returned | Accepted / Modified / Rejected | Why, and exactly what I changed |


