import React, { useEffect, useMemo, useRef, useState } from "react";

/* Late Night Studio: Contact page.
   1. Hero + "start with a few taps" form: tapping chips writes the message for the visitor.
   2. "What happens next" steps (+ optional testimonials, hidden until you add real ones).
   3. Giant "LATENIGHT." wordmark: letters near the cursor turn red, lift and tilt. It auto-sizes to fill the width.
   Self-contained: styles injected below, no packages. Edit only the CONFIG block. */

/* ===================== CONFIG: edit these ===================== */
const CONTACT = {
  email: "richyantwi456@gmail.com",
  phone: "+233 55 488 6122",
  replyPromise: "I reply within a day, and I only use your details to answer you. No mailing lists. We agree on scope, timing and price before any work begins.",
};
/* Where the form posts. Leave "" to fall back to opening the visitor's email app with the message filled in.
   Free options: https://formspree.io or https://web3forms.com (paste their endpoint URL here). */
const FORM_ENDPOINT = "";

const NEEDS = [
  { label: "A new website", phrase: "a new website" },
  { label: "A website redesign", phrase: "a website redesign" },
  { label: "A business system", phrase: "a business management system" },
  { label: "Branding", phrase: "branding" },
  { label: "Graphic design", phrase: "graphic design (flyers, banners and more)" },
];
const BUSINESSES = [
  { label: "A local business", phrase: "a local business" },
  { label: "Professional services", phrase: "a professional services business" },
  { label: "Retail or e-commerce", phrase: "a retail business" },
  { label: "Hospitality", phrase: "a hospitality business" },
  { label: "A startup", phrase: "a startup" },
  { label: "A church or non-profit", phrase: "a church or non-profit" },
];
const TIMING = [
  { label: "As soon as possible", phrase: ", as soon as possible." },
  { label: "Within a month", phrase: ", within a month." },
  { label: "In the next three months", phrase: ", in the next three months." },
  { label: "Just exploring", phrase: ". I'm just exploring for now." },
];
const STEPS = [
  { title: "Within a day", text: "I reply by email, usually with a couple of questions and times for a short call." },
  { title: "A short call", text: "We talk through your business, your audience and what you already have, with no obligation." },
  { title: "Your proposal", text: "Pages, features, schedule and price in writing. Work starts only once you agree to it." },
];
/* Only add REAL quotes from real clients. The block stays hidden while this is empty. */
const TESTIMONIALS: { quote: string; name: string; detail: string }[] = [];
/* =============================================================== */

type Pick = number | null;

function compose(need: Pick, biz: Pick, when: Pick) {
  if (need === null && biz === null && when === null) return "";
  let s = "I need " + (need !== null ? NEEDS[need].phrase : "help");
  if (biz !== null) s += " for " + BUSINESSES[biz].phrase;
  s += when !== null ? TIMING[when].phrase : ".";
  return s;
}

function ChipGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { label: string }[];
  value: Pick;
  onChange: (v: Pick) => void;
}) {
  return (
    <fieldset className="lns-ct__group">
      <legend>{label}</legend>
      <div className="lns-ct__chips">
        {options.map((o, i) => (
          <button
            key={o.label}
            type="button"
            className="lns-ct__chip"
            aria-pressed={value === i}
            onClick={() => onChange(value === i ? null : i)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function ContactForm() {
  const [need, setNeed] = useState<Pick>(null);
  const [biz, setBiz] = useState<Pick>(null);
  const [when, setWhen] = useState<Pick>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [edited, setEdited] = useState(false); // once the visitor types, taps stop overwriting
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const auto = useMemo(() => compose(need, biz, when), [need, biz, when]);
  const text = edited ? message : auto; // taps write the message until the visitor types their own

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      email,
      message: text,
      need: need !== null ? NEEDS[need].label : "",
      business: biz !== null ? BUSINESSES[biz].label : "",
      timing: when !== null ? TIMING[when].label : "",
    };
    if (!FORM_ENDPOINT) {
      const body = `${text}\n\n${name}\n${email}`;
      window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent("New project enquiry")}&body=${encodeURIComponent(body)}`;
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
        <p>I'll reply to {email} within a day.</p>
      </div>
    );

  return (
    <form className="lns-ct__card" onSubmit={submit}>
      <div className="lns-ct__taps">
        <p className="lns-ct__taps-title">
          Start with a few taps <span>Optional</span>
        </p>
        <ChipGroup label="What do you need?" options={NEEDS} value={need} onChange={setNeed} />
        <ChipGroup label="What kind of business?" options={BUSINESSES} value={biz} onChange={setBiz} />
        <ChipGroup label="When would you like to start?" options={TIMING} value={when} onChange={setWhen} />
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
      <label className="lns-ct__field">
        <span>Tell me about your project</span>
        <textarea
          required
          rows={5}
          value={text}
          placeholder="Tap the options, or write it in your own words."
          onChange={(e) => {
            setMessage(e.target.value);
            setEdited(e.target.value !== "");
          }}
        />
      </label>

      <button className="lns-ct__send" type="submit" disabled={status === "sending"}>
        <span>{status === "sending" ? "Sending…" : "Send the details"}</span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 19L19 5M8 5h11v11" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {status === "error" && (
        <p className="lns-ct__error" role="alert">
          That didn't go through. Email me directly at <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>.
        </p>
      )}
      <p className="lns-ct__fine">I'll reply by email to arrange a conversation. No obligation to hire me.</p>
    </form>
  );
}

export default function ContactPage() {
  return (
    <main className="lns-ct" id="contact">
      <style>{CSS}</style>

      <section className="lns-ct__hero">
        <div className="lns-ct__intro">
          <p className="lns-ct__eyebrow">Your next project</p>
          <h1 className="lns-ct__title">
            Let's talk<span className="lns-ct__dot">.</span>
          </h1>
          <p className="lns-ct__lead">
            Need a website, a system to run your business, or a brand that looks the part? Tell me what you're working on and when you need it.
          </p>
          <a className="lns-ct__email" href={`mailto:${CONTACT.email}`}>
            {CONTACT.email}
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 19L19 5M8 5h11v11" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          {CONTACT.phone && (
            <p className="lns-ct__phone">
              Or call <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}>{CONTACT.phone}</a>
            </p>
          )}
          <p className="lns-ct__promise">{CONTACT.replyPromise}</p>
        </div>
        <ContactForm />
      </section>

      <section className="lns-ct__next" aria-labelledby="lns-next-title">
        <div>
          <p className="lns-ct__eyebrow">After you send it</p>
          <h2 id="lns-next-title" className="lns-ct__next-title">
            WHAT
            <br />
            HAPPENS
            <br />
            <em>next.</em>
          </h2>
        </div>
        <ol className="lns-ct__steps">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <span className="lns-ct__num">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
        {TESTIMONIALS.length > 0 && (
          <div className="lns-ct__quotes">
            {TESTIMONIALS.map((t) => (
              <figure key={t.quote}>
                <blockquote>“{t.quote}”</blockquote>
                <figcaption>
                  <strong>{t.name}</strong>
                  <span>{t.detail}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

const CSS = `
.lns-ct,.lns-wm{
  --lns-paper:#cdc9c3;--lns-ink:#28272a;--lns-red:#ed1d04;--lns-muted:#5e5a57;
  --lns-line:rgba(40,39,42,.22);--lns-field:rgba(255,255,255,.42);--lns-card:rgba(255,255,255,.22);
  --lns-display:"LNS Numerals", "Blackburn", system-ui, sans-serif;   /* = your heading font */
  --lns-body:"LNS Numerals", Inter, system-ui, -apple-system, sans-serif;      /* = your body font */
  --lns-ease:cubic-bezier(.22,.61,.36,1);
  color:var(--lns-ink);font-family:var(--lns-body);
}
.dark .lns-ct,.dark .lns-wm,
.lns-ct.dark,.lns-wm.dark{
  --lns-paper:#28272a;
  --lns-ink:#cdc9c3;
  --lns-muted:#a39e99;
  --lns-line:rgba(205,201,195,.22);
  --lns-field:rgba(255,255,255,.06);
  --lns-card:rgba(255,255,255,.04);
}
.lns-ct{display:block}
.lns-ct *,.lns-ct *::before,.lns-ct *::after,.lns-wm *{box-sizing:border-box}
.lns-ct__eyebrow{margin:0 0 20px;font-size:12px;font-weight:600;letter-spacing:.12em;text-transform:uppercase}

/* ---------- hero ---------- */
.lns-ct__hero{max-width:1180px;margin:0 auto;padding:120px 24px 96px;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,600px);gap:64px;align-items:start}
.lns-ct__title{font-family:var(--lns-display);font-size:clamp(56px,9vw,120px);line-height:.92;letter-spacing:.01em;margin:0 0 28px}
.lns-ct__dot{color:var(--lns-red)}
.lns-ct__lead{max-width:420px;margin:0 0 36px;font-size:17px;line-height:1.65;color:var(--lns-muted)}
.lns-ct__email{display:inline-flex;align-items:center;gap:14px;padding-bottom:10px;border-bottom:2px solid var(--lns-ink);
  color:inherit;text-decoration:none;font-size:clamp(17px,2vw,20px);transition:gap .3s var(--lns-ease),border-color .3s}
.lns-ct__email svg{width:18px;height:18px;transition:transform .3s var(--lns-ease)}
.lns-ct__email:hover{gap:20px;border-color:var(--lns-red)}
.lns-ct__email:hover svg{transform:rotate(45deg);color:var(--lns-red)}
.lns-ct__phone{margin:20px 0 0;color:var(--lns-muted)}
.lns-ct__phone a{color:var(--lns-ink);text-underline-offset:3px}
.lns-ct__promise{max-width:400px;margin:32px 0 0;font-size:15px;line-height:1.7;color:var(--lns-muted)}

/* ---------- form card ---------- */
.lns-ct__card{background:var(--lns-card);border:1px solid var(--lns-ink);border-radius:24px;padding:32px;display:flex;flex-direction:column;gap:20px}
.lns-ct__taps{border:1px solid var(--lns-line);border-radius:16px;padding:20px}
.lns-ct__taps-title{margin:0 0 4px;font-weight:600;font-size:15px}
.lns-ct__taps-title span{font-weight:400;font-size:12px;color:var(--lns-muted);margin-left:6px}
.lns-ct__group{border:0;margin:14px 0 0;padding:0;min-width:0}
.lns-ct__group legend{padding:0;margin-bottom:8px;font-size:13px;color:var(--lns-muted)}
.lns-ct__chips{display:flex;flex-wrap:wrap;gap:8px}
.lns-ct__chip{font:inherit;font-size:13px;padding:8px 14px;border-radius:999px;border:1px solid var(--lns-line);
  background:var(--lns-field);color:var(--lns-ink);cursor:pointer;
  transition:background .2s,color .2s,border-color .2s,transform .2s var(--lns-ease)}
.lns-ct__chip:hover{border-color:var(--lns-ink)}
.lns-ct__chip:active{transform:scale(.96)}
.lns-ct__chip[aria-pressed="true"]{background:var(--lns-ink);border-color:var(--lns-ink);color:var(--lns-paper)}
.lns-ct__chip[aria-pressed="true"]::before{content:"";display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--lns-red);margin-right:8px;vertical-align:middle}
.lns-ct__chip:focus-visible,.lns-ct__send:focus-visible{outline:2px solid var(--lns-red);outline-offset:2px}

.lns-ct__row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.lns-ct__field{display:flex;flex-direction:column;gap:8px;min-width:0;font-size:13px;font-weight:500}
.lns-ct__field input,.lns-ct__field textarea{font:inherit;font-size:16px;font-weight:400;color:var(--lns-ink);
  width:100%;background:var(--lns-field);border:1px solid var(--lns-line);border-radius:12px;padding:12px 14px;
  transition:border-color .2s,background .2s}
.lns-ct__field textarea{resize:vertical;min-height:130px;line-height:1.55}
.lns-ct__field input:focus,.lns-ct__field textarea:focus{outline:none;border-color:var(--lns-ink);background:rgba(255,255,255,.6)}
.dark .lns-ct__field input:focus,.dark .lns-ct__field textarea:focus{background:rgba(255,255,255,.1)}
.lns-ct__send{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;
  font:inherit;font-family:var(--lns-display);font-size:17px;letter-spacing:.02em;
  padding:18px 24px;border:0;border-radius:999px;background:var(--lns-red);color:var(--lns-ink);cursor:pointer;
  transition:transform .2s var(--lns-ease),filter .2s}
.lns-ct__send svg{width:20px;height:20px;transition:transform .3s var(--lns-ease)}
.lns-ct__send:hover svg{transform:rotate(45deg)}
.lns-ct__send:active{transform:scale(.98)}
.lns-ct__send:disabled{filter:grayscale(.6);cursor:progress}
.lns-ct__fine{margin:-6px 0 0;font-size:12px;color:var(--lns-muted)}
.lns-ct__error{margin:0;font-size:14px;color:var(--lns-red)}
.lns-ct__error a{color:inherit}
.lns-ct__done{min-height:320px;justify-content:center;text-align:center}
.lns-ct__done-title{font-family:var(--lns-display);font-size:32px;margin:0}
.lns-ct__done p{margin:0}

/* ---------- what happens next ---------- */
.lns-ct__next{max-width:1180px;margin:0 auto;padding:96px 24px;border-top:1px solid var(--lns-line);
  display:grid;grid-template-columns:minmax(0,300px) minmax(0,1fr);gap:64px;align-items:start}
.lns-ct__next:has(.lns-ct__quotes){grid-template-columns:minmax(0,280px) minmax(0,1fr) minmax(0,340px)}
.lns-ct__next-title{font-family:var(--lns-display);font-size:clamp(40px,5vw,64px);line-height:.95;margin:0}
.lns-ct__next-title em{font-style:normal;color:var(--lns-red)}
.lns-ct__steps{list-style:none;margin:0;padding:0;border-top:1px solid var(--lns-ink)}
.lns-ct__steps li{display:grid;grid-template-columns:48px 1fr;gap:12px;padding:24px 0;border-bottom:1px solid var(--lns-ink)}
.lns-ct__num{font-family:var(--lns-display);font-size:13px;padding-top:6px}
.lns-ct__steps h3{font-family:var(--lns-display);font-size:24px;margin:0 0 6px;letter-spacing:.01em}
.lns-ct__steps p{margin:0;font-size:15px;line-height:1.65;color:var(--lns-muted)}
.lns-ct__quotes{display:flex;flex-direction:column;gap:16px}
.lns-ct__quotes figure{margin:0;padding:24px;border:1px solid var(--lns-ink);border-radius:20px;background:var(--lns-card)}
.lns-ct__quotes blockquote{margin:0 0 16px;font-family:var(--lns-display);font-size:22px;line-height:1.3}
.lns-ct__quotes figcaption{display:flex;flex-direction:column;gap:2px;font-size:13px;color:var(--lns-muted)}
.lns-ct__quotes strong{color:var(--lns-ink)}

@media (max-width:900px){
  .lns-ct__hero{grid-template-columns:1fr;gap:48px;padding:96px 16px 64px}
  .lns-ct__next,.lns-ct__next:has(.lns-ct__quotes){grid-template-columns:1fr;gap:40px;padding:64px 16px}
  .lns-ct__card{padding:20px;border-radius:20px}
  .lns-ct__taps{padding:16px}
  .lns-wm{padding:16px 16px 32px}
}
@media (max-width:520px){.lns-ct__row{grid-template-columns:1fr}}
@media (prefers-reduced-motion:reduce){.lns-ct *,.lns-wm *{transition:none!important}}
`;

/* Shared with ContactOverlay.tsx so the overlay uses this exact same form. */
export { ContactForm, ChipGroup, CONTACT, FORM_ENDPOINT, CSS as CONTACT_CSS };
