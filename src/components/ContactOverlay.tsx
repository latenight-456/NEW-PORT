import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ContactForm, ChipGroup, CONTACT, FORM_ENDPOINT, CONTACT_CSS } from "./ContactPage";

/* Late Night Studio: "Let's talk" overlay.
   Choreography (taken from the reference):
   1. The page behind blurs and darkens.
   2. "Welcome! It's great to meet you." fades in at the centre of the screen, slightly larger,
      then glides up into its place at the top left.
   3. The three cards rise in one after another; the eyebrow and close button come in last.
   4. Hovering a card floods it with red and reveals its icon; the arrow button fills.
   5. "New project" swaps the cards for the Contact page's own tap-to-write form, right here
      (same chips, same message, same send). "Question" swaps in a shorter tap-to-write form
      for questions that posts to the same place. "Back" returns to the cards.
   6. Close (X, Esc, or clicking outside the content) plays it out quickly in reverse.
   Mount <ContactOverlay /> ONCE in App. Open it from any button with openContactOverlay(). */

/* ===================== CONFIG: edit these ===================== */
// Your email and the form endpoint come from ContactPage.tsx, so they are set in ONE place.
const EMAIL = CONTACT.email;
const WHATSAPP: string = "+233 55 488 6122";
const CARDS = [
  { tag: "New project", title: "I'd like to start a project.", href: "form", icon: "project" as const },
  { tag: "Question", title: "I have a quick question.", href: "question", icon: "question" as const },
  { tag: "Anything else", title: "Just saying hi.", href: "", icon: "hi" as const },
];
/* Chips for the question form. "phrase" finishes the sentence "Hi, I have a question about ..." */
const TOPICS = [
  { label: "Prices", phrase: "your prices" },
  { label: "How long it takes", phrase: "how long a project takes" },
  { label: "How you work", phrase: "how you work" },
  { label: "My current website", phrase: "my current website" },
  { label: "Something else", phrase: "" },
];
const REPLY_BY = [
  { label: "By email", needsPhone: false },
  { label: "A quick call", needsPhone: true },
  ...(WHATSAPP ? [{ label: "On WhatsApp", needsPhone: true }] : []),
];
/* =============================================================== */

const OPEN_EVENT = "lns:open-contact";
export function openContactOverlay() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

type Phase = "closed" | "opening" | "open" | "closing";

const Icon = ({ type }: { type: "project" | "question" | "hi" }) => (
  <svg className="lns-ov__icon" viewBox="0 0 120 120" aria-hidden="true">
    {type === "project" && (
      <g>
        <rect x="14" y="22" width="92" height="70" rx="8" />
        <path d="M14 38h92M28 54h48M28 66h36M28 78h22" />
        <circle cx="25" cy="30" r="2.5" />
      </g>
    )}
    {type === "question" && (
      <g>
        <path d="M18 24h84a6 6 0 016 6v46a6 6 0 01-6 6H52L32 98V82H18a6 6 0 01-6-6V30a6 6 0 016-6z" />
        <path d="M50 44a10 10 0 1120 0c0 8-10 8-10 16" />
        <circle cx="60" cy="70" r="2.5" />
      </g>
    )}
    {type === "hi" && (
      <g>
        <path d="M44 96c-14-6-24-20-24-36V42a7 7 0 0114 0v14M34 56V28a7 7 0 0114 0v26M48 54V20a7 7 0 0114 0v34M62 54V26a7 7 0 0114 0v40c0 20-14 32-32 30" />
        <path d="M88 22c6 4 10 10 12 18M96 14c8 6 13 14 15 24" />
      </g>
    )}
  </svg>
);

/* the CTA arrow: ↗ in a red circle, turns to → on hover (same as every CTA on the site) */
const GoArrow = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 17L17 7M9 7h8v8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Arrow = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

type Pick = number | null;

function QuestionForm() {
  const [topic, setTopic] = useState<Pick>(null);
  const [reply, setReply] = useState<Pick>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [edited, setEdited] = useState(false); // once the visitor types, taps stop overwriting
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const auto =
    topic === null ? "" : TOPICS[topic].phrase ? `Hi, I have a question about ${TOPICS[topic].phrase}: ` : "Hi, I have a quick question: ";
  const text = edited ? message : auto;
  const needsPhone = reply !== null && REPLY_BY[reply].needsPhone;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      type: "Question",
      name,
      email,
      phone: needsPhone ? phone : "",
      message: text,
      topic: topic !== null ? TOPICS[topic].label : "",
      reply_by: reply !== null ? REPLY_BY[reply].label : "",
    };
    if (!FORM_ENDPOINT) {
      const extra = reply !== null ? `\n\nReply: ${REPLY_BY[reply].label}${needsPhone ? ` (${phone})` : ""}` : "";
      const body = `${text}${extra}\n\n${name}\n${email}`;
      window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent("A quick question")}&body=${encodeURIComponent(body)}`;
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent")
    return (
      <div className="lns-ct__card lns-ct__done" role="status">
        <p className="lns-ct__done-title">Got it. Thanks, {name.split(" ")[0] || "friend"}.</p>
        <p>{needsPhone ? `I'll get back to you on ${phone} within a day.` : `I'll reply to ${email} within a day.`}</p>
      </div>
    );

  return (
    <form className="lns-ct__card" onSubmit={submit}>
      <div className="lns-ct__taps">
        <p className="lns-ct__taps-title">
          Start with a tap <span>Optional</span>
        </p>
        <ChipGroup label="What's it about?" options={TOPICS} value={topic} onChange={setTopic} />
        <ChipGroup label="How should I get back to you?" options={REPLY_BY} value={reply} onChange={setReply} />
      </div>

      <div className="lns-ct__row">
        <label className="lns-ct__field">
          <span>Your name</span>
          <input required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="lns-ct__field">
          <span>Email address</span>
          <input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
      </div>
      {needsPhone && (
        <label className="lns-ct__field">
          <span>Phone number</span>
          <input required type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
      )}
      <label className="lns-ct__field">
        <span>Your question</span>
        <textarea
          required
          rows={4}
          value={text}
          placeholder="Tap a topic, or just ask."
          onChange={(e) => {
            setMessage(e.target.value);
            setEdited(e.target.value !== "");
          }}
        />
      </label>

      <button className="lns-ct__send" type="submit" disabled={status === "sending"}>
        <span>{status === "sending" ? "Sending…" : "Send my question"}</span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 19L19 5M8 5h11v11" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {status === "error" && (
        <p className="lns-ct__error" role="alert">
          That didn't go through. Email me directly at <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
        </p>
      )}
      <p className="lns-ct__fine">No question is too small. I reply within a day.</p>
    </form>
  );
}

type View = "cards" | "form" | "question";

export default function ContactOverlay() {
  const [phase, setPhase] = useState<Phase>("closed");
  const rootRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const timers = useRef<number[]>([]);
  const [view, setView] = useState<View>("cards");
  const [swapped, setSwapped] = useState(false); // true after the first swap, so views animate in
  const lastCard = useRef<View>("form"); // which card to focus when coming back

  const show = (v: View) => {
    if (v !== "cards") lastCard.current = v;
    setSwapped(true);
    setView(v);
  };

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  const open = useCallback(() => {
    if (phase === "open" || phase === "opening") return;
    returnFocus.current = document.activeElement as HTMLElement;
    clearTimers();
    setView("cards");
    setSwapped(false);
    setPhase("opening");
  }, [phase]);

  const close = useCallback(() => {
    if (phase === "closed" || phase === "closing") return;
    clearTimers();
    setPhase("closing");
    timers.current.push(
      window.setTimeout(() => {
        setPhase("closed");
        returnFocus.current?.focus?.();
      }, 450)
    );
  }, [phase]);

  useEffect(() => {
    window.addEventListener(OPEN_EVENT, open);
    return () => window.removeEventListener(OPEN_EVENT, open);
  }, [open]);

  // the heading starts centred on screen, then glides into place (FLIP)
  useEffect(() => {
    if (phase !== "opening") return;
    const root = rootRef.current;
    const title = titleRef.current;
    if (!root || !title) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.documentElement.style.overflow = "hidden";
    if (reduce) {
      setPhase("open");
      return;
    }
    const r = title.getBoundingClientRect();
    const dx = window.innerWidth / 2 - (r.left + r.width / 2);
    const dy = window.innerHeight / 2 - (r.top + r.height / 2);
    title.style.transition = "none";
    title.style.transform = `translate(${dx}px, ${dy}px) scale(1.12)`;
    title.style.opacity = "0";
    void title.offsetWidth; // commit the start state
    root.classList.add("is-in");
    timers.current.push(
      window.setTimeout(() => {
        title.style.transition = "opacity .35s ease";
        title.style.opacity = "1";
      }, 180),
      window.setTimeout(() => {
        title.style.transition = "transform .7s cubic-bezier(.65,0,.25,1)";
        title.style.transform = "none";
      }, 650),
      window.setTimeout(() => setPhase("open"), 1350)
    );
  }, [phase]);

  useEffect(() => {
    if (phase === "open") closeRef.current?.focus();
    if (phase === "closed") document.documentElement.style.overflow = "";
    if (phase !== "open" && phase !== "opening") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab" && rootRef.current) {
        // keep keyboard focus inside the overlay
        const f = rootRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), input, textarea");
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, close]);

  useEffect(() => {
    if (!swapped) return;
    if (view !== "cards") {
      rootRef.current?.scrollTo({ top: 0 });
      // land on the first chip so keyboard users can start tapping straight away
      rootRef.current?.querySelector<HTMLElement>(".lns-ct__chip")?.focus({ preventScroll: true });
    } else {
      rootRef.current?.querySelector<HTMLElement>(`[data-view="${lastCard.current}"]`)?.focus({ preventScroll: true });
    }
  }, [view, swapped]);

  useEffect(() => () => clearTimers(), []);

  if (phase === "closed") return null;

  const cls =
    "lns-ov" +
    (phase === "open" ? " is-in is-open" : "") +
    (phase === "closing" ? " is-out" : "") +
    (swapped ? " is-swapped" : "");

  return createPortal(
    <div
      ref={rootRef}
      className={cls}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lns-ov-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <style>{CSS}</style>
      <div className="lns-ov__veil" aria-hidden="true" />
      <button ref={closeRef} className="lns-ov__close" onClick={close} aria-label="Close">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

      <div className="lns-ov__inner" onMouseDown={(e) => e.stopPropagation()}>
        <p className="lns-ov__eyebrow">
          <span /> Let's talk
        </p>
        <h2 id="lns-ov-title" ref={titleRef} className="lns-ov__title">
          Welcome! It's great to meet you.
        </h2>
        {view !== "cards" ? (
          <div className="lns-ov__view lns-ov__form" key={view}>
            <style>{CONTACT_CSS}</style>
            <button type="button" className="lns-ov__back" onClick={() => show("cards")}>
              <Arrow /> Back
            </button>
            <div className="lns-ct">{view === "form" ? <ContactForm /> : <QuestionForm />}</div>
          </div>
        ) : (
          <div className="lns-ov__view lns-ov__cards" key="cards">
            {CARDS.map((c, i) => {
              const body = (
                <>
                  <span className="lns-ov__media" aria-hidden="true">
                    <Icon type={c.icon} />
                  </span>
                  <span className="lns-ov__tag">
                    <i /> {c.tag}
                  </span>
                  <span className="lns-ov__card-title">{c.title}</span>
                  {c.href ? (
                    <span className="lns-ov__go">
                      <GoArrow />
                    </span>
                  ) : (
                    <span className="lns-ov__chips">
                      <a href={`mailto:${EMAIL}`}>
                        <small>Email</small>
                        {EMAIL}
                      </a>
                      {WHATSAPP && (
                        <a href={`https://wa.me/${WHATSAPP.replace(/[^\d]/g, "")}`} target="_blank" rel="noreferrer">
                          <small>WhatsApp</small>
                          {WHATSAPP}
                        </a>
                      )}
                    </span>
                  )}
                </>
              );
              const style = { ["--i" as any]: i } as React.CSSProperties;
              if (c.href === "form" || c.href === "question")
                return (
                  <button
                    key={c.tag}
                    type="button"
                    className="lns-ov__card"
                    style={style}
                    data-view={c.href}
                    onClick={() => show(c.href as View)}
                  >
                    {body}
                  </button>
                );
              return c.href ? (
                <a key={c.tag} className="lns-ov__card" href={c.href} style={style}>
                  {body}
                </a>
              ) : (
                <div key={c.tag} className="lns-ov__card" style={style}>
                  {body}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

const CSS = `
.lns-ov{
  --lns-paper:#cdc9c3;--lns-ink:#28272a;--lns-red:#ed1d04;
  --lns-display:inherit;--lns-body:inherit;
  --ease:cubic-bezier(.22,.61,.36,1);
  position:fixed;inset:0;z-index:1000;overflow-y:auto;color:var(--lns-paper);font-family:var(--lns-body);
  display:flex;align-items:flex-start;justify-content:center;padding:clamp(88px,14vh,160px) 24px 64px;
}
.lns-ov *{box-sizing:border-box}
/* 1. blur + darken whatever is behind */
.lns-ov__veil{position:fixed;inset:0;z-index:-1;background:rgba(24,23,26,0);
  -webkit-backdrop-filter:blur(0px);backdrop-filter:blur(0px);
  transition:background .5s var(--ease),backdrop-filter .5s var(--ease),-webkit-backdrop-filter .5s var(--ease)}
.lns-ov.is-in .lns-ov__veil{background:rgba(24,23,26,.9);-webkit-backdrop-filter:blur(28px) saturate(.8);backdrop-filter:blur(28px) saturate(.8)}

.lns-ov__inner{position:relative;z-index:1;width:100%;max-width:1180px}
.lns-ov__title{font-family:var(--lns-display);font-size:clamp(32px,4.4vw,60px);line-height:1.05;letter-spacing:.01em;margin:0 0 40px;
  transform-origin:left center;will-change:transform}

/* 3. staged entrances */
.lns-ov__eyebrow,.lns-ov__close,.lns-ov__card{opacity:0;transition:opacity .45s var(--ease),transform .55s var(--ease)}
.lns-ov__card{transform:translateY(24px)}
.lns-ov.is-in .lns-ov__card{opacity:1;transform:none;transition-delay:calc(1.05s + var(--i) * .09s)}
.lns-ov.is-in .lns-ov__eyebrow,.lns-ov.is-in .lns-ov__close{opacity:1;transition-delay:1.25s}
.lns-ov.is-open .lns-ov__card{transition-delay:0s}
/* 5. quick reverse */
.lns-ov.is-out .lns-ov__veil{background:rgba(24,23,26,0);-webkit-backdrop-filter:blur(0px);backdrop-filter:blur(0px);transition-duration:.4s}
.lns-ov.is-out .lns-ov__inner,.lns-ov.is-out .lns-ov__close{opacity:0;transform:translateY(-12px);transition:opacity .25s ease,transform .3s ease}

.lns-ov__eyebrow{display:flex;align-items:center;gap:10px;margin:0 0 16px;font-size:12px;letter-spacing:.14em;text-transform:uppercase}
.lns-ov__eyebrow span{width:8px;height:8px;border:1px solid currentColor;border-radius:50%}

.lns-ov__close{position:fixed;top:24px;right:24px;z-index:2;width:64px;height:64px;border-radius:50%;cursor:pointer;color:var(--lns-paper);
  background:rgba(255,255,255,.04);border:1px solid rgba(205,201,195,.7);
  box-shadow:0 0 40px 6px rgba(205,201,195,.12);display:grid;place-items:center;
  transform:rotate(-90deg) scale(.6)}
.lns-ov.is-in .lns-ov__close{transform:none}
.lns-ov__close svg{width:24px;height:24px}
.lns-ov__close:hover{background:var(--lns-paper);color:var(--lns-ink)}

.lns-ov__cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.lns-ov__card{position:relative;isolation:isolate;overflow:hidden;min-height:clamp(300px,42vh,460px);
  display:flex;flex-direction:column;padding:28px;border-radius:20px;color:inherit;text-decoration:none;
  background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08)}
/* 4. hover: the card floods red and its icon rises in */
.lns-ov__media{position:absolute;inset:0;z-index:-1;background:var(--lns-red);opacity:0;transform:scale(1.06);
  display:grid;place-items:end;padding:22px;transition:opacity .45s var(--ease),transform .7s var(--ease)}
.lns-ov__icon{width:42%;max-width:170px;fill:none;stroke:var(--lns-ink);stroke-width:3;stroke-linecap:round;stroke-linejoin:round;
  opacity:0;transform:translateY(18px) rotate(-6deg);transition:opacity .45s var(--ease) .05s,transform .6s var(--ease) .05s}
.lns-ov__icon circle{fill:var(--lns-ink);stroke:none}
.lns-ov__card:is(:hover,:focus-visible,:focus-within) .lns-ov__media{opacity:1;transform:none}
.lns-ov__card:is(:hover,:focus-visible,:focus-within) .lns-ov__icon{opacity:.9;transform:none}
.lns-ov__card:is(:hover,:focus-visible,:focus-within){color:var(--lns-ink)}
.lns-ov__card:focus-visible{outline:2px solid var(--lns-paper);outline-offset:3px}

.lns-ov__tag{display:flex;align-items:center;gap:10px;font-size:12px;letter-spacing:.12em;text-transform:uppercase}
.lns-ov__tag i{width:8px;height:8px;border-radius:50%;background:currentColor}
.lns-ov__card-title{margin-top:20px;max-width:16ch;font-family:var(--lns-display);font-size:clamp(22px,2vw,28px);line-height:1.15}
/* the CTA arrow, like every CTA on the site: a red circle whose arrow turns from ↗ to → on hover.
   (On the red hovered card the circle turns ink so it stays visible.) */
.lns-ov__go{margin-top:auto;width:64px;height:64px;border-radius:50%;background:#ed1d04;color:#fff;display:grid;place-items:center;transition:background .3s}
.lns-ov__go svg{width:24px;height:24px;transition:transform .35s var(--ease)}
.lns-ov__card:is(:hover,:focus-visible) .lns-ov__go{background:var(--lns-ink)}
.lns-ov__card:is(:hover,:focus-visible) .lns-ov__go svg{transform:rotate(45deg)}
.lns-ov__chips{margin-top:auto;display:flex;flex-wrap:wrap;gap:8px}
.lns-ov__chips a{display:flex;flex-direction:column;gap:2px;padding:12px 14px;border-radius:12px;font-size:12px;letter-spacing:.04em;
  color:var(--lns-ink);background:var(--lns-paper);text-decoration:none;word-break:break-all;transition:transform .2s var(--ease)}
.lns-ov__chips a small{font-size:10px;letter-spacing:.14em;text-transform:uppercase;opacity:.7}
.lns-ov__chips a:hover{transform:translateY(-2px)}
.lns-ov__card:is(:hover,:focus-within) .lns-ov__chips a{background:var(--lns-ink);color:var(--lns-paper)}

button.lns-ov__card{font:inherit;text-align:left;cursor:pointer;width:100%;appearance:none;-webkit-appearance:none}

/* 6. the form view: the Contact page's own form, as a paper card on the dark veil */
.lns-ov.is-swapped .lns-ov__view{animation:lns-ov-swap .5s var(--ease) both}
.lns-ov.is-swapped .lns-ov__card{opacity:1;transform:none;transition-delay:0s}
@keyframes lns-ov-swap{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
.lns-ov__form{max-width:720px}
.lns-ov__form .lns-ct{display:block;color:var(--lns-ink)}
.lns-ov__form .lns-ct__card{background:var(--lns-paper);border-color:var(--lns-paper);box-shadow:0 30px 80px rgba(0,0,0,.35)}
/* on desktop: chips on the left, details + message + send on the right, so nothing sits below the fold */
@media (min-width:980px){
  .lns-ov__form{max-width:1180px}
  .lns-ov__form .lns-ct__card{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);
    grid-template-rows:repeat(6,auto) 1fr;column-gap:32px;row-gap:0;align-items:start}
  .lns-ov__form .lns-ct__taps{grid-column:1;grid-row:1 / -1;align-self:start}
  .lns-ov__form .lns-ct__card > :not(.lns-ct__taps){grid-column:2;margin:0 0 18px}
  .lns-ov__form .lns-ct__card > .lns-ct__fine{margin:0}
  .lns-ov__form .lns-ct__done{display:flex}
}
.lns-ov__back{display:inline-flex;align-items:center;gap:10px;margin:0 0 16px;padding:10px 16px 10px 12px;border-radius:999px;
  font:inherit;font-size:13px;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;
  color:var(--lns-paper);background:transparent;border:1px solid rgba(205,201,195,.5);transition:background .25s,color .25s}
.lns-ov__back svg{width:16px;height:16px;transform:rotate(180deg)}
.lns-ov__back:hover,.lns-ov__back:focus-visible{background:var(--lns-paper);color:var(--lns-ink);outline:none}

@media (max-width:860px){
  .lns-ov{padding:96px 16px 40px}
  .lns-ov__cards{grid-template-columns:1fr}
  .lns-ov__card{min-height:200px;padding:22px}
  .lns-ov__go{width:52px;height:52px}
  .lns-ov__close{top:16px;right:16px;width:52px;height:52px}
  .lns-ov__title{margin-bottom:28px}
}
@media (prefers-reduced-motion:reduce){.lns-ov *{transition:none!important}.lns-ov__card,.lns-ov__eyebrow,.lns-ov__close{opacity:1!important;transform:none!important}.lns-ov__view{animation:none!important}}
`;
