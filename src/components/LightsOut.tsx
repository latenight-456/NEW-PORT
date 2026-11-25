import React, { useEffect, useRef, useState } from "react";

/* Late Night Studio: "Lights out" + letter construction.
   1. A light switch in the nav (<LightSwitch />). Flip it and the lights go out with a flicker: the whole site turns
      into its blueprint (red grid, element outlines, sizes, type specs), and the cursor becomes a soft torch that
      shows the real design underneath. On phones the torch sits where you last touched; scrolling still works.
      Flip it back, press Esc or tap "Lights on" to turn the lights back on. The page itself is never changed;
      the blueprint is drawn on a canvas, and links and buttons keep working in the dark.
   2. Hover a big heading: letters near the cursor show their construction (red boxes, baseline,
      x-height and cap-height lines) and spring away from it. Mouse only, and only while the lights are on.
   Mount <LightsOut /> once in App, next to <ContactOverlay />, and put <LightSwitch /> in the nav next to the
   theme toggle. Self-contained: styles injected below, no packages. Edit only the CONFIG block. */

/* ===================== CONFIG: edit these ===================== */
const RADIUS = 230; // torch radius in px (phones use 75% of it)
const CONSTRUCT = "h1, h2, h3, [data-construct]"; // headings that show letter construction on hover
const MIN_SIZE = 22; // ...if their text is at least this big (px)
const LIFT = 0.16; // how far letters spring up near the cursor, as a share of the font size (0 = no movement)
const SWITCH_LABEL = "Lights"; // tiny label beside the switch in the nav ("" = no label)
const SWITCH_TITLE = "Turn the lights off and see how it's built";
const BACK_ON = "Lights on"; // the button that floats over the dark, to turn them back on
const NOTE = "the real thing"; // hand-written note beside the torch
const CAPTION = "Lights out. This is how it's built."; // shown at the top while the lights are out
/* =============================================================== */

const RED = "#ed1d04";
const PAPER = "#cdc9c3";
const SHAPES = "h1,h2,h3,h4,h5,h6,p,li,a,button,img,svg,video,canvas,input,textarea,select,section,header,footer,nav,figure,blockquote";

type Box = { x: number; y: number; w: number; h: number };
const clampN = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/* ---------- the blueprint: draws what's in the viewport as a wireframe ---------- */
function drawBlueprint(cv: HTMLCanvasElement) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const W = window.innerWidth;
  const H = window.innerHeight;
  if (cv.width !== Math.round(W * dpr)) cv.width = Math.round(W * dpr);
  if (cv.height !== Math.round(H * dpr)) cv.height = Math.round(H * dpr);
  const c = cv.getContext("2d")!;
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.fillStyle = "#141316";
  c.fillRect(0, 0, W, H);
  // grid
  for (let x = 0; x < W; x += 24) {
    c.fillStyle = x % 120 === 0 ? "rgba(237,29,4,.2)" : "rgba(237,29,4,.08)";
    c.fillRect(x, 0, 1, H);
  }
  for (let y = 0; y < H; y += 24) {
    c.fillStyle = y % 120 === 0 ? "rgba(237,29,4,.2)" : "rgba(237,29,4,.08)";
    c.fillRect(0, y, W, 1);
  }
  const mono = "10px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  const tags: [string, number, number][] = [];
  const els = Array.from(document.body.querySelectorAll<HTMLElement>(SHAPES)).filter((el) => !el.closest(".lns-lo"));
  for (const el of els) {
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4 || r.bottom < 0 || r.top > H || r.right < 0 || r.left > W) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.opacity === "0" || cs.display === "none") continue;
    // skip things hidden by a parent (closed panels, faded layers)
    if ((el as any).checkVisibility && !(el as any).checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
    const tag = el.tagName.toLowerCase();
    const size = `${Math.round(r.width)}×${Math.round(r.height)}`;
    if (tag === "section" || tag === "header" || tag === "footer" || tag === "nav" || tag === "figure") {
      c.setLineDash([4, 4]);
      c.strokeStyle = "rgba(205,201,195,.22)";
      c.lineWidth = 1;
      c.strokeRect(r.left + 0.5, r.top + 0.5, r.width - 1, r.height - 1);
      c.setLineDash([]);
      if (r.width > 200) tags.push([`${tag} ${size}`, r.left, r.top]);
      continue;
    }
    if (tag === "img" || tag === "video" || tag === "canvas" || (tag === "svg" && r.width > 40)) {
      c.strokeStyle = "rgba(205,201,195,.45)";
      c.lineWidth = 1;
      c.strokeRect(r.left + 0.5, r.top + 0.5, r.width - 1, r.height - 1);
      c.beginPath();
      c.moveTo(r.left, r.top);
      c.lineTo(r.right, r.bottom);
      c.moveTo(r.right, r.top);
      c.lineTo(r.left, r.bottom);
      c.strokeStyle = "rgba(205,201,195,.18)";
      c.stroke();
      if (r.width > 60) tags.push([`${tag === "svg" ? "icon" : tag} ${size}`, r.left, r.top]);
      continue;
    }
    if (tag === "svg") continue;
    if (tag === "button" || tag === "input" || tag === "textarea" || tag === "select" || (tag === "a" && parseFloat(cs.paddingLeft) > 6)) {
      const rad = Math.min(parseFloat(cs.borderTopLeftRadius) || 0, r.height / 2);
      c.beginPath();
      c.roundRect(r.left + 0.5, r.top + 0.5, r.width - 1, r.height - 1, rad);
      c.strokeStyle = "rgba(205,201,195,.7)";
      c.lineWidth = 1;
      c.stroke();
      tags.push([`${tag} ${size}`, r.left, r.top]);
    }
    // text: single-line headings are traced as outlined letters, everything else as wireframe bars
    const isHead = /^h[1-4]$/.test(tag);
    const own = Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent!.trim());
    if (!own && !isHead) continue;
    const range = document.createRange();
    range.selectNodeContents(el);
    const lines = Array.from(range.getClientRects()).filter((q) => q.width > 2 && q.height > 2);
    const fs = parseFloat(cs.fontSize);
    const text = (el.textContent || "").replace(/\s+/g, " ").trim();
    if (isHead && text && lines.length && lines.every((q) => Math.abs(q.top - lines[0].top) < 2)) {
      c.font = `${cs.fontStyle} ${cs.fontWeight} ${fs}px ${cs.fontFamily}`;
      if ("letterSpacing" in c) (c as any).letterSpacing = cs.letterSpacing === "normal" ? "0px" : cs.letterSpacing;
      const m = c.measureText(text);
      const asc = m.fontBoundingBoxAscent || fs * 0.8;
      const desc = m.fontBoundingBoxDescent || fs * 0.2;
      const top = Math.min(...lines.map((q) => q.top));
      const lh = Math.max(...lines.map((q) => q.height));
      const left = Math.min(...lines.map((q) => q.left));
      const base = top + (lh - (asc + desc)) / 2 + asc;
      c.strokeStyle = PAPER;
      c.lineWidth = 1;
      c.textBaseline = "alphabetic";
      c.strokeText(text, left, base);
      c.fillStyle = "rgba(237,29,4,.55)";
      c.fillRect(left, Math.round(base), m.width, 1);
    } else {
      for (const q of lines) {
        c.beginPath();
        c.roundRect(q.left, q.top + q.height * 0.25, q.width, Math.max(3, q.height * 0.42), 3);
        c.fillStyle = isHead ? "rgba(205,201,195,.32)" : "rgba(205,201,195,.16)";
        c.fill();
      }
    }
    if (lines.length && (isHead || fs >= 18)) {
      tags.push([`${tag} ${Math.round(fs)}/${Math.round(parseFloat(cs.lineHeight) || fs * 1.2)} px`, lines[0].left, lines[0].top]);
    }
  }
  // size tags, red, as in a design tool
  c.font = mono;
  c.textBaseline = "middle";
  let n = 0;
  for (const [t, x, y] of tags) {
    if (n++ > 60) break;
    const w = c.measureText(t).width + 10;
    const ty = Math.max(2, y - 16);
    c.fillStyle = RED;
    c.fillRect(x, ty, w, 14);
    c.fillStyle = "#fff";
    c.fillText(t, x + 5, ty + 7.5);
  }
}

/* ---------- letter construction on hover ---------- */
type Glyph = {
  ch: string; r: Box; font: string; color: string; asc: number; desc: number;
  ox: number; oy: number; or: number; vx: number; vy: number; vr: number; // spring offset, velocity
};
function glyphsOf(el: HTMLElement): Glyph[] {
  const out: Glyph[] = [];
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  const meas = document.createElement("canvas").getContext("2d")!;
  let node: Node | null;
  while ((node = walk.nextNode())) {
    const t = node.textContent || "";
    const host = (node.parentElement || el) as HTMLElement;
    const cs = getComputedStyle(host);
    const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    meas.font = font;
    const m = meas.measureText("Hxg");
    const fs = parseFloat(cs.fontSize);
    const up = cs.textTransform === "uppercase";
    for (let i = 0; i < t.length; i++) {
      if (!t[i].trim()) continue;
      range.setStart(node, i);
      range.setEnd(node, i + 1);
      const q = range.getBoundingClientRect();
      if (q.width <= 0) continue;
      out.push({
        ch: up ? t[i].toUpperCase() : t[i], r: { x: q.left, y: q.top, w: q.width, h: q.height }, font, color: cs.color,
        asc: m.fontBoundingBoxAscent || fs * 0.8, desc: m.fontBoundingBoxDescent || fs * 0.2,
        ox: 0, oy: 0, or: 0, vx: 0, vy: 0, vr: 0,
      });
    }
  }
  return out;
}
const visible = (el: Element) =>
  !(el as any).checkVisibility || (el as any).checkVisibility({ opacityProperty: true, visibilityProperty: true });
const alpha = (c: string) => {
  if (c === "transparent") return 0;
  const m = c.match(/rgba?\(([^)]+)\)/);
  if (!m) return 1;
  const p = m[1].split(/[ ,/]+/).filter(Boolean);
  return p.length > 3 ? parseFloat(p[3]) : 1;
};
const opaque = (el: Element) => alpha(getComputedStyle(el).backgroundColor) >= 0.5;
// Headings that are already animated or drawn some other way are left alone: text that is clipped or masked
// (e.g. a wipe-in like the dot-matrix heading), rotated or vertical text, and text whose ink is invisible.
const constructable = (h: HTMLElement) => {
  if (h.closest("[data-no-construct]")) return false;
  let ok = h.classList.contains("lns-lo-ghost") || alpha(getComputedStyle(h).color) > 0.1; // (ghosted = ours, hidden on purpose)
  for (const el of ok ? [h, ...Array.from(h.querySelectorAll("*"))] : []) {
    const cs = getComputedStyle(el);
    if ((cs.clipPath && cs.clipPath !== "none") || (cs.maskImage && cs.maskImage !== "none") || cs.backgroundClip === "text") ok = false;
    if (cs.writingMode && !cs.writingMode.startsWith("horizontal")) ok = false;
    if (!ok) break;
  }
  for (let el: Element | null = h; ok && el && el !== document.body; el = el.parentElement) {
    const t = getComputedStyle(el).transform;
    const m = t && t !== "none" ? t.match(/matrix\(([^)]+)\)/) : null;
    if (m) {
      const [, b, c] = m[1].split(",").map(parseFloat);
      if (Math.abs(b) > 0.01 || Math.abs(c) > 0.01) ok = false; // rotated or skewed
    }
    const cs = getComputedStyle(el);
    if (cs.rotate && cs.rotate !== "none") ok = false;
  }
  return ok;
};

export default function LightsOut() {
  const rootRef = useRef<HTMLDivElement>(null);
  const bpRef = useRef<HTMLCanvasElement>(null);
  const tyRef = useRef<HTMLCanvasElement>(null);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const root = rootRef.current!;
    const bp = bpRef.current!;
    const ty = tyRef.current!;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const R = coarse ? RADIUS * 0.75 : RADIUS;
    const coords = root.querySelector<HTMLElement>(".lns-lo__coords");

    let on = false;
    let x = innerWidth / 2;
    let y = innerHeight / 2;
    let r = 0;
    let raf = 0;
    let dirty = true;

    const paint = () => {
      raf = 0;
      const target = on ? R : 0;
      r = reduce ? target : r + (target - r) * 0.18;
      if (Math.abs(target - r) < 0.4) r = target;
      root.style.setProperty("--x", `${x}px`);
      root.style.setProperty("--y", `${y}px`);
      root.style.setProperty("--r", `${r}px`);
      root.classList.toggle("is-left", x > innerWidth * 0.6);
      if (coords) coords.textContent = `x ${Math.round(x + scrollX)}  ·  y ${Math.round(y + scrollY)}`;
      if (on && dirty) {
        drawBlueprint(bp);
        dirty = false;
      }
      if (r !== target) raf = requestAnimationFrame(paint);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const set = (v: boolean) => {
      if (v === on) return;
      on = v;
      dirty = true;
      document.documentElement.classList.toggle("lns-lights-out", on);
      root.classList.toggle("is-on", on);
      setDark(on);
      if (on) release(); // no letter effect in the dark
      window.dispatchEvent(new CustomEvent("lns:lights-changed", { detail: on }));
      kick();
    };
    // the switch (or anything else) asks: detail true = lights out, false = lights on, nothing = toggle
    const ask = (e: Event) => set(typeof (e as CustomEvent).detail === "boolean" ? (e as CustomEvent).detail : !on);
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (on) kick();
    };
    const redraw = () => {
      dirty = true;
      if (on) kick();
    };
    const key = (e: KeyboardEvent) => e.key === "Escape" && set(false);

    window.addEventListener("lns:lights", ask);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", move, { passive: true }); // phones: the torch goes where you touch
    window.addEventListener("keydown", key);
    document.addEventListener("scroll", redraw, { passive: true, capture: true });
    window.addEventListener("resize", redraw);

    // ---- letter construction (mouse only) ----
    // Near the cursor the letters spring up and away from it, rotating slightly, each in a red construction box,
    // over static baseline / x-height / cap-height guides. While it plays, the real heading's ink is hidden and the
    // letters are drawn on the canvas in the same font, colour and place; the page itself is never changed.
    let head: HTMLElement | null = null; // heading under the cursor
    let live: HTMLElement | null = null; // heading currently drawn on the canvas (stays while letters settle back)
    let glyphs: Glyph[] = [];
    let tyRaf = 0;
    let mx = -999;
    let my = -999;
    const pickHead = (px: number, py: number) => {
      for (const el of document.elementsFromPoint(px, py)) {
        if (el.closest(".lns-lo")) continue;
        const h = el.closest?.(CONSTRUCT) as HTMLElement | null;
        if (h && visible(h) && parseFloat(getComputedStyle(h).fontSize) >= MIN_SIZE) return constructable(h) ? h : null;
        // an opaque layer (a modal, the full-screen build) covers whatever is underneath: stop looking
        if (visible(el) && opaque(el)) return null;
      }
      return null;
    };
    const release = () => {
      live?.classList.remove("lns-lo-ghost");
      live = null;
      glyphs = [];
    };
    const drawType = () => {
      tyRaf = 0;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const W = innerWidth;
      const H = innerHeight;
      if (ty.width !== Math.round(W * dpr)) ty.width = Math.round(W * dpr);
      if (ty.height !== Math.round(H * dpr)) ty.height = Math.round(H * dpr);
      const c = ty.getContext("2d")!;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, W, H);
      if (on || !live || !glyphs.length) {
        if (on) release();
        return;
      }
      const hovering = head === live;
      const fs = parseFloat(getComputedStyle(live).fontSize);
      const reach = Math.max(80, fs * 1.6);
      let moving = false;
      let near: Glyph | null = null;
      let best = Infinity;
      for (const g of glyphs) {
        const gx = g.r.x + g.r.w / 2;
        const gy = g.r.y + g.r.h / 2;
        const d = Math.hypot(gx - mx, gy - my);
        if (d < best) {
          best = d;
          near = g;
        }
        // where this letter wants to be: lifted, pushed sideways away from the cursor, tilted
        let f = hovering && !reduce ? clampN(1 - d / reach, 0, 1) : 0;
        f = f * f * (3 - 2 * f);
        const side = clampN((gx - mx) / reach, -1, 1);
        const tx = side * f * fs * LIFT * 1.6;
        const tyy = -f * fs * LIFT;
        const tr = side * f * 0.12;
        g.vx = (g.vx + (tx - g.ox) * 0.2) * 0.72;
        g.vy = (g.vy + (tyy - g.oy) * 0.2) * 0.72;
        g.vr = (g.vr + (tr - g.or) * 0.2) * 0.72;
        g.ox += g.vx;
        g.oy += g.vy;
        g.or += g.vr;
        if (Math.abs(g.vx) + Math.abs(g.vy) > 0.02 || Math.abs(tx - g.ox) + Math.abs(tyy - g.oy) > 0.05) moving = true;
        const base = g.r.y + (g.r.h - (g.asc + g.desc)) / 2 + g.asc;
        c.save();
        c.translate(gx + g.ox, base + g.oy);
        c.rotate(g.or);
        c.font = g.font;
        c.fillStyle = g.color;
        c.textBaseline = "alphabetic";
        c.textAlign = "center";
        c.fillText(g.ch, 0, 0);
        const a = hovering ? clampN(1 - d / reach, 0, 1) : 0;
        if (a > 0.02) {
          c.strokeStyle = `rgba(237,29,4,${(a * 0.85).toFixed(3)})`;
          c.lineWidth = 1;
          c.strokeRect(-g.r.w / 2, -(base - g.r.y), g.r.w, g.r.h);
        }
        c.restore();
      }
      if (hovering && near && best < reach * 1.2) {
        const g = near;
        c.font = g.font;
        c.textBaseline = "alphabetic"; // ascent is measured from the current baseline
        const capH = c.measureText("H").actualBoundingBoxAscent || fs * 0.7;
        const xH = c.measureText("x").actualBoundingBoxAscent || fs * 0.5;
        const base = g.r.y + (g.r.h - (g.asc + g.desc)) / 2 + g.asc;
        const lineGlyphs = glyphs.filter((q) => Math.abs(q.r.y - g.r.y) < 2);
        const x0 = Math.min(...lineGlyphs.map((q) => q.r.x)) - 24;
        const x1 = Math.max(...lineGlyphs.map((q) => q.r.x + q.r.w)) + 24;
        const guide = (yy: number, label: string) => {
          const grad = c.createLinearGradient(mx - reach * 2, 0, mx + reach * 2, 0);
          grad.addColorStop(0, "rgba(237,29,4,.2)");
          grad.addColorStop(0.5, "rgba(237,29,4,.75)");
          grad.addColorStop(1, "rgba(237,29,4,.2)");
          c.fillStyle = grad;
          c.fillRect(x0, Math.round(yy), x1 - x0, 1);
          c.font = "9px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
          c.fillStyle = "rgba(237,29,4,.8)";
          // labels sit just past the end of the line (or before its start if there's no room)
          const right = x1 + 70 < innerWidth;
          c.textAlign = right ? "left" : "right";
          c.textBaseline = "middle";
          if (label) c.fillText(label, right ? x1 + 6 : x0 - 6, yy);
        };
        guide(base, "baseline");
        guide(base - xH, capH - xH > 13 ? "x-height" : ""); // small type: line only, no label
        guide(base - capH, "cap height");
        // the letter nearest the cursor gets its name tag, riding along with it
        c.font = "10px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
        const tag = `${g.ch} · ${Math.round(parseFloat(g.font.split(" ")[2]) || fs)} px`;
        const tw = c.measureText(tag).width + 10;
        const tx = g.r.x + g.ox;
        const tyy = g.r.y + g.oy - 18;
        c.fillStyle = RED;
        c.fillRect(tx, tyy, tw, 14);
        c.fillStyle = "#fff";
        c.textAlign = "left";
        c.textBaseline = "middle";
        c.fillText(tag, tx + 5, tyy + 7.5);
      }
      if (moving || hovering) tyRaf = requestAnimationFrame(drawType);
      else {
        c.clearRect(0, 0, W, H);
        release();
      }
    };
    const tyKick = () => {
      if (!tyRaf) tyRaf = requestAnimationFrame(drawType);
    };
    const tyMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || on) return;
      mx = e.clientX;
      my = e.clientY;
      const h = pickHead(mx, my);
      if (h !== head) {
        head = h;
        if (h && h !== live) {
          release(); // a different heading: the old one snaps back
          live = h;
          glyphs = glyphsOf(h);
          h.classList.add("lns-lo-ghost");
        }
      }
      tyKick();
    };
    const tyRefresh = () => {
      if (!live) return;
      // positions move on scroll/resize: re-measure, keep each letter's current offset
      const fresh = glyphsOf(live);
      if (fresh.length === glyphs.length)
        fresh.forEach((g, i) => Object.assign(g, { color: glyphs[i].color, ox: glyphs[i].ox, oy: glyphs[i].oy, or: glyphs[i].or, vx: glyphs[i].vx, vy: glyphs[i].vy, vr: glyphs[i].vr }));
      else if (glyphs.length) fresh.forEach((g) => (g.color = glyphs[0].color)); // text changed: keep the ink colour, not the hidden one
      glyphs = fresh;
      head = pickHead(mx, my) === live ? live : head === live ? null : head;
      tyKick();
    };
    const tyLeave = () => {
      head = null;
      tyKick();
    };
    if (!coarse) {
      window.addEventListener("pointermove", tyMove, { passive: true });
      document.addEventListener("scroll", tyRefresh, { passive: true, capture: true });
      window.addEventListener("resize", tyRefresh);
      document.documentElement.addEventListener("mouseleave", tyLeave);
    }

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(tyRaf);
      document.documentElement.classList.remove("lns-lights-out");
      window.removeEventListener("lns:lights", ask);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", move);
      window.removeEventListener("keydown", key);
      document.removeEventListener("scroll", redraw, { capture: true });
      window.removeEventListener("resize", redraw);
      window.removeEventListener("pointermove", tyMove);
      document.removeEventListener("scroll", tyRefresh, { capture: true });
      window.removeEventListener("resize", tyRefresh);
      document.documentElement.removeEventListener("mouseleave", tyLeave);
      release();
    };
  }, []);

  return (
    <div ref={rootRef} className="lns-lo">
      <style>{CSS}</style>
      <canvas ref={tyRef} className="lns-lo__type" aria-hidden="true" />
      <canvas ref={bpRef} className="lns-lo__bp" aria-hidden="true" />
      <div className="lns-lo__coords" aria-hidden="true" />
      <span className="lns-lo__note" aria-hidden="true">{NOTE}</span>
      <p className="lns-lo__cap" aria-live="polite">{dark ? CAPTION : ""}</p>
      {/* floats above the dark, so the lights can always come back on */}
      <button type="button" className="lns-lo__on" tabIndex={dark ? 0 : -1} aria-hidden={!dark} onClick={() => toggleLights(false)}>
        <i />
        {BACK_ON}
      </button>
    </div>
  );
}

const CSS = `
@import url("https://fonts.googleapis.com/css2?family=Caveat:wght@500&display=swap");
.lns-lo{position:fixed;inset:0;z-index:950;pointer-events:none;--x:50vw;--y:50vh;--r:0px}
.lns-lo > *{position:fixed}
.lns-lo__type{inset:0;width:100vw;height:100vh;z-index:1}
/* while its letters are drawn moving on the canvas, the real heading's ink is hidden (layout and selection stay) */
.lns-lo-ghost,.lns-lo-ghost *{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important}
/* lights out: the blueprint covers the whole screen, except a soft torch around the cursor where the real site shows */
.lns-lo__bp{inset:0;width:100vw;height:100vh;opacity:0;visibility:hidden;transition:opacity .3s,visibility 0s .3s;
  -webkit-mask:radial-gradient(circle var(--r) at var(--x) var(--y), transparent 45%, #000 100%);
          mask:radial-gradient(circle var(--r) at var(--x) var(--y), transparent 45%, #000 100%)}
/* the lights go out with a fluorescent flicker */
.lns-lo.is-on .lns-lo__bp{opacity:1;visibility:visible;transition:none;animation:lnsLoFlicker .5s steps(1) both}
@keyframes lnsLoFlicker{0%{opacity:.85}12%{opacity:.15}24%{opacity:.95}36%{opacity:.4}50%{opacity:1}}
.lns-lo__coords{left:var(--x);top:calc(var(--y) + var(--r) * .55);transform:translateX(-50%);opacity:0;
  font:10px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:${RED};white-space:nowrap}
.lns-lo__note{left:calc(var(--x) + var(--r) * .5);top:calc(var(--y) - var(--r) * .62);opacity:0;transform:rotate(-8deg);
  font:500 20px/1 "Caveat","Segoe Print","Bradley Hand",cursive;color:${RED};white-space:nowrap}
.lns-lo.is-left .lns-lo__note{left:auto;right:calc(100vw - var(--x) + var(--r) * .5);transform:rotate(8deg)}
.lns-lo.is-on .lns-lo__note,.lns-lo.is-on .lns-lo__coords{opacity:1;transition:opacity .3s .4s}
.lns-lo__cap{left:50%;bottom:78px;margin:0;transform:translateX(-50%);white-space:nowrap;opacity:0;
  font:11px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:.14em;text-transform:uppercase;color:${PAPER}}
.lns-lo.is-on .lns-lo__cap{opacity:.8;transition:opacity .4s .5s}
/* "Lights on": always reachable while it's dark */
.lns-lo__on{left:50%;bottom:24px;transform:translate(-50%,16px);display:flex;align-items:center;gap:10px;margin:0;padding:10px 16px 10px 12px;
  border:1px solid rgba(205,201,195,.25);border-radius:999px;background:#28272a;color:${PAPER};cursor:pointer;
  font:500 13px/1 var(--lns-body, system-ui, sans-serif);opacity:0;pointer-events:none;transition:opacity .3s,transform .3s;
  box-shadow:0 14px 30px -12px rgba(0,0,0,.6)}
.lns-lo__on i{width:8px;height:8px;border-radius:50%;background:#f3e6c4;box-shadow:0 0 10px 2px rgba(243,230,196,.6)}
.lns-lo.is-on .lns-lo__on{opacity:1;pointer-events:auto;transform:translate(-50%,0);transition-delay:.4s}
.lns-lo__on:hover{background:#000}
.lns-lo__on:focus-visible{outline:2px solid ${RED};outline-offset:3px}
html.lns-lights-out{cursor:crosshair}
@media (prefers-reduced-motion:reduce){.lns-lo *{transition:none!important;animation:none!important}}
`;

/* ---------- the switch for the nav ---------- */
/* Turns the lights out/on anywhere: toggleLights() flips, toggleLights(true) = out, toggleLights(false) = on. */
export function toggleLights(out?: boolean) {
  window.dispatchEvent(new CustomEvent("lns:lights", { detail: out }));
}

export function LightSwitch({ className }: { className?: string }) {
  const [out, setOut] = useState(false);
  useEffect(() => {
    const on = (e: Event) => setOut(!!(e as CustomEvent).detail);
    window.addEventListener("lns:lights-changed", on);
    return () => window.removeEventListener("lns:lights-changed", on);
  }, []);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={out}
      aria-label={SWITCH_TITLE}
      title={SWITCH_TITLE}
      className={"lns-sw" + (out ? " is-out" : "") + (className ? " " + className : "")}
      onClick={() => toggleLights()}
    >
      <style>{SWITCH_CSS}</style>
      <span className="lns-sw__plate" aria-hidden="true">
        <span className="lns-sw__rocker" />
      </span>
      {SWITCH_LABEL && <span className="lns-sw__label">{SWITCH_LABEL}</span>}
    </button>
  );
}

const SWITCH_CSS = `
/* a small wall switch: the rocker tips down when the lights are out. Uses the nav's text colour */
.lns-sw{display:inline-flex;align-items:center;gap:8px;margin:0;padding:4px;border:0;background:transparent;color:inherit;cursor:pointer;
  font:500 12px/1 var(--lns-body, system-ui, sans-serif);-webkit-tap-highlight-color:transparent}
.lns-sw__plate{position:relative;display:block;width:22px;height:30px;border-radius:6px;border:1.5px solid currentColor;opacity:.9}
.lns-sw__rocker{position:absolute;left:4px;right:4px;top:4px;height:12px;border-radius:3px;background:currentColor;
  transition:top .22s cubic-bezier(.3,1.6,.5,1),background .2s}
.lns-sw__rocker::after{content:"";position:absolute;left:50%;top:50%;width:4px;height:4px;margin:-2px 0 0 -2px;border-radius:50%;background:${RED};
  box-shadow:0 0 6px 1px rgba(237,29,4,.7);opacity:0;transition:opacity .2s}
.lns-sw.is-out .lns-sw__rocker{top:11px}
.lns-sw.is-out .lns-sw__rocker::after{opacity:1}
.lns-sw:hover .lns-sw__plate{opacity:1}
.lns-sw:focus-visible{outline:2px solid ${RED};outline-offset:3px;border-radius:8px}
@media (prefers-reduced-motion:reduce){.lns-sw__rocker{transition:none}}
`;
