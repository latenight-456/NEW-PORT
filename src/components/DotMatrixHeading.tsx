import React, { useEffect, useRef } from "react";

/* Late Night Studio: scroll-driven dot-matrix heading.
   The section is tall and the heading stays pinned while you scroll through it.
   Scroll position IS the timeline: scrolling down plays it forward, scrolling up plays it backward.
   0.00 to 0.35  dots appear left to right while the heading is ~2.2x size
   0.15 to 0.55  heading shrinks to its normal size
   0.50 to 0.90  solid letters wipe in line by line with a slanted edge; dots behind the wipe disappear
   0.85 to 1.00  paragraph fades up
   Dots are sampled from the heading's real font, so they sit exactly under the solid letters.
   No libraries. */

type Props = {
  lines?: string[];
  body?: string;
  id?: string;
  /** scroll length of the effect, in screen heights (higher = slower) */
  length?: number;
};

type Dot = { x: number; y: number; d: number; line: number };

const SCALE_FROM = 2.2;
const DOTS = [0, 0.35];
const SHRINK = [0.15, 0.55];
const WIPE = [0.5, 0.9];
const BODY = [0.85, 1];
const EDGE_EM = 0.6; // slant of the wipe edge, in em

const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const range = (p: number, [a, b]: number[]) => clamp01((p - a) / (b - a));

export default function DotMatrixHeading({
  lines = ["I'M YOUR PERSON", "TO GET SH*T DONE"],
  body = "I design and build digital products, combining frontend engineering with interactive design. Away from that work, music, photography, gaming and GOD are parts of my life, too.",
  id,
  length = 2.5,
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const section = sectionRef.current!;
    const stage = stageRef.current!;
    const title = titleRef.current!;
    const canvas = canvasRef.current!;
    const bodyEl = bodyRef.current!;
    const ctx = canvas.getContext("2d")!;
    const spans = Array.from(title.querySelectorAll<HTMLSpanElement>(".lns-dm__line"));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let dots: Dot[] = [];
    let radius = 2;
    let edgePx = 40;
    let ink = "#28272a";
    let raf = 0;
    let cancelled = false;

    const sample = () => {
      const W = title.offsetWidth;
      const H = title.offsetHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cs = getComputedStyle(title);
      ink = getComputedStyle(section).getPropertyValue("--lns-ink").trim() || cs.color;
      const fontSize = parseFloat(cs.fontSize);
      const pitch = Math.max(3, fontSize * 0.062);
      radius = pitch * 0.36;
      edgePx = fontSize * EDGE_EM;

      const off = document.createElement("canvas");
      off.width = Math.ceil(W);
      off.height = Math.ceil(H);
      const o = off.getContext("2d", { willReadFrequently: true })!;
      o.fillStyle = "#000";
      o.textBaseline = "alphabetic";
      dots = [];
      spans.forEach((s, li) => {
        o.clearRect(0, 0, off.width, off.height);
        const ss = getComputedStyle(s);
        o.font = `${ss.fontStyle} ${ss.fontWeight} ${ss.fontSize} ${ss.fontFamily}`;
        if ("letterSpacing" in o) (o as any).letterSpacing = ss.letterSpacing;
        const m = o.measureText(s.textContent || "");
        const asc = m.fontBoundingBoxAscent ?? m.actualBoundingBoxAscent;
        const desc = m.fontBoundingBoxDescent ?? m.actualBoundingBoxDescent;
        const baseline = s.offsetTop + (s.offsetHeight - (asc + desc)) / 2 + asc;
        o.fillText(s.textContent || "", s.offsetLeft, baseline);
        const data = o.getImageData(0, 0, off.width, off.height).data;
        for (let y = pitch / 2; y < H; y += pitch) {
          for (let x = pitch / 2; x < W; x += pitch) {
            const i = (Math.floor(y) * off.width + Math.floor(x)) * 4 + 3;
            // stable pseudo-random per dot, so scrolling back and forth looks identical
            const r = Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
            if (data[i] > 140) dots.push({ x, y, d: (x / W) * 0.7 + r * 0.3, line: li });
          }
        }
      });
    };

    const lineWipe = (p: number, i: number) => {
      const n = spans.length;
      const [a, b] = WIPE;
      const span = (b - a) / (1 + 0.35 * (n - 1)); // each line's share, overlapping
      const start = a + i * span * 0.35;
      return ease(clamp01((p - start) / span));
    };

    const render = (p: number) => {
      const k = ease(range(p, SHRINK));
      stage.style.transform = `scale(${SCALE_FROM + (1 - SCALE_FROM) * k})`;

      const wipes = spans.map((_, i) => lineWipe(p, i));
      spans.forEach((s, i) => {
        s.style.setProperty("--w", wipes[i].toFixed(4));
        // once a line is fully solid it's plain text again, so the site's hover effects can use it
        s.style.clipPath = wipes[i] >= 1 ? "none" : "";
      });

      const W = title.offsetWidth;
      const H = title.offsetHeight;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = ink;
      const dp = range(p, DOTS);
      for (const d of dots) {
        const w = wipes[d.line];
        if (w >= 1) continue; // line fully solid: no dots
        if (w > 0) {
          // hide dots the slanted edge has already passed
          const s = spans[d.line];
          const yRel = ((d.y - s.offsetTop) / s.offsetHeight + 0.1) / 1.2; // matches the -10%..110% clip-path
          const edgeX = s.offsetLeft + w * (s.offsetWidth + edgePx) - edgePx * yRel;
          if (d.x < edgeX) continue;
        }
        const a = clamp01((dp - d.d * 0.75) / 0.25);
        if (a <= 0) continue;
        ctx.globalAlpha = 0.6 * a;
        ctx.beginPath();
        ctx.arc(d.x, d.y, radius * (0.6 + 0.4 * a), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      const bo = range(p, BODY);
      bodyEl.style.opacity = String(bo);
      bodyEl.style.transform = `translateY(${16 * (1 - bo)}px)`;
    };

    const progress = () => {
      const r = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.8; // starts when card is 20% into view
      const total = section.offsetHeight - vh + start;
      return total <= 0 ? 1 : clamp01((start - r.top) / total);
    };

    const update = () => {
      raf = 0;
      render(reduce ? 1 : progress());
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    const ro = new ResizeObserver(() => {
      sample();
      update();
    });

    document.fonts.ready.then(() => {
      if (cancelled) return;
      sample();
      update();
      ro.observe(title);
      // capture:true also catches scrolling inside a container (smooth-scroll wrappers, overflow:auto mains)
      document.addEventListener("scroll", onScroll, { passive: true, capture: true });
      window.addEventListener("resize", onScroll);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("resize", onScroll);
    };
  }, [lines.join("|")]);

  return (
    <section
      id={id}
      ref={sectionRef}
      className="lns-dm"
      style={{ height: `${Math.max(1, length) * 100 + 100}vh` }}
      aria-labelledby="lns-dm-title"
    >
      <style>{CSS}</style>
      <div className="lns-dm__pin">
        <div ref={stageRef} className="lns-dm__stage">
          <canvas ref={canvasRef} className="lns-dm__dots" aria-hidden="true" />
          <h2 ref={titleRef} id="lns-dm-title" className="lns-dm__title">
            {lines.map((l) => (
              <span key={l} className="lns-dm__line">
                {l}
              </span>
            ))}
          </h2>
        </div>
        <p ref={bodyRef} className="lns-dm__body">
          {body}
        </p>
      </div>
    </section>
  );
}

const CSS = `
.lns-dm{
  --lns-ink:#28272a;
  --lns-muted:#5e5a57;
  --lns-display:"LNS Numerals", "Blackburn", system-ui, sans-serif;   /* = the font your "I'M YOUR PERSON" heading uses now */
  --lns-body:"LNS Numerals", Inter, system-ui, -apple-system, sans-serif;
  position:relative;color:var(--lns-ink);font-family:var(--lns-body);text-align:center;
}
.dark .lns-dm,
.lns-dm.dark {
  --lns-ink:#cdc9c3;
  --lns-muted:#a39e99;
}
/* stays on screen while the section scrolls past; overflow:clip keeps the 2.2x text inside the panel */
.lns-dm__pin{position:sticky;top:0;height:100vh;height:100svh;overflow:clip;
  display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 16px}
.lns-dm__stage{position:relative;transform-origin:50% 50%;will-change:transform}
.lns-dm__dots{position:absolute;left:0;top:0;pointer-events:none}
.lns-dm__title{position:relative;margin:0;font-family:var(--lns-display);font-weight:var(--lns-dm-weight,800);
  font-size:clamp(34px,8vw,104px);line-height:1.02;letter-spacing:.01em}
.lns-dm__line{--w:0;--edge:${EDGE_EM}em;display:block;width:fit-content;margin-inline:auto;white-space:nowrap;
  clip-path:polygon(0 -10%, calc(var(--w) * (100% + var(--edge))) -10%, calc(var(--w) * (100% + var(--edge)) - var(--edge)) 110%, 0 110%)}
.lns-dm__body{max-width:520px;margin:48px auto 0;font-size:17px;line-height:1.65;color:var(--lns-muted);opacity:0}
@media (prefers-reduced-motion:reduce){.lns-dm{height:auto!important}.lns-dm__pin{position:static;height:auto;padding:96px 16px}}
`;
