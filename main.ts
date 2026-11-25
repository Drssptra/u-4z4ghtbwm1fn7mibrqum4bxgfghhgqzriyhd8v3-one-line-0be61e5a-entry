/**
 * one-line-one-laugh — v2 resubmission entry writer.
 *
 * What this does, in one sentence: it materialises the competition entry
 * (a single funny line) as a file named `entry.txt` inside the directory
 * named by MAKEFUN_OUTPUT_DIR, with no trailing newline byte.
 *
 * Why no trailing newline matters: the sealed checker compares the file
 * contents byte for byte against the entry, so even one extra `\n` at the
 * end would change the result. Everything here is pure Node 22 standard
 * library, synchronous, offline, and deterministic — run it ten times and
 * you get the identical file ten times.
 */

import * as fs from "node:fs";
import * as path from "node:path";

/* ------------------------------------------------------------------ */
/* The entry itself                                                    */
/* ------------------------------------------------------------------ */

// Assembled from parts so the line reads as setup -> turn -> punchline,
// while the joined result is still exactly one line of plain text.
const SETUP = "My therapist says I use humour as a defence mechanism";
const TURN = "rich, coming from someone who charges $150 an hour";
const PUNCH = "to laugh at it.";

const ENTRY_TEXT: string = [SETUP, " — ", TURN, " ", PUNCH].join("");

/* ------------------------------------------------------------------ */
/* Rules the entry has to satisfy (competition.yaml: 1–140 chars)      */
/* ------------------------------------------------------------------ */

const RULES = {
  minChars: 1,
  maxChars: 140,
  // A "line" here means: no line-break characters anywhere in the text.
  forbidden: /[\r\n\u2028\u2029]/,
} as const;

/** Count grapheme-ish units via code-point iteration (em dash = 1). */
function countChars(text: string): number {
  return Array.from(text).length;
}

/**
 * Returns a list of every rule the text breaks; empty list = valid.
 * Collecting all failures (instead of throwing on the first) makes the
 * failure message diagnostic rather than a bare yes/no.
 */
function findProblems(text: string): string[] {
  const problems: string[] = [];
  const n = countChars(text);
  if (n < RULES.minChars) problems.push(`too short: ${n} chars`);
  if (n > RULES.maxChars) problems.push(`too long: ${n} chars (max ${RULES.maxChars})`);
  if (RULES.forbidden.test(text)) problems.push("contains a line break");
  if (text.trim().length === 0) problems.push("blank / whitespace only");
  return problems;
}

/* ------------------------------------------------------------------ */
/* Output location                                                     */
/* ------------------------------------------------------------------ */

/** Resolve the output directory, falling back to /output when unset. */
function resolveOutDir(): string {
  const raw = process.env.MAKEFUN_OUTPUT_DIR;
  const trimmed = typeof raw === "string" ? raw.trim() : "";
  return trimmed.length > 0 ? trimmed : "/output";
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

function main(): void {
  const problems = findProblems(ENTRY_TEXT);
  if (problems.length > 0) {
    throw new Error(`Entry failed validation: ${problems.join("; ")}`);
  }

  const outDir = resolveOutDir();
  fs.mkdirSync(outDir, { recursive: true });
  const target = path.resolve(outDir, "entry.txt");
  // "utf8" + a plain string: writeFileSync writes exactly these bytes,
  // nothing appended, no newline added.
  fs.writeFileSync(target, ENTRY_TEXT, { encoding: "utf8" });

  // Belt-and-braces: read the file back and confirm it round-trips
  // byte-exactly before reporting success. If the disk write had
  // silently altered anything, fail loudly instead of passing silently.
  const written = fs.readFileSync(target, "utf8");
  if (written !== ENTRY_TEXT) {
    throw new Error("entry.txt did not round-trip byte-exactly");
  }

  process.stdout.write(ENTRY_TEXT + "\n");
}

main();
