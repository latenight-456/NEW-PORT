import { useEffect, useRef, useState } from "react";
import { LogoMark } from "./assets";
import { LightSwitch } from "./components/LightsOut";

interface NavbarProps {
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
  isContactPage?: boolean;
  isAboutPage?: boolean;
}

export default function Navbar({ theme = "light", onToggleTheme, isContactPage = false, isAboutPage = false }: NavbarProps) {
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>(isContactPage ? "contact" : isAboutPage ? "about" : "hero");
  const lastScrollYRef = useRef(0);

  // Auto-hiding on scroll down, revealing on scroll up
  useEffect(() => {
    let rafId = 0;

    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const delta = currentScrollY - lastScrollYRef.current;

        // Scrolled past top
        setScrolled(currentScrollY > 20);

        if (currentScrollY <= 60) {
          setVisible(true);
        } else if (delta > 7) {
          // Scrolling down
          setVisible(false);
        } else if (delta < -7) {
          // Scrolling up
          setVisible(true);
        }

        lastScrollYRef.current = currentScrollY;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Reset navbar visibility and active highlight on route switch
  useEffect(() => {
    setVisible(true);
    setScrolled(window.scrollY > 20);
    lastScrollYRef.current = window.scrollY;
    if (isContactPage) {
      setActiveSection("contact");
    } else if (isAboutPage) {
      setActiveSection("about");
    }
  }, [isContactPage, isAboutPage]);

  // Scroll spy to highlight active section in navbar on Home page
  useEffect(() => {
    if (isContactPage) {
      setActiveSection("contact");
      return;
    }
    if (isAboutPage) {
      setActiveSection("about");
      return;
    }
    const sections = ["work", "services", "hero"];
    const onScrollSpy = () => {
      const scrollPos = window.scrollY + 200;
      let matched = "hero";
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          const top = rect.top + window.scrollY;
          const height = rect.height;
          if (scrollPos >= top && scrollPos < top + height) {
            matched = id;
            break;
          }
        }
      }
      setActiveSection(matched);
    };

    window.addEventListener("scroll", onScrollSpy, { passive: true });
    onScrollSpy();
    return () => window.removeEventListener("scroll", onScrollSpy);
  }, [isContactPage, isAboutPage]);

  return (
    <header className={`global-navbar-wrap ${visible ? "is-visible" : "is-hidden"}`}>
      <style>{`
        .global-navbar-wrap {
          position: fixed;
          top: 12px;
          left: 12px;
          right: 12px;
          z-index: 50;
          transition: transform 0.38s cubic-bezier(0.16, 1, 0.3, 1);
          pointer-events: none;
        }
        .global-navbar-wrap.is-visible {
          transform: translateY(0);
        }
        .global-navbar-wrap.is-hidden {
          transform: translateY(-135%);
        }

        .nav-card {
          --ink: #292929;
          --cream: #d8d5ce;
          --red: #ff3100;
          width: 100%;
          box-sizing: border-box;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px clamp(16px, 2.5vw, 28px);
          pointer-events: auto;
          transition: border-radius 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease, color 0.3s ease;
        }

        .nav-card.dark {
          --card-bg: var(--ink);
          --card-text: var(--cream);
          --border-color: rgba(216, 213, 206, 0.14);
          color: var(--card-text);
        }

        .nav-card.light {
          --card-bg: var(--cream);
          --card-text: var(--ink);
          --border-color: rgba(41, 41, 41, 0.12);
          color: var(--card-text);
        }

        .nav-card {
          border-top-left-radius: 40px;
          border-top-right-radius: 40px;
          border-bottom-left-radius: 24px;
          border-bottom-right-radius: 24px;
          border-bottom: 1px solid var(--border-color);
        }

        .nav-card.is-scrolled {
          border-radius: 32px;
          box-shadow: 0 14px 35px rgba(0, 0, 0, 0.18);
          border: 1px solid var(--border-color);
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: 0;
          padding: 0;
          cursor: pointer;
          color: var(--card-text);
          transition: transform 0.25s ease;
          text-decoration: none;
        }
        .nav-logo:hover {
          transform: rotate(-3deg) scale(1.04);
        }
        .nav-logo-mark {
          height: 36px;
          width: auto;
          display: block;
        }
        .nav-logo-text {
          display: flex;
          flex-direction: column;
          text-align: left;
          font-family: "LNS Numerals", "Blackburn", system-ui, sans-serif;
          font-size: 0.82rem;
          line-height: 0.94;
          letter-spacing: 0.04em;
        }

        .nav-links-wrap {
          display: flex;
          align-items: center;
          gap: clamp(14px, 2.2vw, 32px);
        }

        .nav-link {
          display: inline-block;
          color: var(--card-text);
          text-decoration: none;
          font-family: "LNS Numerals", "Blackburn", system-ui, sans-serif;
          letter-spacing: 0.08em;
          font-size: clamp(0.78rem, 1vw, 0.92rem);
          white-space: nowrap;
          transition: color 0.2s ease, transform 0.2s ease;
          position: relative;
        }
        .nav-link:hover {
          color: var(--red);
          transform: translateY(-2px);
        }
        .nav-link.active {
          color: var(--card-text);
          text-decoration: underline;
          text-decoration-color: var(--red);
          text-decoration-thickness: 2.5px;
          text-underline-offset: 6px;
        }

        .nav-theme-toggle {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: 0;
          padding: 6px;
          cursor: pointer;
          color: var(--card-text);
          transition: color 0.2s ease, transform 0.25s ease;
        }
        .nav-theme-toggle:hover {
          color: var(--red);
          transform: rotate(15deg) scale(1.15);
        }
        .nav-theme-toggle:focus-visible {
          outline: 2px solid var(--card-text);
          outline-offset: 2px;
          border-radius: 8px;
        }
        .nav-theme-toggle svg {
          width: 18px;
          height: 18px;
          display: block;
        }

        @media (max-width: 640px) {
          .nav-card {
            padding: 12px 14px;
            border-radius: 24px;
          }
          .nav-links-wrap {
            gap: 10px;
          }
          .nav-logo-text {
            font-size: 0.72rem;
          }
          .nav-link {
            font-size: 0.72rem;
          }
        }
        @media (max-width: 520px) {
          .nav-card {
            padding: 10px 12px;
          }
          .nav-logo-mark {
            height: 28px;
          }
          .nav-logo-text {
            display: none;
          }
          .nav-links-wrap {
            gap: 8px;
          }
          .nav-link {
            font-size: 0.68rem;
            letter-spacing: 0.04em;
          }
        }
      `}</style>

      <div className={`nav-card linen ${theme} ${scrolled ? "is-scrolled" : ""}`}>
        {/* Left: Logo */}
        <a href="#hero" className="nav-logo" aria-label="Late night studio home">
          <LogoMark className="nav-logo-mark" aria-hidden="true" />
          <span className="nav-logo-text">
            <span>Late</span>
            <span>night</span>
            <span>studio</span>
          </span>
        </a>

        {/* Right: Nav Links and Theme Toggle */}
        <nav className="nav-links-wrap">
          <a
            href="#services"
            className={`nav-link ${activeSection === "services" ? "active" : ""}`}
          >
            Services
          </a>
          <a
            href="#work"
            className={`nav-link ${activeSection === "work" ? "active" : ""}`}
          >
            My Work
          </a>
          <a
            href="#/about"
            className={`nav-link ${isAboutPage || activeSection === "about" ? "active" : ""}`}
          >
            About
          </a>
          <a
            href="#/contact"
            className={`nav-link ${isContactPage || activeSection === "contact" ? "active" : ""}`}
          >
            Contact
          </a>

          <LightSwitch />

          {onToggleTheme && (
            <button
              type="button"
              className="nav-theme-toggle"
              onClick={onToggleTheme}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? (
                /* Moon Icon */
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                /* Sun Icon */
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              )}
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
