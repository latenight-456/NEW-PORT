import { useState, type ChangeEvent, type FormEvent, type MouseEvent } from "react";

// Configurable contact endpoints
export const WHATSAPP_NUMBER = "233554886122";
export const EMAIL_ADDRESS = "richyantwi456@gmail.com";

interface SectionProps {
  theme?: "light" | "dark";
}

interface FormState {
  name: string;
  email: string;
  projectType: string;
  budget: string;
  details: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  projectType?: string;
}

const PROJECT_TYPE_OPTIONS = [
  "Brand identity",
  "Website",
  "Custom app or tool",
  "Freelance work for my agency",
] as const;

const BUDGET_OPTIONS = [
  "< GH₵15,000",
  "GH₵15,000 - GH₵35,000",
  "GH₵35,000 - GH₵75,000",
  "GH₵75,000+",
] as const;

const css = `
.contact-section {
  --ink: #292929;
  --cream: #d8d5ce;
  --red: #ff3100;
  --red-hover: #e02b00;
  --text-dark: #1a1a1a;
  min-height: 100vh;
  padding: 12px;
  box-sizing: border-box;
  font-family: "LNS Numerals", Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  transition: background .3s, color .3s;
  scroll-margin-top: 0px;
}
.contact-section.dark {
  --frame: var(--cream);
  --card-bg: var(--ink);
  --card-text: var(--cream);
  --input-bg: #1e1e1e;
  --input-border: rgba(216, 213, 206, 0.2);
  --input-text: #f5f5f3;
  --input-placeholder: rgba(216, 213, 206, 0.45);
  --label-color: #d8d5ce;
  --meta-bg: rgba(216, 213, 206, 0.05);
  --meta-border: rgba(216, 213, 206, 0.12);
  --link-muted: rgba(216, 213, 206, 0.7);
}
.contact-section.light {
  --frame: var(--ink);
  --card-bg: var(--cream);
  --card-text: var(--ink);
  --input-bg: #ece9e1;
  --input-border: rgba(41, 41, 41, 0.22);
  --input-text: #1a1a1a;
  --input-placeholder: rgba(41, 41, 41, 0.5);
  --label-color: #292929;
  --meta-bg: rgba(41, 41, 41, 0.05);
  --meta-border: rgba(41, 41, 41, 0.12);
  --link-muted: rgba(41, 41, 41, 0.75);
  background: var(--frame);
}

.contact-section * { box-sizing: border-box; }

.contact-card {
  position: relative;
  overflow: hidden;
  min-height: calc(100vh - 24px);
  border-radius: 40px;
  background-color: var(--card-bg);
  color: var(--card-text);
  padding: clamp(28px, 4.5vw, 64px) clamp(20px, 4vw, 56px);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color .3s ease, color .3s ease;
}

.contact-grid {
  width: 100%;
  max-width: 1160px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
  align-items: start;
}

@media (min-width: 960px) {
  .contact-grid {
    grid-template-columns: 1.05fr 1.2fr;
    gap: 64px;
    align-items: center;
  }
}

/* Left Column Info */
.contact-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
  text-align: left;
}

.contact-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--meta-bg);
  border: 1px solid var(--meta-border);
  border-radius: 999px;
  padding: 6px 14px;
  font-size: 0.8125rem;
  letter-spacing: 0.04em;
  font-weight: 500;
  width: fit-content;
}

.contact-pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6);
  animation: contactPulse 2s infinite;
}

@keyframes contactPulse {
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6); }
  70% { box-shadow: 0 0 0 7px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.contact-heading {
  margin: 0;
  font-family: "LNS Numerals", "Blackburn", "Baloo 2", system-ui, sans-serif;
  font-weight: 400;
  letter-spacing: .065em;
  line-height: 1.15;
  font-size: clamp(2.4rem, 4.8vw, 4.2rem);
  color: var(--card-text);
}

.contact-subline {
  margin: 0;
  font-size: clamp(1.05rem, 1.4vw, 1.25rem);
  line-height: 1.55;
  color: var(--card-text);
  opacity: 0.88;
  font-weight: 400;
  max-width: 480px;
}

.contact-meta-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 8px;
}

@media (max-width: 480px) {
  .contact-meta-cards {
    grid-template-columns: 1fr;
  }
}

.contact-meta-card {
  background: var(--meta-bg);
  border: 1px solid var(--meta-border);
  border-radius: 16px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.contact-meta-label {
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  opacity: 0.6;
  font-weight: 600;
}

.contact-meta-value {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--card-text);
}

.contact-channels {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
  font-size: 0.9rem;
}

.contact-channel-item {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--link-muted);
  text-decoration: none;
  transition: color 0.2s;
  width: fit-content;
}

.contact-channel-item:hover {
  color: var(--red);
}

.contact-channel-item svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

/* Right Column Form */
.contact-form-container {
  background: var(--meta-bg);
  border: 1px solid var(--meta-border);
  border-radius: 28px;
  padding: clamp(20px, 3.5vw, 36px);
  width: 100%;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
  text-align: left;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 600px) {
  .form-row-2 {
    grid-template-columns: 1fr 1fr;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
}

.form-label {
  font-size: 0.84rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  color: var(--label-color);
  display: flex;
  align-items: center;
  gap: 4px;
}

.form-required {
  color: var(--red);
  font-size: 0.88rem;
  line-height: 1;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  color: var(--input-text);
  font-family: inherit;
  font-size: 0.95rem;
  padding: 12px 14px;
  border-radius: 12px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s, background-color 0.2s;
  box-sizing: border-box;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: var(--input-placeholder);
}

.form-input:focus-visible,
.form-select:focus-visible,
.form-textarea:focus-visible {
  border-color: var(--red);
  outline: 2px solid var(--red);
  outline-offset: 1px;
}

.form-input.has-error,
.form-select.has-error,
.form-textarea.has-error {
  border-color: var(--red);
  box-shadow: 0 0 0 1px var(--red);
}

.form-select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23ff3100' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-size: 16px;
  padding-right: 38px;
}

.form-select option {
  background: var(--ink);
  color: #f5f5f3;
  padding: 8px;
}

.contact-section.light .form-select option {
  background: #ece9e1;
  color: #1a1a1a;
}

.form-textarea {
  resize: vertical;
  min-height: 92px;
  max-height: 200px;
  line-height: 1.45;
}

.form-error {
  color: var(--red);
  font-size: 0.775rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
}

/* Primary CTA button styled like hero CTA */
.btn-whatsapp {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  background: var(--red);
  color: var(--text-dark);
  font-family: inherit;
  font-size: clamp(0.92rem, 1.3vw, 1.05rem);
  font-weight: 600;
  letter-spacing: .05em;
  padding: 14px 28px;
  border-radius: 9999px;
  border: 0;
  cursor: pointer;
  transition: background .2s ease, color .2s ease, transform .2s ease;
  margin-top: 4px;
  text-decoration: none;
}

.btn-whatsapp:hover {
  background: #d8d5ce;
  color: #1a1a1a;
  transform: translateY(-1px);
}

.btn-whatsapp:focus-visible {
  outline: 2px solid var(--card-text);
  outline-offset: 3px;
}

.btn-whatsapp svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  fill: currentColor;
}

/* Secondary link */
.email-link-wrap {
  text-align: center;
  margin-top: 4px;
}

.btn-email-link {
  background: none;
  border: 0;
  padding: 6px 10px;
  color: var(--link-muted);
  font-family: inherit;
  font-size: 0.875rem;
  letter-spacing: 0.02em;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 4px;
  transition: color 0.2s, opacity 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-email-link:hover {
  color: var(--red);
}

.btn-email-link:focus-visible {
  outline: 2px solid var(--red);
  outline-offset: 2px;
  border-radius: 4px;
}
`;

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.63C8.75 21.42 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.9C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.59 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.08 7.38C8.91 7.38 8.63 7.44 8.39 7.7C8.16 7.96 7.5 8.58 7.5 9.85C7.5 11.12 8.43 12.35 8.56 12.52C8.69 12.69 10.36 15.28 12.93 16.39C15.07 17.31 15.5 17.13 15.96 17.09C16.42 17.05 17.44 16.48 17.65 15.89C17.86 15.3 17.86 14.8 17.8 14.69C17.74 14.58 17.57 14.52 17.31 14.39C17.05 14.26 15.79 13.64 15.55 13.55C15.32 13.47 15.15 13.42 14.98 13.68C14.81 13.94 14.33 14.52 14.18 14.69C14.04 14.86 13.9 14.88 13.64 14.75C13.38 14.62 12.55 14.35 11.57 13.47C10.8 12.79 10.28 11.94 10.14 11.69C10 11.43 10.12 11.3 10.25 11.17C10.37 11.05 10.51 10.86 10.65 10.71C10.79 10.55 10.84 10.44 10.93 10.27C11.02 10.1 10.97 9.95 10.91 9.82C10.84 9.7 10.36 8.51 10.16 8.03C9.97 7.56 9.77 7.62 9.63 7.61C9.49 7.6 9.32 7.39 9.08 7.38Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

export default function Contact({ theme = "light" }: SectionProps) {
  const [formData, setFormData] = useState<FormState>({
    name: "",
    email: "",
    projectType: "",
    budget: "",
    details: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validate = (data: FormState): FormErrors => {
    const errs: FormErrors = {};
    if (!data.name.trim()) {
      errs.name = "Please enter your name.";
    }
    if (!data.email.trim()) {
      errs.email = "Please enter your email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      errs.email = "Please enter a valid email address.";
    }
    if (!data.projectType) {
      errs.projectType = "Please select a project type.";
    }
    return errs;
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const validationErrors = validate(formData);
    if (validationErrors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validationErrors[name as keyof FormErrors],
      }));
    }
  };

  // Compile prefilled WhatsApp text
  const buildWhatsAppMessage = (data: FormState): string => {
    const lines = [
      "*New Project Inquiry*",
      "",
      `*Name:* ${data.name.trim()}`,
      `*Email:* ${data.email.trim()}`,
      `*Project Type:* ${data.projectType}`,
      `*Budget Range:* ${data.budget || "Not specified"}`,
    ];

    if (data.details.trim()) {
      lines.push("", "*Project Details:*", data.details.trim());
    }

    return lines.join("\n");
  };

  // Compile prefilled Email subject & body
  const buildEmailContent = (data: FormState) => {
    const subject = `Project Inquiry: ${data.projectType || "New Project"} - ${data.name.trim() || "Client"}`;
    const bodyLines = [
      "Hi Richy,",
      "",
      "I would like to start a project with you. Here are the details:",
      "",
      `Name: ${data.name.trim() || "N/A"}`,
      `Email: ${data.email.trim() || "N/A"}`,
      `Project Type: ${data.projectType || "N/A"}`,
      `Budget Range: ${data.budget || "Not specified"}`,
    ];

    if (data.details.trim()) {
      bodyLines.push("", "What I need:", data.details.trim());
    }

    bodyLines.push("", "Looking forward to hearing from you!");

    return {
      subject,
      body: bodyLines.join("\n"),
    };
  };

  const handleWhatsAppSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, projectType: true, budget: true, details: true });
    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstErrorField = document.getElementById(
        `contact-${Object.keys(validationErrors)[0]}`
      );
      firstErrorField?.focus();
      return;
    }

    const message = buildWhatsAppMessage(formData);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleEmailClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setTouched({ name: true, email: true, projectType: true, budget: true, details: true });
    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstErrorField = document.getElementById(
        `contact-${Object.keys(validationErrors)[0]}`
      );
      firstErrorField?.focus();
      return;
    }

    const { subject, body } = buildEmailContent(formData);
    const mailtoUrl = `mailto:${EMAIL_ADDRESS}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  return (
    <section id="contact" className={`contact-section ${theme} linen`}>
      <style>{css}</style>
      <div className="contact-card linen">
        <div className="contact-grid">
          {/* Left Column: Heading, sub-line, response promise, quick contact */}
          <div className="contact-info">
            <div className="contact-badge">
              <span className="contact-pulse" />
              <span>Available for new projects</span>
            </div>

            <h2 className="contact-heading">Start a project</h2>

            <p className="contact-subline">
              Tell me what you need. I reply within 24 hours.
            </p>

            <div className="contact-meta-cards">
              <div className="contact-meta-card">
                <span className="contact-meta-label">Response time</span>
                <span className="contact-meta-value">&lt; 24 hours</span>
              </div>
              <div className="contact-meta-card">
                <span className="contact-meta-label">Location / Time</span>
                <span className="contact-meta-value">Accra, GMT</span>
              </div>
            </div>

            <div className="contact-channels">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-channel-item"
              >
                <WhatsAppIcon />
                <span>+{WHATSAPP_NUMBER}</span>
              </a>
              <a
                href={`mailto:${EMAIL_ADDRESS}`}
                className="contact-channel-item"
              >
                <MailIcon />
                <span>{EMAIL_ADDRESS}</span>
              </a>
            </div>
          </div>

          {/* Right Column: Accessible Inquiry Form */}
          <div className="contact-form-container">
            <form className="contact-form" onSubmit={handleWhatsAppSubmit} noValidate>
              <div className="form-row form-row-2">
                {/* Name */}
                <div className="form-group">
                  <label htmlFor="contact-name" className="form-label">
                    <span>Name</span>
                    <span className="form-required" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    placeholder="e.g. Alex Mensah"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                    className={`form-input ${errors.name && touched.name ? "has-error" : ""}`}
                  />
                  {errors.name && touched.name && (
                    <span id="name-error" className="form-error" role="alert">
                      {errors.name}
                    </span>
                  )}
                </div>

                {/* Email */}
                <div className="form-group">
                  <label htmlFor="contact-email" className="form-label">
                    <span>Email</span>
                    <span className="form-required" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    placeholder="alex@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    className={`form-input ${errors.email && touched.email ? "has-error" : ""}`}
                  />
                  {errors.email && touched.email && (
                    <span id="email-error" className="form-error" role="alert">
                      {errors.email}
                    </span>
                  )}
                </div>
              </div>

              {/* Project type */}
              <div className="form-group">
                <label htmlFor="contact-projectType" className="form-label">
                  <span>Project type</span>
                  <span className="form-required" aria-hidden="true">*</span>
                </label>
                <select
                  id="contact-projectType"
                  name="projectType"
                  required
                  value={formData.projectType}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!errors.projectType}
                  aria-describedby={errors.projectType ? "projectType-error" : undefined}
                  className={`form-select ${errors.projectType && touched.projectType ? "has-error" : ""}`}
                >
                  <option value="" disabled>
                    Select project type
                  </option>
                  {PROJECT_TYPE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                {errors.projectType && touched.projectType && (
                  <span id="projectType-error" className="form-error" role="alert">
                    {errors.projectType}
                  </span>
                )}
              </div>

              {/* Budget range */}
              <div className="form-group">
                <label htmlFor="contact-budget" className="form-label">
                  <span>Budget range</span>
                </label>
                <select
                  id="contact-budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">Select budget range (optional)</option>
                  {BUDGET_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* What do you need? */}
              <div className="form-group">
                <label htmlFor="contact-details" className="form-label">
                  <span>What do you need?</span>
                </label>
                <textarea
                  id="contact-details"
                  name="details"
                  rows={3}
                  placeholder="Tell me about your goals, timeline, and vision..."
                  value={formData.details}
                  onChange={handleChange}
                  className="form-textarea"
                />
              </div>

              {/* Primary submit button */}
              <button
                type="submit"
                className="btn-whatsapp"
                aria-label="Send project inquiry via WhatsApp"
              >
                <WhatsAppIcon />
                <span>Send via WhatsApp</span>
              </button>

              {/* Secondary email link */}
              <div className="email-link-wrap">
                <button
                  type="button"
                  onClick={handleEmailClick}
                  className="btn-email-link"
                >
                  Prefer email? Send it by email
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
