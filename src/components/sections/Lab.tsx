import type { Dictionary } from "@/lib/i18n";
import { FadeUp } from "@/components/motion/FadeUp";

export function Lab({ copy }: { copy: Dictionary["lab"] }) {
  return (
    <section className="lab section-pad page-grid">
      <div className="lab-heading">
        <FadeUp className="section-kicker">
          <span>07</span>
          {copy.kicker}
        </FadeUp>
        <FadeUp>
          <p>{copy.intro}</p>
        </FadeUp>
      </div>
      <div className="lab-grid">
        {copy.items.map((item, index) => (
          <article className={`lab-item lab-item-${index + 1}`} key={item.title} data-cursor="OPEN">
            <div className="lab-visual" aria-hidden="true">
              <span className="lab-shape-a" />
              <span className="lab-shape-b" />
              <span className="lab-grid-lines" />
            </div>
            <div>
              <span>0{index + 1}</span>
              <p>{item.tag}</p>
            </div>
            <h3>{item.title}</h3>
          </article>
        ))}
      </div>
    </section>
  );
}
