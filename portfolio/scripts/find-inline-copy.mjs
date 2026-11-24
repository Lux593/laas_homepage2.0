/**
 * Findet Text, der noch direkt in Komponenten steht statt im Wörterbuch.
 *
 * Warum: sichtbarer Text in einer .tsx-Datei ist genau der, den die englische
 * Version vergessen würde. Der Befehl ist die Checkliste für den Umzug in die
 * Wörterbücher und danach der Wächter, dass nichts zurückwandert.
 *
 * Gemeldet wird (jeweils `datei:zeile`):
 *   - JSX-Text mit mindestens zwei Buchstaben        <p>Hallo Welt</p>
 *   - String-/Template-Werte in Text-Attributen      aria-label, alt, title,
 *     placeholder, label, eyebrow, lede
 *   - GROSSGESCHRIEBENE const mit Array aus Strings   const ROTATING_WORDS = [...]
 *
 * Aufruf:
 *   node scripts/find-inline-copy.mjs src/components src/app
 *   node scripts/find-inline-copy.mjs src/components/sections/Hero.tsx
 *
 * Exit-Code 1 bei Funden. `typescript` kommt aus node_modules, es gibt keine
 * eigene Abhängigkeit dafür.
 */

import { createRequire } from "node:module";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const require = createRequire(import.meta.url);
const ts = require("typescript");

/** Attribute, deren String-Wert sichtbarer oder vorgelesener Text ist. */
const COPY_ATTRS = new Set([
  "aria-label",
  "alt",
  "title",
  "placeholder",
  "label",
  "eyebrow",
  "lede",
]);

const letters = (s) => (s.match(/\p{L}/gu) ?? []).length;

/** Alle .tsx-Dateien unter den Argumenten, sortiert. */
function collect(target, out = []) {
  const stat = statSync(target);
  if (stat.isFile()) {
    if (target.endsWith(".tsx")) out.push(target);
  } else if (stat.isDirectory()) {
    for (const name of readdirSync(target).sort()) {
      if (name === "node_modules" || name.startsWith(".")) continue;
      collect(join(target, name), out);
    }
  }
  return out;
}

/** Packt `as const`, `satisfies` und Klammern aus. */
function unwrap(node) {
  while (
    node &&
    (ts.isAsExpression(node) ||
      ts.isSatisfiesExpression(node) ||
      ts.isTypeAssertionExpression(node) ||
      ts.isParenthesizedExpression(node))
  ) {
    node = node.expression;
  }
  return node;
}

const isStringLike = (n) =>
  n && (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n));

/** Der feste Textanteil eines String- oder Template-Literals, sonst null. */
function literalText(n) {
  if (isStringLike(n)) return n.text;
  if (n && ts.isTemplateExpression(n)) {
    return n.head.text + n.templateSpans.map((s) => s.literal.text).join("");
  }
  return null;
}

function scan(file) {
  const text = readFileSync(file, "utf8");
  const sf = ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const findings = [];

  const report = (pos, kind, excerpt) => {
    const line = sf.getLineAndCharacterOfPosition(pos).line + 1;
    const short = excerpt.replace(/\s+/g, " ").trim().slice(0, 60);
    findings.push(
      `${relative(process.cwd(), file)}:${line}  ${kind}: ${JSON.stringify(short)}`,
    );
  };

  const visit = (node) => {
    if (ts.isJsxText(node)) {
      // Entities (&nbsp;, &amp;) sind keine Wörter und zählen nicht mit.
      const raw = node.text.replace(/&#?\w+;/g, " ");
      if (letters(raw) >= 2) {
        // Zeile des ersten sichtbaren Zeichens, nicht des Umbruchs davor.
        const lead = node.text.length - node.text.trimStart().length;
        report(node.pos + lead, "JSX-Text", node.text);
      }
    } else if (
      ts.isJsxAttribute(node) &&
      COPY_ATTRS.has(node.name.getText(sf))
    ) {
      const init = node.initializer;
      const value = init && ts.isJsxExpression(init) ? init.expression : init;
      const fixed = literalText(value);
      if (fixed !== null && letters(fixed) > 0) {
        report(node.getStart(sf), `Attribut ${node.name.getText(sf)}`, fixed);
      }
    } else if (
      ts.isVariableStatement(node) &&
      node.declarationList.flags & ts.NodeFlags.Const
    ) {
      for (const decl of node.declarationList.declarations) {
        const init = unwrap(decl.initializer);
        if (
          ts.isIdentifier(decl.name) &&
          /^[A-Z][A-Z0-9_]*$/.test(decl.name.text) &&
          init &&
          ts.isArrayLiteralExpression(init) &&
          init.elements.length > 0 &&
          init.elements.every(isStringLike) &&
          init.elements.some((e) => letters(e.text) > 0)
        ) {
          report(
            decl.getStart(sf),
            `Konstante ${decl.name.text}`,
            init.elements.map((e) => e.text).join(", "),
          );
        }
      }
    }
    ts.forEachChild(node, visit);
  };

  visit(sf);
  return findings;
}

const targets = process.argv.slice(2);
if (targets.length === 0) {
  console.error(
    "Aufruf: node scripts/find-inline-copy.mjs <datei-oder-ordner…>",
  );
  process.exit(2);
}

const files = targets.flatMap((t) => collect(t));
const findings = files.flatMap(scan);
for (const f of findings) console.log(f);
console.log(
  findings.length
    ? `${findings.length} Funde in ${files.length} Dateien`
    : `keine Funde in ${files.length} Dateien`,
);
process.exitCode = findings.length ? 1 : 0;
