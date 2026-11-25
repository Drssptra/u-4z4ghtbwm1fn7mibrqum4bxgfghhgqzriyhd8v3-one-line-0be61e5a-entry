// One Line, One Laugh — make.fun entry (competition
// u-4z4ghtbwm1fn7mibrqum4bxgfghhgqzriyhd8v3-one-line-0be61e5a).
// One self-contained funny line: it goes to stdout (with a newline) and to
// $MAKEFUN_OUTPUT_DIR/entry.txt (default /output/entry.txt) as the exact
// text with no trailing newline, so the sealed gate reads it byte for byte.
// Stdlib only, no network, and the same line on every single run.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The joke: one line, one laugh — a purchase with a punchline built in.
const ENTRY =
  "I bought noise-cancelling headphones to ignore people in high definition — best $200 I never heard.";

// The sealed gate counts characters: 1 to 140, a single line, not only
// whitespace. Count code points (not UTF-16 units) so the em dash and any
// other non-ASCII character count as one character each, as the gate does.
const MAX_CHARS = 140;
const charCount = [...ENTRY].length;

if (
  charCount < 1 ||
  charCount > MAX_CHARS ||
  ENTRY.includes("\n") ||
  ENTRY.trim().length === 0
) {
  throw new Error(`Entry must be one line of 1–${MAX_CHARS} characters.`);
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "entry.txt"), ENTRY, "utf8");
console.log(ENTRY);
