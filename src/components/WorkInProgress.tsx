import React from "react";
import ProcessBuild from "./ProcessBuild";

/* Late Night Studio: Work section.
   Honest "under construction" header + the case studies being written,
   followed by "The build", the scroll-driven process section (it replaced the loading bar).
   The process ends in the "Let's talk" button, so this section has no separate CTA. */

const BUILDING = [
  { name: "Case study 01", status: "Writing" },
  { name: "Case study 02", status: "Designing" },
  { name: "Case study 03", status: "Planned" },
];

export default function WorkInProgress() {
  return (
    <div id="work">
      <section className="lns-wip" aria-labelledby="lns-wip-title">
        <style>{CSS}</style>
        <h2 id="lns-wip-title" className="lns-wip__title">WORK.</h2>
        <p className="lns-wip__status">
          <span className="lns-wip__light" aria-hidden="true" /> Case studies under construction
        </p>
        <ul className="lns-wip__list">
          {BUILDING.map((b) => (
            <li key={b.name}>
              <span>{b.name}</span>
              <span className="lns-wip__tag">{b.status}</span>
            </li>
          ))}
        </ul>
        <p className="lns-wip__next">Meanwhile, here is how every site gets built. Scroll.</p>
      </section>
      <ProcessBuild build="web" tabs={false} />
    </div>
  );
}

const CSS = `
.lns-wip{
  --lns-paper:#cdc9c3;--lns-ink:#28272a;--lns-red:#ed1d04;--lns-muted:#5e5a57;--lns-line:rgba(40,39,42,.22);
  --lns-display:inherit;--lns-body:inherit;
  max-width:720px;margin:0 auto;padding:96px 24px 24px;text-align:center;color:var(--lns-ink);font-family:var(--lns-body)}
.dark .lns-wip,
.lns-wip.dark{
  --lns-paper:#28272a;
  --lns-ink:#cdc9c3;
  --lns-muted:#a39e99;
  --lns-line:rgba(205,201,195,.22);
}
.lns-wip__title{font-family:var(--lns-display);font-size:clamp(40px,6vw,64px);line-height:1;margin:0 0 16px;letter-spacing:.02em}
.lns-wip__status{display:inline-flex;align-items:center;gap:8px;margin:0 0 8px;font-size:14px;
  padding:6px 14px;border:1px solid var(--lns-line);border-radius:999px}
.lns-wip__light{width:8px;height:8px;border-radius:50%;background:var(--lns-red);animation:lns-wip-blink 1.2s steps(2) infinite}
@keyframes lns-wip-blink{50%{opacity:.15}}


.lns-wip__list{list-style:none;margin:40px 0 0;padding:0;border-top:1px solid var(--lns-line);text-align:left}
.lns-wip__list li{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:16px 4px;border-bottom:1px solid var(--lns-line);font-size:16px}
.lns-wip__tag{font-size:12px;padding:4px 10px;border:1px solid var(--lns-line);border-radius:999px;color:var(--lns-muted)}
.lns-wip__next{margin:28px 0 0;font-size:14px;color:var(--lns-muted)}
@media (prefers-reduced-motion:reduce){.lns-wip *{animation:none!important;transition:none!important}}
`;
