import { Icon } from "@/components/icons";
import { fa, faClock } from "@/lib/format";
import { deckMeta, type Slide } from "@/lib/presentation-content";
import { ClosingVisual, HeroVisual, SourcesVisual, VerifyVisual, sideVisuals } from "./visuals";

type SlideViewProps = {
  slide: Slide;
  index: number;
  total: number;
};

export function SlideView({ slide, index, total }: SlideViewProps) {
  const number = fa(index + 1).padStart(2, "۰");

  if (slide.visual === "hero") {
    return (
      <div className="slide slide-hero">
        <HeroVisual slide={slide} />
        <SlideFooter index={index} total={total} />
      </div>
    );
  }

  if (slide.visual === "closing") {
    return (
      <div className="slide slide-closing">
        <SlideHeader slide={slide} number={number} />
        <ClosingVisual slide={slide} />
        <SlideFooter index={index} total={total} />
      </div>
    );
  }

  if (slide.visual === "verify" || slide.visual === "sources") {
    return (
      <div className="slide slide-appendix">
        <SlideHeader slide={slide} number={number} />
        <div className="slide-full">{slide.visual === "verify" ? <VerifyVisual /> : <SourcesVisual />}</div>
        <SlideFooter index={index} total={total} />
      </div>
    );
  }

  const Visual = sideVisuals[slide.visual];
  const isProject = slide.id.startsWith("project-");
  const isPl = slide.id.startsWith("pl-");
  const variant = isProject ? " slide-project" : isPl ? " slide-pl" : "";

  if (slide.points.length === 0) {
    return (
      <div className={`slide${variant}`}>
        <SlideHeader slide={slide} number={number} />
        <div className="slide-full">{Visual ? <Visual /> : null}</div>
        <SlideFooter index={index} total={total} />
      </div>
    );
  }

  return (
    <div className={`slide${variant}`}>
      <SlideHeader slide={slide} number={number} />
      <div className="slide-body">
        <ul className="slide-points">
          {slide.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
          {slide.verify && slide.verify.length > 0 && (
            <li className="slide-verify-flag">
              <Icon name="alert" /> {fa(slide.verify.length)} ادعای نیازمند راستی‌آزمایی
            </li>
          )}
        </ul>
        <div className="slide-visual">{Visual ? <Visual /> : null}</div>
      </div>
      <SlideFooter index={index} total={total} />
    </div>
  );
}

function SlideHeader({ slide, number }: { slide: Slide; number: string }) {
  return (
    <header className="slide-head">
      <div className="slide-kicker">
        <span className="slide-num">{slide.appendix ? "پیوست" : number}</span>
        {slide.id.startsWith("project-") && <span className="slide-tag">پروژه‌ی من</span>}
        {slide.id.startsWith("pl-") && <span className="slide-tag is-pl">طراحی زبان</span>}
        {!slide.appendix && slide.seconds > 0 && (
          <span className="slide-time"><Icon name="clock" /> {faClock(slide.seconds)} دقیقه</span>
        )}
      </div>
      <h2 className="slide-title">{slide.title}</h2>
      <p className="slide-message">{slide.message}</p>
    </header>
  );
}

function SlideFooter({ index, total }: { index: number; total: number }) {
  return (
    <footer className="slide-foot">
      <span>{deckMeta.title}</span>
      <span className="slide-foot-progress">
        <i style={{ width: `${((index + 1) / total) * 100}%` }} />
      </span>
      <span>{fa(index + 1)} / {fa(total)}</span>
    </footer>
  );
}
