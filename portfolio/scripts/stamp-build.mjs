/**
 * Schreibt public/build.txt vor jedem Build.
 *
 * Zweck: von aussen beantworten koennen, WELCHER Stand gerade live ist.
 * Genau daran hing die Fehlersuche am Deploy — die Seite zeigte einen alten
 * Build, und ohne Marker war das nur an Textstellen zu erraten.
 *
 * Aufruf ueber das build-Script, nicht als "prebuild": pnpm fuehrt pre/post-
 * Skripte standardmaessig nicht aus (enable-pre-post-scripts=false).
 */
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function git(args) {
  try {
    return execSync(`git ${args}`, { cwd: root, stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return "unbekannt";
  }
}

const info = [
  `build:  ${new Date().toISOString()}`,
  `commit: ${git("rev-parse --short HEAD")}`,
  `betreff: ${git("log -1 --format=%s")}`,
  "",
].join("\n");

const out = join(root, "public", "build.txt");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, info);
console.log(`build.txt geschrieben:\n${info}`);
