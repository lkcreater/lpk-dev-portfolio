import type { Dictionary } from "@/lib/i18n";
import type { PortfolioProfile } from "@/data/projects";
import { MagneticButton } from "@/components/motion/MagneticButton";

export function Contact({ copy, profile }: { copy: Dictionary["contact"]; profile: PortfolioProfile }) {
  return (
    <section id="contact" className="contact section-pad page-grid">
      <p className="section-kicker light">
        <span>06</span>
        {copy.kicker}
      </p>
      <h2>
        {copy.lines.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </h2>
      <div className="contact-bottom">
        <MagneticButton href={`mailto:${copy.email}`}>{copy.cta}</MagneticButton>
        <div className="contact-links">
          <a href={`mailto:${copy.email}`} data-cursor="OPEN">
            {copy.email}
          </a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer" data-cursor="OPEN">
            LinkedIn ↗
          </a>
          <a href={profile.github} target="_blank" rel="noreferrer" data-cursor="OPEN">
            GitHub ↗
          </a>
        </div>
      </div>
    </section>
  );
}
