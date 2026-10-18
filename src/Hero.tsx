import { useEffect, useState } from "react";
import { LogoMark, Avatar, DesignArt } from "./assets";
import { BLACKBURN_WOFF2 } from "./fonts";

const VARIANTS = [
  { word: "brand", noun: "identities", tail: "that people remember." },
  { word: "web", noun: "experiences", tail: "that turn visitors into clients." },
  { word: "app", noun: "interfaces", tail: "that teams actually use." },
];

const css = `
@font-face{font-family:"Blackburn";src:url("${BLACKBURN_WOFF2}") format("woff2");font-display:swap}

.hero{--ink:#292929;--cream:#d8d5ce;--red:#ff3100;--frame:#d8d5ce;
  min-height:100vh;padding:12px;background:var(--frame);box-sizing:border-box;
  font-family:"Blackburn","Baloo 2",system-ui,sans-serif}
.hero *{box-sizing:border-box}
.hero-card{position:relative;overflow:hidden;min-height:calc(100vh - 24px);border-radius:40px;
  background:var(--ink);color:var(--cream);display:flex;flex-direction:column}

.nav{display:flex;justify-content:space-between;align-items:flex-start;padding:32px 36px;position:relative;z-index:3}
.logo{display:flex;align-items:center;gap:10px;background:none;border:0;padding:0;cursor:pointer;
  color:var(--cream);transition:transform .3s}
.logo:hover{transform:rotate(-4deg) scale(1.05)}
.logo-mark{height:76px;width:auto;display:block}
.logo-text{display:flex;flex-direction:column;text-align:left;font-size:1.55rem;line-height:.95;letter-spacing:.04em}
.links{display:flex;gap:56px}
.links a{display:inline-block;color:var(--cream);text-decoration:none;letter-spacing:.08em;
  font-size:1.5rem;transition:color .2s,transform .2s}
.links a:hover{color:var(--red);transform:translateY(-2px) rotate(-2deg)}
.links a.active{text-decoration:underline wavy var(--red);text-decoration-thickness:1.5px;text-underline-offset:6px}

.center{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:32px;position:relative;z-index:3;padding:0 20px 140px}
h1{margin:0;text-align:center;font-weight:400;letter-spacing:.03em;line-height:1.1;
  font-size:clamp(2rem,5.2vw,4.6rem)}
.line{display:flex;align-items:center;justify-content:center;gap:.28em;flex-wrap:wrap}

.avatar{height:1.3em;width:auto;display:block;cursor:pointer;transition:transform .3s}
.avatar:hover{transform:rotate(-8deg) scale(1.12)}

.pill-wrap{position:relative;display:inline-flex}
.pill{border:0;cursor:pointer;background:var(--red);color:#1a1a1a;font:inherit;font-size:.62em;
  line-height:1;padding:.5em 1em;border-radius:999px;min-width:3em;transform:rotate(-3deg);transition:transform .25s}
.pill.idle{animation:wiggle 4s ease-in-out infinite}
.pill:hover{transform:rotate(3deg) scale(1.08);animation:none}
.pill:focus-visible,.cta:focus-visible,.links a:focus-visible,.logo:focus-visible{outline:3px solid var(--cream);outline-offset:4px}
.pill-word{display:inline-block;animation:pop .35s ease-out}
.tail,.noun{animation:rise .4s ease-out}

.hint{position:absolute;left:55%;bottom:calc(100% + 4px);display:flex;flex-direction:column;
  align-items:flex-start;pointer-events:none;color:var(--cream);font-family:cursive;
  font-size:.3em;white-space:nowrap;animation:rise .5s ease-out}
.hint span{transform:rotate(-6deg)}
.hint svg{width:2.2em;height:2.2em;margin-left:-.4em}

.cta{display:inline-block;background:var(--red);color:#1a1a1a;text-decoration:none;
  letter-spacing:.06em;font-size:clamp(1.2rem,1.9vw,1.6rem);padding:.65em 1.8em;border-radius:999px;
  transition:background .2s,color .2s}
.cta:hover{background:var(--cream)}

.art{position:absolute;left:0;bottom:-2px;width:100%;height:auto;z-index:1;display:block;transition:transform .5s}
.art:hover{transform:translateY(-10px)}

@keyframes wiggle{0%,86%,100%{transform:rotate(-3deg)}89%{transform:rotate(-9deg)}
  92%{transform:rotate(4deg)}95%{transform:rotate(-6deg)}98%{transform:rotate(0)}}
@keyframes pop{0%{transform:scaleX(.5)}60%{transform:scaleX(1.15)}100%{transform:scaleX(1)}}
@keyframes rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}

@media (max-width:640px){
  .nav{padding:20px}.logo-mark{height:52px}.logo-text{font-size:1.1rem}
  .links{gap:22px}.links a{font-size:1.1rem}
}
@media (prefers-reduced-motion:reduce){
  .hero *{animation:none!important;transition:none!important}
}
`;

export default function Hero() {
  const [i, setI] = useState(0);
  const [swapKey, setSwapKey] = useState(0);
  const [touched, setTouched] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowHint(true), 1500);
    return () => clearTimeout(t);
  }, []);

  const next = () => {
    setI((v) => (v + 1) % VARIANTS.length);
    setSwapKey((k) => k + 1);
    setTouched(true);
  };

  const v = VARIANTS[i];

  return (
    <section className="hero">
      <style>{css}</style>
      <div className="hero-card">
        <header className="nav">
          <button className="logo" aria-label="Late night studio home">
            <LogoMark className="logo-mark" aria-hidden="true" />
            <span className="logo-text">
              <span>Late</span>
              <span>night</span>
              <span>studio</span>
            </span>
          </button>
          <nav className="links">
            <a href="#about">About</a>
            <a href="#work">Work</a>
            <a href="#contact" className="active">Contact</a>
          </nav>
        </header>

        <div className="center">
          <h1>
            <span className="line">
              Hi I’m <Avatar className="avatar" role="img" aria-label="Richy" /> Richy.
            </span>
            <span className="line">
              Designing
              <span className="pill-wrap">
                <button
                  className={"pill" + (touched ? "" : " idle")}
                  onClick={next}
                  aria-label={`Showing ${v.word}. Click to change.`}
                >
                  <span className="pill-word" key={"w" + swapKey}>{v.word}</span>
                </button>
                {showHint && !touched && (
                  <span className="hint" aria-hidden="true">
                    <span>poke me</span>
                    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M6 4 C 8 22, 18 30, 32 32" />
                      <path d="M24 26 L32 32 L22 36" />
                    </svg>
                  </span>
                )}
              </span>
              <span className="noun" key={"n" + swapKey}>{v.noun}</span>
            </span>
            <span className="line tail" key={"t" + swapKey}>{v.tail}</span>
          </h1>
          <a className="cta" href="#contact">Start a project</a>
        </div>

        <DesignArt className="art" aria-hidden="true" />
      </div>
    </section>
  );
}
