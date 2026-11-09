"use client";

import { type ChangeEvent, type DragEvent, useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { fa, faPercent, formatSize } from "@/lib/format";

type Prediction = {
  prediction: "Normal" | "Pneumonia";
  label: string;
  confidence: number;
  probabilities: { Normal: number; Pneumonia: number };
  threshold: number;
  model: string;
};

type ServiceStatus = "checking" | "ready" | "offline";

// Same-origin by default: on Vercel (and under `vercel dev`) the top-level rewrite
// `/api/(.*)` routes to the backend service. Set NEXT_PUBLIC_API_URL only when the
// API runs on a different origin, e.g. http://127.0.0.1:8000/api with start.bat.
const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "/api").replace(/\/+$/, "");
const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png"];
const START_COMMAND = "python -m uvicorn backend.main:app --reload";

const SAMPLES = [
  { file: "normal-1.jpg", label: "نمونه نرمال ۱", hint: "NORMAL" },
  { file: "normal-2.jpg", label: "نمونه نرمال ۲", hint: "NORMAL" },
  { file: "pneumonia-viral.jpg", label: "پنومونی ویروسی", hint: "VIRUS" },
  { file: "pneumonia-bacterial.jpg", label: "پنومونی باکتریایی", hint: "BACTERIA" },
] as const;

const statusText: Record<ServiceStatus, string> = {
  checking: "در حال اتصال به سرویس",
  ready: "سرویس مدل آماده است",
  offline: "سرویس مدل در دسترس نیست",
};

export function AnalysisWorkspace() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<ServiceStatus>("checking");
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef("");

  /* ---------- service health ---------- */
  const checkHealth = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/health`, { cache: "no-store" });
      if (!response.ok) throw new Error("health");
      const health = (await response.json()) as { status: string };
      setStatus(health.status === "ready" ? "ready" : "offline");
    } catch {
      setStatus("offline");
    }
  }, []);

  useEffect(() => {
    let active = true;
    const run = () => {
      if (active) void checkHealth();
    };
    run();
    const interval = window.setInterval(run, 6000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [checkHealth]);

  /* ---------- file selection ---------- */
  const selectFile = useCallback((nextFile?: File | null) => {
    if (!nextFile) return;
    setPrediction(null);
    setError("");

    if (!ACCEPTED.includes(nextFile.type)) {
      setError("فرمت تصویر باید JPG یا PNG باشد.");
      return;
    }
    if (nextFile.size > MAX_BYTES) {
      setError("حجم تصویر باید کمتر از ۱۰ مگابایت باشد.");
      return;
    }

    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    const url = URL.createObjectURL(nextFile);
    previewRef.current = url;
    setFile(nextFile);
    setPreview(url);
  }, []);

  // Paste an image from the clipboard (Ctrl/Cmd + V)
  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const item = Array.from(event.clipboardData?.files ?? []).find((f) => f.type.startsWith("image/"));
      if (item) {
        event.preventDefault();
        selectFile(item);
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [selectFile]);

  useEffect(() => () => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
  }, []);

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    selectFile(event.target.files?.[0]);
    event.target.value = "";
  }

  function onDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    setIsDragging(false);
    selectFile(event.dataTransfer.files[0]);
  }

  async function loadSample(sample: (typeof SAMPLES)[number]) {
    try {
      const response = await fetch(`/samples/${sample.file}`);
      if (!response.ok) throw new Error();
      const blob = await response.blob();
      selectFile(new File([blob], sample.file, { type: blob.type || "image/jpeg" }));
    } catch {
      setError("بارگذاری تصویر نمونه ناموفق بود.");
    }
  }

  function clearFile() {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = "";
    setFile(null);
    setPreview("");
    setPrediction(null);
    setError("");
  }

  async function analyzeImage() {
    if (!file || isLoading) return;
    setIsLoading(true);
    setError("");
    setPrediction(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`${API_URL}/predict`, { method: "POST", body: formData });
      const result = (await response.json()) as Prediction | { detail?: string };
      if (!response.ok) {
        throw new Error("detail" in result && result.detail ? result.detail : "تحلیل تصویر ناموفق بود.");
      }
      setPrediction(result as Prediction);
      setStatus("ready");
    } catch (caught) {
      if (caught instanceof TypeError) {
        setStatus("offline");
        setError(`سرویس مدل در ${API_URL} در دسترس نیست. بک‌اند را اجرا کنید و دوباره تلاش کنید.`);
      } else {
        setError(caught instanceof Error ? caught.message : "خطای نامشخصی هنگام تحلیل رخ داد.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function copyCommand() {
    try {
      await navigator.clipboard.writeText(START_COMMAND);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  }

  const step = prediction ? 3 : file ? 2 : 1;
  const isPneumonia = prediction?.prediction === "Pneumonia";

  return (
    <section className="workspace" id="analysis" aria-labelledby="workspace-title">
      {/* ---------- heading ---------- */}
      <div className="workspace-head">
        <div>
          <p className="eyebrow">
            <span className="eyebrow-dot" /> دستیار پژوهشی رادیوگرافی قفسه سینه
          </p>
          <h1 id="workspace-title">
            بررسی تصویر رادیوگرافی
            <span className="title-accent"> با PneumoniaCNN</span>
          </h1>
          <p className="lead">
            تصویر را بارگذاری کنید؛ مدل کانولوشنی احتمال الگوی پنومونی را برآورد می‌کند. خروجی فقط یک پیش‌بینی آموزشی است، نه تشخیص.
          </p>
        </div>

        <div className={`status-pill status-${status}`} role="status">
          <span className="status-dot" />
          <span>{statusText[status]}</span>
          {status === "offline" && (
            <button type="button" className="status-retry" onClick={() => { setStatus("checking"); void checkHealth(); }} aria-label="تلاش دوباره برای اتصال">
              <Icon name="refresh" size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ---------- stepper ---------- */}
      <ol className="stepper" aria-label="مراحل تحلیل">
        {["انتخاب تصویر", "اجرای تحلیل", "مشاهده نتیجه"].map((label, index) => {
          const n = index + 1;
          const state = n < step ? "done" : n === step ? "current" : "todo";
          return (
            <li key={label} className={`stepper-item is-${state}`} aria-current={state === "current" ? "step" : undefined}>
              <span className="stepper-num">{state === "done" ? <Icon name="check" size={14} strokeWidth={2.4} /> : fa(n)}</span>
              <span>{label}</span>
            </li>
          );
        })}
      </ol>

      {status === "offline" && (
        <div className="offline-card" role="alert">
          <span className="offline-icon"><Icon name="alert" size={18} /></span>
          <div>
            <strong>بک‌اند در حال اجرا نیست</strong>
            <p>از پوشه‌ی اصلی پروژه این دستور را اجرا کنید. آدرس سرویس: <code dir="ltr">{API_URL}</code></p>
          </div>
          <button type="button" className="command" onClick={copyCommand} dir="ltr">
            <code>{START_COMMAND}</code>
            <span className="command-copy">
              <Icon name={copied ? "check" : "copy"} size={15} /> {copied ? "کپی شد" : "کپی"}
            </span>
          </button>
        </div>
      )}

      <div className="workspace-grid">
        {/* ---------- input ---------- */}
        <article className="panel">
          <header className="panel-head">
            <h2>تصویر ورودی</h2>
            <span className="panel-meta">PNG · JPG · تا ۱۰ مگابایت</span>
          </header>

          {!file ? (
            <>
              <div
                className={`dropzone${isDragging ? " is-dragging" : ""}`}
                onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
              >
                <div className="dropzone-art" aria-hidden="true">
                  <span className="dropzone-ring" />
                  <span className="dropzone-icon"><Icon name="upload" size={24} /></span>
                </div>
                <h3>تصویر را اینجا رها کنید</h3>
                <p>
                  یا از دستگاه انتخاب کنید · <kbd>Ctrl</kbd> + <kbd>V</kbd> هم کار می‌کند
                </p>
                <button type="button" className="btn btn-primary" onClick={() => inputRef.current?.click()}>
                  <Icon name="image" size={17} /> انتخاب تصویر
                </button>
                <input
                  ref={inputRef}
                  className="visually-hidden"
                  id="image-upload"
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={onFileChange}
                  aria-label="انتخاب تصویر رادیوگرافی"
                />
              </div>

              <div className="samples">
                <div className="samples-head">
                  <span>تصویر ندارید؟ یکی از نمونه‌های دیتاست را امتحان کنید</span>
                </div>
                <div className="samples-grid">
                  {SAMPLES.map((sample) => (
                    <button key={sample.file} type="button" className="sample" onClick={() => void loadSample(sample)}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`/samples/${sample.file}`} alt="" loading="lazy" />
                      <span className="sample-label">{sample.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="preview">
              <div className={`preview-frame${isLoading ? " is-scanning" : ""}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="پیش‌نمایش تصویر رادیوگرافی" />
                <span className="scan-line" aria-hidden="true" />
                <span className="corner corner-tl" aria-hidden="true" />
                <span className="corner corner-tr" aria-hidden="true" />
                <span className="corner corner-bl" aria-hidden="true" />
                <span className="corner corner-br" aria-hidden="true" />
              </div>

              <div className="file-row">
                <span className="file-icon"><Icon name="image" size={18} /></span>
                <div className="file-info">
                  <strong dir="auto">{file.name}</strong>
                  <span>{formatSize(file.size)}</span>
                </div>
                <button type="button" className="icon-btn" onClick={clearFile} aria-label="حذف تصویر" disabled={isLoading}>
                  <Icon name="x" size={18} />
                </button>
              </div>

              <div className="preview-actions">
                <button type="button" className="btn btn-primary btn-lg" onClick={() => void analyzeImage()} disabled={isLoading || status === "offline"}>
                  {isLoading ? (
                    <><span className="spinner" /> در حال تحلیل…</>
                  ) : prediction ? (
                    <><Icon name="refresh" size={18} /> تحلیل دوباره</>
                  ) : (
                    <><Icon name="scan" size={18} /> شروع تحلیل</>
                  )}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => inputRef.current?.click()} disabled={isLoading}>
                  تعویض تصویر
                </button>
                <input ref={inputRef} className="visually-hidden" type="file" accept="image/png,image/jpeg" onChange={onFileChange} tabIndex={-1} aria-hidden="true" />
              </div>
            </div>
          )}

          {error && (
            <div className="error" role="alert">
              <Icon name="alert" size={17} />
              <span>{error}</span>
            </div>
          )}
        </article>

        {/* ---------- result ---------- */}
        <article className="panel result-panel" aria-live="polite" aria-busy={isLoading}>
          <header className="panel-head">
            <h2>نتیجه‌ی مدل</h2>
            {prediction && <span className="panel-meta panel-meta-ok"><Icon name="check" size={14} /> تکمیل شد</span>}
          </header>

          {isLoading ? (
            <div className="result-loading">
              <div className="skeleton skeleton-gauge" />
              <div className="skeleton skeleton-line" />
              <div className="skeleton skeleton-line short" />
              <p>مدل در حال پردازش تصویر ۲۸×۲۸ خاکستری است…</p>
            </div>
          ) : prediction ? (
            <ResultView prediction={prediction} isPneumonia={isPneumonia} />
          ) : (
            <div className="result-empty">
              <div className="result-empty-art" aria-hidden="true">
                <Icon name="activity" size={30} />
              </div>
              <h3>هنوز نتیجه‌ای نیست</h3>
              <p>پس از بارگذاری تصویر و اجرای تحلیل، احتمال هر کلاس، آستانه‌ی تصمیم و تفسیر نتیجه این‌جا نمایش داده می‌شود.</p>
              <ul className="result-empty-list">
                <li><Icon name="check" size={14} /> احتمال نرمال و پنومونی</li>
                <li><Icon name="check" size={14} /> مقایسه با آستانه‌ی تصمیم مدل</li>
                <li><Icon name="check" size={14} /> راهنمای تفسیر نتیجه</li>
              </ul>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}

function ResultView({ prediction, isPneumonia }: { prediction: Prediction; isPneumonia: boolean }) {
  const p = prediction.probabilities.Pneumonia;
  const t = prediction.threshold;
  // semicircle gauge
  const radius = 80;
  const circumference = Math.PI * radius;
  const angle = Math.PI * (1 - t);
  const tickX = 100 + radius * Math.cos(angle);
  const tickY = 100 - radius * Math.sin(angle);
  const margin = Math.abs(p - t);

  return (
    <div className={`result ${isPneumonia ? "is-alert" : "is-normal"}`}>
      <div className="gauge">
        <svg viewBox="0 0 200 116" role="img" aria-label={`احتمال پنومونی ${faPercent(p)}`}>
          <path d="M20 100 A80 80 0 0 1 180 100" className="gauge-track" />
          <path
            d="M20 100 A80 80 0 0 1 180 100"
            className="gauge-value"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - p)}
          />
          <line x1={100 + 66 * Math.cos(angle)} y1={100 - 66 * Math.sin(angle)} x2={tickX + 8 * Math.cos(angle)} y2={tickY - 8 * Math.sin(angle)} className="gauge-tick" />
        </svg>
        <div className="gauge-center">
          <strong>{faPercent(p)}</strong>
          <span>احتمال پنومونی</span>
        </div>
        <div className="gauge-scale" dir="ltr"><span>0%</span><span>100%</span></div>
      </div>

      <div className="verdict">
        <span className="verdict-badge">
          <Icon name={isPneumonia ? "alert" : "check"} size={15} /> {prediction.label}
        </span>
        <h3>{isPneumonia ? "الگوی مشکوک به پنومونی" : "الگوی نرمال"}</h3>
        <p>
          {isPneumonia
            ? `احتمال پنومونی (${faPercent(p)}) از آستانه‌ی تصمیم (${faPercent(t)}) بالاتر است. این یعنی «دقیق‌تر نگاه کنیم»، نه «بیماری قطعی است».`
            : `احتمال پنومونی (${faPercent(p)}) کمتر از آستانه‌ی تصمیم (${faPercent(t)}) است و مدل تصویر را در دسته‌ی نرمال قرار داده است.`}
        </p>
      </div>

      <div className="bars">
        <ProbabilityBar label="نرمال" value={prediction.probabilities.Normal} tone="normal" />
        <ProbabilityBar label="پنومونی" value={p} tone="alert" threshold={t} />
      </div>

      {margin < 0.1 && (
        <div className="note note-warn">
          <Icon name="alert" size={16} />
          <span>نتیجه نزدیک به آستانه است ({faPercent(margin)} فاصله)؛ اطمینان مدل در این تصویر پایین است.</span>
        </div>
      )}

      <dl className="result-meta">
        <div><dt>مدل</dt><dd dir="ltr">{prediction.model}</dd></div>
        <div><dt>آستانه‌ی تصمیم</dt><dd>{faPercent(t)}</dd></div>
        <div><dt>اطمینان کلاس انتخابی</dt><dd>{faPercent(prediction.confidence)}</dd></div>
      </dl>
    </div>
  );
}

function ProbabilityBar({ label, value, tone, threshold }: { label: string; value: number; tone: "normal" | "alert"; threshold?: number }) {
  return (
    <div className={`bar bar-${tone}`}>
      <div className="bar-head">
        <span><i className="bar-dot" /> {label}</span>
        <strong>{faPercent(value)}</strong>
      </div>
      <div className="bar-track">
        <span className="bar-fill" style={{ width: `${Math.round(value * 100)}%` }} />
        {threshold !== undefined && (
          <span className="bar-threshold" style={{ insetInlineStart: `${threshold * 100}%` }} title={`آستانه ${faPercent(threshold)}`} />
        )}
      </div>
    </div>
  );
}
