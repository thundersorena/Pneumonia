"use client";

import Link from "next/link";
import { type KeyboardEvent as ReactKeyboardEvent, type TouchEvent, useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { fa, faClock } from "@/lib/format";
import { deckMeta, plannedSeconds, slideQA, slides } from "@/lib/presentation-content";
import { SlideView } from "./slide-view";

const total = slides.length;

function readHashIndex() {
  const n = Number.parseInt(window.location.hash.replace("#", ""), 10);
  return Number.isFinite(n) && n >= 1 && n <= total ? n - 1 : 0;
}

export function PresentationDeck() {
  const [index, setIndex] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [showOverview, setShowOverview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);

  const slide = slides[index];

  const go = useCallback((next: number) => {
    setIndex(Math.min(total - 1, Math.max(0, next)));
  }, []);
  const next = useCallback(() => setIndex((i) => Math.min(total - 1, i + 1)), []);
  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);

  /* hash <-> index */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync with URL on mount
    setIndex(readHashIndex());
    const onHash = () => setIndex(readHashIndex());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    const target = `#${index + 1}`;
    if (window.location.hash !== target) window.history.replaceState(null, "", target);
  }, [index]);

  /* timer */
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  /* fullscreen */
  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void rootRef.current?.requestFullscreen?.();
    }
  }, []);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  /* keyboard */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      switch (event.key) {
        case "ArrowLeft":
        case "ArrowDown":
        case "PageDown":
        case " ":
          event.preventDefault();
          next();
          break;
        case "ArrowRight":
        case "ArrowUp":
        case "PageUp":
          event.preventDefault();
          prev();
          break;
        case "Home":
          go(0);
          break;
        case "End":
          go(total - 1);
          break;
        case "n":
        case "N":
        case "ی":
          setShowNotes((v) => !v);
          break;
        case "g":
        case "G":
        case "o":
        case "O":
        case "خ":
          setShowOverview((v) => !v);
          break;
        case "f":
        case "F":
        case "ب":
          toggleFullscreen();
          break;
        case "t":
        case "T":
        case "ف":
          setRunning((v) => !v);
          break;
        case "Escape":
          setShowOverview(false);
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, next, prev, toggleFullscreen]);

  /* swipe (RTL: swipe right → next) */
  function onTouchStart(event: TouchEvent) {
    touchX.current = event.touches[0]?.clientX ?? null;
  }
  function onTouchEnd(event: TouchEvent) {
    if (touchX.current === null) return;
    const dx = (event.changedTouches[0]?.clientX ?? touchX.current) - touchX.current;
    if (Math.abs(dx) > 50) {
      if (dx > 0) next();
      else prev();
    }
    touchX.current = null;
  }

  const plannedUntilNow = slides.slice(0, index + 1).reduce((s, x) => s + x.seconds, 0);
  const drift = elapsed - plannedUntilNow;

  return (
    <div ref={rootRef} className={`deck${showNotes ? " has-notes" : ""}${isFullscreen ? " is-fullscreen" : ""}`}>
      {/* ---------- top bar ---------- */}
      <header className="deck-bar">
        <div className="deck-bar-start">
          <Link href="/" className="deck-back" aria-label="بازگشت به تحلیل تصویر">
            <Icon name="arrowRight" size={18} />
          </Link>
          <div className="deck-title">
            <strong>{deckMeta.title}</strong>
            <span>{slide.short}</span>
          </div>
        </div>

        <div className="deck-bar-end">
          <div className={`deck-timer${running ? " is-running" : ""}${drift > 30 ? " is-late" : ""}`} title="زمان سپری‌شده / زمان برنامه">
            <button type="button" onClick={() => setRunning((v) => !v)} aria-label={running ? "توقف زمان‌سنج" : "شروع زمان‌سنج"}>
              <Icon name={running ? "pause" : "play"} size={14} />
            </button>
            <span className="deck-timer-value">{faClock(elapsed)}</span>
            <span className="deck-timer-plan">/ {faClock(plannedSeconds)}</span>
            {elapsed > 0 && (
              <button type="button" onClick={() => { setElapsed(0); setRunning(false); }} aria-label="صفر کردن زمان‌سنج">
                <Icon name="reset" size={14} />
              </button>
            )}
          </div>
          <button type="button" className={`deck-tool${showOverview ? " is-on" : ""}`} onClick={() => setShowOverview((v) => !v)} aria-pressed={showOverview} title="نمای کلی (G)">
            <Icon name="grid" size={18} /> <span>اسلایدها</span>
          </button>
          <button type="button" className={`deck-tool${showNotes ? " is-on" : ""}`} onClick={() => setShowNotes((v) => !v)} aria-pressed={showNotes} title="یادداشت گوینده (N)">
            <Icon name="notes" size={18} /> <span>یادداشت</span>
          </button>
          <button type="button" className="deck-tool" onClick={toggleFullscreen} title="تمام‌صفحه (F)">
            <Icon name={isFullscreen ? "shrink" : "expand"} size={18} />
          </button>
        </div>
      </header>

      {/* ---------- stage ---------- */}
      <main className="deck-main">
        <div className="deck-stage" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <div className="slide-frame" aria-roledescription="اسلاید" aria-label={`اسلاید ${fa(index + 1)} از ${fa(total)}: ${slide.title}`}>
            <div className="slide-scale" key={slide.id}>
              <SlideView slide={slide} index={index} total={total} />
            </div>
          </div>
        </div>

        {showNotes && (
          <aside className="deck-notes" aria-label="یادداشت گوینده">
            <div className="deck-notes-head">
              <strong><Icon name="notes" size={16} /> یادداشت گوینده</strong>
              {slide.seconds > 0 && <span>زمان پیشنهادی: {faClock(slide.seconds)}</span>}
            </div>
            <div className="deck-notes-body">
              {slide.notes.map((note) => (
                <p key={note.slice(0, 40)}>{note}</p>
              ))}
              {slide.verify && slide.verify.length > 0 && (
                <div className="deck-notes-verify">
                  <strong><Icon name="alert" size={15} /> نیازمند راستی‌آزمایی</strong>
                  <ul>
                    {slide.verify.map((v) => <li key={v}>{v}</li>)}
                  </ul>
                </div>
              )}
              {(slideQA[slide.id]?.length ?? 0) > 0 && (
                <div className="deck-notes-qa">
                  <strong><Icon name="book" size={15} /> پرسش‌های احتمالی</strong>
                  {slideQA[slide.id].map((item) => (
                    <details key={item.q}>
                      <summary>{item.q}</summary>
                      <p>{item.a}</p>
                    </details>
                  ))}
                </div>
              )}
              {index < total - 1 && (
                <p className="deck-notes-next">
                  <span>اسلاید بعد:</span> {slides[index + 1].short}
                </p>
              )}
            </div>
          </aside>
        )}
      </main>

      {/* ---------- bottom controls ---------- */}
      <footer className="deck-controls">
        <button type="button" className="deck-nav" onClick={prev} disabled={index === 0} aria-label="اسلاید قبلی">
          <Icon name="arrowRight" size={20} />
        </button>

        <div className="deck-dots" role="tablist" aria-label="پیمایش اسلایدها">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`${fa(i + 1)}. ${s.short}`}
              title={`${fa(i + 1)}. ${s.short}`}
              className={`deck-dot${i === index ? " is-current" : ""}${i < index ? " is-past" : ""}${s.appendix ? " is-appendix" : ""}`}
              onClick={() => go(i)}
            />
          ))}
        </div>

        <span className="deck-counter">{fa(index + 1)} / {fa(total)}</span>

        <button type="button" className="deck-nav deck-nav-next" onClick={next} disabled={index === total - 1} aria-label="اسلاید بعدی">
          <Icon name="arrowLeft" size={20} />
        </button>
      </footer>

      {/* ---------- overview ---------- */}
      {showOverview && (
        <div className="deck-overview" role="dialog" aria-modal="true" aria-label="نمای کلی اسلایدها">
          <div className="deck-overview-head">
            <div>
              <strong>همه‌ی اسلایدها</strong>
              <span>{fa(total)} اسلاید · حدود {faClock(plannedSeconds)} دقیقه</span>
            </div>
            <button type="button" className="deck-tool" onClick={() => setShowOverview(false)} aria-label="بستن">
              <Icon name="x" size={18} />
            </button>
          </div>
          <div className="deck-overview-grid">
            {slides.map((s, i) => (
              <div
                key={s.id}
                role="button"
                tabIndex={0}
                className={`deck-thumb${i === index ? " is-current" : ""}`}
                onClick={() => { go(i); setShowOverview(false); }}
                onKeyDown={(event: ReactKeyboardEvent) => {
                  if (event.key === "Enter") { go(i); setShowOverview(false); }
                }}
              >
                <div className="deck-thumb-frame" inert>
                  <div className="slide-scale">
                    <SlideView slide={s} index={i} total={total} />
                  </div>
                </div>
                <div className="deck-thumb-meta">
                  <span>{fa(i + 1)}</span>
                  <strong>{s.short}</strong>
                  {s.seconds > 0 && <small>{faClock(s.seconds)}</small>}
                </div>
              </div>
            ))}
          </div>
          <p className="deck-shortcuts">
            <kbd>←</kbd> <kbd>→</kbd> پیمایش · <kbd>N</kbd> یادداشت · <kbd>G</kbd> نمای کلی · <kbd>F</kbd> تمام‌صفحه · <kbd>T</kbd> زمان‌سنج
          </p>
        </div>
      )}
    </div>
  );
}
