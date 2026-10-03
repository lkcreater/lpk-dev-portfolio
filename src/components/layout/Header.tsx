"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Dictionary, Locale } from "@/lib/i18n";
import type { PortfolioProfile } from "@/data/projects";
import { LanguageSwitcher } from "./LanguageSwitcher";

const navKeys = ["work", "services", "about", "contact"] as const;

export function Header({
  locale,
  nav,
  profile,
}: {
  locale: Locale;
  nav: Dictionary["nav"];
  profile: PortfolioProfile;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const previousScroll = useRef(0);
  const pathname = usePathname();
  const interiorPage = pathname.includes("/work/");

  useEffect(() => {
    document.documentElement.lang = locale;
    const onScroll = () => {
      const current = window.scrollY;
      setScrolled(current > 48);
      setHidden(current > previousScroll.current && current > 180);
      previousScroll.current = current;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [locale]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={`site-header${scrolled || interiorPage ? " is-scrolled" : ""}${hidden && !menuOpen ? " is-hidden" : ""}`}
      >
        <Link href={`/${locale}`} className="wordmark" data-cursor="OPEN" aria-label="LPK home">
          LPK<sup>®</sup>
        </Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navKeys.map((key) => (
            <Link key={key} href={`/${locale}#${key}`} data-cursor="OPEN">
              {nav[key]}
            </Link>
          ))}
        </nav>
        <div className="header-tools">
          <LanguageSwitcher locale={locale} />
          <button
            className="menu-toggle"
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            {menuOpen ? nav.close : nav.menu}
            <span className="menu-dot" />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            id="mobile-menu"
            className="mobile-menu"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="mobile-menu-links">
              {navKeys.map((key, index) => (
                <motion.div
                  key={key}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.16 + index * 0.07, duration: 0.55 }}
                >
                  <Link href={`/${locale}#${key}`} onClick={() => setMenuOpen(false)}>
                    <sup>0{index + 1}</sup>
                    {nav[key]}
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className="mobile-menu-meta">
              <span>Bangkok · TH</span>
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
