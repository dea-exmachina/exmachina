#!/usr/bin/env node
// render.mjs — fills {{handlebars}} in a template file with values from a JSON answers file.
//
// Usage:
//   node render.mjs <template-path> <answers-json-path> [out-path]
//
// If out-path is omitted, prints to stdout.
//
// Template syntax:
//   {{key}}            — replaced with answers[key]
//   {{key|default}}    — replaced with answers[key] or "default" if key missing
//   {{!comment}}       — stripped before output (template-only comments)
//
// No conditionals, no loops, no logic. Renderers should stay dumb so templates
// stay readable and answers stay debuggable. If a template needs logic, write
// a separate generator — don't grow this script.

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

function die(msg) {
  console.error(`render: ${msg}`);
  process.exit(1);
}

const [, , templatePath, answersPath, outPath] = process.argv;

if (!templatePath || !answersPath) {
  die('usage: render.mjs <template-path> <answers-json-path> [out-path]');
}

if (!fs.existsSync(templatePath)) die(`template not found: ${templatePath}`);
if (!fs.existsSync(answersPath)) die(`answers not found: ${answersPath}`);

const template = fs.readFileSync(templatePath, 'utf8');
let answers;
try {
  answers = JSON.parse(fs.readFileSync(answersPath, 'utf8'));
} catch (e) {
  die(`could not parse answers JSON: ${e.message}`);
}

// Strip template-only comments first.
let rendered = template.replace(/\{\{!.*?\}\}/g, '');

// Replace {{key|default}} and {{key}}.
rendered = rendered.replace(/\{\{\s*([\w.]+)\s*(?:\|\s*([^}]*?))?\s*\}\}/g, (match, key, def) => {
  const val = key.split('.').reduce((acc, k) => (acc != null ? acc[k] : undefined), answers);
  if (val !== undefined && val !== null) return String(val);
  if (def !== undefined) return def;
  // Unfilled handlebars are an error — fail loud, don't silently render half a file.
  console.error(`render: missing answer for {{${key}}} in ${path.basename(templatePath)}`);
  process.exit(2);
});

if (outPath) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, rendered);
  console.error(`render: wrote ${outPath}`);
} else {
  process.stdout.write(rendered);
}
