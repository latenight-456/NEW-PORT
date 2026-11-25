import { useEffect, useState } from "react";
import { LogoMark, Avatar, DesignArt } from "./assets";
import { openContactOverlay } from "./components/ContactOverlay";

// Hosted Blackburn.woff2
const FONT_URL = "https://cdn.jsdelivr.net/gh/latenight-456/NEW-PORT@main/Blackburn.woff2";

// 1. Web Design Icon (Browser window with top bar, accent dot, and content wireframe)
function WebDesignIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" aria-hidden="true">
      <g transform="translate(0, 25)">
        <rect x="25" y="20" width="150" height="110" rx="16" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <line x1="25" y1="55" x2="175" y2="55" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="50" cy="37.5" r="6" fill="#d8d5ce" stroke="currentColor" strokeWidth="2" />
        <line x1="55" y1="85" x2="145" y2="85" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
        <line x1="55" y1="105" x2="110" y2="105" stroke="currentColor" strokeWidth="8" strokeLinecap="round" opacity="0.65" />
      </g>
    </svg>
  );
}

// 2. Mobile Apps Icon (Smartphone silhouette with 4 app icons and home button)
function MobileAppsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" aria-hidden="true">
      <g transform="translate(0, 15)">
        <rect x="50" y="10" width="100" height="150" rx="20" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <rect x="70" y="35" width="22" height="22" rx="6" fill="currentColor" />
        <rect x="108" y="35" width="22" height="22" rx="6" fill="#d8d5ce" stroke="currentColor" strokeWidth="2.5" />
        <rect x="70" y="70" width="22" height="22" rx="6" fill="currentColor" />
        <rect x="108" y="70" width="22" height="22" rx="6" fill="currentColor" />
        <circle cx="100" cy="130" r="5" fill="currentColor" />
      </g>
    </svg>
  );
}

// 3. AI Products Icon (Microchip body with perimeter connection pins and inner accent core)
function AIProductsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" aria-hidden="true">
      <g transform="translate(0, 10)">
        <rect x="45" y="35" width="110" height="110" rx="6" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <rect x="75" y="65" width="50" height="50" rx="4" fill="#d8d5ce" stroke="currentColor" strokeWidth="3" />
        {/* Top Pins */}
        <line x1="70" y1="10" x2="70" y2="35" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
        <line x1="100" y1="10" x2="100" y2="35" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
        <line x1="130" y1="10" x2="130" y2="35" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
        {/* Bottom Pins */}
        <line x1="70" y1="145" x2="70" y2="170" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
        <line x1="100" y1="145" x2="100" y2="170" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
        <line x1="130" y1="145" x2="130" y2="170" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
        {/* Left Pins */}
        <line x1="20" y1="60" x2="45" y2="60" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
        <line x1="20" y1="90" x2="45" y2="90" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
        <line x1="20" y1="120" x2="45" y2="120" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
        {/* Right Pins */}
        <line x1="155" y1="60" x2="180" y2="60" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
        <line x1="155" y1="90" x2="180" y2="90" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
        <line x1="155" y1="120" x2="180" y2="120" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
      </g>
    </svg>
  );
}

// 4. Brand & Identity Icon (Two overlapping rotated business cards with accent front card)
function BrandIdentityIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" aria-hidden="true">
      <g transform="translate(0, 5)">
        {/* Back Card */}
        <g transform="translate(85, 90) rotate(-15)">
          <rect x="-40" y="-55" width="80" height="110" rx="12" fill="#d8d5ce" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        {/* Front Card */}
        <g transform="translate(115, 100) rotate(15)">
          <rect x="-40" y="-55" width="80" height="110" rx="12" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>
    </svg>
  );
}

const PILL_ICONS = [
  { id: "web", title: "Web Design", subtitle: "sites that sell", Icon: WebDesignIcon },
  { id: "mobile", title: "Mobile Apps", subtitle: "apps people keep", Icon: MobileAppsIcon },
  { id: "ai", title: "AI Products", subtitle: "smart, shipped", Icon: AIProductsIcon },
  { id: "brand", title: "Brand & Identity", subtitle: "looks that last", Icon: BrandIdentityIcon },
];

const css = `
.hero {
  --ink: #292929;
  --cream: #d8d5ce;
  --red: #ff3100;
  min-height: 100vh;
  padding: 12px;
  box-sizing: border-box;
  font-family: "LNS Numerals", "Blackburn", "Baloo 2", system-ui, sans-serif;
  opacity: 0;
  transition: opacity .3s, background .3s, color .3s;
}
.hero.ready { opacity: 1; }
.hero.dark {
  --frame: var(--cream);
  --card-bg: var(--ink);
  --card-text: var(--cream);
}
.hero.light {
  --frame: var(--ink);
  --card-bg: var(--cream);
  --card-text: var(--ink);
  background: var(--frame);
}
.hero * { box-sizing: border-box; }
.hero-card {
  position: relative;
  overflow: hidden;
  min-height: calc(100vh - 24px);
  border-radius: 40px;
  background-color: var(--card-bg);
  color: var(--card-text);
  display: flex;
  flex-direction: column;
  transition: background-color .3s ease, color .3s ease;
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px 18px;
  position: relative;
  z-index: 3;
}
.logo {
  display: flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: 0;
  padding: 0;
  cursor: pointer;
  color: var(--card-text);
  transition: transform .3s, color .3s;
}
.logo:hover { transform: rotate(-4deg) scale(1.05); }
.logo-mark { height: 38px; width: auto; display: block; }
.logo-text {
  display: flex;
  flex-direction: column;
  text-align: left;
  font-size: 0.775rem;
  line-height: .95;
  letter-spacing: .04em;
}
.links { display: flex; align-items: center; gap: 28px; }
.links a {
  display: inline-block;
  color: var(--card-text);
  text-decoration: none;
  letter-spacing: .08em;
  font-size: 0.75rem;
  transition: color .2s, transform .2s;
}
.links a:hover { color: var(--red); transform: translateY(-2px) rotate(-2deg); }
.links a.active {
  text-decoration: underline wavy var(--red);
  text-decoration-thickness: 1.5px;
  text-underline-offset: 6px;
}

.theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 0;
  padding: 6px;
  cursor: pointer;
  color: var(--card-text);
  transition: color .2s, transform .25s;
}
.theme-toggle:hover { color: var(--red); transform: rotate(15deg) scale(1.15); }
.theme-toggle:focus-visible { outline: 2px solid var(--card-text); outline-offset: 2px; border-radius: 8px; }
.theme-toggle svg { width: 18px; height: 18px; display: block; }

.center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  position: relative;
  z-index: 3;
  padding: 0 20px;
  will-change: filter, opacity, transform;
}
.hero.ready .center {
  animation: focalReveal 1.05s cubic-bezier(.16, 1, .3, 1) forwards;
}

h1 {
  margin: 0;
  text-align: center;
  font-weight: 400;
  letter-spacing: .085em;
  line-height: 1.36;
  font-size: clamp(1.35rem, 3.5vw, 3.1rem);
}
.line {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .35em;
  flex-wrap: wrap;
}

/* 3D Coin-Flip Avatar (Cartoon -> HD Photo) */
.avatar-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
}
.avatar-flipper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  perspective: 700px;
  cursor: pointer;
  position: relative;
  height: 1.35em;
  width: 1.05em;
  border: 0;
  background: transparent;
  padding: 0;
  outline: none;
  user-select: none;
  vertical-align: middle;
}
.avatar-flipper-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.65s cubic-bezier(0.34, 1.35, 0.64, 1);
  will-change: transform;
}
/* Flip on hover or when click-locked with .flipped class */
.avatar-flipper:hover .avatar-flipper-inner,
.avatar-flipper.flipped .avatar-flipper-inner {
  transform: rotateY(180deg);
}
.avatar-flipper:focus-visible {
  outline: 2px solid var(--card-text);
  outline-offset: 4px;
  border-radius: 8px;
}

.avatar-face {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
.avatar-front {
  transform: rotateY(0deg);
}
.avatar-back {
  transform: rotateY(180deg);
}
.avatar-svg {
  height: 100%;
  width: auto;
  display: block;
}
.avatar-photo {
  height: 100%;
  width: auto;
  display: block;
  object-fit: contain;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.25));
}

/* Stationary Orange Pill with Clock-Rotation Icons */
.pill-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
}
.pill {
  border: 0;
  cursor: pointer;
  background: var(--red);
  color: #1a1a1a;
  font: inherit;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 70px;
  height: 40px;
  padding: 0;
  border-radius: 999px;
  transform: rotate(-3deg);
  transition: background .2s ease, transform .2s ease;
  vertical-align: middle;
}
.pill:hover {
  transform: rotate(-3deg) scale(1.08);
  background: #ff4500;
}
.pill:focus-visible {
  outline: 2px solid var(--card-text);
  outline-offset: 2px;
}

/* Clock Dial Rotation Animation: sweeps in clockwise like a clock hand */
@keyframes clockDialIn {
  0% {
    transform: rotate(-110deg) scale(0.65);
    opacity: 0;
  }
  65% {
    transform: rotate(10deg) scale(1.04);
    opacity: 0.95;
  }
  100% {
    transform: rotate(0deg) scale(1);
    opacity: 1;
  }
}

.pill-icon-inner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transform-origin: center center;
  animation: clockDialIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  will-change: transform, opacity;
}

.pill-icon {
  width: 1.25em;
  height: 1.25em;
  display: block;
}

.cta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: var(--card-text);
  color: var(--card-bg);
  text-decoration: none;
  font-family: "LNS Numerals", Inter, system-ui, -apple-system, sans-serif;
  font-weight: 600;
  letter-spacing: .02em;
  font-size: clamp(0.85rem, 1.15vw, 0.96rem);
  padding: 8px 8px 8px 20px;
  border-radius: 999px;
  transition: background .25s, color .25s;
}
.cta:hover { background: color-mix(in srgb, var(--card-text) 84%, #000); }
.cta:focus-visible { outline: 2px solid #ed1d04; outline-offset: 3px; }
.cta-arrow {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #ed1d04;
  color: #fff;
  display: grid;
  place-items: center;
  flex: none;
}
.cta-arrow svg {
  width: 15px;
  height: 15px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.3;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: transform .35s cubic-bezier(.22,.61,.36,1);
}
.cta:hover .cta-arrow svg,
.cta:focus-visible .cta-arrow svg { transform: rotate(45deg); }

.art {
  position: absolute;
  left: 0;
  bottom: -2px;
  width: 100%;
  height: auto;
  z-index: 1;
  display: block;
  transition: transform .5s, opacity .3s;
}
.art:hover { transform: translateY(-10px); }
.hero.light .art { opacity: .65; }
.hero.dark .art { opacity: .9; }

@keyframes focalReveal {
  0% { filter: blur(16px); opacity: 0; transform: translateY(28px) scale(.98); }
  100% { filter: blur(0px); opacity: 1; transform: translateY(0) scale(1); }
}

@media (max-width: 640px) {
  .nav { padding: 10px; }
  .logo-mark { height: 26px; }
  .logo-text { font-size: 0.55rem; }
  .links { gap: 14px; }
  .links a { font-size: 0.55rem; }
  .theme-toggle svg { width: 15px; height: 15px; }
  .pill-icon { width: 1.1em; height: 1.1em; }
  .avatar-flipper { height: 1.25em; width: 0.95em; }
}

@media (prefers-reduced-motion: reduce) {
  .hero *, .center { animation: none !important; transition: none !important; filter: none !important; }
}
`;

interface HeroProps {
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
}

export default function Hero({ theme: controlledTheme }: HeroProps = {}) {
  const [iconIndex, setIconIndex] = useState(0);
  const [cycleKey, setCycleKey] = useState(0);
  const [isAvatarFlipped, setIsAvatarFlipped] = useState(false);
  const [ready, setReady] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      const saved = localStorage.getItem("latenight_theme");
      if (saved === "light" || saved === "dark") return saved;
    } catch (_) {}
    return "light";
  });

  const activeTheme = controlledTheme || theme;

  useEffect(() => {
    const face = new FontFace("Blackburn", `url(${FONT_URL}) format("woff2")`);
    face
      .load()
      .then((f) => document.fonts.add(f))
      .catch((e) => console.error("Blackburn font failed to load. Check FONT_URL:", e))
      .finally(() => setReady(true));
  }, []);

  const nextIcon = () => {
    setIconIndex((v) => (v + 1) % PILL_ICONS.length);
    setCycleKey((k) => k + 1);
  };

  // Auto-cycle through the 4 vector icons every 3 seconds inside the stationary pill
  useEffect(() => {
    const timer = setInterval(() => {
      nextIcon();
    }, 3000);
    return () => clearInterval(timer);
  }, [iconIndex]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const nextTheme = prev === "light" ? "dark" : "light";
      try {
        localStorage.setItem("latenight_theme", nextTheme);
      } catch (_) {}
      return nextTheme;
    });
  };

  const toggleAvatarFlip = () => {
    setIsAvatarFlipped((prev) => !prev);
  };

  const currentIcon = PILL_ICONS[iconIndex];

  return (
    <section className={`hero ${activeTheme} linen${ready ? " ready" : ""}`}>
      <style>{css}</style>
      <div className="hero-card linen">
        <div className="nav-spacer" style={{ height: 68, pointerEvents: "none" }} aria-hidden="true" />

        <div className="center">
          <h1>
            <span className="line">
              Hi I’m{" "}
              <span className="avatar-wrap">
                <button
                  type="button"
                  className={`avatar-flipper ${isAvatarFlipped ? "flipped" : ""}`}
                  onClick={toggleAvatarFlip}
                  aria-label="Richy Antwi - Click or hover to reveal real photo"
                  title="Click or hover to reveal real photo"
                >
                  <span className="avatar-flipper-inner">
                    {/* Front face: Cartoon Avatar */}
                    <span className="avatar-face avatar-front">
                      <Avatar className="avatar-svg" role="img" aria-label="Richy cartoon illustration" />
                    </span>
                    {/* Back face: Real HD Photo */}
                    <span className="avatar-face avatar-back">
                      <img
                        src="/assets/aistudio/avatar_hd_cropped.png"
                        alt="Richy Antwi portrait"
                        className="avatar-photo"
                        loading="eager"
                      />
                    </span>
                  </span>
                </button>
              </span>{" "}
              Richy.
            </span>
            <span className="line">
              Designing{" "}
              <span className="pill-wrap">
                <button
                  type="button"
                  className="pill"
                  onClick={nextIcon}
                  aria-label={`${currentIcon.title}: ${currentIcon.subtitle}. Click to switch.`}
                  title={`${currentIcon.title}: ${currentIcon.subtitle}. Click to switch.`}
                >
                  <span className="pill-icon-inner" key={cycleKey}>
                    <currentIcon.Icon className="pill-icon" />
                  </span>
                </button>
              </span>{" "}
              interfaces
            </span>
            <span className="line">that help brands and businesses grow.</span>
          </h1>
          <a
            className="cta"
            href="#/contact"
            onClick={(e) => {
              e.preventDefault();
              openContactOverlay();
            }}
          >
            <span>Let's talk</span>
            <span className="cta-arrow" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </span>
          </a>
        </div>

        <DesignArt className="art" aria-hidden="true" />
      </div>
    </section>
  );
}
