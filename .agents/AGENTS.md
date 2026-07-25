# Phoenix ERP - Agent Core Operational Rules

## 1. Safe UI & Styling Modifications (No Bulk Scripts)
When the user requests minor UI tweaks (e.g., adjusting padding, colors, rounded corners like `rounded-sm`), **NEVER** use broad, codebase-wide custom scripts (like Node.js replace scripts, Bash sed, etc.) to blindly replace text.
**Always use precise file modification tools (`replace_file_content` / `multi_replace_file_content`)** targeted at the specific files and line numbers. Global replacements consistently cause unintended UI regressions.

## 2. Mandatory Checkpoints Before Risky Operations
Before executing any large-scale refactoring, bulk edit, or potentially destructive command (e.g., executing scripts that mutate many files, modifying core layouts), you **MUST** ensure the current progress is saved.
Run `git add . && git commit -m "WIP: checkpoint before risky operation"` to secure the codebase state.

## 3. Strict Prohibition of Blind `git restore`
**NEVER execute `git restore .` or `git checkout -- .` when there is uncommitted work.**
If an error occurs and a rollback is needed, you must use `git diff` to identify the specific broken lines and fix them manually, or selectively restore ONLY the specific files you know were broken. A blanket restore will silently erase all uncommitted progress and lead to severe data loss.

## 4. Preserve Core Logic During UI Redesign (Anti-Overengineering)
When instructed by system prompts or users to apply specific visual styles (like glassmorphism, dark mode, or vibrant colors), **NEVER** completely rewrite or overwrite an existing component from scratch if it already contains functional logic.
**Always modify existing DOM structure iteratively.** You must ensure that all existing state hooks (e.g., `useState`), event handlers (e.g., password visibility toggles), and backend assumptions (e.g., default seeded passwords) are perfectly preserved. Blindly replacing code just to achieve an aesthetic look is strictly prohibited because it destroys business logic.
