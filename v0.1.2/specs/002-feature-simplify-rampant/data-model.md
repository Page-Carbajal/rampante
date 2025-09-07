# Data Model: Simplify slash command by removing stack selection

No new persistent data entities are introduced by this feature.

Transient artifacts considered:
- `rampante/command/rampante.<epoch>.md`: Timestamped backup files created on update.

Validation rules:
- Backup file must be created before writing the new command definition.
- Backup filenames must be unique at time of creation (use `-N` suffix if needed).

State transitions:
- Command definition state transitions from “current” to “archived (timestamped)” and “current (simplified)”.
