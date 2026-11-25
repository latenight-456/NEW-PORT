import React, { useEffect, useRef, useState } from "react";
import { openContactOverlay } from "./ContactOverlay";
import { MARK_D, MARK_VB } from "./ProcessBuild";
import { CONTACT } from "./ContactPage";

/* Late Night Studio: the About page (its own page, at /about or #/about).
   1. Intro: your name, a short story and your photo.
   2. The details: Experience, Education, Certificates, Capabilities, Tools, Let's talk, zig-zagging left and right.
      Your photo is a card that flies down from the intro and crosses from side to side as each row arrives, bending
      like paper with its own speed and rebuilding under a red scan line with that row's picture. Hover it and it
      bulges under the cursor; grab it and pull, and it stretches and wobbles back. (WebGL; plain 2D if unavailable.)
   3. A night at the desk: the page pins while you scroll, 22:00 to 04:00, and each hour puts one thing on your desk
      (an isometric line drawing). Everything is playable: the lamp follows you, the laptop screen changes, the coffee goes down,
      you can draw in the sketchbook, drag the bars in the stats notebook, play a beat on the headphones, and the phone
      at 04:00 opens Let's talk.
   4. What I stick to: four principles, each with a small drawing that plays when it comes into view.
   Self-contained: styles injected below, no packages. Edit only the CONFIG block. */

/* ===================== CONFIG: edit these ===================== */
const NAME = "Richy";
const LEAD = "Designer in Accra with a marketer's head and a statistician's habits. I build things that look right and actually sell.";
const STORY = [
  "I'm the whole studio. The person you talk to on the first call is the person who designs it, builds it and hands it over. No account manager, no hand-offs.",
  "By day I run marketing campaigns. By night I build. That's where the name comes from.",
  "A statistics degree, years of CRM and shop-floor work, and design since 2014. So I don't just make it look good: I build it around how your business actually sells.",
];
const SIGNATURE = "Richy, Late night studio";
const PHOTO = "/images/richy.jpeg"; // e.g. "/images/richy.jpg" (portrait, about 4:5). Empty shows a drawn placeholder frame.
const PHOTO_ALT = "Portrait of Richy";

const NIGHT_EYEBROW = "A night at the desk";
const STEPS: [string, string, string][] = [
  // [title, line, what to try] — one per hour, 22:00 → 04:00. Each hour puts one thing on the desk.
  ["The desk.", "Same desk every night. The lamp goes where you go.", "Move around the desk"],
  ["The laptop.", "Where the websites, systems and logos get built.", "Tap the screen"],
  ["Coffee.", "Midnight, second cup. The house is quiet now.", "Take a sip"],
  ["The sketchbook.", "Every logo and layout starts as a scribble.", "Draw something"],
  ["The numbers.", "A statistics degree never really leaves you. Every decision gets measured.", "Drag the bars"],
  ["Music.", "Same beat, same focus, until it's right.", "Press play on the headphones"],
  ["Sent.", "04:00. It's live, and the client is awake. Your turn.", "Tap the phone"],
];

/* The details: label | travelling card | content. The card flies down from your photo and rides beside each row,
   bending as it moves and rebuilding itself (a red scan line) with that row's picture.
   card.img: a picture for that row (e.g. "/images/knust.jpg"). Leave "" for a drawn studio card with `big` and `tag`.
   All facts come from your CV: keep them true. */
type Item = { year?: string; title: string; where?: string; text?: string };
type Row = { label: string; card: { img: string; big: string; tag: string }; items?: Item[]; cols?: string[]; cta?: boolean };
const ROWS: Row[] = [
  {
    label: "Experience",
    card: { img: "", big: "2019 → now", tag: "Experience" },
    items: [
      { year: "2025 – now", title: "Marketing specialist", where: "Softcare Ghana", text: "Campaigns across digital, social, email and print, with one brand kept consistent everywhere." },
      { year: "2023 – 24", title: "CRM specialist", where: "Sunda International", text: "Set up and tuned CRM systems and trained the staff to use them. That's where the systems work started." },
      { year: "2021 – 22", title: "Research assistant", where: "Ghana Cocoa Board · National Service", text: "Export reports and survey data for the STABEX programme. Accuracy over everything." },
      { year: "2019", title: "Intern", where: "Institute of African Studies, Legon · Yiri Lodge", text: "Records, sales dispatch and stock. First look at how a small operation really runs." },
    ],
  },
  {
    label: "Education",
    card: { img: "", big: "KNUST", tag: "BSc Statistics" },
    items: [
      { year: "2017 – 21", title: "BSc Statistics", where: "KNUST", text: "Four years of numbers. It's why I build with data, not guesses." },
      { year: "2014", title: "Certificate in Graphic Design", where: "Philips Training Institute", text: "Where it started, and I never stopped drawing." },
    ],
  },
  {
    label: "Certificates",
    card: { img: "", big: "Always learning", tag: "5 certificates" },
    items: [
      { title: "AI, Digital Marketing & Strategic Communications", where: "IDMC Ghana" },
      { title: "Generative AI", where: "Google Cloud" },
      { title: "CS50: Introduction to Information Technology", where: "Harvard University" },
      { title: "Data Analytics with Excel", where: "Great Learning Academy" },
      { title: "Frontend Development" },
    ],
  },
  {
    label: "Capabilities",
    card: { img: "", big: "Look + logic", tag: "What I do" },
    cols: ["Websites", "Business systems", "Branding", "Graphic design", "Video editing", "Marketing campaigns", "CRM setup", "Data and reporting"],
  },
  {
    label: "Tools",
    card: { img: "", big: "The kit", tag: "Tools" },
    cols: ["Framer", "Affinity", "CorelDRAW", "Excel", "CRM software", "Generative AI tools"],
  },
  {
    label: "Let's talk",
    card: { img: "", big: "Your project", tag: "Next up" },
    cta: true,
  },
];
const NEXT = "Next up: your project.";
const CTA = "Let's talk";
const EMAIL = "";
const PULL_NOTE = "go on, pull it"; // the little handwritten note under the card in the first row // shown under the button. "" = use the email from ContactPage's CONTACT.

const RULES_TITLE = "What I stick to.";
const RULES: [string, string][] = [
  ["You talk to the builder.", "No middlemen. The person on the call is the person writing the code, so nothing gets lost on the way."],
  ["Phones first.", "Most of your customers will see it on a phone. That's where it gets designed first, not squeezed in last."],
  ["Not a template.", "Your business isn't anyone else's, so the site shouldn't be either. Built for you, from a blank page."],
  ["Yours to keep.", "Domain, logins, files and code in your name. If we ever stop working together, you keep everything."],
];
/* =============================================================== */


function Arrow() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M4.5 11.5l7-7M5.5 4.5h6v6" />
    </svg>
  );
}

/* ---------- a night at the desk (isometric line drawing) ---------- */
// desk space: x runs right-down, y runs left-down, z is up. 1 unit = 1px before scaling.
const IC = 0.866, OX = 610, OY = 170;
const iso = (x: number, y: number, z = 0): [number, number] => [OX + (x - y) * IC, OY + (x + y) * 0.5 - z];
const pts = (...p: [number, number, number][]) => p.map(([x, y, z]) => iso(x, y, z).map((n) => n.toFixed(1)).join(",")).join(" ");
// a flat surface at height z: draw in plain (x, y) inside it and it lands on the desk at the right angle
const plane = (z = 0) => `matrix(${IC} 0.5 ${-IC} 0.5 ${OX} ${OY - z})`;
const DESK_ORDER = ["lamp", "laptop", "mug", "sketch", "stats", "phones", "phone"]; // one per hour

function Box({ x0, x1, y0, y1, z0, z1, cls = "" }: { x0: number; x1: number; y0: number; y1: number; z0: number; z1: number; cls?: string }) {
  return (
    <g className={"iso-box " + cls}>
      <polygon className="iso-l" points={pts([x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1])} />
      <polygon className="iso-r" points={pts([x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1])} />
      <polygon className="iso-t" points={pts([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1])} />
    </g>
  );
}

function Cyl({ x, y, z0, z1, r, cls = "", children }: { x: number; y: number; z0: number; z1: number; r: number; cls?: string; children?: React.ReactNode }) {
  const [cx, cy] = iso(x, y, z0);
  const rx = r * 1.2247, ry = r * 0.7071, h = z1 - z0;
  return (
    <g className={"iso-cyl " + cls}>
      <path className="iso-r" d={`M${cx - rx} ${cy - h}V${cy}A${rx} ${ry} 0 0 0 ${cx + rx} ${cy}V${cy - h}Z`} />
      <ellipse className="iso-t" cx={cx} cy={cy - h} rx={rx} ry={ry} />
      {children}
    </g>
  );
}

const svgPoint = (el: SVGGraphicsElement, x: number, y: number) => {
  const m = el.getScreenCTM();
  if (!m) return { x: 0, y: 0 };
  const pt = new DOMPoint(x, y).matrixTransform(m.inverse());
  return { x: pt.x, y: pt.y };
};

/* a soft beat for the headphones, made on the spot (no audio files) */
function makeBeat() {
  const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
  if (!AC) return null;
  const ac: AudioContext = new AC();
  const out = ac.createGain();
  out.gain.value = 0.16;
  out.connect(ac.destination);
  const noise = ac.createBuffer(1, ac.sampleRate * 0.2, ac.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const bass = [55, 55, 65.4, 49];
  let step = 0;
  const beat = 60 / 84 / 2;
  let next = ac.currentTime + 0.05;
  const hit = (t: number) => {
    const s = step % 16;
    if (s % 8 === 0 || s === 11) {
      const o = ac.createOscillator(), g = ac.createGain();
      o.frequency.setValueAtTime(120, t);
      o.frequency.exponentialRampToValueAtTime(42, t + 0.18);
      g.gain.setValueAtTime(1, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      o.connect(g).connect(out);
      o.start(t);
      o.stop(t + 0.32);
    }
    if (s % 2 === 1) {
      const n = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
      n.buffer = noise;
      f.type = "highpass";
      f.frequency.value = 7000;
      g.gain.value = s % 4 === 3 ? 0.35 : 0.18;
      n.connect(f).connect(g).connect(out);
      n.start(t);
      n.stop(t + 0.06);
    }
    if (s % 4 === 0) {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = "triangle";
      o.frequency.value = bass[Math.floor(step / 16) % 4] * 2;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.25, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.001, t + beat * 3.6);
      o.connect(g).connect(out);
      o.start(t);
      o.stop(t + beat * 4);
    }
    step++;
  };
  const timer = window.setInterval(() => {
    while (next < ac.currentTime + 0.12) {
      hit(next);
      next += beat;
    }
  }, 30);
  return {
    stop: () => {
      clearInterval(timer);
      ac.close();
    },
  };
}

// the laptop lid leans back 14°. This maps flat screen artwork (0..W across, 0..H down) onto it.
const LID = { x0: 400, x1: 700, hinge: 178, z: 14, h: 220, tilt: 0.24 };
const lidMatrix = () => {
  const s = Math.sin(LID.tilt), c = Math.cos(LID.tilt);
  const A: [number, number] = [IC, 0.5]; // along x
  const B: [number, number] = [IC * s, -(0.5 * s + c)]; // up the lid
  const [bx, by] = iso(LID.x0, LID.hinge, LID.z);
  return `matrix(${A[0]} ${A[1]} ${-B[0]} ${-B[1]} ${bx + LID.h * B[0]} ${by + LID.h * B[1]})`;
};

function Desk({ step }: { step: number }) {
  const svg = useRef<SVGSVGElement>(null);
  const deskPlane = useRef<SVGGElement>(null);
  const sketchRef = useRef<SVGGElement>(null);
  const [port, setPort] = useState(false);
  const [light, setLight] = useState<{ x: number; y: number } | null>(null);
  const [screen, setScreen] = useState(0);
  const [scan, setScan] = useState(0);
  const [sips, setSips] = useState(0);
  const [ripple, setRipple] = useState(0);
  const [lines, setLines] = useState<string[]>([]);
  const drawing = useRef<string | null>(null);
  const [bars, setBars] = useState([36, 62, 48, 88, 74, 108]);
  const dragBar = useRef<{ i: number; y: number; h: number } | null>(null);
  const [playing, setPlaying] = useState(false);
  const beat = useRef<{ stop: () => void } | null>(null);
  const [buzz, setBuzz] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(max-width:720px)");
    const on = () => setPort(mq.matches);
    on();
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);
  // music stops when you leave the scene
  useEffect(() => {
    const el = svg.current!;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting && beat.current) {
        beat.current.stop();
        beat.current = null;
        setPlaying(false);
      }
    });
    io.observe(el);
    return () => {
      io.disconnect();
      beat.current?.stop();
    };
  }, []);

  const arrive = (i: number) => ({ ["--a" as any]: i + 0.12, ["--d" as any]: 0.5 }) as React.CSSProperties;
  const ready = (k: string) => step >= DESK_ORDER.indexOf(k);

  const onMoveDesk = (e: React.PointerEvent<SVGSVGElement>) => {
    if (deskPlane.current) {
      const q = svgPoint(deskPlane.current, e.clientX, e.clientY);
      setLight({ x: Math.max(30, Math.min(970, q.x)), y: Math.max(30, Math.min(530, q.y)) });
    }
    if (drawing.current !== null && sketchRef.current) {
      const q = svgPoint(sketchRef.current, e.clientX, e.clientY);
      if (q.x > 64 && q.x < 330 && q.y > 300 && q.y < 486) {
        drawing.current += ` L${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
        const d = drawing.current;
        setLines((l) => [...l.slice(0, -1), d]);
      }
    }
    if (dragBar.current && svg.current) {
      const q = svgPoint(svg.current, e.clientX, e.clientY);
      const { i, y, h } = dragBar.current;
      const nh = Math.max(8, Math.min(150, h + (y - q.y)));
      setBars((b) => b.map((v, j) => (j === i ? Math.round(nh) : v)));
    }
  };
  const endDrag = () => {
    drawing.current = null;
    dragBar.current = null;
  };
  const startDraw = (e: React.PointerEvent) => {
    if (!sketchRef.current) return;
    e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const q = svgPoint(sketchRef.current, e.clientX, e.clientY);
    drawing.current = `M${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
    const d = drawing.current;
    setLines((l) => [...l.slice(-30), d + " l0.1 0"]);
  };
  const sip = () => {
    setSips((s) => (s >= 4 ? 0 : s + 1));
    setRipple((r) => r + 1);
  };
  const nextScreen = () => {
    setScreen((s) => (s + 1) % 3);
    setScan((n) => n + 1);
  };
  const toggleMusic = () => {
    if (beat.current) {
      beat.current.stop();
      beat.current = null;
      setPlaying(false);
    } else {
      beat.current = makeBeat();
      setPlaying(!!beat.current);
    }
  };
  const key = (e: React.KeyboardEvent, fn: () => void) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fn();
    }
  };
  const phoneTap = () => {
    setBuzz((b) => b + 1);
    window.setTimeout(() => openContactOverlay(), 380);
  };

  const mean = Math.round(bars.reduce((a, b) => a + b, 0) / bars.length);
  const level = 1 - sips / 5;
  const pool = light || { x: 250, y: 260 };
  // the lamp: base at (95, 70), head leans toward wherever the light is
  const LB = { x: 95, y: 70 };
  const hx = LB.x + (pool.x - LB.x) * 0.3, hy = LB.y + (pool.y - LB.y) * 0.3;
  const [b0x, b0y] = iso(LB.x, LB.y, 14), [elx, ely] = iso(LB.x, LB.y, 150), [hdx, hdy] = iso(hx, hy, 175);
  const [mx, my] = iso(250, 70, 0); // mug
  const mrx = 34 * 1.2247, mry = 34 * 0.7071;
  // headphones: two cups and a band arching between them
  const cupA = { x: 830, y: 80 }, cupB = { x: 900, y: 175 };
  const band = Array.from({ length: 17 }, (_, i) => {
    const t = i / 16, a = Math.PI * t;
    const x = cupA.x + (cupB.x - cupA.x) * t - Math.sin(a) * 18, y = cupA.y + (cupB.y - cupA.y) * t + Math.sin(a) * 18;
    return iso(x, y, 22 + Math.sin(a) * 70).map((n) => n.toFixed(1)).join(",");
  }).join(" ");
  const barX = (i: number) => 770 + (i % 3) * 52, barY = (i: number) => 350 + Math.floor(i / 3) * 66;
  const vb = port ? "470 140 1100 760" : "0 0 1600 1000";

  return (
    <svg
      ref={svg}
      className={"lns-ab__room lns-ab__desk" + (playing ? " is-playing" : "")}
      viewBox={vb}
      preserveAspectRatio={port ? "xMidYMid meet" : "xMidYMid slice"}
      onPointerMove={onMoveDesk}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
    >
      <defs>
        <radialGradient id="dkPool">
          <stop offset="0" stopColor="#ffb257" stopOpacity=".55" />
          <stop offset=".6" stopColor="#ffb257" stopOpacity=".18" />
          <stop offset="1" stopColor="#ffb257" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g transform="translate(380 90) scale(.8)">

      {/* 22:00 the desk itself */}
      <g className="dk-ob" style={arrive(-0.1)}>
        <polygon className="iso-shadow" points={pts([20, 30, -34], [1020, 30, -34], [1020, 590, -34], [20, 590, -34])} />
        <Box x0={0} x1={1000} y0={0} y1={560} z0={-26} z1={0} cls="dk-deskbox" />
        <g transform={plane(0)} ref={deskPlane}>
          <rect className="dk-mat" x="80" y="300" width="270" height="200" rx="10" />
          <circle className="dk-pool" cx={pool.x} cy={pool.y} r="190" fill="url(#dkPool)" style={arrive(0)} />
          {/* where things will go: dashed placeholders, like a plan */}
          <rect className="dk-foot" x="384" y="164" width="332" height="244" rx="14" style={arrive(1)} />
          <circle className="dk-foot" cx="250" cy="70" r="46" style={arrive(2)} />
          <rect className="dk-foot" x="60" y="290" width="290" height="210" rx="10" style={arrive(3)} />
          <rect className="dk-foot" x="748" y="318" width="200" height="200" rx="10" style={arrive(4)} />
          <rect className="dk-foot" x="770" y="40" width="190" height="190" rx="60" style={arrive(5)} />
          <rect className="dk-foot" x="476" y="430" width="92" height="124" rx="16" style={arrive(6)} />
        </g>
      </g>

      {/* the lamp: its light follows you */}
      <g className="dk-ob" style={arrive(0)}>
        <path className="dk-cone" d={`M${hdx - 10} ${hdy + 6}L${iso(pool.x - 70, pool.y + 70, 0).join(" ")}L${iso(pool.x + 70, pool.y - 70, 0).join(" ")}L${hdx + 10} ${hdy + 6}Z`} />
        <Cyl x={LB.x} y={LB.y} z0={0} z1={14} r={38} />
        <path className="iso-line dk-arm" d={`M${b0x} ${b0y}L${elx} ${ely}L${hdx} ${hdy}`} />
        <circle className="iso-joint" cx={elx} cy={ely} r="6" />
        <path className="dk-shade" d={`M${hdx - 26} ${hdy - 6}Q${hdx} ${hdy - 34} ${hdx + 26} ${hdy - 6}L${hdx + 16} ${hdy + 8}Q${hdx} ${hdy + 14} ${hdx - 16} ${hdy + 8}Z`} />
        <ellipse className="dk-bulb" cx={hdx} cy={hdy + 8} rx="14" ry="6" />
        <text className="dk-tag" x={b0x - 70} y={b0y + 44} style={arrive(0)}>Lamp · 2700 K</text>
      </g>

      {/* 00:00 coffee: take a sip */}
      <g
        className={"dk-ob dk-hit" + (ready("mug") ? "" : " is-off")}
        style={arrive(2)}
        onClick={sip}
        onKeyDown={(e) => key(e, sip)}
        role="button"
        tabIndex={ready("mug") ? 0 : -1}
        aria-label="Take a sip"
      >
        <ellipse className="iso-shadow" cx={mx + 12} cy={my + 6} rx={mrx + 4} ry={mry + 3} />
        <path className="iso-line dk-handle" d={`M${mx + mrx - 2} ${my - 72}c34 -2 36 40 2 46`} />
        <Cyl x={250} y={70} z0={0} z1={86} r={34} cls="dk-mug">
          <ellipse className="dk-coffee" cx={mx} cy={my - 86 + (1 - level) * 6} rx={(mrx - 6) * Math.max(0.2, 0.55 + level * 0.45)} ry={(mry - 4) * Math.max(0.2, 0.55 + level * 0.45)} />
          <ellipse key={ripple} className="dk-ripple" cx={mx} cy={my - 86} rx="10" ry="6" />
        </Cyl>
        {level > 0.25 && (
          <g className="dk-steam">
            <path d={`M${mx - 14} ${my - 104}c-10-14 10-22 0-38`} />
            <path d={`M${mx + 4} ${my - 110}c-10-14 10-22 0-38`} />
            <path d={`M${mx + 22} ${my - 104}c-10-14 10-22 0-38`} />
          </g>
        )}
        <text className="dk-tag" x={mx - 64} y={my + 46}>
          {sips >= 4 ? "Mug · empty · tap to refill" : sips ? `Mug · ${4 - sips} sips left` : "Mug · 2nd cup · tap"}
        </text>
      </g>

      {/* 03:00 headphones: press play */}
      <g
        className={"dk-ob dk-hit" + (ready("phones") ? "" : " is-off")}
        style={arrive(5)}
        onClick={toggleMusic}
        onKeyDown={(e) => key(e, toggleMusic)}
        role="button"
        tabIndex={ready("phones") ? 0 : -1}
        aria-label={playing ? "Stop the music" : "Play some music"}
        aria-pressed={playing}
      >
        <polyline className="dk-band" points={band} />
        <polyline className="dk-band-in" points={band} />
        {[cupA, cupB].map((c, i) => (
          <g key={i} className="dk-cup">
            <Cyl x={c.x} y={c.y} z0={0} z1={22} r={34}>
              <ellipse className="dk-cup-pad" cx={iso(c.x, c.y, 22)[0]} cy={iso(c.x, c.y, 22)[1]} rx={34 * 1.2247 * 0.55} ry={34 * 0.7071 * 0.55} />
            </Cyl>
          </g>
        ))}
        {playing && (
          <g className="dk-eq">
            {Array.from({ length: 9 }, (_, i) => {
              const [ex, ey] = iso(850 + i * 6, 130 - i * 6, 60);
              return <rect key={i} x={ex} y={ey - 40} width="4" height="40" style={{ animationDelay: `${-(i * 0.17) % 0.7}s` }} />;
            })}
          </g>
        )}
        <text className="dk-tag" x={iso(830, 80, 0)[0] - 30} y={iso(830, 80, 0)[1] - 70}>
          {playing ? "Now playing · 84 BPM · tap to stop" : "Headphones · tap to play"}
        </text>
      </g>

      {/* 23:00 the laptop: tap the screen */}
      <g className="dk-ob" style={arrive(1)}>
        <polygon className="iso-shadow" points={pts([412, 190, 0], [716, 190, 0], [716, 404, 0], [412, 404, 0])} />
        {/* the lid, leaning back */}
        <g transform={lidMatrix()}>
          <rect className="dk-lid" x="0" y="0" width={LID.x1 - LID.x0} height={LID.h} rx="12" />
          <g
            className={"dk-hit" + (ready("laptop") ? "" : " is-off")}
            onClick={nextScreen}
            onKeyDown={(e) => key(e, nextScreen)}
            role="button"
            tabIndex={ready("laptop") ? 0 : -1}
            aria-label="Show what's on the laptop"
          >
            <rect className="dk-screen" x="12" y="12" width={LID.x1 - LID.x0 - 24} height={LID.h - 30} rx="4" />
            {screen === 0 && (
              <g>
                <rect className="dk-ui" x="24" y="24" width="252" height="10" rx="3" />
                <rect className="dk-ui-ink" x="24" y="48" width="140" height="16" rx="3" />
                <rect className="dk-ui-ink" x="24" y="70" width="100" height="16" rx="3" />
                <rect className="dk-ui" x="24" y="96" width="120" height="6" rx="3" />
                <rect className="dk-red" x="24" y="116" width="58" height="20" rx="10" />
                <rect className="dk-card" x="178" y="48" width="98" height="140" rx="6" />
                <rect className="dk-card dk-dash" x="24" y="150" width="140" height="38" rx="6" />
              </g>
            )}
            {screen === 1 && (
              <g>
                <rect className="dk-ui-ink" x="12" y="12" width="50" height={LID.h - 30} />
                {[0, 1, 2, 3].map((i) => (
                  <rect key={i} x="22" y={30 + i * 22} width="26" height="6" rx="3" className={i === 1 ? "dk-red" : "dk-ui"} />
                ))}
                {[40, 70, 56, 96, 82, 120].map((h, i) => (
                  <rect key={i} x={84 + i * 32} y={180 - h} width="20" height={h} rx="3" className={i === 5 ? "dk-red" : "dk-ui"} />
                ))}
                <rect className="dk-ui-ink" x="84" y="24" width="110" height="10" rx="3" />
              </g>
            )}
            {screen === 2 && (
              <g>
                <rect className="dk-ui-ink" x="12" y="12" width={LID.x1 - LID.x0 - 24} height={LID.h - 30} rx="4" />
                <svg x="100" y="40" width="100" height="112" viewBox={MARK_VB}>
                  <path d={MARK_D} fill="#ed1d04" />
                </svg>
              </g>
            )}
            <rect key={scan} className="dk-scan" x="12" y="12" width={LID.x1 - LID.x0 - 24} height="3" />
          </g>
        </g>
        <Box x0={LID.x0 - 16} x1={LID.x1 + 16} y0={LID.hinge} y1={400} z0={0} z1={14} cls="dk-base" />
        <g transform={plane(14)}>
          <rect className="dk-keys" x={LID.x0 + 10} y={LID.hinge + 16} width={LID.x1 - LID.x0 - 20} height="104" rx="6" />
          {Array.from({ length: 4 }, (_, r) =>
            Array.from({ length: 11 }, (_, c) => <rect key={r * 11 + c} className="dk-key" x={LID.x0 + 18 + c * 25.6} y={LID.hinge + 22 + r * 24.5} width="20" height="18" rx="3" />)
          )}
          <rect className="dk-pad" x={LID.x0 + 100} y={LID.hinge + 136} width="100" height="62" rx="6" />
        </g>
        <text className="dk-tag" x={iso(LID.x1, LID.hinge, 0)[0] + 70} y={iso(LID.x1, LID.hinge, 0)[1] - 210}>
          Laptop · {["website", "system", "logo"][screen]} · tap the screen
        </text>
      </g>

      {/* 01:00 the sketchbook: draw on it */}
      <g className="dk-ob" style={arrive(3)}>
        <polygon className="iso-shadow" points={pts([76, 306, 0], [346, 306, 0], [346, 506, 0], [76, 506, 0])} />
        <Box x0={64} x1={330} y0={290} y1={490} z0={0} z1={10} cls="dk-book" />
        <g transform={plane(10)} ref={sketchRef}>
          <rect className="dk-page" x="64" y="290" width="266" height="200" rx="4" />
          {Array.from({ length: 10 }, (_, i) => (
            <circle key={i} className="dk-ring" cx={84 + i * 25} cy="302" r="5" />
          ))}
          <g className="dk-pencil">
            <svg x="150" y="330" width="80" height="90" viewBox={MARK_VB}>
              <path d={MARK_D} />
            </svg>
            <path d="M90 440h80M90 456h50M250 330h56v44h-56z" />
          </g>
          {lines.map((d, i) => (
            <path key={i} className="dk-ink-red" d={d} />
          ))}
          <rect className={"dk-draw" + (ready("sketch") ? "" : " is-off")} x="64" y="312" width="266" height="178" onPointerDown={startDraw} />
          {lines.length > 0 && (
            <text className="dk-tear" x="324" y="482" onClick={() => setLines([])}>
              tear off ✕
            </text>
          )}
        </g>
        <text className="dk-tag" x={iso(64, 490, 0)[0] - 10} y={iso(64, 490, 0)[1] + 40}>Sketchbook · A5 · draw something</text>
      </g>

      {/* 02:00 the numbers: drag the bars */}
      <g className="dk-ob" style={arrive(4)}>
        <polygon className="iso-shadow" points={pts([762, 334, 0], [962, 334, 0], [962, 534, 0], [762, 534, 0])} />
        <Box x0={748} x1={948} y0={318} y1={518} z0={0} z1={8} cls="dk-book" />
        <g transform={plane(8)}>
          <rect className="dk-page" x="748" y="318" width="200" height="200" rx="4" />
          <path className="dk-gridln" d="M760 330H936M760 362H936M760 394H936M760 426H936M760 458H936M760 490H936" />
        </g>
        {/* back to front so nearer bars cover farther ones */}
        {[0, 1, 2, 3, 4, 5]
          .sort((a, b) => barX(a) + barY(a) - (barX(b) + barY(b)))
          .map((i) => (
            <g key={i}>
              <Box x0={barX(i)} x1={barX(i) + 26} y0={barY(i)} y1={barY(i) + 26} z0={8} z1={8 + bars[i]} cls={"dk-bar" + (bars[i] === Math.max(...bars) ? " is-top" : "")} />
              <polygon
                className={"dk-grab" + (ready("stats") ? "" : " is-off")}
                points={pts([barX(i), barY(i), 8], [barX(i) + 26, barY(i), 8], [barX(i) + 26, barY(i) + 26, 8], [barX(i) + 26, barY(i) + 26, 170], [barX(i), barY(i), 170])}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  (e.target as Element).setPointerCapture?.(e.pointerId);
                  const q = svgPoint(svg.current!, e.clientX, e.clientY);
                  dragBar.current = { i, y: q.y, h: bars[i] };
                }}
              />
            </g>
          ))}
        <text className="dk-mean-t" x={iso(948, 420, 0)[0] + 14} y={iso(948, 420, 0)[1] - 8 - mean}>
          x̄ {mean}
        </text>
        <text className="dk-tag" x={iso(748, 518, 0)[0] - 150} y={iso(748, 518, 0)[1] + 30}>Notebook · n = 6 · drag the bars</text>
      </g>

      {/* 04:00 the phone: it's live */}
      <g
        key={buzz}
        className={"dk-ob dk-hit" + (ready("phone") ? "" : " is-off") + (buzz ? " is-buzz" : "")}
        style={arrive(6)}
        onClick={phoneTap}
        onKeyDown={(e) => key(e, phoneTap)}
        role="button"
        tabIndex={ready("phone") ? 0 : -1}
        aria-label="Reply: let's talk"
      >
        <polygon className="iso-shadow" points={pts([490, 444, 0], [574, 444, 0], [574, 560, 0], [490, 560, 0])} />
        <Box x0={480} x1={564} y0={434} y1={550} z0={0} z1={8} cls="dk-phonebox" />
        <g transform={plane(8)}>
          <rect className="dk-phone-scr" x="486" y="440" width="72" height="104" rx="8" />
          <rect className="dk-note" x="491" y="452" width="62" height="34" rx="6" />
          <circle cx="499" cy="460" r="3" fill="#ed1d04" />
          <text className="dk-note-t" x="506" y="463">Client</text>
          <text className="dk-note-b" x="496" y="478">It's live!? 🔥</text>
          <rect className="dk-red" x="496" y="518" width="52" height="16" rx="8" />
          <text className="dk-reply-t" x="522" y="529">Let's talk</text>
        </g>
        <text className="dk-tag" x={iso(564, 550, 0)[0] - 10} y={iso(564, 550, 0)[1] + 34}>Phone · 04:00 · tap to reply</text>
      </g>
      </g>
    </svg>
  );
}

function Night() {
  const ref = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const clockRef = useRef<HTMLSpanElement>(null);
  const [step, setStep] = useState(0);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sec = ref.current!, stage = stageRef.current!;
    const put = (p: number) => {
      stage.style.setProperty("--p", p.toFixed(3));
      const s = Math.min(6, Math.floor(p));
      setStep((o) => (o === s ? o : s));
      const mins = 22 * 60 + Math.min(6, p) * 60;
      const m = Math.round(mins / 5) * 5;
      if (clockRef.current) clockRef.current.textContent = `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
    };
    if (reduce) {
      setStill(true);
      put(7);
      return;
    }
    let raf = 0;
    const read = () => {
      raf = 0;
      const r = sec.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      const p = span > 0 ? Math.max(0, Math.min(1, -r.top / span)) * 7 : 7;
      put(p);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
    };
  }, []);

  return (
    <div ref={ref} className={"lns-ab__night" + (still ? " is-still" : "")}>
      <div ref={stageRef} className="lns-ab__stage">
        <Desk step={step} />
        <div className="lns-ab__hud">
          <span className="lns-ab__eyebrow">{NIGHT_EYEBROW}</span>
          <span className="lns-ab__clock">
            <span ref={clockRef}>22:00</span>
            <small>Accra · GMT</small>
          </span>
        </div>
        <div className="lns-ab__caps" aria-live="polite">
          {STEPS.map(([t, line, hint], i) => (
            <div key={i} className={"lns-ab__cap" + (i === step ? " is-on" : "")} aria-hidden={i !== step}>
              <span className="lns-ab__count">
                <b>{String(i + 1).padStart(2, "0")}</b>
                <i />
                {String(STEPS.length).padStart(2, "0")}
              </span>
              <h3>{t}</h3>
              <p>{line}</p>
              {hint && <span className="lns-ab__try">{hint}</span>}
              {i === STEPS.length - 1 && (
                <button type="button" className="lns-ab__btn" onClick={() => openContactOverlay()} tabIndex={i === step ? 0 : -1}>
                  {CTA}
                  <span className="lns-ab__go">
                    <Arrow />
                  </span>
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="lns-ab__dots" aria-hidden="true">
          {STEPS.map((_, i) => (
            <i key={i} className={i <= step ? "is-on" : ""} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- the travelling card ---------- */
const TEX_W = 480, TEX_H = 600; // card art is drawn at this size (x scale) and scaled to fit
const lerpEase = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

/* draws one card: your picture, or a studio card (dark, red grid, the mark, a big line) */
function paintCard(c: HTMLCanvasElement, s: number, img: HTMLImageElement | null, big: string, tag: string, idx: string, display: string) {
  const g = c.getContext("2d")!;
  const w = TEX_W * s, h = TEX_H * s;
  g.clearRect(0, 0, w, h);
  g.save();
  roundRect(g, 0, 0, w, h, 22 * s);
  g.clip();
  const mono = "ui-monospace,SFMono-Regular,Menlo,Consolas,monospace";
  if (img && img.naturalWidth) {
    const r = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const iw = img.naturalWidth * r, ih = img.naturalHeight * r;
    g.drawImage(img, (w - iw) / 2, (h - ih) / 2, iw, ih);
    const grad = g.createLinearGradient(0, h * 0.55, 0, h);
    grad.addColorStop(0, "rgba(20,19,22,0)");
    grad.addColorStop(1, "rgba(20,19,22,.55)");
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
  } else {
    g.fillStyle = "#28272a";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(237,29,4,.16)";
    g.lineWidth = 1 * s;
    for (let x = 24 * s; x < w; x += 24 * s) {
      g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke();
    }
    for (let y = 24 * s; y < h; y += 24 * s) {
      g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke();
    }
    g.strokeStyle = "rgba(237,29,4,.5)";
    g.beginPath(); g.moveTo(0, h * 0.42); g.lineTo(w, h * 0.42); g.moveTo(w * 0.5, 0); g.lineTo(w * 0.5, h); g.stroke();
    // the mark
    const [vx, vy, vw, vh] = MARK_VB.split(" ").map(Number);
    const ms = (120 * s) / vw;
    g.save();
    g.translate(w * 0.5 - (vw * ms) / 2 - vx * ms, h * 0.42 - (vh * ms) / 2 - vy * ms);
    g.scale(ms, ms);
    g.fillStyle = "#ed1d04";
    g.fill(new Path2D(MARK_D));
    g.restore();
    // the big line, shrunk to fit
    let fs = 64 * s;
    g.font = `800 ${fs}px ${display}`;
    while (g.measureText(big).width > w - 56 * s && fs > 20 * s) {
      fs -= 2 * s;
      g.font = `800 ${fs}px ${display}`;
    }
    g.fillStyle = "#cdc9c3";
    g.textBaseline = "alphabetic";
    g.fillText(big, 28 * s, h - 40 * s);
    g.fillStyle = "rgba(205,201,195,.45)";
    g.font = `500 ${13 * s}px ${mono}`;
    g.textAlign = "right";
    g.fillText(idx, w - 28 * s, 46 * s);
    g.textAlign = "left";
  }
  // the red tag, like the build labels
  g.font = `500 ${13 * s}px ${mono}`;
  const t = tag.toUpperCase();
  const tw = g.measureText(t).width + 16 * s;
  g.fillStyle = "#ed1d04";
  roundRect(g, 24 * s, 26 * s, tw, 26 * s, 5 * s);
  g.fill();
  g.fillStyle = "#fff";
  g.textBaseline = "middle";
  g.fillText(t, 32 * s, 39.5 * s);
  g.restore();
}

const VS = `attribute vec2 a;uniform vec4 uRect;uniform vec2 uView;uniform float uPad;varying vec2 vP;
void main(){vec2 px=uRect.xy+a*uRect.zw;vP=a*uRect.zw-vec2(uPad);gl_Position=vec4(px.x/uView.x*2.-1.,1.-px.y/uView.y*2.,0.,1.);}`;
const FS = `precision mediump float;varying vec2 vP;
uniform vec2 uSize,uMouse,uGrab,uDrag;uniform float uBend,uBendX,uBulge,uR,uMix,uCorner,uTilt;uniform sampler2D uA,uB;
void main(){
  vec2 c=uSize*.5;vec2 q=vP-c;float cs=cos(-uTilt),sn=sin(-uTilt);q=vec2(cs*q.x-sn*q.y,sn*q.x+cs*q.y)+c;
  float sig=.5*min(uSize.x,uSize.y);vec2 e=q-uGrab-uDrag;q-=uDrag*exp(-dot(e,e)/(sig*sig));
  vec2 d=q-uMouse;float r=length(d);float f=clamp(r/uR,0.,1.);
  q=uMouse+d*mix(1.,.55+.45*f*f,uBulge);
  float u=q.x/uSize.x*2.-1.;q.y-=uBend*(1.-u*u);
  float v=q.y/uSize.y*2.-1.;q.x-=uBendX*(1.-v*v);
  vec2 h=c-vec2(uCorner);vec2 k=abs(q-c)-h;float sd=length(max(k,0.))+min(max(k.x,k.y),0.)-uCorner;
  float al=clamp(.5-sd,0.,1.);if(al<=0.)discard;
  vec2 uv=clamp(q/uSize,0.,1.);float line=uMix*uSize.y;
  vec4 col=q.y<line?texture2D(uB,uv):texture2D(uA,uv);
  if(uMix<1.){float g=clamp(1.-(line-q.y)/60.,0.,1.)*step(q.y,line);col.rgb=mix(col.rgb,vec3(.93,.11,.02),.35*g*g);if(abs(q.y-line)<1.6)col=vec4(.93,.11,.02,1.);}
  float sh=1.-min(.22,abs(uBend)/140.)*u*u-min(.22,abs(uBendX)/140.)*v*v;
  float hi=uBulge*(1.-f)*(1.-f)*.16;
  gl_FragColor=vec4(col.rgb*sh+hi,1.)*al*col.a;
}`;

function TravelCard({ slot, rows, cards }: { slot: React.RefObject<HTMLElement | null>; rows: React.RefObject<HTMLDivElement | null>; cards: { img: string; big: string; tag: string }[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const s = Math.min(2, Math.max(1, dpr)) * 0.75; // texture scale
    const display = getComputedStyle(document.querySelector(".lns-ab__name") || document.body).fontFamily || "system-ui, sans-serif";
    const n = cards.length;
    const texs = cards.map(() => {
      const c = document.createElement("canvas");
      c.width = TEX_W * s;
      c.height = TEX_H * s;
      return c;
    });
    const stale = cards.map(() => true); // needs uploading to the GPU
    const imgs: (HTMLImageElement | null)[] = cards.map(() => null);
    let dirty = true;
    const paint = (i: number) => {
      paintCard(texs[i], s, imgs[i], cards[i].big, cards[i].tag, `${String(i).padStart(2, "0")}/${String(n - 1).padStart(2, "0")}`, display);
      stale[i] = true;
      dirty = true;
    };
    cards.forEach((c, i) => {
      paint(i);
      if (c.img) {
        const im = new Image();
        im.decoding = "async";
        if (/^https?:/.test(c.img) && !c.img.startsWith(location.origin)) im.crossOrigin = "anonymous";
        im.onload = () => {
          imgs[i] = im;
          paint(i);
        };
        im.src = c.img;
      }
    });
    (document.fonts?.ready || Promise.resolve()).then(() => cards.forEach((_, i) => paint(i)));

    /* WebGL when we can (bend + bulge + stretch), plain 2D strips otherwise */
    const gl = cv.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: true }) as WebGLRenderingContext | null;
    let prog: WebGLProgram | null = null;
    const U: Record<string, WebGLUniformLocation | null> = {};
    let glTex: WebGLTexture[] = [];
    if (gl) {
      const sh = (t: number, src: string) => {
        const o = gl.createShader(t)!;
        gl.shaderSource(o, src);
        gl.compileShader(o);
        return o;
      };
      prog = gl.createProgram()!;
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) prog = null;
    }
    const ctx2 = !prog ? (cv.getContext("2d") as CanvasRenderingContext2D | null) : null;
    if (gl && prog) {
      gl.useProgram(prog);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, "a");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      ["uRect", "uView", "uPad", "uSize", "uMouse", "uGrab", "uDrag", "uBend", "uBendX", "uBulge", "uR", "uMix", "uCorner", "uTilt", "uA", "uB"].forEach(
        (k) => (U[k] = gl.getUniformLocation(prog!, k))
      );
      gl.uniform1i(U.uA, 0);
      gl.uniform1i(U.uB, 1);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      glTex = texs.map(() => {
        const t = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, t);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        return t;
      });
    }
    const upload = (i: number) => {
      if (!gl || !prog || !stale[i]) return;
      gl.bindTexture(gl.TEXTURE_2D, glTex[i]);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      stale[i] = false;
      try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texs[i]);
      } catch {
        // a picture from another site without CORS can't go to the GPU: fall back to the drawn card
        imgs[i] = null;
        paint(i);
      }
    };
    // 2D fallback compositor for the scan line
    const mix = document.createElement("canvas");
    mix.width = TEX_W * s;
    mix.height = TEX_H * s;
    const mg = mix.getContext("2d")!;

    let W = 0, H = 0;
    const size = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      dirty = true;
    };
    // springs: where the card is, how it's pulled and how much it bulges
    const p = { x: 0, y: 0, w: 0, h: 0 }, v = { x: 0, y: 0, w: 0, h: 0 };
    const drag = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 };
    const mouse = { x: -1e4, y: -1e4, in: false, down: false, gx: 0, gy: 0, sx: 0, sy: 0 };
    let bulge = 0, bulgeV = 0;
    let first = true, cur = 0, from = 0, t0 = -1, raf = 0;
    const root = cv.closest(".lns-ab");
    root?.classList.add("has-card"); // the card takes over from the photo in the intro
    const html = document.documentElement;

    const target = () => {
      const rowEls = rows.current ? Array.from(rows.current.querySelectorAll<HTMLElement>(".lns-ab__row")) : [];
      let active = -1;
      rowEls.forEach((r, i) => {
        if (r.getBoundingClientRect().top < H * 0.55) active = i;
      });
      if (active < 0 && slot.current) {
        const r = slot.current.getBoundingClientRect();
        return { x: r.left, y: r.top, w: r.width, h: r.height, i: 0 };
      }
      const gut = rowEls[Math.max(0, active)]?.querySelector<HTMLElement>(".lns-ab__gut");
      if (!gut) return null;
      const g = gut.getBoundingClientRect();
      const w = g.width, h = w * (TEX_H / TEX_W);
      const stick = W < 720 ? 72 : 96;
      const y = Math.min(Math.max(g.top, stick), g.bottom - h);
      return { x: g.left, y, w, h, i: Math.min(n - 1, Math.max(0, active) + 1) };
    };

    const inCard = (x: number, y: number) => x > p.x && x < p.x + p.w && y > p.y && y < p.y + p.h;
    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (mouse.down) {
        // rubber band: the further you pull, the harder it pulls back
        const dx = e.clientX - mouse.sx, dy = e.clientY - mouse.sy, d = Math.hypot(dx, dy) || 1;
        const k = (0.75 * 260) / (260 + d);
        drag.tx = dx * k;
        drag.ty = dy * k;
      }
      const was = mouse.in;
      mouse.in = inCard(e.clientX, e.clientY);
      if (mouse.in !== was || mouse.down) html.style.cursor = mouse.down ? "grabbing" : mouse.in ? "grab" : "";
      dirty = true;
    };
    const onDown = (e: PointerEvent) => {
      if (!inCard(e.clientX, e.clientY)) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      mouse.in = true;
      if (e.pointerType === "touch") return; // on phones: press to bulge, scrolling stays free
      e.preventDefault();
      mouse.down = true;
      mouse.sx = e.clientX;
      mouse.sy = e.clientY;
      mouse.gx = e.clientX - p.x;
      mouse.gy = e.clientY - p.y;
      html.style.cursor = "grabbing";
      html.style.userSelect = "none";
    };
    const onUp = () => {
      if (!mouse.down) return;
      mouse.down = false;
      drag.tx = drag.ty = 0; // let go: it springs back with a wobble
      html.style.cursor = mouse.in ? "grab" : "";
      html.style.userSelect = "";
    };
    const onLeave = () => {
      mouse.in = false;
      if (!mouse.down) html.style.cursor = "";
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const t = target();
      if (!t) return;
      if (first) {
        Object.assign(p, t);
        first = false;
        cur = t.i;
      }
      if (t.i !== cur) {
        from = cur;
        cur = t.i;
        t0 = reduce ? -1 : now;
      }
      let moving = false;
      (["x", "y", "w", "h"] as const).forEach((k) => {
        if (reduce) {
          p[k] = t[k];
          v[k] = 0;
          return;
        }
        v[k] = (v[k] + (t[k] - p[k]) * 0.085) * 0.78;
        p[k] += v[k];
        if (Math.abs(v[k]) > 0.02 || Math.abs(t[k] - p[k]) > 0.3) moving = true;
      });
      // touch: the card follows your finger only while it's pressed on it
      if (!mouse.down && mouse.in && !inCard(mouse.x, mouse.y)) mouse.in = false;
      const bt = reduce ? 0 : mouse.down ? 0.35 : mouse.in ? 1 : 0;
      bulgeV = (bulgeV + (bt - bulge) * 0.12) * 0.72;
      bulge += bulgeV;
      const dk = mouse.down ? 0.35 : 0.16, dd = mouse.down ? 0.6 : 0.84; // released: low damping = wobble
      drag.vx = (drag.vx + (drag.tx - drag.x) * dk) * dd;
      drag.vy = (drag.vy + (drag.ty - drag.y) * dk) * dd;
      drag.x += drag.vx;
      drag.y += drag.vy;
      if (Math.abs(bulgeV) > 0.001 || Math.abs(drag.vx) + Math.abs(drag.vy) > 0.02 || Math.abs(drag.x) + Math.abs(drag.y) > 0.2 || bulge > 0.002) moving = true;
      const trans = t0 >= 0 ? Math.min(1, (now - t0) / 560) : 1;
      if (!moving && trans >= 1 && !dirty) return;
      dirty = false;
      if (trans >= 1) t0 = -1;

      const off = p.y + p.h < -200 || p.y > H + 200 || p.w < 4;
      const bend = reduce ? 0 : Math.max(-30, Math.min(30, v.y * 1.1));
      const bendX = reduce ? 0 : Math.max(-36, Math.min(36, v.x * 0.9));
      const tilt = reduce ? 0 : Math.max(-0.05, Math.min(0.05, v.x * 0.003));

      if (gl && prog) {
        gl.viewport(0, 0, cv.width, cv.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        if (off) return;
        upload(cur);
        upload(from);
        const pad = 200;
        gl.uniform4f(U.uRect, p.x - pad, p.y - pad, p.w + pad * 2, p.h + pad * 2);
        gl.uniform2f(U.uView, W, H);
        gl.uniform1f(U.uPad, pad);
        gl.uniform2f(U.uSize, p.w, p.h);
        gl.uniform2f(U.uMouse, mouse.x - p.x, mouse.y - p.y);
        gl.uniform2f(U.uGrab, mouse.gx, mouse.gy);
        gl.uniform2f(U.uDrag, drag.x, drag.y);
        gl.uniform1f(U.uBend, bend);
        gl.uniform1f(U.uBendX, bendX);
        gl.uniform1f(U.uBulge, Math.max(0, bulge));
        gl.uniform1f(U.uR, Math.min(p.w, p.h) * 0.42);
        gl.uniform1f(U.uMix, trans < 1 ? lerpEase(trans) : 1);
        gl.uniform1f(U.uCorner, Math.min(22, p.w * 0.07));
        gl.uniform1f(U.uTilt, tilt);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, glTex[trans < 1 ? from : cur]);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, glTex[cur]);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        return;
      }
      if (!ctx2) return;
      // 2D fallback: bend only
      let src: HTMLCanvasElement = texs[cur];
      if (trans < 1) {
        const k = lerpEase(trans), th = mix.height, tw = mix.width, line = th * k;
        mg.clearRect(0, 0, tw, th);
        mg.drawImage(texs[from], 0, 0);
        mg.save();
        mg.beginPath();
        mg.rect(0, 0, tw, line);
        mg.clip();
        mg.clearRect(0, 0, tw, line);
        mg.drawImage(texs[cur], 0, 0);
        mg.restore();
        mg.fillStyle = "#ed1d04";
        mg.fillRect(0, line - 1.5 * s, tw, 3 * s);
        src = mix;
      }
      ctx2.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx2.clearRect(0, 0, W, H);
      if (off) return;
      const N = 40, sw = src.width / N, dw = p.w / N;
      ctx2.save();
      ctx2.translate(p.x + p.w / 2, p.y + p.h / 2);
      ctx2.rotate(tilt);
      ctx2.translate(-p.w / 2, -p.h / 2);
      for (let j = 0; j < N; j++) {
        const u = ((j + 0.5) / N) * 2 - 1;
        ctx2.drawImage(src, j * sw, 0, sw, src.height, j * dw, bend * (1 - u * u), dw + 1, p.h);
      }
      ctx2.restore();
    };

    size();
    raf = requestAnimationFrame(frame);
    window.addEventListener("resize", size);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    document.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      document.removeEventListener("pointerleave", onLeave);
      html.style.cursor = "";
      html.style.userSelect = "";
      root?.classList.remove("has-card");
    };
  }, []);
  return <canvas ref={ref} className="lns-ab__card" aria-hidden="true" />;
}

function Details({ slot }: { slot: React.RefObject<HTMLElement | null> }) {
  const rows = useRef<HTMLDivElement>(null);
  const email = EMAIL || CONTACT.email;
  const cards = [{ img: PHOTO, big: NAME + ".", tag: PHOTO ? NAME : "Your photo · 4:5" }, ...ROWS.map((r) => r.card)];
  useEffect(() => {
    // each row's write-up slides in from the side opposite the card
    const els = rows.current!.querySelectorAll<HTMLElement>(".lns-ab__row");
    if (!("IntersectionObserver" in window)) {
      els.forEach((e) => e.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -35% 0px" }
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);
  return (
    <div className="lns-ab__details" ref={rows}>
      <TravelCard slot={slot} rows={rows} cards={cards} />
      {ROWS.map((r, i) => (
        <section key={i} className={"lns-ab__row " + (i % 2 ? "is-r" : "is-l") + (r.cta ? " lns-ab__row--cta" : "")} aria-label={r.label}>
          <div className="lns-ab__gut" aria-hidden="true">
            {i === 0 && <span className="lns-ab__pull">{PULL_NOTE}</span>}
          </div>
          <div className="lns-ab__cont">
            <h2 className="lns-ab__label">
              <b>{String(i + 1).padStart(2, "0")}</b>
              {r.label}
            </h2>
            {r.items && (
              <ul className="lns-ab__items">
                {r.items.map((it, j) => (
                  <li key={j}>
                    {it.year && <span className="lns-ab__year">{it.year}</span>}
                    <div>
                      <h3>{it.title}</h3>
                      {it.where && <em>{it.where}</em>}
                      {it.text && <p>{it.text}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {r.cols && (
              <ul className="lns-ab__cols">
                {r.cols.map((c, j) => (
                  <li key={j}>{c}</li>
                ))}
              </ul>
            )}
            {r.cta && (
              <div className="lns-ab__next">
                <h3>{NEXT}</h3>
                <button type="button" className="lns-ab__btn" onClick={() => openContactOverlay()}>
                  {CTA}
                  <span className="lns-ab__go">
                    <Arrow />
                  </span>
                </button>
                {email && (
                  <a className="lns-ab__mail" href={`mailto:${email}`}>
                    {email} <span aria-hidden="true">↗</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

const RULE_ART = [
  // you talk to the builder: the long way round gets crossed out, a straight line takes over
  <svg viewBox="0 0 200 120" key="0">
    <path className="r-mute" d="M30 60L70 22L110 92L170 60" pathLength={1} />
    <circle className="r-mute-dot" cx="70" cy="22" r="5" />
    <circle className="r-mute-dot" cx="110" cy="92" r="5" />
    <path className="r-x" d="M82 40L98 72M98 40L82 72" pathLength={1} />
    <path className="r-red" d="M30 60H170" pathLength={1} />
    <circle className="r-node" cx="30" cy="60" r="8" />
    <circle className="r-node r-node--red" cx="170" cy="60" r="8" />
  </svg>,
  // phones first: blocks stack into a phone
  <svg viewBox="0 0 200 120" key="1">
    <path className="r-ink" d="M78 8h44a8 8 0 0 1 8 8v88a8 8 0 0 1 -8 8h-44a8 8 0 0 1 -8 -8v-88a8 8 0 0 1 8 -8z" pathLength={1} />
    <rect className="r-blk r-blk--red" x="80" y="22" width="26" height="6" rx="3" />
    <rect className="r-blk" x="80" y="36" width="40" height="22" rx="3" />
    <rect className="r-blk" x="80" y="64" width="40" height="8" rx="3" />
    <rect className="r-blk" x="80" y="78" width="32" height="8" rx="3" />
    <rect className="r-blk r-blk--red" x="80" y="94" width="22" height="8" rx="4" />
  </svg>,
  // not a template: a grid of the same, one becomes yours
  <svg viewBox="0 0 200 120" key="2">
    {Array.from({ length: 15 }, (_, i) => {
      const x = 46 + (i % 5) * 24, y = 24 + Math.floor(i / 5) * 26;
      return i === 7 ? (
        <circle key={i} className="r-own" cx={x + 8} cy={y + 8} r="11" />
      ) : (
        <rect key={i} className="r-cell" x={x} y={y} width="16" height="16" rx="2" style={{ ["--i" as any]: i } as React.CSSProperties} />
      );
    })}
  </svg>,
  // yours to keep: a key draws itself
  <svg viewBox="0 0 200 120" key="3">
    <path className="r-ink" d="M52 60a20 20 0 1 0 40 0a20 20 0 1 0 -40 0" pathLength={1} />
    <path className="r-red" d="M92 60H156V76M140 60V72" pathLength={1} />
    <circle className="r-node r-node--red" cx="72" cy="60" r="5" />
  </svg>,
];

function Rules() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const cards = ref.current!.querySelectorAll<HTMLElement>(".lns-ab__rule");
    if (!("IntersectionObserver" in window)) {
      cards.forEach((c) => c.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.45 }
    );
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);
  return (
    <div className="lns-ab__rules-wrap">
      <h2 className="lns-ab__h">{RULES_TITLE}</h2>
      <div ref={ref} className="lns-ab__rules">
        {RULES.map(([t, line], i) => (
          <article key={i} className="lns-ab__rule">
            <div className="lns-ab__art" aria-hidden="true">
              {RULE_ART[i % RULE_ART.length]}
            </div>
            <span className="lns-ab__num">{String(i + 1).padStart(2, "0")}</span>
            <h3>{t}</h3>
            <p>{line}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

export default function AboutPage() {
  const slot = useRef<HTMLElement>(null);
  return (
    <main id="about" className="lns-ab" aria-label="About">
      <style>{CSS}</style>
      <div className="lns-ab__intro">
        <span className="lns-ab__eyebrow">The studio</span>
        <div className="lns-ab__head">
          <h1 className="lns-ab__name">{NAME}.</h1>
          <p className="lns-ab__lead">{LEAD}</p>
        </div>
        <div className="lns-ab__body">
          <figure className="lns-ab__photo" ref={slot}>
            {PHOTO ? (
              <img src={PHOTO} alt={PHOTO_ALT} />
            ) : (
              <div className="lns-ab__ph" aria-hidden="true">
                <i />
                <i />
                <span>Your photo · 4:5</span>
              </div>
            )}
          </figure>
          <div className="lns-ab__story">
            {STORY.map((s, i) => (
              <p key={i}>{s}</p>
            ))}
            <span className="lns-ab__sig">{SIGNATURE}</span>
          </div>
        </div>
      </div>
      <Details slot={slot} />
      <Night />
      <Rules />
    </main>
  );
}

const CSS = `
.lns-ab{--ab-ink:#28272a;--ab-muted:rgba(40,39,42,.62);--ab-faint:rgba(40,39,42,.16);--ab-red:#ed1d04;--ab-paper:#cdc9c3;
  --lns-display:inherit;--lns-body:inherit;--e:cubic-bezier(.65,0,.35,1);
  position:relative;color:var(--ab-ink);font-family:var(--lns-body, system-ui, sans-serif)}
.lns-ab *{box-sizing:border-box}
.lns-ab h2,.lns-ab h3,.lns-ab p,.lns-ab figure,.lns-ab ol{margin:0}
.lns-ab__eyebrow{display:inline-flex;align-items:center;gap:10px;font:500 11px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:.14em;text-transform:uppercase;color:var(--ab-muted)}
.lns-ab__eyebrow::before{content:"";width:28px;height:1px;background:var(--ab-red)}
.lns-ab__h{font-family:var(--lns-display, system-ui, sans-serif);font-weight:800;font-size:clamp(36px,5.4vw,76px);line-height:.95;letter-spacing:-.01em}

/* intro */
.lns-ab__intro{padding:clamp(48px,8vw,120px) clamp(16px,4vw,56px) clamp(40px,6vw,88px)}
.lns-ab__head{display:grid;grid-template-columns:1.3fr 1fr;gap:clamp(20px,4vw,64px);align-items:end;margin-top:18px}
.lns-ab__name{font-family:var(--lns-display, system-ui, sans-serif);font-weight:800;font-size:clamp(64px,12vw,184px);line-height:.85;letter-spacing:-.02em}
.lns-ab__lead{font-size:clamp(17px,1.5vw,21px);line-height:1.4;color:var(--ab-muted);max-width:34ch}
.lns-ab__body{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr);gap:clamp(24px,4vw,64px);margin-top:clamp(32px,5vw,72px);align-items:start}
.lns-ab__photo{position:relative;aspect-ratio:4/5;border-radius:20px;overflow:hidden;background:rgba(40,39,42,.06)}
.lns-ab__photo img{width:100%;height:100%;object-fit:cover;display:block}
.lns-ab__ph{position:absolute;inset:0;border:1px solid rgba(237,29,4,.5);border-radius:20px}
.lns-ab__ph i{position:absolute;background:rgba(237,29,4,.35)}
.lns-ab__ph i:nth-child(1){left:0;right:0;top:50%;height:1px}
.lns-ab__ph i:nth-child(2){top:0;bottom:0;left:50%;width:1px}
.lns-ab__ph span{position:absolute;left:12px;top:12px;padding:4px 7px;border-radius:4px;background:var(--ab-red);color:#fff;font:500 10px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:.06em}
.lns-ab__story{display:grid;gap:18px;max-width:58ch;font-size:clamp(16px,1.25vw,19px);line-height:1.55}
.lns-ab__sig{margin-top:8px;font:13px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:var(--ab-muted)}

/* a night in the studio */
.lns-ab__night{position:relative;height:640vh}
.lns-ab__night.is-still{height:auto}
.lns-ab__stage{--p:0;position:sticky;top:0;height:100vh;height:100svh;overflow:hidden;border-top:1px solid var(--ab-faint);border-bottom:1px solid var(--ab-faint)}
.lns-ab__night.is-still .lns-ab__stage{position:relative}
.lns-ab__room{position:absolute;inset:0;width:100%;height:100%;display:block}
.lns-ab__room [style*="--a"]{--k:clamp(0, calc((var(--p) - var(--a)) / var(--d)), 1)}
/* the desk: an isometric line drawing in the studio's ink, paper and red */
.lns-ab__stage{background:#d8d3cb}
.lns-ab__stage::before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse at 60% 55%,rgba(255,255,255,.35),transparent 60%)}
.lns-ab__desk{touch-action:pan-y}
.lns-ab__desk polygon,.lns-ab__desk path,.lns-ab__desk rect,.lns-ab__desk ellipse,.lns-ab__desk circle,.lns-ab__desk polyline{vector-effect:non-scaling-stroke;stroke-linejoin:round;stroke-linecap:round}
.iso-t{fill:#fbf9f6;stroke:#28272a;stroke-width:2.2}
.iso-l{fill:#e7e2da;stroke:#28272a;stroke-width:2.2}
.iso-r{fill:#d3ccc1;stroke:#28272a;stroke-width:2.2}
.iso-shadow{fill:rgba(40,39,42,.12);stroke:none}
.iso-line{fill:none;stroke:#28272a;stroke-width:2.2}
.iso-joint{fill:#fbf9f6;stroke:#28272a;stroke-width:2}
.dk-deskbox .iso-t{fill:#f3efe9}
.dk-mat{fill:#e4ded5;stroke:#28272a;stroke-width:1.4}
.dk-pool{mix-blend-mode:multiply;opacity:var(--k);transition:cx .2s ease-out,cy .2s ease-out}
.dk-cone{fill:rgba(255,178,87,.16);stroke:none;opacity:calc(1 - clamp(0, calc((var(--p) - 6.2) / .5), 1))}
.dk-arm{stroke-width:5}
.dk-shade{fill:#28272a;stroke:#28272a;stroke-width:2}
.dk-bulb{fill:#ffcf96;stroke:#28272a;stroke-width:1.5}
.dk-ob{opacity:clamp(0, calc((var(--k) - .3) / .5), 1);transform-box:view-box;
  transform:translateY(calc((1 - clamp(0, calc((var(--k) - .3) / .7), 1)) * -60px))}
.dk-foot{fill:none;stroke:#ed1d04;stroke-width:1.6;stroke-dasharray:7 6;opacity:calc(min(1, var(--k) * 3) * (1 - clamp(0, calc((var(--k) - .55) / .45), 1)))}
.dk-tag{font:500 13px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;fill:#ed1d04;pointer-events:none}
.dk-hit{cursor:pointer;outline:none}
.dk-hit.is-off,.dk-draw.is-off,.dk-grab.is-off{pointer-events:none}
.dk-hit:focus-visible{filter:drop-shadow(0 0 4px #ed1d04)}
.dk-lid{fill:#3a393d;stroke:#28272a;stroke-width:2.2}
.dk-screen{fill:#fbf9f6;stroke:#28272a;stroke-width:1.2}
.dk-ui{fill:#d3ccc1}
.dk-ui-ink{fill:#28272a}
.dk-red{fill:#ed1d04}
.dk-card{fill:#e7e2da;stroke:#28272a;stroke-width:1.2}
.dk-dash{fill:none;stroke-dasharray:5 4}
.dk-scan{fill:#ed1d04;animation:lnsDkScan .55s cubic-bezier(.65,0,.35,1) forwards}
@keyframes lnsDkScan{from{transform:translateY(0)}to{transform:translateY(186px);opacity:0}}
.dk-base .iso-t{fill:#fbf9f6}
.dk-keys{fill:#e7e2da;stroke:#28272a;stroke-width:1.2}
.dk-key{fill:#fbf9f6;stroke:#28272a;stroke-width:.9}
.dk-pad{fill:#e7e2da;stroke:#28272a;stroke-width:1.2}
.dk-handle{stroke-width:9;stroke:#28272a}
.dk-coffee{fill:#4a2f1c;stroke:#28272a;stroke-width:1.2;transition:rx .5s,ry .5s,cy .5s}
.dk-ripple{fill:none;stroke:#e9c9a6;stroke-width:2;opacity:0;animation:lnsDkRip .9s ease-out}
@keyframes lnsDkRip{from{opacity:.9;rx:4;ry:2}to{opacity:0;rx:30;ry:17}}
.dk-steam path{fill:none;stroke:rgba(40,39,42,.35);stroke-width:2.5;stroke-linecap:round;animation:lnsDkSteam 2.6s ease-in-out infinite}
.dk-steam path:nth-child(2){animation-delay:-.9s}.dk-steam path:nth-child(3){animation-delay:-1.7s}
@keyframes lnsDkSteam{0%{opacity:0;transform:translateY(10px)}40%{opacity:1}100%{opacity:0;transform:translateY(-22px)}}
.dk-book .iso-t{fill:#fbf9f6}
.dk-page{fill:#fbf9f6;stroke:#28272a;stroke-width:1.4}
.dk-ring{fill:#d3ccc1;stroke:#28272a;stroke-width:1.4}
.dk-pencil{opacity:.3}
.dk-pencil svg path{fill:none;stroke:#28272a;stroke-width:6}
.dk-pencil > path{fill:none;stroke:#28272a;stroke-width:1.6}
.dk-ink-red{fill:none;stroke:#ed1d04;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
.dk-draw{fill:transparent;cursor:crosshair;touch-action:none}
.dk-tear{font:500 11px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;fill:#8d8781;text-anchor:end;cursor:pointer}
.dk-gridln{fill:none;stroke:#d3ccc1;stroke-width:1}
.dk-bar .iso-t{fill:#fbf9f6}.dk-bar .iso-l{fill:#e7e2da}.dk-bar .iso-r{fill:#d3ccc1}
.dk-bar.is-top .iso-t{fill:#ff6a4d}.dk-bar.is-top .iso-l{fill:#ed1d04}.dk-bar.is-top .iso-r{fill:#b81603}
.dk-grab{fill:transparent;stroke:none;cursor:ns-resize;touch-action:none}
.dk-mean-t{font:600 13px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;fill:#ed1d04}
.dk-band{fill:none;stroke:#28272a;stroke-width:16}
.dk-band-in{fill:none;stroke:#e7e2da;stroke-width:11}
.dk-cup-pad{fill:#ed1d04;stroke:#28272a;stroke-width:1.4}
.dk-cup{transform-box:fill-box;transform-origin:center}
.is-playing .dk-cup{animation:lnsDkThump .714s ease-out infinite}
@keyframes lnsDkThump{0%{transform:scale(1.06)}40%{transform:scale(1)}}
.dk-eq rect{fill:#ed1d04;transform-box:fill-box;transform-origin:50% 100%;animation:lnsAbEq .7s ease-in-out infinite alternate}
@keyframes lnsAbEq{from{transform:scaleY(.25)}to{transform:scaleY(1)}}
.dk-phonebox .iso-t{fill:#28272a}.dk-phonebox .iso-l,.dk-phonebox .iso-r{fill:#3a393d}
.dk-phone-scr{fill:#1b1a1d}
.dk-note{fill:#fbf9f6;animation:lnsDkPing 1.6s ease-in-out infinite}
@keyframes lnsDkPing{50%{opacity:.75}}
.dk-note-t{font:700 8px var(--lns-body, system-ui, sans-serif);fill:#28272a}
.dk-note-b{font:500 9px var(--lns-body, system-ui, sans-serif);fill:#28272a}
.dk-reply-t{font:600 8px var(--lns-body, system-ui, sans-serif);fill:#fff;text-anchor:middle}
.is-buzz{animation:lnsDkBuzz .38s linear}
@keyframes lnsDkBuzz{20%,60%{transform:translateX(-3px)}40%,80%{transform:translateX(3px)}}
.lns-ab__try{display:flex;width:max-content;align-items:center;gap:8px;margin-top:14px;font:500 22px/1 "Caveat","Segoe Print","Bradley Hand",cursive;color:#ed1d04}
.lns-ab__try::before{content:"↳"}
.lns-ab__hud{position:absolute;left:clamp(16px,4vw,56px);right:clamp(16px,4vw,56px);top:clamp(76px,11vh,104px);display:flex;justify-content:space-between;align-items:flex-start;gap:16px;pointer-events:none}
.lns-ab__clock{display:grid;justify-items:end;gap:6px;font-family:var(--lns-display, system-ui, sans-serif);font-weight:700;font-size:clamp(40px,6vw,88px);line-height:.85;font-variant-numeric:tabular-nums;color:rgba(40,39,42,.2)}
.lns-ab__clock small{font:500 11px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:.12em;text-transform:uppercase;color:var(--ab-muted)}
.lns-ab__caps{position:absolute;left:clamp(16px,4vw,56px);top:clamp(150px,21vh,210px);width:min(420px,calc(100% - 32px));display:grid;pointer-events:none}
.lns-ab__cap{grid-area:1/1;align-self:start;opacity:0;transform:translateY(14px);transition:opacity .35s,transform .45s var(--e);pointer-events:none}
.lns-ab__cap.is-on{opacity:1;transform:none;pointer-events:auto}
.lns-ab__count{display:flex;align-items:center;gap:10px;font:500 12px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:var(--ab-muted);margin-bottom:12px}
.lns-ab__count b{font-weight:500;color:var(--ab-red)}
.lns-ab__count i{width:28px;height:1px;background:var(--ab-muted)}
.lns-ab__cap h3{font-family:var(--lns-display, system-ui, sans-serif);font-weight:800;font-size:clamp(32px,3.6vw,52px);line-height:1}
.lns-ab__cap p{margin-top:10px;font-size:clamp(15px,1.2vw,18px);line-height:1.45;color:var(--ab-muted);max-width:40ch}
.lns-ab__cap .lns-ab__btn{margin-top:18px}
.lns-ab__dots{position:absolute;right:clamp(16px,4vw,56px);bottom:clamp(28px,6vh,60px);display:flex;gap:6px}
.lns-ab__dots i{width:8px;height:8px;border-radius:50%;border:1px solid var(--ab-muted);transition:background .3s,border-color .3s}
.lns-ab__dots i.is-on{background:var(--ab-red);border-color:var(--ab-red)}

/* CTA: red circle, arrow turns 45° */
.lns-ab__btn{display:inline-flex;align-items:center;gap:14px;padding:6px 6px 6px 22px;border:0;border-radius:999px;background:var(--ab-ink);color:#f3efe9;
  font:600 16px/1 var(--lns-body, system-ui, sans-serif);cursor:pointer;transition:background .25s}
.lns-ab__go{display:grid;place-items:center;width:40px;height:40px;border-radius:50%;background:var(--ab-red);color:#fff;transition:transform .35s var(--e)}
.lns-ab__go svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.lns-ab__btn:hover{background:#000}
.lns-ab__btn:hover .lns-ab__go,.lns-ab__btn:focus-visible .lns-ab__go{transform:rotate(45deg)}
.lns-ab__btn:focus-visible{outline:2px solid var(--ab-red);outline-offset:4px}

/* the details: rows zig-zag, the card crosses from side to side */
.lns-ab__card{position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:30}
.lns-ab.has-card .lns-ab__photo > *{visibility:hidden}
.lns-ab__details{--cw:clamp(220px,26vw,360px);position:relative;padding:clamp(24px,4vw,56px) clamp(16px,4vw,56px) clamp(64px,8vw,120px)}
.lns-ab__row{display:grid;grid-template-columns:var(--cw) minmax(0,1fr);gap:clamp(24px,6vw,120px);align-items:start;
  padding:clamp(40px,5vw,72px) 0;border-top:1px solid var(--ab-faint)}
.lns-ab__row.is-r{grid-template-columns:minmax(0,1fr) var(--cw)}
.lns-ab__row.is-r .lns-ab__gut{order:2}
.lns-ab__gut{position:relative;min-height:calc(var(--cw) * 1.25 + 40px)}
.lns-ab__pull{position:absolute;left:8px;bottom:0;font:500 22px/1 "Caveat","Segoe Print","Bradley Hand",cursive;color:var(--ab-red);transform:rotate(-4deg);white-space:nowrap}
.lns-ab__cont{max-width:680px}
.lns-ab__row.is-r .lns-ab__cont{justify-self:end;width:100%}
.lns-ab__cont > *{opacity:0;transform:translateX(var(--from,-48px));transition:opacity .6s,transform .9s var(--e)}
.lns-ab__row.is-l .lns-ab__cont > *{--from:48px}
.lns-ab__row.is-r .lns-ab__cont > *{--from:-48px}
.lns-ab__row.is-in .lns-ab__cont > *{opacity:1;transform:none}
.lns-ab__row.is-in .lns-ab__cont > :nth-child(2){transition-delay:.08s}
.lns-ab__row.is-in .lns-ab__cont > :nth-child(3){transition-delay:.16s}
.lns-ab__label{display:flex;align-items:center;gap:12px;margin-bottom:clamp(20px,2.4vw,32px)!important;font:500 12px/1.4 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace!important;letter-spacing:.14em;text-transform:uppercase;color:var(--ab-muted)}
.lns-ab__label b{font-weight:500;color:var(--ab-red)}
.lns-ab__label::after{content:"";flex:1;height:1px;background:var(--ab-faint)}
.lns-ab .lns-ab__items,.lns-ab .lns-ab__cols{list-style:none;margin:0;padding:0}
.lns-ab__items{display:grid;gap:clamp(20px,2.4vw,32px)}
.lns-ab__items li{display:grid;grid-template-columns:110px minmax(0,1fr);gap:16px}
.lns-ab__items li > div:only-child{grid-column:1 / -1}
.lns-ab__year{font-family:var(--lns-display, system-ui, sans-serif);font-weight:700;font-size:18px;line-height:1.2;font-variant-numeric:tabular-nums;white-space:nowrap}
.lns-ab__items h3{font-family:var(--lns-display, system-ui, sans-serif);font-weight:700;font-size:clamp(19px,1.6vw,24px);line-height:1.15}
.lns-ab__items em{display:block;margin-top:6px;font:normal 12px/1.3 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:var(--ab-red)}
.lns-ab__items p{margin-top:8px;max-width:52ch;line-height:1.5;color:var(--ab-muted)}
.lns-ab__cols{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 24px;font-family:var(--lns-display, system-ui, sans-serif);font-weight:600;font-size:clamp(18px,1.6vw,22px)}
.lns-ab__next h3{font-family:var(--lns-display, system-ui, sans-serif);font-weight:800;font-size:clamp(30px,3.4vw,52px);line-height:1}
.lns-ab__next .lns-ab__btn{margin-top:22px}
.lns-ab__mail{display:block;margin-top:18px;width:max-content;color:var(--ab-ink);font-size:17px;text-decoration:none;border-bottom:1px solid var(--ab-faint)}
.lns-ab__mail:hover{border-color:var(--ab-red)}

/* what I stick to */
.lns-ab__rules-wrap{padding:clamp(48px,7vw,110px) clamp(16px,4vw,56px) clamp(56px,8vw,120px)}
.lns-ab__rules{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:clamp(12px,1.6vw,24px);margin-top:clamp(28px,4vw,56px)}
.lns-ab__rule{position:relative;padding:20px 20px 24px;border-radius:20px;border:1px solid var(--ab-faint);transition:border-color .3s}
.lns-ab__rule:hover{border-color:rgba(237,29,4,.5)}
.lns-ab__art{height:120px;margin:-4px -4px 18px;border-radius:12px;background:rgba(40,39,42,.05)}
.lns-ab__art svg{display:block;width:100%;height:100%;overflow:visible}
.lns-ab__num{font:500 12px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:var(--ab-red)}
.lns-ab__rule h3{margin-top:10px;font-family:var(--lns-display, system-ui, sans-serif);font-weight:700;font-size:clamp(20px,1.6vw,24px);line-height:1.1}
.lns-ab__rule p{margin-top:10px;font-size:15px;line-height:1.5;color:var(--ab-muted)}
.lns-ab__art path,.lns-ab__art circle,.lns-ab__art rect{vector-effect:non-scaling-stroke}
.r-ink,.r-red,.r-mute,.r-x{fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1 1;stroke-dashoffset:1}
.r-ink{stroke:var(--ab-ink)}
.r-red{stroke:var(--ab-red);stroke-width:3}
.r-mute{stroke:rgba(40,39,42,.35);stroke-dasharray:1 1}
.r-x{stroke:var(--ab-red)}
.r-mute-dot{fill:rgba(40,39,42,.3);opacity:0}
.r-node{fill:var(--ab-ink);opacity:0;transform-box:fill-box;transform-origin:center;transform:scale(.3)}
.r-node--red{fill:var(--ab-red)}
.r-blk{fill:rgba(40,39,42,.28);opacity:0;transform:translateY(-14px)}
.r-blk--red{fill:var(--ab-red)}
.r-cell{fill:rgba(40,39,42,.2);opacity:0}
.r-own{fill:var(--ab-red);opacity:0;transform-box:fill-box;transform-origin:center;transform:scale(0)}
.is-in .r-mute{animation:lnsAbDash .6s var(--e) forwards,lnsAbFade .4s 1.3s forwards}
.is-in .r-mute-dot{animation:lnsAbIn .3s .2s forwards,lnsAbFade .4s 1.3s forwards}
.is-in .r-x{animation:lnsAbDash .35s .8s var(--e) forwards}
.is-in .r-red{animation:lnsAbDash .7s 1.1s var(--e) forwards}
.is-in .r-ink{animation:lnsAbDash .8s var(--e) forwards}
.is-in .r-node{animation:lnsAbPop .4s var(--e) forwards}
.is-in .r-node--red{animation-delay:1.6s}
.is-in .r-blk{animation:lnsAbDrop .45s var(--e) forwards}
.is-in .r-blk:nth-of-type(1){animation-delay:.7s}.is-in .r-blk:nth-of-type(2){animation-delay:.85s}.is-in .r-blk:nth-of-type(3){animation-delay:1s}
.is-in .r-blk:nth-of-type(4){animation-delay:1.15s}.is-in .r-blk:nth-of-type(5){animation-delay:1.3s}
.is-in .r-cell{animation:lnsAbIn .25s calc(var(--i) * .05s) forwards}
.is-in .r-own{animation:lnsAbPop .5s 1s var(--e) forwards}
.lns-ab__rule:nth-child(4).is-in .r-red{animation-delay:.7s}
.lns-ab__rule:nth-child(4).is-in .r-node--red{animation-delay:.3s}
@keyframes lnsAbDash{to{stroke-dashoffset:0}}
@keyframes lnsAbIn{to{opacity:1}}
@keyframes lnsAbFade{to{opacity:.15}}
@keyframes lnsAbPop{to{opacity:1;transform:scale(1)}}
@keyframes lnsAbDrop{to{opacity:1;transform:none}}

@media (max-width:1000px){.lns-ab__rules{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:720px){
  .lns-ab__head,.lns-ab__body{grid-template-columns:1fr}
  .lns-ab__photo{max-width:420px}
  .lns-ab__night{height:560vh}
  .lns-ab__room{inset:auto 0 auto 0;top:14%;height:58%}
  .dk-tag{display:none}
  .lns-ab__clock{font-size:44px}
  .lns-ab__dots{display:none}
  .lns-ab__caps{top:auto;bottom:20px}
  .lns-ab__cap{align-self:end}
  .lns-ab__cap h3{font-size:28px}
  .lns-ab__try{font-size:19px;margin-top:8px}
  .lns-ab__hud{top:64px}
  .lns-ab__details{--cw:116px}
  .lns-ab__row{gap:16px}
  .lns-ab__gut{min-height:175px}
  .lns-ab__pull{font-size:17px;left:0}
  .lns-ab__items li{grid-template-columns:1fr;gap:4px}
  .lns-ab__cols{grid-template-columns:1fr}
  .lns-ab__rules{grid-template-columns:1fr}
}
@media (prefers-reduced-motion:reduce){
  .lns-ab *{animation:none!important;transition:none!important}
  .lns-ab__cont > *{opacity:1;transform:none}
  .r-ink,.r-red,.r-mute,.r-x{stroke-dashoffset:0}
  .r-mute-dot,.r-node,.r-blk,.r-cell,.r-own{opacity:1;transform:none}
}
`;
