import { useEffect, useRef, useState } from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import About from "./About";
import Services from "./Services";
import Work from "./Work";
import AboutPage from "./components/AboutPage";
import ContactPage from "./components/ContactPage";
import NightFooter from "./components/NightFooter";
import LogoLoader from "./components/LogoLoader";
import ContactOverlay from "./components/ContactOverlay";
import LightsOut from "./components/LightsOut";
import { BLACKBURN_WOFF2 } from "./fonts";

const BLACKBURN_URL = "https://cdn.jsdelivr.net/gh/latenight-456/NEW-PORT@main/Blackburn.woff2";

export default function App() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      const saved = localStorage.getItem("latenight_theme");
      if (saved === "light" || saved === "dark") return saved;
    } catch (_) {}
    return "light";
  });

  const [hash, setHash] = useState<string>(() => window.location.hash || "");
  const isContact = hash === "#/contact";
  const isAbout = hash === "#/about";
  const route = isContact ? "contact" : isAbout ? "about" : "home";
  const pendingAnchorRef = useRef<string | null>(null);
  const prevRouteRef = useRef<string>(route);

  const toggleTheme = () => {
    setTheme((prev) => {
      const nextTheme = prev === "light" ? "dark" : "light";
      try {
        localStorage.setItem("latenight_theme", nextTheme);
      } catch (_) {}
      return nextTheme;
    });
  };

  // Ensure Blackburn font is loaded on both Home and direct #/contact visits
  useEffect(() => {
    const face = new FontFace("Blackburn", `url(${BLACKBURN_URL}) format("woff2")`);
    face
      .load()
      .then((f) => document.fonts.add(f))
      .catch(() => {
        const fallback = new FontFace("Blackburn", `url(${BLACKBURN_WOFF2}) format("woff2")`);
        fallback.load().then((f) => document.fonts.add(f)).catch(() => {});
      });
  }, []);

  // Sync background color with theme and toggle dark class
  useEffect(() => {
    document.body.style.backgroundColor = theme === "dark" ? "#d8d5ce" : "#292929";
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.body.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Listen to browser hashchange to switch between Home and Contact page
  useEffect(() => {
    const onHashChange = () => {
      setHash(window.location.hash || "");
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // Handle scroll positioning on route switches and cross-page anchor navigation
  useEffect(() => {
    const routeChanged = prevRouteRef.current !== route;
    prevRouteRef.current = route;

    if (route !== "home") {
      window.scrollTo(0, 0);
      return;
    }

    const targetHash = pendingAnchorRef.current || (routeChanged ? hash : null);
    pendingAnchorRef.current = null;

    if (routeChanged) {
      window.scrollTo(0, 0);
    }

    if (targetHash && targetHash !== "#hero" && targetHash.startsWith("#") && !targetHash.startsWith("#/")) {
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          const el = document.querySelector(targetHash);
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          }
        });
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    }
  }, [route, hash]);

  // Intercept anchor link clicks (#services, #work, #hero, #/about, #/contact)
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      const target = (e.target as HTMLElement).closest('a[href^="#"], button.logo, a.nav-logo');
      if (!target) return;

      let href = "";
      if (target.matches("button.logo, a.nav-logo")) {
        href = "#hero";
      } else {
        href = target.getAttribute("href") || "";
      }

      if (!href || href === "#") return;

      // Contact & About page routes
      if (href === "#/contact" || href === "#/about") {
        e.preventDefault();
        if (window.location.hash === href) {
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          window.location.hash = href;
        }
        return;
      }

      // Home page section anchors (#services, #work, #hero)
      if (!href.startsWith("#/")) {
        e.preventDefault();
        if (window.location.hash === "#/contact" || window.location.hash === "#/about") {
          pendingAnchorRef.current = href;
          window.location.hash = href;
        } else {
          const targetElem = document.querySelector(href);
          if (targetElem) {
            targetElem.scrollIntoView({ behavior: "smooth" });
            if (history.pushState) {
              history.pushState(null, "", href);
            }
          }
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);
    return () => document.removeEventListener("click", handleAnchorClick);
  }, []);

  return (
    <>
      <LogoLoader />
      <ContactOverlay />
      <LightsOut />
      <Navbar theme={theme} onToggleTheme={toggleTheme} isContactPage={isContact} isAboutPage={isAbout} />
      {isContact ? (
        <div className={`contact-page-shell ${theme} linen`}>
          <style>{`
            .contact-page-shell {
              --ink: #292929;
              --cream: #d8d5ce;
              min-height: 100vh;
              padding: 12px;
              box-sizing: border-box;
              transition: background .3s ease, color .3s ease;
            }
            .contact-page-shell.dark {
              --frame: var(--cream);
              --card-bg: var(--ink);
              --card-text: var(--cream);
              background: var(--frame);
            }
            .contact-page-shell.light {
              --frame: var(--ink);
              --card-bg: var(--cream);
              --card-text: var(--ink);
              background: var(--frame);
            }
            .contact-page-shell .contact-card {
              position: relative;
              overflow: clip;
              min-height: calc(100vh - 24px);
              border-radius: 40px;
              background-color: var(--card-bg) !important;
              color: var(--card-text);
              padding-top: 24px;
              box-sizing: border-box;
              transition: background-color .3s ease, color .3s ease;
            }
          `}</style>
          <div className="contact-card linen">
            <ContactPage />
          </div>
        </div>
      ) : isAbout ? (
        <div className={`about-page-shell ${theme} linen`}>
          <style>{`
            .about-page-shell {
              --ink: #292929;
              --cream: #d8d5ce;
              min-height: 100vh;
              padding: 12px;
              box-sizing: border-box;
              transition: background .3s ease, color .3s ease;
            }
            .about-page-shell.dark {
              --frame: var(--cream);
              --card-bg: var(--ink);
              --card-text: var(--cream);
              background: var(--frame);
            }
            .about-page-shell.light {
              --frame: var(--ink);
              --card-bg: var(--cream);
              --card-text: var(--ink);
              background: var(--frame);
            }
            .about-page-shell .about-page-card {
              overflow: clip;
              min-height: calc(100vh - 24px);
              border-radius: 40px;
              background-color: var(--card-bg) !important;
              color: var(--card-text);
              padding-top: 24px;
              box-sizing: border-box;
              transition: background-color .3s ease, color .3s ease;
            }
          `}</style>
          <div className="about-page-card linen">
            <AboutPage />
          </div>
        </div>
      ) : (
        <main className="page-scroll-container">
          <div id="hero">
            <Hero theme={theme} onToggleTheme={toggleTheme} />
          </div>
          <About theme={theme} />
          <Services theme={theme} />
          <Work theme={theme} />
        </main>
      )}
      <NightFooter />
    </>
  );
}
