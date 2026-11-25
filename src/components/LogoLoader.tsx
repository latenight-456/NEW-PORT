import React, { useEffect, useRef, useState } from "react";
import { MARK_D, MARK_VB, SKELETON } from "./ProcessBuild";

/* Late Night Studio: the site's loading screen. Your mark gets built, the same way the logo build does it:
   red guide lines cross, the mark's centre line draws itself, gains its weight and turns solid,
   the name types out beside a 000 → 100 counter. When the page has loaded, the screen lifts away
   with a slanted edge and the site is underneath.
   Shows on every page load (refresh included). "Back to the top" in the footer replays it: the dark sheet
   slides up over the page, the page jumps to the top behind it, the mark is built again and it lifts away.
   Anything can replay it with replayLoader(). Self-contained: styles injected below, no packages.
   Edit only the CONFIG block. */

/* ===================== CONFIG: edit these ===================== */
const NAME = "Late night studio";
const LINE = "Building the site";
const COLOUR = "#ff3100"; // the mark's own colour
const MIN_MS = 2200; // shortest time on screen, so the build can finish even on fast connections
const MAX_MS = 6000; // longest wait for the page before it lifts anyway
const ONCE_PER_VISIT = false; // true = only the first load in a tab (refreshes skip it); Back to the top still replays it
const REPLAY_MS = 2000; // how long the replay stays (the page is already loaded, so it only plays the build)
/* =============================================================== */

const ENTER_MS = 650; // replay: the sheet slides up over the page this long before the build starts

/* Replays the loader and lands the visitor at the top of the page. Returns false if no loader is mounted
   (then the caller should just scroll up itself). */
export function replayLoader() {
  return !window.dispatchEvent(new Event("lns:replay", { cancelable: true }));
}

const jumpToTop = () => {
  const html = document.documentElement;
  const prev = html.style.scrollBehavior;
  html.style.scrollBehavior = "auto"; // instant, even if the site uses smooth scrolling
  window.scrollTo(0, 0);
  html.style.scrollBehavior = prev;
};

export default function LogoLoader() {
  const [state, setState] = useState<"on" | "out" | "gone">(() => {
    try {
      if (ONCE_PER_VISIT && sessionStorage.getItem("lns-loaded") === "1") return "gone";
    } catch {}
    return "on";
  });
  const [run, setRun] = useState(0); // 0 = the page load, 1+ = replays
  const numRef = useRef<HTMLSpanElement>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Back to the top (or anything calling replayLoader) plays it again
  useEffect(() => {
    const replay = (e: Event) => {
      e.preventDefault();
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        jumpToTop();
        return;
      }
      if (stateRef.current !== "gone") return;
      setRun((n) => n + 1);
      setState("on");
    };
    window.addEventListener("lns:replay", replay);
    return () => window.removeEventListener("lns:replay", replay);
  }, []);

  useEffect(() => {
    if (state !== "on") return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const replaying = run > 0;
    const off = replaying ? ENTER_MS : 0;
    const t0 = performance.now() + off;
    let jumped = !replaying;
    if (!replaying) html.style.overflow = "hidden";
    let loaded = replaying || document.readyState === "complete";
    const onLoad = () => (loaded = true);
    window.addEventListener("load", onLoad);
    let fontsOk = replaying;
    (document.fonts?.ready || Promise.resolve()).then(() => (fontsOk = true));

    // the counter follows real progress: time on screen, the page load and the fonts
    let shown = 0;
    let raf = 0;
    let done = false;
    const min = reduce ? 600 : replaying ? REPLAY_MS : MIN_MS;
    const tick = (t: number) => {
      const el = t - t0;
      if (el < 0) {
        raf = requestAnimationFrame(tick); // replay: the sheet is still sliding in
        return;
      }
      if (!jumped) {
        jumped = true; // covered: go to the top behind the sheet
        html.style.overflow = "hidden";
        jumpToTop();
      }
      const ready = (loaded && fontsOk) || el > MAX_MS;
      const target = ready ? Math.min(1, el / min) : Math.min(0.9, (el / min) * 0.9);
      shown += (target - shown) * (ready ? 0.2 : 0.12);
      if (ready && el >= min && shown > 0.995) shown = 1;
      if (numRef.current) numRef.current.textContent = String(Math.round(shown * 100)).padStart(3, "0");
      if (shown === 1 && !done) {
        done = true;
        try {
          sessionStorage.setItem("lns-loaded", "1");
        } catch {}
        window.setTimeout(() => setState("out"), reduce ? 0 : 250);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("load", onLoad);
      html.style.overflow = prev;
    };
  }, [state, run]);

  useEffect(() => {
    if (state !== "out") return;
    document.documentElement.style.overflow = "";
    window.dispatchEvent(new Event("lns:loaded"));
    const t = window.setTimeout(() => setState("gone"), 1000);
    return () => clearTimeout(t);
  }, [state]);

  if (state === "gone") return null;
  return (
    <div
      key={run}
      className={"lns-ld" + (state === "out" ? " is-out" : "") + (run > 0 ? " is-replay" : "")}
      style={{ ["--off" as any]: run > 0 ? `${ENTER_MS}ms` : "0ms" } as React.CSSProperties}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <style>{CSS}</style>
      <div className="lns-ld__sheet">
        <i className="lns-ld__g lns-ld__gh" />
        <i className="lns-ld__g lns-ld__gv" />
        <div className="lns-ld__mark">
          <svg viewBox={MARK_VB} aria-hidden="true">
            {SKELETON.map(([d], i) => (
              <path key={d} className="lns-ld__skel" d={d} pathLength={1} style={{ ["--i" as any]: i } as React.CSSProperties} />
            ))}
            <path className="lns-ld__fill" d={MARK_D} />
          </svg>
          <em className="lns-ld__tag">Stroke 24 · round ends</em>
        </div>
        <div className="lns-ld__foot">
          <span className="lns-ld__name">
            {Array.from(NAME).map((c, i) => (
              <span key={i} style={{ ["--i" as any]: i } as React.CSSProperties}>
                {c === " " ? "\u00a0" : c}
              </span>
            ))}
            <small>{LINE}</small>
          </span>
          <span className="lns-ld__num">
            <span ref={numRef}>000</span>
            <small>%</small>
          </span>
        </div>
      </div>
    </div>
  );
}

const CSS = `
.lns-ld{position:fixed;inset:0;z-index:3000;pointer-events:auto;
  --ld-bg:#141316;--ld-ink:#cdc9c3;--ld-muted:#8d8781;--ld-red:#ed1d04;--ld-mark:${COLOUR};
  --lns-display:"LNS Numerals", "Blackburn", system-ui, sans-serif;--lns-body:"LNS Numerals", Inter, system-ui, -apple-system, sans-serif;--off:0ms;
  --e:cubic-bezier(.65,0,.35,1)}
.lns-ld__sheet{position:absolute;inset:0;background:var(--ld-bg);color:var(--ld-ink);font-family:var(--lns-body, system-ui, sans-serif);
  clip-path:polygon(0 0,100% 0,100% 100%,0 100%);transition:clip-path .85s var(--e)}
/* lifts away with a slanted edge */
.lns-ld.is-out .lns-ld__sheet{clip-path:polygon(0 0,100% 0,100% calc(0% - 12vw),0 0%)}
.lns-ld.is-out{pointer-events:none}
/* replay: the sheet first slides up over the page, with the same slanted edge */
.lns-ld.is-replay:not(.is-out) .lns-ld__sheet{animation:lnsLdEnter ${ENTER_MS}ms var(--e) both}
@keyframes lnsLdEnter{from{clip-path:polygon(0 calc(100% + 12vw),100% 100%,100% 100%,0 calc(100% + 12vw))}}

/* guide lines cross first */
.lns-ld__g{position:absolute;background:rgba(237,29,4,.45)}
.lns-ld__gh{left:0;right:0;top:50%;height:1px;transform:scaleX(0);animation:lnsLdX .7s var(--e) calc(var(--off) + .05s) forwards}
.lns-ld__gv{top:0;bottom:0;left:50%;width:1px;transform:scaleY(0);animation:lnsLdY .7s var(--e) calc(var(--off) + .15s) forwards}
@keyframes lnsLdX{to{transform:scaleX(1)}}
@keyframes lnsLdY{to{transform:scaleY(1)}}

/* the mark: centre line draws, thickens, turns into the solid mark */
.lns-ld__mark{position:absolute;left:50%;top:50%;width:clamp(110px,15vw,200px);transform:translate(-50%,-50%)}
.lns-ld__mark svg{display:block;width:100%;height:auto;overflow:visible}
.lns-ld__skel{fill:none;stroke:var(--ld-red);stroke-linecap:round;stroke-linejoin:round;stroke-width:3px;
  stroke-dasharray:1;stroke-dashoffset:1;
  animation:lnsLdDraw .32s ease-out calc(var(--off) + .45s + var(--i) * .17s) forwards,lnsLdWeight .45s var(--e) calc(var(--off) + 1.45s) forwards,
    lnsLdOff .2s linear calc(var(--off) + 1.95s) forwards}
@keyframes lnsLdDraw{to{stroke-dashoffset:0}}
@keyframes lnsLdWeight{to{stroke-width:24.3px;stroke:var(--ld-mark)}}
@keyframes lnsLdOff{to{opacity:0}}
.lns-ld__fill{fill:var(--ld-mark);opacity:0;animation:lnsLdIn .2s linear calc(var(--off) + 1.9s) forwards}
@keyframes lnsLdIn{to{opacity:1}}
.lns-ld__tag{position:absolute;left:calc(100% + 18px);top:6%;white-space:nowrap;font:normal 10px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:var(--ld-red);
  opacity:0;animation:lnsLdIn .2s linear calc(var(--off) + 1.45s) forwards,lnsLdOff .3s linear calc(var(--off) + 1.95s) forwards}
.lns-ld.is-out .lns-ld__mark{transition:transform .85s var(--e),opacity .5s;transform:translate(-50%,-70%) scale(.9);opacity:0}

/* name + counter */
.lns-ld__foot{position:absolute;left:clamp(16px,4vw,56px);right:clamp(16px,4vw,56px);bottom:clamp(24px,5vh,48px);
  display:flex;align-items:flex-end;justify-content:space-between;gap:16px}
.lns-ld__name{display:flex;flex-wrap:wrap;align-items:baseline;font-family:var(--lns-display, system-ui, sans-serif);font-weight:700;font-size:clamp(18px,2vw,24px)}
.lns-ld__name > span{opacity:0;animation:lnsLdIn .01s linear calc(var(--off) + .6s + var(--i) * .045s) forwards}
.lns-ld__name small{flex-basis:100%;margin-top:8px;font:500 11px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:.14em;text-transform:uppercase;color:var(--ld-muted)}
.lns-ld__num{font-family:var(--lns-display, system-ui, sans-serif);font-weight:600;font-size:clamp(56px,9vw,128px);line-height:.85;
  font-variant-numeric:tabular-nums;color:rgba(205,201,195,.2)}
.lns-ld__num small{font-size:.3em;margin-left:2px}

@media (max-width:600px){.lns-ld__tag{display:none}}
@media (prefers-reduced-motion:reduce){
  .lns-ld *{animation:none!important;transition:none!important}
  .lns-ld__g,.lns-ld__name > span,.lns-ld__fill{transform:none;opacity:1}
  .lns-ld__skel,.lns-ld__tag{opacity:0}
  .lns-ld.is-out{opacity:0;transition:opacity .3s}
}
`;
