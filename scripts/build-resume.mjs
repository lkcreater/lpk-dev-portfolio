// Builds public/resume/Ponlawat_Koeisuwan_Resume_{EN,TH}.pdf with headless Chrome.
// Content: src/data/resume.json (CV copy) + src/data/portfolio.json (contact details).
// Usage: npm run resume   (set CHROME_PATH if Chrome is not in the default macOS location)
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const resume = JSON.parse(readFileSync("src/data/resume.json", "utf8"));
const { identity } = JSON.parse(readFileSync("src/data/portfolio.json", "utf8"));
const chrome = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const outDir = join(root, "public/resume");
const asset = (path) => pathToFileURL(join(root, path)).href;

// Experience entries that fit on page one; the rest continue on page two.
const PAGE_ONE_JOBS = 2;

const esc = (value) =>
  String(value).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const bare = (url) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

const job = (item) => `<article class="job">
  <div class="job-head"><h3>${esc(item.role)}</h3><span class="period">${esc(item.period)}</span></div>
  <p class="company">${esc(item.company)}</p>
  <ul>${item.bullets.map((bullet) => `<li>${esc(bullet)}</li>`).join("")}</ul>
</article>`;

function html(locale) {
  const cv = resume[locale];
  const l = cv.labels;
  const contact = [
    ["Email", identity.email],
    ["Phone", identity.phone],
    ["LinkedIn", bare(identity.linkedin)],
    ["GitHub", bare(identity.github)],
    ["Location", identity.location],
  ];

  return `<!doctype html>
<html lang="${locale}"><head><meta charset="utf-8"><title>${esc(cv.name)} — Resume</title>
<style>
  @font-face { font-family: Geist; src: url("${asset("src/assets/fonts/geist-variable.woff2")}") format("woff2"); font-weight: 100 900; }
  @font-face { font-family: NotoThai; src: url("${asset("src/assets/fonts/noto-sans-thai-variable.woff2")}") format("woff2"); font-weight: 100 900; }
  @page { size: A4; margin: 0; }
  :root { --ink: #121210; --panel: #191916; --text: #eeeae1; --muted: rgba(238, 234, 225, 0.62); --faint: rgba(238, 234, 225, 0.14); --signal: #e85d2a; }
  * { box-sizing: border-box; }
  html, body { margin: 0; background: var(--ink); -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { color: var(--text); font: 8.6pt/1.55 Geist, NotoThai, sans-serif; }
  .page { position: relative; width: 210mm; height: 297mm; padding: 13mm 15mm 13mm; overflow: hidden; break-after: page;
    background: radial-gradient(circle at 88% 6%, rgba(232, 93, 42, 0.16), transparent 70mm), linear-gradient(160deg, #161614, #0e0f0e 60%, #141310); }
  .page:last-child { break-after: auto; }
  .corner { position: absolute; width: 5mm; height: 5mm; border: 0 solid rgba(238, 234, 225, 0.35); }
  .c1 { top: 7mm; left: 7mm; border-width: 0.3mm 0 0 0.3mm; } .c2 { top: 7mm; right: 7mm; border-width: 0.3mm 0.3mm 0 0; }
  .c3 { bottom: 7mm; left: 7mm; border-width: 0 0 0.3mm 0.3mm; } .c4 { bottom: 7mm; right: 7mm; border-width: 0 0.3mm 0.3mm 0; }
  .topbar { display: flex; justify-content: space-between; align-items: center; padding-bottom: 4mm; border-bottom: 0.25mm solid var(--faint);
    color: var(--muted); font-family: ui-monospace, Menlo, monospace; font-size: 6.6pt; letter-spacing: 0.16em; text-transform: uppercase; }
  .logo { width: 21mm; height: 11mm; object-fit: cover; }
  .hero { display: grid; grid-template-columns: 1fr 38mm; gap: 9mm; align-items: end; margin-top: 6mm; }
  h1 { margin: 0; font-size: 27pt; font-weight: 500; line-height: 1.02; letter-spacing: -0.03em; }
  .headline { margin: 2.5mm 0 0; color: var(--signal); font-size: 10pt; font-weight: 600; }
  .summary { margin: 4mm 0 0; color: var(--muted); font-size: 8.8pt; line-height: 1.65; }
  .portrait { width: 38mm; height: 48mm; object-fit: cover; object-position: center 12%; border: 0.3mm solid rgba(232, 93, 42, 0.7);
    box-shadow: 0 0 9mm rgba(232, 93, 42, 0.18); }
  .contact { display: flex; flex-wrap: wrap; gap: 1.5mm 6mm; margin: 4.5mm 0 0; padding: 3mm 0; border-top: 0.25mm solid var(--faint); border-bottom: 0.25mm solid var(--faint); list-style: none; }
  .contact li { font-size: 7.8pt; } .contact b { margin-right: 1.5mm; color: var(--signal); font-size: 6.2pt; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; }
  .stats { display: grid; grid-template-columns: repeat(3, 1fr); margin-top: 4mm; border: 0.25mm solid var(--faint); background: rgba(255, 255, 255, 0.02); }
  .stat { padding: 3mm 4mm; border-left: 0.25mm solid var(--faint); } .stat:first-child { border-left: 0; }
  .stat strong { display: block; color: var(--signal); font-size: 17pt; font-weight: 500; line-height: 1; }
  .stat span { display: block; margin-top: 1.2mm; color: var(--muted); font-size: 6.8pt; line-height: 1.35; }
  h2 { display: flex; align-items: center; gap: 3mm; margin: 5.5mm 0 2.6mm; color: var(--signal); font-size: 7.4pt; font-weight: 650; letter-spacing: 0.06em; text-transform: uppercase; }
  :lang(th) h2, :lang(th) .stat span { letter-spacing: 0; }
  h2::after { flex: 1; height: 0.25mm; background: linear-gradient(90deg, rgba(232, 93, 42, 0.6), transparent); content: ""; }
  .skills { display: grid; grid-template-columns: 24mm 1fr; gap: 1.6mm 4mm; margin: 0; }
  .skills dt { font-weight: 600; } .skills dd { margin: 0; color: var(--muted); }
  .job { position: relative; padding: 0 0 3mm 6mm; border-left: 0.25mm solid var(--faint); }
  .job::before { position: absolute; top: 1.3mm; left: -1.2mm; width: 2.2mm; height: 2.2mm; border-radius: 50%; background: var(--signal); box-shadow: 0 0 2.5mm rgba(232, 93, 42, 0.7); content: ""; }
  .job:last-child { padding-bottom: 0; }
  .job-head { display: flex; justify-content: space-between; align-items: baseline; gap: 4mm; }
  h3 { margin: 0; font-size: 10.4pt; font-weight: 600; } .period { color: var(--muted); font-size: 7.4pt; white-space: nowrap; }
  .company { margin: 0.5mm 0 1.5mm; color: var(--signal); font-size: 8pt; }
  .job ul { margin: 0; padding-left: 3.6mm; color: var(--muted); } .job li { margin-bottom: 0.8mm; } .job li::marker { color: var(--signal); }
  .projects { display: grid; grid-template-columns: 1fr 1fr; gap: 3mm; }
  .project { padding: 3.2mm 3.6mm; border: 0.25mm solid var(--faint); background: rgba(255, 255, 255, 0.025); break-inside: avoid; }
  .project h3 { font-size: 9pt; } .project .type { margin: 0.6mm 0 1.2mm; color: var(--signal); font-size: 6.8pt; } .project p { margin: 0; color: var(--muted); font-size: 7.6pt; line-height: 1.45; }
  .edu { display: flex; justify-content: space-between; align-items: baseline; gap: 4mm; }
  .edu p { margin: 0.6mm 0 0; color: var(--muted); }
  .links { display: flex; flex-wrap: wrap; gap: 2mm 6mm; margin: 0; padding: 0; list-style: none; color: var(--muted); }
  .links b { margin-right: 1.5mm; color: var(--text); font-weight: 600; }
  .footer { position: absolute; right: 15mm; bottom: 9mm; left: 15mm; display: flex; justify-content: space-between; color: rgba(238, 234, 225, 0.35);
    font-family: ui-monospace, Menlo, monospace; font-size: 6pt; letter-spacing: 0.14em; text-transform: uppercase; }
</style></head><body>
<section class="page">
  <i class="corner c1"></i><i class="corner c2"></i><i class="corner c3"></i><i class="corner c4"></i>
  <div class="topbar"><img class="logo" src="${asset("public/images/brand/lpk-logo-gradient.png")}" alt="LPK"><span>Curriculum Vitae · ${new Date().getFullYear()}</span></div>
  <header class="hero">
    <div>
      <h1>${esc(cv.name)}</h1>
      <p class="headline">${esc(cv.headline)}</p>
      <p class="summary">${esc(cv.summary)}</p>
    </div>
    <img class="portrait" src="${asset("public/images/portrait.jpg")}" alt="">
  </header>
  <ul class="contact">${contact.map(([label, value]) => `<li><b>${label}</b>${esc(value)}</li>`).join("")}</ul>
  <div class="stats">${cv.stats.map((stat) => `<div class="stat"><strong>${esc(stat.value)}</strong><span>${esc(stat.label)}</span></div>`).join("")}</div>
  <h2>${esc(l.skills)}</h2>
  <dl class="skills">${cv.skills.map((group) => `<dt>${esc(group.label)}</dt><dd>${esc(group.items)}</dd>`).join("")}</dl>
  <h2>${esc(l.experience)}</h2>
  ${cv.experience.slice(0, PAGE_ONE_JOBS).map(job).join("\n")}
  <div class="footer"><span>${esc(cv.name)}</span><span>01 / 02</span></div>
</section>
<section class="page">
  <i class="corner c1"></i><i class="corner c2"></i><i class="corner c3"></i><i class="corner c4"></i>
  ${cv.experience.slice(PAGE_ONE_JOBS).map(job).join("\n")}
  <h2>${esc(l.projects)}</h2>
  <div class="projects">${cv.projects
    .map(
      (project) =>
        `<div class="project"><h3>${esc(project.name)}</h3><p class="type">${esc(project.type)}</p><p>${esc(project.detail)}</p></div>`,
    )
    .join("")}</div>
  <h2>${esc(l.education)}</h2>
  <div class="edu"><div><h3>${esc(cv.education.degree)}</h3><p>${esc(cv.education.school)} · ${esc(cv.education.detail)}</p></div><span class="period">${esc(cv.education.period)}</span></div>
  <h2>${esc(l.links)}</h2>
  <ul class="links">
    <li><b>Portfolio</b>${esc(bare(identity.website))}</li>
    <li><b>LinkedIn</b>${esc(bare(identity.linkedin))}</li>
    <li><b>GitHub</b>${esc(bare(identity.github))}</li>
  </ul>
  <div class="footer"><span>${esc(cv.name)}</span><span>02 / 02</span></div>
</section>
</body></html>`;
}

mkdirSync(outDir, { recursive: true });
const tmp = mkdtempSync(join(tmpdir(), "resume-"));
for (const locale of Object.keys(resume)) {
  const htmlPath = join(tmp, `resume-${locale}.html`);
  const output = join(outDir, `Ponlawat_Koeisuwan_Resume_${locale.toUpperCase()}.pdf`);
  writeFileSync(htmlPath, html(locale));
  execFileSync(
    chrome,
    [
      "--headless",
      "--disable-gpu",
      "--no-pdf-header-footer",
      "--allow-file-access-from-files",
      `--print-to-pdf=${output}`,
      pathToFileURL(htmlPath).href,
    ],
    { stdio: "ignore" },
  );
  console.log(`Resume written to ${output}`);
}
