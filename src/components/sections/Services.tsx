"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Dictionary } from "@/lib/i18n";

export function Services({ copy }: { copy: Dictionary["services"] }) {
  const [active, setActive] = useState(0);

  return (
    <section id="services" className={`services section-pad service-tone-${active}`}>
      <div className="page-grid">
        <div className="services-intro">
          <p className="section-kicker light">
            <span>06</span>
            {copy.kicker}
          </p>
          <p>{copy.intro}</p>
        </div>
        <div className="service-list">
          {copy.items.map((item, index) => (
            <button
              key={item}
              type="button"
              className={active === index ? "active" : ""}
              onPointerEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              onClick={() => setActive(index)}
              data-cursor="OPEN"
            >
              <span>0{index + 1}</span>
              <strong>{item}</strong>
              <i>↗</i>
              <AnimatePresence initial={false}>
                {active === index ? (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35 }}
                  >
                    {copy.details[index]}
                  </motion.p>
                ) : null}
              </AnimatePresence>
            </button>
          ))}
        </div>
      </div>
      <div className="service-orb" aria-hidden="true">
        <span>{String(active + 1).padStart(2, "0")}</span>
      </div>
    </section>
  );
}
