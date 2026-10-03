import type { Dictionary } from "@/lib/i18n";
import type { PortfolioProfile } from "@/data/projects";
import { FadeUp } from "@/components/motion/FadeUp";
import { TextReveal } from "@/components/motion/TextReveal";
import { IntroNow } from "@/components/sections/IntroNow";
import { ReviewFlow } from "@/components/sections/ReviewFlow";

// Line icons for each capability, drawn on a 24×24 grid.
const CAPABILITY_ICONS: Record<string, string> = {
  publish: "M4 5h16v14H4ZM4 9h16M8 13h8M8 16h5",
  chat: "M4 5h16v11H11l-5 4v-4H4ZM8 10h1M12 10h1M16 10h1",
  insights: "M4 20h16M7 20v-6M12 20V9M17 20V5",
  ads: "M4 10v4h3l7 4V6l-7 4ZM17 9c1.5 1.5 1.5 4.5 0 6",
  profile: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5 20c1-4 13-4 14 0",
  video: "M4 6h12v12H4ZM16 10l4-2v8l-4-2",
};

export function Intro({ copy, profile }: { copy: Dictionary["intro"]; profile: PortfolioProfile }) {
  const { review } = copy;

  return (
    <section className="intro section-pad page-grid">
      <FadeUp className="section-kicker">
        <span>02</span>
        {copy.kicker}
      </FadeUp>
      <TextReveal text={copy.statement} className="intro-statement" />
      <FadeUp className="intro-description" delay={0.05}>
        {copy.description}
      </FadeUp>
      <FadeUp className="intro-meta" delay={0.1}>
        {copy.meta.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </FadeUp>
      <IntroNow copy={copy.now} current={profile.career[0]} />

      <div className="intro-review">
        <FadeUp className="intro-review-head">
          <p className="section-kicker">{review.kicker}</p>
          <h3>{review.title}</h3>
          <p>{review.body}</p>
        </FadeUp>
        <ReviewFlow copy={review.flow} />
        <div className="intro-review-grid">
          {review.platforms.map((platform, index) => (
            <FadeUp className="intro-review-card" delay={index * 0.08} key={platform.name}>
              <header>
                <h4>{platform.name}</h4>
                <span>{platform.products}</span>
                <p className="intro-review-badge">{platform.review}</p>
              </header>
              <ul className="intro-review-caps">
                {platform.capabilities.map((capability) => (
                  <li key={capability.text}>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d={CAPABILITY_ICONS[capability.icon]} />
                    </svg>
                    {capability.text}
                  </li>
                ))}
              </ul>
            </FadeUp>
          ))}
        </div>
        <FadeUp className="intro-review-compliance">
          <p>{review.complianceLabel}</p>
          <ul>
            {review.compliance.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </FadeUp>
      </div>
    </section>
  );
}
