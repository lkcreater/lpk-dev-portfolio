import type { Dictionary } from "@/lib/i18n";
import { FadeUp } from "@/components/motion/FadeUp";
import { TextReveal } from "@/components/motion/TextReveal";

export function Intro({ copy }: { copy: Dictionary["intro"] }) {
  return (
    <section className="intro section-pad page-grid">
      <FadeUp className="section-kicker">
        <span>02</span>
        {copy.kicker}
      </FadeUp>
      <TextReveal text={copy.statement} className="intro-statement" />
      <FadeUp className="intro-meta" delay={0.1}>
        {copy.meta.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </FadeUp>
    </section>
  );
}
