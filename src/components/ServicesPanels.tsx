import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ProcessBuild, { BuildKey, MARK_D, MARK_VB, NightShot, SKELETON } from "./ProcessBuild";
import { openContactOverlay } from "./ContactOverlay";

/* Late Night Studio: Services as expanding panels.
   Tall panels in a row; the one you hover (or tap, or tab to) widens and shows its art, text and link.
   The open panel wears a red design-tool selection box with its live size.
   "Watch it get built" opens that service's build from "The build" full screen, growing out of the panel, with tabs at the top to switch to the other builds.
   Self-contained: styles injected below, no packages. Edit only the CONFIG block. */

/* ===================== CONFIG: edit these ===================== */
const TITLE = "SERVICES.";
const INTRO = "Websites and systems for businesses of every kind, with branding, graphic design and video when you need them.";
const START_OPEN = 0; // which panel is open before anyone hovers (0 = the first)
const SERVICES: {
  title: string;
  tagline: string;
  text: string;
  tags: string[];
  build: BuildKey | null; // which build "Watch it get built" opens ("web" | "system" | "logo" | "flyer" | "video"); null = the link opens the contact overlay
  image?: string; // optional photo/render URL, fills the panel. Empty = the drawn artwork below is used
  screen?: string; // optional screenshot of finished work, shown in a browser window at the top of the panel
  video?: string; // optional video of finished work (.mp4), fills the panel, plays muted on a loop
}[] = [
  {
    title: "Websites",
    tagline: "Hand-built, fast on every phone.",
    text: "Custom websites designed and built around your business, easy to keep up to date.",
    tags: ["Business sites", "E-commerce", "Landing pages"],
    build: "web",
    screen: "/images/website-benansah.png", // Benansah Financial Solutions
  },
  {
    title: "Systems",
    tagline: "Software that fits how you work.",
    text: "Business systems for bookings, stock, staff and customers, built around how your team already works.",
    tags: ["Dashboards", "Bookings & inventory", "Automations"],
    build: "system",
    screen: "/images/system-merchsales.png", // MerchSales performance dashboard
  },
  {
    title: "Branding",
    tagline: "A name people remember.",
    text: "Logos and visual identities, with the files and guidelines to use them the same way everywhere.",
    tags: ["Logo design", "Visual identity", "Guidelines"],
    build: "logo",
  },
  {
    title: "Graphic design",
    tagline: "Made to stop people walking past.",
    text: "Flyers, banners, posters and social graphics, designed for print and screen.",
    tags: ["Flyers", "Banners", "Social graphics"],
    build: "flyer",
    image: "/images/flyer-tropic.jpg", // the same flyer the build makes
  },
  {
    title: "Video editing",
    tagline: "Raw clips in. A story out.",
    text: "Promos, reels and event films, cut, coloured and scored, then exported for every screen.",
    tags: ["Reels & TikTok", "Promos", "Event films"],
    build: "video",
    video: "", // optional: a finished video of yours (e.g. "/videos/showreel.mp4"); plays muted in the panel
  },
];
const LINK_BUILD = "Watch it get built";
const LINK_TALK = "Let's talk";
const CLOSE = "Close";
/* =============================================================== */

/* ---------- drawn artwork (used when a service has no image) ---------- */
const DOTS = (() => {
  const out: [number, number, number][] = [];
  for (let i = 0; i < 16; i++)
    for (let j = 0; j < 22; j++) {
      const x = 14 + i * 26;
      const y = 14 + j * 26;
      const d = Math.hypot(x - 300, y - 170);
      out.push([x, y, Math.max(1.2, 10.5 - d / 32)]);
    }
  return out;
})();

function Art({ kind }: { kind: number }) {
  return (
    <svg className="lns-sp__art" viewBox="0 0 400 560" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {kind === 0 && (
        <>
          {DOTS.map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} className="f" />
          ))}
          <circle cx="300" cy="170" r="15" className="red" />
        </>
      )}
      {kind === 1 && (
        <>
          <rect x="40" y="96" width="320" height="292" rx="16" className="s" />
          <path d="M40 140H360M104 140V388" className="s" />
          {[164, 196, 228, 260].map((y) => (
            <path key={y} d={`M60 ${y}H86`} className="s thin" />
          ))}
          {[[132, 90], [170, 150], [208, 110], [246, 190], [284, 140], [322, 210]].map(([x, h]) => (
            <rect key={x} x={x - 12} y={360 - h} width="24" height={h} rx="4" className="f soft" />
          ))}
          <path d="M132 250L170 200L208 230L246 170L284 196L322 136" className="s" />
          <circle cx="322" cy="136" r="9" className="red" />
          <circle cx="60" cy="118" r="5" className="red" />
          {[424, 456, 488].map((y, i) => (
            <React.Fragment key={y}>
              <circle cx="56" cy={y} r="8" className="s thin" />
              <path d={`M76 ${y}H${300 - i * 50}`} className="s thin" />
            </React.Fragment>
          ))}
        </>
      )}
      {kind === 2 && (
        <>
          {[60, 120, 180, 240, 300, 360].map((x) => (
            <path key={"v" + x} d={`M${x} 40V520`} className="s grid" />
          ))}
          {[100, 160, 220, 280, 340, 400, 460].map((y) => (
            <path key={"h" + y} d={`M20 ${y}H380`} className="s grid" />
          ))}
          <svg x="100" y="120" width="200" height="230" viewBox={MARK_VB}>
            <path d={MARK_D} className="mark" />
            {SKELETON.map(([d]) => (
              <path key={d} d={d} className="s guide skel" />
            ))}
          </svg>
        </>
      )}
      {kind === 4 && (
        <>
          {/* the monitor, the night shot on it, and a timeline underneath */}
          <rect x="36" y="92" width="328" height="196" rx="10" className="f dark" />
          <NightShot box={{ x: 44, y: 100, width: 312, height: 176 }} crop={[0, 0, 1]} title="LAUNCH NIGHT" />
          <rect x="36" y="312" width="328" height="150" rx="10" className="s thin" />
          {[[52, 330, 80], [138, 330, 60], [204, 330, 96], [306, 330, 44]].map(([x, y, w]) => (
            <rect key={x} x={x} y={y} width={w - 4} height="34" rx="4" className="f soft" />
          ))}
          <rect x="138" y="374" width="120" height="14" rx="3" className="red" opacity=".35" />
          {Array.from({ length: 36 }, (_, k) => {
            const h = 6 + Math.abs(Math.sin(k * 1.7) * 14 + Math.sin(k * 0.43) * 9);
            return <rect key={k} x={52 + k * 8.4} y={420 - h / 2} width="4" height={h} rx="2" className="f soft" />;
          })}
          <path d="M232 316V456" className="s" style={{ stroke: "var(--sp-red)" }} />
          <path d="M226 312H238L232 320Z" className="red" />
        </>
      )}
      {kind === 3 && (
        <>
          <rect x="104" y="96" width="220" height="310" rx="3" transform="rotate(7 214 251)" className="s thin" />
          <g transform="rotate(-6 200 280)">
            <rect x="90" y="110" width="220" height="310" rx="3" className="sheet" />
            <rect x="106" y="126" width="188" height="160" className="f" />
            <circle cx="200" cy="226" r="42" className="red" />
            <path d="M106 266H294V286H106Z" className="f dark" />
            <path d="M110 316H250M110 340H210" className="s bold" />
            <path d="M110 380H170M110 394H150" className="s thin" />
            <rect x="232" y="372" width="62" height="24" rx="12" className="red" />
            <circle cx="200" cy="112" r="7" className="red" />
          </g>
        </>
      )}
    </svg>
  );
}

const Arrow = () => (
  <svg className="lns-sp__arrow" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 17L17 7M9 7h8v8" />
  </svg>
);

export default function ServicesPanels() {
  const [active, setActive] = useState(START_OPEN);
  const [open, setOpen] = useState<{ key: BuildKey; rect: DOMRect } | null>(null);
  const [shown, setShown] = useState(false);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);
  const sizeRef = useRef<HTMLSpanElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const backTo = useRef<HTMLElement | null>(null);

  // live size in the selection tag, updated as the panel widens
  useLayoutEffect(() => {
    const el = panelRefs.current[active];
    if (!el) return;
    const write = () => {
      if (sizeRef.current) sizeRef.current.textContent = `${Math.round(el.offsetWidth)}×${Math.round(el.offsetHeight)}`;
    };
    write();
    const ro = new ResizeObserver(write);
    ro.observe(el);
    return () => ro.disconnect();
  }, [active]);

  const launch = (i: number, from: HTMLElement) => {
    const s = SERVICES[i];
    if (!s.build) {
      openContactOverlay();
      return;
    }
    backTo.current = from;
    setOpen({ key: s.build, rect: panelRefs.current[i]!.getBoundingClientRect() });
  };
  const close = () => {
    setShown(false);
    window.setTimeout(() => {
      setOpen(null);
      backTo.current?.focus();
    }, 450);
  };

  // full-screen build: lock the page, grow out of the panel, Esc closes
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
    const key = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", key);
    layerRef.current?.focus();
    return () => {
      cancelAnimationFrame(raf);
      html.style.overflow = prev;
      window.removeEventListener("keydown", key);
    };
  }, [open]);

  const r = open?.rect;
  const layerStyle = r
    ? ({
        ["--t" as any]: `${r.top}px`,
        ["--r" as any]: `${window.innerWidth - r.right}px`,
        ["--b" as any]: `${window.innerHeight - r.bottom}px`,
        ["--l" as any]: `${r.left}px`,
      } as React.CSSProperties)
    : undefined;

  return (
    <section id="services" className="lns-sp" aria-labelledby="lns-sp-title">
      <style>{CSS}</style>
      <header className="lns-sp__head">
        <h2 id="lns-sp-title" className="lns-sp__title">{TITLE}</h2>
        <p className="lns-sp__intro">{INTRO}</p>
      </header>

      <div className="lns-sp__row">
        {SERVICES.map((s, i) => {
          const on = i === active;
          return (
            <article
              key={s.title}
              ref={(el) => { panelRefs.current[i] = el; }}
              className={"lns-sp__panel" + (on ? " is-on" : "")}
              onMouseEnter={() => setActive(i)}
            >
              <div className="lns-sp__media">
                {s.screen ? (
                  <span className="lns-sp__shot">
                    <span className="lns-sp__shotbar">
                      <i />
                      <i />
                      <i />
                    </span>
                    <img src={s.screen} alt={`${s.title}: finished work`} loading="lazy" />
                  </span>
                ) : s.video ? (
                  <video src={s.video} muted loop autoPlay playsInline preload="metadata" />
                ) : s.image ? (
                  <img src={s.image} alt="" loading="lazy" />
                ) : (
                  <Art kind={i} />
                )}
              </div>
              <span className="lns-sp__num">{String(i + 1).padStart(2, "0")}</span>
              <span className="lns-sp__vt" aria-hidden="true">{s.title}</span>
              {/* the whole closed panel is one button: tap or Tab opens it */}
              <button
                type="button"
                className="lns-sp__hit"
                aria-expanded={on}
                aria-controls={`lns-sp-body-${i}`}
                onClick={() => setActive(i)}
                onFocus={() => setActive(i)}
              >
                <span className="lns-sp__sr">{s.title}</span>
              </button>
              <div className="lns-sp__body" id={`lns-sp-body-${i}`} aria-hidden={!on}>
                <h3>{s.title}</h3>
                <p className="lns-sp__tag">{s.tagline}</p>
                <p className="lns-sp__text">{s.text}</p>
                <ul>
                  {s.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                <button type="button" className="lns-sp__link" tabIndex={on ? 0 : -1} onClick={(e) => launch(i, e.currentTarget)}>
                  {s.build ? LINK_BUILD : LINK_TALK}
                  <Arrow />
                </button>
              </div>
              {on && (
                <span className="lns-sp__sel" aria-hidden="true">
                  <em>
                    {s.title} <span ref={sizeRef} />
                  </em>
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
              )}
            </article>
          );
        })}
      </div>

      {open &&
        createPortal(
          <div
            ref={layerRef}
            className={"lns-sp__layer" + (shown ? " is-shown" : "")}
            style={layerStyle}
            role="dialog"
            aria-modal="true"
            aria-label={SERVICES.find((s) => s.build === open.key)?.title}
            tabIndex={-1}
          >
            <button type="button" className="lns-sp__close" onClick={close} aria-label={CLOSE}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            <ProcessBuild build={open.key} tabs onCta={close} />
          </div>,
          document.body
        )}
    </section>
  );
}

const CSS = `
.lns-sp,.lns-sp__layer{
  /* these follow your theme (see the dark-mode rule in the prompt) */
  --sp-paper:#cdc9c3;--sp-ink:#28272a;--sp-muted:#5e5a57;--sp-line:rgba(40,39,42,.2);--sp-card:rgba(255,255,255,.16);
  --sp-red:#ed1d04;
  --sp-mono:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  --lns-display:"LNS Numerals", "Blackburn", system-ui, sans-serif;
  --lns-body:"LNS Numerals", Inter, system-ui, -apple-system, sans-serif;
  --sp-e:cubic-bezier(.22,.61,.36,1);
}
.lns-sp{width:100%;margin:0;padding:88px clamp(20px,3vw,48px);color:var(--sp-ink);font-family:var(--lns-body, system-ui, sans-serif)}
.lns-sp *,.lns-sp *::before,.lns-sp *::after{box-sizing:border-box}
.lns-sp__head{text-align:center;margin-bottom:56px}
.lns-sp__title{font-family:var(--lns-display, system-ui, sans-serif);font-size:clamp(40px,6vw,64px);line-height:1;margin:0 0 16px;letter-spacing:.02em}
.lns-sp__intro{max-width:540px;margin:0 auto;font-size:16px;line-height:1.6;color:var(--sp-muted)}

.lns-sp__row{display:flex;width:100%;gap:12px;height:clamp(460px,64vh,600px)}
.lns-sp__panel{position:relative;flex:1 1 0;min-width:0;border-radius:18px;border:1px solid var(--sp-line);background:var(--sp-card);
  transition:flex-grow .65s var(--sp-e),border-color .3s}
.lns-sp__panel.is-on{flex-grow:3.4;border-color:transparent}
.lns-sp__media{position:absolute;inset:0;border-radius:inherit;overflow:hidden;color:var(--sp-ink)}
.lns-sp__media img,.lns-sp__media video,.lns-sp__art{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;
  opacity:.28;filter:grayscale(1);transform:scale(1.06);transition:opacity .5s var(--sp-e),filter .5s,transform .8s var(--sp-e)}
.is-on .lns-sp__media img,.is-on .lns-sp__media video,.is-on .lns-sp__art{opacity:1;filter:none;transform:none}
/* finished work in a browser window: fixed width, so a closed panel shows a slice of it */
.lns-sp__shot{position:absolute;left:24px;top:52px;width:clamp(460px,42vw,720px);border-radius:10px;overflow:hidden;background:#fff;
  box-shadow:0 0 0 1px rgba(40,39,42,.14), 0 24px 50px -24px rgba(0,0,0,.45);
  opacity:.35;filter:grayscale(1);transform:translateY(8px);transition:opacity .5s var(--sp-e),filter .5s,transform .8s var(--sp-e)}
.is-on .lns-sp__shot{opacity:1;filter:none;transform:none}
.lns-sp__shotbar{display:flex;gap:5px;align-items:center;height:20px;padding:0 10px;background:#ecebe8;border-bottom:1px solid rgba(40,39,42,.1)}
.lns-sp__shotbar i{width:6px;height:6px;border-radius:50%;background:rgba(40,39,42,.25)}
.lns-sp__media .lns-sp__shot img{position:static;display:block;width:100%;height:auto;opacity:1;filter:none;transform:none}
/* a soft wash at the bottom so the text always reads over the art */
.lns-sp__media::after{content:"";position:absolute;inset:auto 0 0 0;height:78%;
  background:linear-gradient(to top, var(--sp-paper) 52%, transparent);opacity:0;transition:opacity .5s}
.is-on .lns-sp__media::after{opacity:.94}
.lns-sp__art .f{fill:currentColor}
.lns-sp__art .f.soft{opacity:.18}
.lns-sp__art .f.dark{opacity:.85}
.lns-sp__art .s{fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
.lns-sp__art .s.thin{stroke-width:1.4;opacity:.6}
.lns-sp__art .s.bold{stroke-width:9}
.lns-sp__art .s.grid{stroke:var(--sp-red);stroke-width:1;opacity:.25}
.lns-sp__art .s.guide{stroke:var(--sp-red);stroke-width:1.2;stroke-dasharray:5 5}
.lns-sp__art .red{fill:var(--sp-red)}
.lns-sp__art .mark{fill:#ff3100}
.lns-sp__art .skel{stroke-width:1.2;vector-effect:non-scaling-stroke;stroke-dasharray:4 4;opacity:.9}
.lns-sp__art .sheet{fill:#e6e3de;stroke:currentColor;stroke-width:1.4}

.lns-sp__num{position:absolute;left:22px;top:22px;font:12px/1 var(--sp-mono);color:var(--sp-muted)}
.lns-sp__vt{position:absolute;left:22px;bottom:26px;writing-mode:vertical-rl;transform:rotate(180deg);white-space:nowrap;
  font-family:var(--lns-display, system-ui, sans-serif);font-size:clamp(20px,2vw,26px);line-height:1;transition:opacity .25s}
.is-on .lns-sp__vt{opacity:0}
.lns-sp__hit{position:absolute;inset:0;z-index:2;margin:0;padding:0;border:0;background:transparent;border-radius:inherit;cursor:pointer}
.is-on .lns-sp__hit{pointer-events:none}
.lns-sp__hit:focus-visible{outline:2px solid var(--sp-red);outline-offset:3px}
.lns-sp__sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}

/* the open panel's text: fixed width, so it never re-wraps while the panel widens */
.lns-sp__body{position:absolute;left:28px;bottom:28px;z-index:3;width:min(380px, calc(100% - 56px));
  opacity:0;transform:translateY(10px);pointer-events:none;transition:opacity .2s,transform .2s}
.is-on .lns-sp__body{opacity:1;transform:none;pointer-events:auto;transition:opacity .45s .25s var(--sp-e),transform .45s .25s var(--sp-e)}
.lns-sp__body h3{margin:0 0 6px;font-family:var(--lns-display, system-ui, sans-serif);font-size:clamp(26px,2.6vw,34px);line-height:1.05}
.lns-sp__tag{margin:0 0 10px;font-size:17px;color:var(--sp-ink)}
.lns-sp__text{margin:0 0 14px;font-size:14px;line-height:1.6;color:var(--sp-muted)}
.lns-sp__body ul{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 18px;padding:0;list-style:none}
.lns-sp__body li{font:11px/1 var(--sp-mono);padding:6px 9px;border:1px solid var(--sp-line);border-radius:999px;color:var(--sp-muted)}
.lns-sp__link{display:inline-flex;align-items:center;gap:10px;margin:0;padding:12px 8px 12px 18px;border:0;border-radius:999px;cursor:pointer;
  background:var(--sp-ink);color:var(--sp-paper);font:600 14px/1 var(--lns-body, system-ui, sans-serif);transition:background .25s}
.lns-sp__link:hover{background:color-mix(in srgb, var(--sp-ink) 82%, #000)}
.lns-sp__link:focus-visible{outline:2px solid var(--sp-red);outline-offset:3px}
.lns-sp__arrow{width:28px;height:28px;padding:6px;border-radius:50%;background:var(--sp-red);fill:none;stroke:#fff;stroke-width:2.4;
  stroke-linecap:round;stroke-linejoin:round;transition:transform .35s var(--sp-e)}
/* every CTA arrow: the red circle stays, the arrow turns from ↗ to → */
.lns-sp__link:hover .lns-sp__arrow,.lns-sp__link:focus-visible .lns-sp__arrow{transform:rotate(45deg)}

/* the selection box: red outline, corner handles and a live size tag */
.lns-sp__sel{position:absolute;inset:-1px;z-index:4;pointer-events:none;border:1.5px solid var(--sp-red);border-radius:18px;animation:lnsSpSel .35s var(--sp-e)}
@keyframes lnsSpSel{from{opacity:0;transform:scale(.985)}}
.lns-sp__sel i{position:absolute;width:8px;height:8px;background:var(--sp-paper);border:1.5px solid var(--sp-red)}
.lns-sp__sel i:nth-of-type(1){left:-4px;top:-4px}
.lns-sp__sel i:nth-of-type(2){right:-4px;top:-4px}
.lns-sp__sel i:nth-of-type(3){left:-4px;bottom:-4px}
.lns-sp__sel i:nth-of-type(4){right:-4px;bottom:-4px}
.lns-sp__sel em{position:absolute;left:-1px;bottom:calc(100% + 6px);padding:4px 7px;border-radius:3px;background:var(--sp-red);color:#fff;
  font:500 10px/1 var(--sp-mono);font-style:normal;white-space:nowrap}
.lns-sp__sel em span{opacity:.75;margin-left:6px;font-variant-numeric:tabular-nums}

/* full-screen build, grown out of the panel. Its progress number moves down to make room for Close */
.lns-sp__layer .lns-pb__meter{top:calc(clamp(24px,5vh,48px) + 64px)}
.lns-sp__layer{position:fixed;inset:0;z-index:900;overflow-y:auto;overscroll-behavior:contain;outline:none;
  background:var(--sp-paper);color:var(--sp-ink);
  clip-path:inset(var(--t) var(--r) var(--b) var(--l) round 18px);transition:clip-path .55s var(--sp-e)}
.lns-sp__layer.is-shown{clip-path:inset(0 0 0 0 round 0)}
.lns-sp__layer .lns-pb{opacity:0;transition:opacity .3s}
.lns-sp__layer.is-shown .lns-pb{opacity:1;transition:opacity .4s .3s}
/* the build's tabs sit top centre, so Close is a round button in the corner, over the progress number */
.lns-sp__close{position:fixed;right:clamp(16px,4vw,56px);top:clamp(24px,5vh,48px);z-index:10;display:grid;place-items:center;
  width:44px;height:44px;margin:0;padding:0;border:1px solid var(--sp-line);border-radius:50%;cursor:pointer;
  background:var(--sp-ink);color:var(--sp-paper)}
.lns-sp__close svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round}
.lns-sp__close:hover{background:var(--sp-red)}
.lns-sp__close{opacity:0;transition:opacity .2s,background .25s}
.is-shown .lns-sp__close{opacity:1;transition:opacity .3s .4s,background .25s}
.lns-sp__close:focus-visible{outline:2px solid var(--sp-red);outline-offset:3px}

/* phones and narrow screens: the panels stack and open downwards */
@media (max-width:820px){
  .lns-sp{padding:64px 16px}
  .lns-sp__row{flex-direction:column;height:auto;gap:10px}
  .lns-sp__panel{flex:none;height:76px;transition:height .55s var(--sp-e),border-color .3s}
  .lns-sp__panel.is-on{height:500px}
  .lns-sp__vt{writing-mode:horizontal-tb;transform:none;left:60px;top:24px;bottom:auto;font-size:24px}
  .lns-sp__num{top:30px}
  .lns-sp__body{left:20px;bottom:20px;width:calc(100% - 40px)}
  .lns-sp__shot{left:20px;top:64px;width:calc(100% - 40px)}
  .lns-sp__close{right:16px;top:24px}
  .lns-sp__layer .lns-pb__meter{top:140px}
}
@media (prefers-reduced-motion:reduce){
  .lns-sp *,.lns-sp__layer{transition:none!important;animation:none!important}
}
`;
