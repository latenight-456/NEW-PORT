import React, { useEffect, useRef, useState } from "react";
import { openContactOverlay } from "./ContactOverlay";
import { CONTACT } from "./ContactPage";
import { replayLoader } from "./LogoLoader";

/* Late Night Studio: the site-wide footer. The lights go off at the bottom of the page.
   - Always "night": a dark band, full width, the same in light and dark mode.
   - A live strip: the time where the studio is, what that means ("Late night. The studio's open."),
     tonight's real moon phase, and whether you're taking on work.
   - Back to the top replays the logo loader (LogoLoader) and lands at the top.
   - The giant LATENIGHT. wordmark is drawn as outlines; the cursor is a torch that lights the letters up.
     On touch screens the torch drifts across on its own while the footer is on screen.
   Self-contained: styles injected below, no packages. Edit only the CONFIG block. */

/* ===================== CONFIG: edit these ===================== */
const WORD = "LATENIGHT";
const ASK = "Got something to build?";
const NOTE = "I'm up late anyway";
const CTA = "Let's talk";
const CITY = "Accra, Ghana";
const TIME_ZONE = "Africa/Accra";
const AVAILABILITY = "Taking on new projects"; // e.g. "Booked until March". "" hides it
const LINKS: [string, string][] = [
  ["Services", "#services"],
  ["My Work", "#work"],
  ["About", "#/about"],
  ["Contact", "#/contact"],
];
const SOCIALS: [string, string][] = [];
const SIGN_OFF = "Designed and built by hand, mostly after dark.";
/* what the clock says about the hour, where the studio is */
const MOODS: [number, string][] = [
  [0, "Late night. The studio's open."],
  [5, "Early. Coffee first, then pixels."],
  [9, "Daytime. Heads down, building."],
  [18, "Evening. Best time to catch me."],
  [22, "Late night. The studio's open."],
];
/* =============================================================== */

const SYNODIC = 29.530588853;
const NEW_MOON = Date.UTC(2000, 0, 6, 18, 14); // a known new moon
function moonPhase(d = new Date()) {
  const days = (d.getTime() - NEW_MOON) / 86400000;
  const p = (((days % SYNODIC) + SYNODIC) % SYNODIC) / SYNODIC; // 0 new → .5 full → 1 new
  const lit = Math.round(((1 - Math.cos(2 * Math.PI * p)) / 2) * 100);
  const names = ["New moon", "Waxing crescent", "First quarter", "Waxing gibbous", "Full moon", "Waning gibbous", "Last quarter", "Waning crescent"];
  return { p, lit, name: names[Math.round(p * 8) % 8] };
}

function Moon({ p }: { p: number }) {
  // the real shape of tonight's moon: a lit half-disc plus an ellipse for the terminator
  const r = 16;
  const c = 20;
  const k = (1 - Math.cos(2 * Math.PI * p)) / 2; // share lit
  const waxing = p < 0.5; // lit on the right while waxing, on the left while waning
  const rx = Math.abs(1 - 2 * k) * r;
  const gibbous = k > 0.5;
  const outer = waxing ? 1 : 0;
  const inner = waxing ? (gibbous ? 1 : 0) : gibbous ? 0 : 1;
  const d = `M${c} ${c - r}A${r} ${r} 0 0 ${outer} ${c} ${c + r}A${rx} ${r} 0 0 ${inner} ${c} ${c - r}Z`;
  return (
    <svg className="lns-nf__moon" viewBox="0 0 40 40" aria-hidden="true">
      <circle cx={c} cy={c} r={r} fill="#2a282d" />
      <path d={d} fill="#f3e6c4" />
      <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(243,230,196,.3)" strokeWidth=".8" />
    </svg>
  );
}

const Arrow = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 17L17 7M9 7h8v8" />
  </svg>
);

export default function NightFooter() {
  const ref = useRef<HTMLElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState<Date | null>(null);

  // the clock, ticking in the studio's time zone
  useEffect(() => {
    setNow(new Date());
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const el = ref.current!;
    const mark = markRef.current!;
    const words = Array.from(mark.querySelectorAll<HTMLElement>(".lns-nf__word"));

    // the wordmark always fills the width exactly
    // (re-fits when the width changes and again whenever a web font finishes loading, since the
    // display font usually arrives after the first paint and is much wider or narrower than the fallback)
    const fit = () => {
      const avail = mark.clientWidth;
      if (!avail) return;
      words.forEach((w) => (w.style.fontSize = "100px"));
      const w = words[0].getBoundingClientRect().width;
      if (w > 0) words.forEach((x) => (x.style.fontSize = ((100 * avail) / w).toFixed(2) + "px"));
    };
    const ro = new ResizeObserver(fit);
    ro.observe(mark);
    fit();
    document.fonts?.ready.then(fit);
    document.fonts?.addEventListener?.("loadingdone", fit);
    const late = [300, 1200, 3000].map((ms) => window.setTimeout(fit, ms));

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const touch = window.matchMedia("(hover: none)").matches;
    let x = -999;
    let y = -999;
    let tx = -999;
    let ty = -999;
    let r = 0;
    let tr = 0;
    let raf = 0;
    const paint = () => {
      raf = 0;
      x += (tx - x) * 0.2;
      y += (ty - y) * 0.2;
      r += (tr - r) * 0.15;
      mark.style.setProperty("--mx", `${x}px`);
      mark.style.setProperty("--my", `${y}px`);
      mark.style.setProperty("--mr", `${Math.max(0, r)}px`);
      if (Math.abs(tx - x) + Math.abs(ty - y) + Math.abs(tr - r) > 0.3) raf = requestAnimationFrame(paint);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const size = () => Math.max(90, mark.clientHeight * 0.75);

    const unfit = () => {
      ro.disconnect();
      late.forEach(clearTimeout);
      document.fonts?.removeEventListener?.("loadingdone", fit);
    };
    if (reduce) {
      mark.classList.add("is-static");
      return unfit;
    }

    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const b = mark.getBoundingClientRect();
      tx = e.clientX - b.left;
      ty = e.clientY - b.top;
      if (x < -900) {
        x = tx;
        y = ty;
      }
      tr = size();
      kick();
    };
    const leave = () => {
      tr = 0;
      kick();
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);

    // touch screens: the torch drifts along the word on its own while it's on screen
    let drift = 0;
    let io: IntersectionObserver | undefined;
    if (touch) {
      let t0 = 0;
      const loop = (t: number) => {
        if (!t0) t0 = t;
        const s = ((t - t0) / 5200) % 1;
        const w = mark.clientWidth;
        tx = (0.5 - Math.cos(s * Math.PI * 2) / 2) * w;
        ty = mark.clientHeight * (0.5 + Math.sin(s * Math.PI * 4) * 0.12);
        tr = size();
        x = tx;
        y = ty;
        r += (tr - r) * 0.1;
        mark.style.setProperty("--mx", `${x}px`);
        mark.style.setProperty("--my", `${y}px`);
        mark.style.setProperty("--mr", `${r}px`);
        drift = requestAnimationFrame(loop);
      };
      io = new IntersectionObserver(([en]) => {
        cancelAnimationFrame(drift);
        if (en.isIntersecting) drift = requestAnimationFrame(loop);
      });
      io.observe(mark);
    }

    return () => {
      unfit();
      io?.disconnect();
      cancelAnimationFrame(raf);
      cancelAnimationFrame(drift);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);

  const time = now
    ? new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(now)
    : "--:--:--";
  const hour = now ? Number(new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, hour: "numeric", hour12: false }).format(now)) % 24 : 0;
  const mood = [...MOODS].reverse().find(([h]) => hour >= h)?.[1] ?? MOODS[0][1];
  const moon = moonPhase(now || new Date());
  const year = (now || new Date()).getFullYear();
  // back to the top replays the logo loader (it jumps to the top behind it); without the loader, a smooth scroll
  const toTop = () => {
    if (!replayLoader()) window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer ref={ref} className="lns-nf">
      <style>{CSS}</style>

      <div className="lns-nf__top">
        <h2 className="lns-nf__ask">{ASK}</h2>
        <div className="lns-nf__cta">
          <button type="button" className="lns-nf__btn" onClick={() => openContactOverlay()}>
            {CTA}
            <span className="lns-nf__go">
              <Arrow />
            </span>
          </button>
          <span className="lns-nf__note" aria-hidden="true">
            <svg viewBox="0 0 60 50">
              <path d="M54 44C40 40 22 32 12 8M12 8l-2 12M12 8l10 6" />
            </svg>
            {NOTE}
          </span>
        </div>
      </div>

      <div className="lns-nf__strip">
        <div className="lns-nf__cell">
          <span className="lns-nf__label">{CITY}</span>
          <span className="lns-nf__clock" aria-label={`Local time ${time}`}>
            {time}
          </span>
          <span className="lns-nf__mood">{mood}</span>
        </div>
        <div className="lns-nf__cell lns-nf__cell--moon">
          <Moon p={moon.p} />
          <span>
            <span className="lns-nf__label">Tonight's moon</span>
            <span className="lns-nf__mood">
              {moon.name} · {moon.lit}% lit
            </span>
          </span>
        </div>
        {AVAILABILITY && (
          <div className="lns-nf__cell">
            <span className="lns-nf__label">Right now</span>
            <span className="lns-nf__avail">
              <i />
              {AVAILABILITY}
            </span>
          </div>
        )}
      </div>

      <div className="lns-nf__cols">
        <nav aria-label="Footer">
          <span className="lns-nf__label">Menu</span>
          {LINKS.map(([t, h]) => (
            <a key={t} href={h}>
              {t}
            </a>
          ))}
        </nav>
        <div>
          <span className="lns-nf__label">Say hello</span>
          <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
          {CONTACT.phone && <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}>{CONTACT.phone}</a>}
        </div>
        {SOCIALS.length > 0 && (
          <div>
            <span className="lns-nf__label">Follow</span>
            {SOCIALS.map(([t, h]) => (
              <a key={t} href={h} target="_blank" rel="noreferrer">
                {t}
                <Arrow />
              </a>
            ))}
          </div>
        )}
      </div>

      {/* the wordmark: outlines, and a torch that lights them */}
      <div ref={markRef} className="lns-nf__mark" aria-label="Late Night Studio" role="img">
        <span className="lns-nf__word lns-nf__word--line" aria-hidden="true">
          {WORD}
          <span className="lns-nf__dot">.</span>
        </span>
        <span className="lns-nf__word lns-nf__word--lit" aria-hidden="true">
          {WORD}
          <span className="lns-nf__dot">.</span>
        </span>
      </div>

      <div className="lns-nf__bar">
        <span>© {year} Late Night Studio</span>
        <span className="lns-nf__sign">{SIGN_OFF}</span>
        <button type="button" className="lns-nf__top-btn" onClick={toTop}>
          Back to the top
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 19V5M6 11l6-6 6 6" />
          </svg>
        </button>
      </div>
    </footer>
  );
}

const CSS = `
@import url("https://fonts.googleapis.com/css2?family=Caveat:wght@500&display=swap");
.lns-nf{
  /* always night, in light and dark mode */
  --nf-bg:#141316;--nf-ink:#cdc9c3;--nf-muted:#8d8781;--nf-line:rgba(205,201,195,.14);--nf-red:#ed1d04;
  --lns-display:"LNS Numerals", "Blackburn", system-ui, sans-serif;--lns-body:"LNS Numerals", Inter, system-ui, -apple-system, sans-serif;
  position:relative;width:100%;overflow:hidden;background:var(--nf-bg);color:var(--nf-ink);font-family:var(--lns-body);
  padding:clamp(56px,9vw,120px) clamp(16px,4vw,56px) 24px;box-sizing:border-box}
.lns-nf *,.lns-nf *::before,.lns-nf *::after{box-sizing:border-box}
.lns-nf a{color:inherit;text-decoration:none}
.lns-nf__label{display:block;font:11px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:.12em;text-transform:uppercase;color:var(--nf-muted);margin-bottom:12px}

/* ask + button */
.lns-nf__top{display:flex;align-items:flex-end;justify-content:space-between;gap:32px;flex-wrap:wrap}
.lns-nf__ask{margin:0;max-width:12ch;font-family:var(--lns-display, system-ui, sans-serif);font-weight:800;font-size:clamp(40px,7vw,104px);line-height:.95;letter-spacing:-.01em;color:var(--nf-ink)}
.lns-nf__cta{position:relative;padding-bottom:6px}
.lns-nf__btn{display:inline-flex;align-items:center;gap:14px;margin:0;padding:8px 8px 8px 24px;border:0;border-radius:999px;cursor:pointer;
  background:var(--nf-ink);color:var(--nf-bg);font:600 16px/1 var(--lns-body, system-ui, sans-serif);transition:background .3s,color .3s}
.lns-nf__go{display:grid;place-items:center;width:44px;height:44px;border-radius:50%;background:var(--nf-red);color:#fff;transition:transform .35s}
.lns-nf__go svg,.lns-nf__cols svg,.lns-nf__top-btn svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.lns-nf__btn:hover{background:#fff}
.lns-nf__btn:hover .lns-nf__go{transform:rotate(45deg)}
.lns-nf__btn:focus-visible,.lns-nf a:focus-visible,.lns-nf__top-btn:focus-visible{outline:2px solid var(--nf-red);outline-offset:4px}
.lns-nf__note{position:absolute;right:0;top:calc(100% + 4px);display:flex;align-items:flex-start;gap:4px;white-space:nowrap;
  font:500 20px/1 "Caveat","Segoe Print","Bradley Hand",cursive;color:var(--nf-red);transform:rotate(-4deg)}
.lns-nf__note svg{width:30px;height:24px;margin-top:-10px;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}

/* live strip */
.lns-nf__strip{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));margin-top:clamp(56px,7vw,96px);
  border-top:1px solid var(--nf-line);border-bottom:1px solid var(--nf-line)}
.lns-nf__cell{padding:24px 24px 24px 0;display:flex;flex-direction:column;justify-content:center}
.lns-nf__cell + .lns-nf__cell{padding-left:24px;border-left:1px solid var(--nf-line)}
.lns-nf__clock{font-family:var(--lns-display, system-ui, sans-serif);font-weight:700;font-size:clamp(32px,4vw,52px);line-height:1;font-variant-numeric:tabular-nums;letter-spacing:.02em}
.lns-nf__mood{display:block;margin-top:10px;font-size:14px;color:var(--nf-muted)}
.lns-nf__cell--moon{flex-direction:row;align-items:center;justify-content:flex-start;gap:16px}
.lns-nf__cell--moon .lns-nf__mood{margin-top:0;font-size:15px;color:var(--nf-ink)}
.lns-nf__moon{width:56px;height:56px;flex:none;filter:drop-shadow(0 0 14px rgba(243,230,196,.25))}
.lns-nf__avail{display:flex;align-items:center;gap:10px;font-size:16px;font-weight:500}
.lns-nf__avail i{width:9px;height:9px;border-radius:50%;background:var(--nf-red);box-shadow:0 0 0 0 rgba(237,29,4,.6);animation:lnsNfPulse 2s infinite}
@keyframes lnsNfPulse{70%{box-shadow:0 0 0 9px rgba(237,29,4,0)}100%{box-shadow:0 0 0 0 rgba(237,29,4,0)}}

/* link columns */
.lns-nf__cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:32px;padding:40px 0 clamp(40px,6vw,80px)}
.lns-nf__cols a{display:flex;align-items:center;gap:6px;width:fit-content;padding:5px 0;font-size:16px;color:var(--nf-ink);transition:color .25s,gap .25s}
.lns-nf__cols a:hover{color:var(--nf-red);gap:10px}
.lns-nf__cols a svg{width:13px;height:13px;opacity:.6}

/* the wordmark */
.lns-nf__mark{position:relative;width:100%;min-width:100%;grid-column:1 / -1;line-height:.8;user-select:none;--mx:-999px;--my:-999px;--mr:0px}
.lns-nf__word{display:block;width:max-content;max-width:none;white-space:nowrap;font-family:var(--lns-display, system-ui, sans-serif);font-weight:800;letter-spacing:-.02em;font-size:16vw}
.lns-nf__word--line{color:transparent;-webkit-text-stroke:1px rgba(205,201,195,.28)}
.lns-nf__word--line .lns-nf__dot{-webkit-text-stroke-color:rgba(237,29,4,.6)}
.lns-nf__word--lit{position:absolute;left:0;top:0;color:var(--nf-ink);
  -webkit-mask:radial-gradient(circle var(--mr) at var(--mx) var(--my), #000 55%, transparent 100%);
          mask:radial-gradient(circle var(--mr) at var(--mx) var(--my), #000 55%, transparent 100%)}
.lns-nf__word--lit .lns-nf__dot{color:var(--nf-red)}
.lns-nf__dot{display:inline}
.lns-nf__mark.is-static .lns-nf__word--lit{-webkit-mask:none;mask:none}

/* bottom bar */
.lns-nf__bar{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-top:24px;padding-top:20px;
  border-top:1px solid var(--nf-line);font-size:13px;color:var(--nf-muted)}
.lns-nf__top-btn{display:inline-flex;align-items:center;gap:8px;margin:0;padding:10px 14px;border:1px solid var(--nf-line);border-radius:999px;
  background:transparent;color:var(--nf-ink);font:500 13px/1 var(--lns-body, system-ui, sans-serif);cursor:pointer;transition:background .25s,color .25s}
.lns-nf__top-btn:hover{background:var(--nf-ink);color:var(--nf-bg)}

@media (max-width:720px){
  .lns-nf__cell,.lns-nf__cell + .lns-nf__cell{padding:20px 0;border-left:0}
  .lns-nf__cell + .lns-nf__cell{border-top:1px solid var(--nf-line)}
  .lns-nf__sign{order:3;width:100%}
}
@media (prefers-reduced-motion:reduce){.lns-nf *{transition:none!important;animation:none!important}}
`;
