// Builds public/resume-ponlawat.pdf from src/data/portfolio.json using headless Chrome.
// Usage: npm run resume   (set CHROME_PATH if Chrome is not in the default macOS location)
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const data = JSON.parse(readFileSync("src/data/portfolio.json", "utf8"));
const { identity, skillGroups } = data;
const { role, summary, career, education } = data.locales.en;
const chrome = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const output = join(process.cwd(), "public/resume-ponlawat.pdf");

const esc = (value) =>
  String(value).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const bare = (url) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${esc(identity.name)} — Resume</title>
<style>
  @page { size: A4; margin: 16mm 16mm 14mm; }
  * { box-sizing: border-box; }
  body { margin: 0; color: #1b1b18; font: 10pt/1.5 "Helvetica Neue", Arial, sans-serif; }
  header { display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 10pt; border-bottom: 2px solid #e85d2a; }
  h1 { margin: 0; font-size: 24pt; font-weight: 600; letter-spacing: -0.02em; }
  .role { margin: 2pt 0 0; color: #e85d2a; font-size: 11pt; font-weight: 600; }
  .contact { margin: 0; padding: 0; list-style: none; text-align: right; color: #55534d; font-size: 8.5pt; line-height: 1.6; }
  h2 { margin: 16pt 0 6pt; color: #e85d2a; font-size: 8.5pt; letter-spacing: 0.14em; text-transform: uppercase; }
  .summary { margin: 10pt 0 0; }
  .job { display: grid; grid-template-columns: 30mm 1fr; gap: 0 10pt; padding: 7pt 0; border-bottom: 1px solid #e4e1da; break-inside: avoid; }
  .job:last-child { border-bottom: 0; }
  .period { color: #77746d; font-size: 8.5pt; }
  h3 { margin: 0; font-size: 10.5pt; }
  .company { margin: 0; color: #55534d; font-size: 9pt; }
  .job p:last-child { margin: 3pt 0 0; }
  .skills { display: grid; grid-template-columns: 22mm 1fr; gap: 3pt 10pt; margin: 0; }
  .skills dt { font-weight: 600; }
  .skills dd { margin: 0; }
</style></head><body>
<header>
  <div><h1>${esc(identity.name)}</h1><p class="role">${esc(role)}</p></div>
  <ul class="contact">
    <li>${esc(identity.location)} · ${esc(identity.phone)}</li>
    <li>${esc(identity.email)}</li>
    <li>${esc(bare(identity.linkedin))} · ${esc(bare(identity.github))}</li>
    <li>${esc(bare(identity.website))}</li>
  </ul>
</header>
<p class="summary">${esc(summary)} ${esc(identity.experienceYears)} years of experience.</p>
<h2>Experience</h2>
${career
  .map(
    (job) => `<section class="job">
  <div class="period">${esc(job.period)}</div>
  <div><h3>${esc(job.role)}</h3><p class="company">${esc(job.company)}</p><p>${esc(job.description)}</p></div>
</section>`,
  )
  .join("\n")}
<h2>Skills</h2>
<dl class="skills">${skillGroups.map((group) => `<dt>${esc(group.label)}</dt><dd>${esc(group.items.join(" · "))}</dd>`).join("")}</dl>
<h2>Education</h2>
<section class="job">
  <div class="period">${esc(education.period)}</div>
  <div><h3>${esc(education.degree)}</h3><p class="company">${esc(education.school)} · ${esc(education.detail)}</p></div>
</section>
</body></html>`;

const htmlPath = join(mkdtempSync(join(tmpdir(), "resume-")), "resume.html");
writeFileSync(htmlPath, html);
execFileSync(chrome, [
  "--headless",
  "--disable-gpu",
  "--no-pdf-header-footer",
  `--print-to-pdf=${output}`,
  pathToFileURL(htmlPath).href,
]);
console.log(`Resume written to ${output}`);
