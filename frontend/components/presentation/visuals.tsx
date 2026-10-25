import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons";
import { fa } from "@/lib/format";
import {
  ProjectDataVisual,
  ProjectLimitsVisual,
  ProjectModelVisual,
  ProjectResultsVisual,
  ProjectSystemVisual,
  ProjectThresholdVisual,
} from "./project-visuals";
import { PlDslVisual, PlFeaturesVisual, PlLessonsVisual, PlMapVisual, PlTypesVisual } from "./pl-visuals";
import {
  assistants,
  autonomyLevels,
  challenges,
  dataSplits,
  deckMeta,
  drugStages,
  imagingTasks,
  metrics,
  miniProject,
  pacsFlow,
  pipelineSteps,
  products,
  regulations,
  sources,
  txgemmaModels,
  verifyItems,
  whyReasons,
  type Slide,
  type VisualKind,
} from "@/lib/presentation-content";

/* ------------------------------------------------------------------ */
/*  Full-bleed slides                                                  */
/* ------------------------------------------------------------------ */

export function HeroVisual({ slide }: { slide: Slide }) {
  return (
    <div className="v-hero">
      <div className="v-hero-text">
        <span className="v-hero-tag">{deckMeta.audience}</span>
        <h1>{deckMeta.title}</h1>
        <p className="v-hero-sub">{deckMeta.subtitle}</p>
        <div className="v-hero-question">
          <span>سؤال آغازین</span>
          <strong>{slide.message}</strong>
        </div>
      </div>
      <div className="v-monitor" aria-hidden="true">
        <div className="v-monitor-head">
          <span>ICU · ۰۳:۱۲</span>
          <span className="v-monitor-live">● پایش</span>
        </div>
        <svg viewBox="0 0 400 120" className="v-ecg">
          <path d="M0 70 H60 L72 70 L80 40 L90 100 L100 20 L110 80 L118 70 H180 L192 70 L200 45 L210 98 L220 25 L230 80 L238 70 H300 L312 70 L320 50 L330 95 L340 35 L350 78 L358 70 H400" />
        </svg>
        <div className="v-monitor-stats">
          <div><small>HR</small><strong>۱۱۲</strong></div>
          <div><small>SpO₂</small><strong>۹۱٪</strong></div>
          <div><small>Temp</small><strong>۳۸٫۶</strong></div>
        </div>
        <p className="v-monitor-note">«الگوریتمی که هرگز نمی‌خوابد و خسته نمی‌شود»</p>
      </div>
    </div>
  );
}

export function ClosingVisual({ slide }: { slide: Slide }) {
  return (
    <div className="v-closing">
      <div className="v-closing-points">
        <span className="v-kicker-pill">جمع‌بندی در سه نکته</span>
        {slide.points.map((point, index) => (
          <div key={point} className="v-closing-item">
            <span>{fa(index + 1)}</span>
            <p>{point}</p>
          </div>
        ))}
      </div>
      <blockquote className="v-quote">
        <p>هوش مصنوعی جایگزین پزشک نمی‌شود، اما پزشکی که از آن استفاده کند، جایگزین پزشکی خواهد شد که استفاده نمی‌کند.</p>
        <footer>از توجه شما سپاسگزارم.</footer>
      </blockquote>
    </div>
  );
}

export function VerifyVisual() {
  return (
    <div className="v-verify">
      {verifyItems.map((item, index) => (
        <div key={item.claim} className="v-verify-item">
          <span className="v-verify-num">{fa(index + 1)}</span>
          <div>
            <strong>{item.claim}</strong>
            <p>{item.action}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SourcesVisual() {
  return (
    <div className="v-sources">
      {sources.map((group) => (
        <div key={group.group} className="v-sources-group">
          <h3>{group.group}</h3>
          <ul>
            {group.items.map((item) =>
              item.url ? (
                <li key={item.label}>
                  <a href={item.url} target="_blank" rel="noreferrer" dir="ltr" lang="en">{item.label}</a>
                </li>
              ) : (
                <li key={item.label} dir="ltr" lang="en">{item.label}</li>
              ),
            )}
          </ul>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Side visuals                                                       */
/* ------------------------------------------------------------------ */

function WhyVisual() {
  return (
    <div className="v-why">
      {whyReasons.map((reason, index) => (
        <div key={reason.title} className="v-why-tile">
          <span className="v-why-num">{fa(index + 1)}</span>
          <span className="v-icon"><Icon name={reason.icon as IconName} /></span>
          <strong>{reason.title}</strong>
          <p>{reason.text}</p>
        </div>
      ))}
    </div>
  );
}

function AiNestedVisual() {
  return (
    <div className="v-nested">
      <div className="v-nest v-nest-ai">
        <span className="v-nest-label"><b dir="ltr">AI</b> هوش مصنوعی</span>
        <small>هر سامانه‌ای که رفتار هوشمند را شبیه‌سازی کند</small>
        <div className="v-nest v-nest-ml">
          <span className="v-nest-label"><b dir="ltr">ML</b> یادگیری ماشین</span>
          <small>یادگیری الگو از داده</small>
          <div className="v-nest v-nest-dl">
            <span className="v-nest-label"><b dir="ltr">DL</b> یادگیری عمیق</span>
            <small>شبکه‌های عصبی چندلایه</small>
          </div>
        </div>
      </div>
      <div className="v-nest-inputs">
        {["تصاویر پزشکی", "نتایج آزمایشگاهی", "سوابق درمانی", "اطلاعات ژنتیکی", "داده‌های سلامت"].map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </div>
  );
}

function PipelineVisual() {
  return (
    <div className="v-pipeline">
      <ol className="v-chevrons">
        {pipelineSteps.map((step, index) => (
          <li key={step.title}>
            <span className="v-chev-num">{fa(index + 1)}</span>
            <strong>{step.title}</strong>
            <small>{step.text}</small>
          </li>
        ))}
      </ol>
      <div className="v-splits">
        <div className="v-splits-internal">
          <span className="v-splits-caption">داده‌ی محل توسعه</span>
          <div className="v-splits-row">
            {dataSplits.map((split) => (
              <div key={split.name} className={`v-split v-split-${split.name.toLowerCase()}`}>
                <b dir="ltr">{split.name}</b>
                <small>{split.text}</small>
              </div>
            ))}
          </div>
        </div>
        <div className="v-split v-split-external">
          <b dir="ltr">External</b>
          <small>مرکز، زمان یا جمعیت دیگر</small>
        </div>
      </div>
      <div className="v-warn">
        <Icon name="alert" />
        <span><b dir="ltr">Data leakage:</b> تصاویر یک بیمار نباید هم در Train و هم در Test باشند.</span>
      </div>
    </div>
  );
}

function NeuralNetVisual() {
  const layers = [3, 4, 4, 1];
  const xs = [40, 150, 260, 360];
  const nodes = layers.map((count, li) =>
    Array.from({ length: count }, (_, i) => ({ x: xs[li], y: 120 + (i - (count - 1) / 2) * 52 })),
  );
  return (
    <div className="v-nn">
      <svg viewBox="0 0 400 260" className="v-nn-svg" aria-hidden="true">
        {nodes.slice(0, -1).map((layer, li) =>
          layer.flatMap((a, ai) =>
            nodes[li + 1].map((b, bi) => <line key={`${li}-${ai}-${bi}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="v-nn-edge" />),
          ),
        )}
        {nodes.map((layer, li) =>
          layer.map((n, ni) => <circle key={`${li}-${ni}`} cx={n.x} cy={n.y} r={li === 3 ? 15 : 12} className={`v-nn-node v-nn-l${li}`} />),
        )}
        <text x="40" y="250" className="v-nn-label">ورودی</text>
        <text x="205" y="250" className="v-nn-label">لایه‌های پنهان</text>
        <text x="360" y="250" className="v-nn-label">خروجی</text>
      </svg>
      <div className="v-cycle">
        {[
          { t: "پیش‌بینی", s: "Forward" },
          { t: "محاسبه‌ی Loss", s: "Loss" },
          { t: "گرادیان", s: "Backprop" },
          { t: "به‌روزرسانی وزن", s: "Adam" },
        ].map((step, index) => (
          <div key={step.t} className="v-cycle-step">
            <span>{fa(index + 1)}</span>
            <strong>{step.t}</strong>
            <small dir="ltr">{step.s}</small>
          </div>
        ))}
      </div>
      <div className="v-glossary">
        <span><b dir="ltr">Epoch</b> یک عبور کامل از داده‌ی آموزش</span>
        <span><b dir="ltr">Batch</b> بخشی از نمونه‌ها در یک مرحله</span>
      </div>
    </div>
  );
}

function TaskArt({ kind }: { kind: number }) {
  return (
    <svg viewBox="0 0 120 90" className="v-task-art" aria-hidden="true">
      <rect x="2" y="2" width="116" height="86" rx="10" className="v-task-bg" />
      <ellipse cx="42" cy="46" rx="20" ry="30" className="v-task-lung" />
      <ellipse cx="78" cy="46" rx="20" ry="30" className="v-task-lung" />
      {kind === 0 && (
        <>
          <rect x="70" y="8" width="44" height="16" rx="8" className="v-task-chip" />
          <text x="92" y="20" className="v-task-chip-text">مشکوک</text>
        </>
      )}
      {kind === 1 && <rect x="64" y="30" width="28" height="24" rx="3" className="v-task-box" />}
      {kind === 2 && <path d="M68 34c6-6 18-4 20 4s-2 16-10 16-14-4-14-10 1-7 4-10Z" className="v-task-mask" />}
      {kind !== 0 && <circle cx="78" cy="42" r="5" className="v-task-dot" />}
    </svg>
  );
}

function ImagingVisual() {
  return (
    <div className="v-imaging">
      <div className="v-tasks">
        {imagingTasks.map((task, index) => (
          <div key={task.name} className="v-task">
            <TaskArt kind={index} />
            <strong>{task.fa} <small dir="ltr">{task.name}</small></strong>
            <p>{task.output}</p>
            <p className="v-task-ex">{task.example}</p>
            <p className="v-task-limit">{task.limit}</p>
          </div>
        ))}
      </div>
      <div className="v-flow">
        {pacsFlow.map((step, index) => (
          <span key={step} className={`v-flow-step${step === "پزشک" ? " is-human" : ""}`}>
            {step}
            {index < pacsFlow.length - 1 && <Icon name="arrowLeft" />}
          </span>
        ))}
      </div>
      <Link href="/" className="v-demo-link">
        <Icon name="scan" /> دموی زنده: طبقه‌بندی رادیوگرافی با PneumoniaCNN
      </Link>
    </div>
  );
}

function MasaiVisual() {
  const evidence = [
    { title: "MASAI · سوئد", meta: "Lancet Oncology", text: "کشف سرطان بیشتر و کاهش بار کاری رادیولوژیست", level: "strong" },
    { title: "کره جنوبی", meta: "پژوهش‌های چندمرکزی", text: "افزایش شناسایی سرطان پستان", level: "strong" },
    { title: "سکته مغزی", meta: "گزارش منابع آموزشی", text: "«تا دو برابر دقیق‌تر از متخصصان»", level: "check" },
    { title: "صرع", meta: "گزارش یک مطالعه", text: "«حدود ۶۴٪ ضایعاتی که دیده نشده بودند»", level: "check" },
  ];
  return (
    <div className="v-masai">
      <div className="v-evidence">
        {evidence.map((e) => (
          <div key={e.title} className={`v-evidence-card is-${e.level}`}>
            <span className="v-evidence-badge">{e.level === "strong" ? "شواهد منتشرشده" : "نیازمند راستی‌آزمایی"}</span>
            <strong>{e.title}</strong>
            <small>{e.meta}</small>
            <p>{e.text}</p>
          </div>
        ))}
      </div>
      <div className="v-checklist">
        <span className="v-checklist-title">چک‌لیست خواندن شواهد</span>
        {["جمعیت مطالعه", "مقایسه‌گر", "نوع پیامد", "عدد دقیق از ناشر"].map((item) => (
          <span key={item}><Icon name="check" /> {item}</span>
        ))}
      </div>
    </div>
  );
}

function IdxDrVisual() {
  return (
    <div className="v-idx">
      <div className="v-idx-eye" aria-hidden="true">
        <svg viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="92" className="v-eye-outer" />
          <circle cx="100" cy="100" r="70" className="v-eye-retina" />
          <path d="M100 100 C80 70 60 60 40 62 M100 100 C120 70 140 58 162 64 M100 100 C78 128 62 140 42 140 M100 100 C124 128 140 142 160 136 M100 100 C100 70 96 50 92 34" className="v-eye-vessel" />
          <circle cx="100" cy="100" r="14" className="v-eye-disc" />
          <circle cx="62" cy="120" r="4" className="v-eye-lesion" />
          <circle cx="138" cy="84" r="3" className="v-eye-lesion" />
        </svg>
      </div>
      <div className="v-idx-steps">
        <div className="v-idx-year"><span dir="ltr">2018</span> FDA</div>
        <div className="v-idx-flow">
          <span>تصویر شبکیه</span>
          <Icon name="arrowLeft" />
          <span className="is-ai">IDx-DR</span>
          <Icon name="arrowLeft" />
          <span>رتینوپاتی دیابتی: بله/خیر</span>
        </div>
        <p>بدون اینکه پزشک تصویر را تفسیر کند.</p>
        <div className="v-idx-chips">
          <span>محصول مشخص</span>
          <span>کاربرد مشخص</span>
          <span>مجوز مشخص</span>
        </div>
      </div>
    </div>
  );
}

function ConfusionMatrix({ tp, fn, fp, tn, numeric }: { tp: string; fn: string; fp: string; tn: string; numeric?: boolean }) {
  return (
    <div className={`v-cm${numeric ? " is-numeric" : ""}`}>
      <span className="v-cm-corner" />
      <span className="v-cm-head">پیش‌بینی مثبت</span>
      <span className="v-cm-head">پیش‌بینی منفی</span>
      <span className="v-cm-side">واقعاً مثبت</span>
      <span className="v-cm-cell is-good"><b>TP</b>{tp}</span>
      <span className="v-cm-cell is-bad"><b>FN</b>{fn}</span>
      <span className="v-cm-side">واقعاً منفی</span>
      <span className="v-cm-cell is-bad"><b>FP</b>{fp}</span>
      <span className="v-cm-cell is-good"><b>TN</b>{tn}</span>
    </div>
  );
}

function MetricsVisual() {
  return (
    <div className="v-metrics">
      <ConfusionMatrix tp="مثبت درست" fn="منفی کاذب" fp="مثبت کاذب" tn="منفی درست" />
      <div className="v-metric-table">
        {metrics.map((m) => (
          <div key={m.name} className="v-metric-row">
            <span className="v-metric-name" dir="ltr">{m.name}</span>
            <code dir="ltr">{m.formula}</code>
            <span className="v-metric-meaning">{m.meaning}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniProjectVisual() {
  const { confusion, loss, results, architecture } = miniProject;
  const maxLoss = 0.25;
  const pts = loss.map((p) => ({ x: 24 + (p.epoch / 100) * 250, y: 22 + (1 - p.value / maxLoss) * 80, ...p }));
  return (
    <div className="v-mini">
      <div className="v-mini-arch" dir="ltr">
        {architecture.map((layer, index) => (
          <span key={`${layer}-${index}`} className={layer === "ReLU" ? "is-act" : ""}>{layer}</span>
        ))}
      </div>
      <div className="v-mini-grid">
        <div className="v-mini-cm">
          <span className="v-mini-caption">ماتریس خطا · ۱۱۴ نمونه‌ی آزمون</span>
          <ConfusionMatrix tp={String(confusion.tp)} fn={String(confusion.fn)} fp={String(confusion.fp)} tn={String(confusion.tn)} numeric />
        </div>
        <div className="v-mini-loss">
          <span className="v-mini-caption">Training Loss</span>
          <svg viewBox="0 0 300 140" aria-label="نمودار کاهش Training Loss">
            <line x1="20" y1="112" x2="290" y2="112" className="v-axis" />
            <polyline points={pts.map((p) => `${p.x},${p.y}`).join(" ")} className="v-loss-line" />
            {pts.map((p, i) => (
              <g key={p.epoch}>
                <circle cx={p.x} cy={p.y} r="4.5" className="v-loss-dot" />
                <text
                  x={i === 0 ? p.x + 10 : i === pts.length - 1 ? p.x - 4 : p.x + 6}
                  y={p.y - 12}
                  className="v-loss-val"
                  textAnchor={i === 0 ? "start" : i === pts.length - 1 ? "end" : "start"}
                >
                  {p.value}
                </text>
                <text x={p.x} y="130" className="v-loss-ep" textAnchor="middle">epoch {p.epoch}</text>
              </g>
            ))}
          </svg>
        </div>
      </div>
      <div className="v-stats">
        {results.map((r) => (
          <div key={r.k} className="v-stat">
            <small dir="ltr">{r.k}</small>
            <strong dir="ltr">{r.v}</strong>
            <span dir="auto">{r.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MonitoringVisual() {
  return (
    <div className="v-monitoring">
      <svg viewBox="0 0 420 170" className="v-timeline" aria-hidden="true">
        <defs>
          <pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="8" className="v-hatch" />
          </pattern>
        </defs>
        <rect x="20" y="40" width="210" height="44" rx="8" className="v-tl-past" />
        <rect x="230" y="40" width="170" height="44" rx="8" fill="url(#hatch)" className="v-tl-future" />
        <path d="M28 70 L60 64 L84 68 L108 52 L132 60 L156 46 L180 54 L204 40 L222 48" className="v-tl-signal" />
        <line x1="230" y1="22" x2="230" y2="104" className="v-tl-now" />
        <text x="230" y="16" textAnchor="middle" className="v-tl-label strong">لحظه‌ی پیش‌بینی</text>
        <text x="125" y="104" textAnchor="middle" className="v-tl-label">داده‌ی در دسترس</text>
        <text x="315" y="104" textAnchor="middle" className="v-tl-label warn">ورود به مدل = نشت داده</text>
        <rect x="260" y="122" width="120" height="30" rx="8" className="v-tl-outcome" />
        <text x="320" y="142" textAnchor="middle" className="v-tl-label">پنجره‌ی پیامد</text>
      </svg>
      <div className="v-monitor-chips">
        <span><Icon name="activity" /> سپسیس در ICU</span>
        <span><Icon name="heart" /> خطر قلبی و دیابت</span>
        <span><Icon name="clock" /> ساعت هوشمند و AF</span>
      </div>
      <div className="v-mon-checks">
        {["زمان هشدار", "نرخ هشدار کاذب", "حساسیت در آستانه‌ی عملیاتی", "Distribution Shift"].map((c) => (
          <span key={c}>{c}</span>
        ))}
      </div>
    </div>
  );
}

function DrugVisual() {
  return (
    <div className="v-drug">
      <ol className="v-stages">
        {drugStages.map((stage, index) => (
          <li key={stage} className={index === 0 ? "is-ai" : ""}>{stage}</li>
        ))}
      </ol>
      <div className="v-drug-cards">
        <div className="v-drug-card">
          <span className="v-icon"><Icon name="flask" /></span>
          <strong>halicin · abaucin</strong>
          <p>آنتی‌بیوتیک در برابر باکتری‌های مقاوم · MIT</p>
        </div>
        <div className="v-drug-card">
          <span className="v-icon"><Icon name="layers" /></span>
          <strong>AlphaFold</strong>
          <p>ساختار سه‌بعدی پروتئین از توالی · نوبل ۲۰۲۴</p>
        </div>
      </div>
      <div className="v-txgemma">
        <div className="v-tx-head">
          <strong dir="ltr">TxGemma</strong>
          <span>Google · بر پایه‌ی Gemma 2</span>
        </div>
        <div className="v-tx-models">
          {txgemmaModels.map((model) => (
            <div key={model.name} className="v-tx-model">
              <b dir="ltr">{model.name}</b>
              <div className="v-tx-sizes" dir="ltr">
                {model.sizes.map((size) => <span key={size}>{size}</span>)}
              </div>
              <small>{model.text}</small>
            </div>
          ))}
        </div>
        <p className="v-tx-note">سمیت · سد خونی‌ـ‌مغزی · لیپوفیلیسیته · binding affinity — پیش‌بینی محاسباتی، نه اثبات بالینی</p>
      </div>
    </div>
  );
}

function TreatmentVisual() {
  return (
    <div className="v-treat">
      <div className="v-treat-card">
        <span className="v-icon"><Icon name="pill" /></span>
        <strong>انتخاب درمان</strong>
        <p>مقایسه‌ی روش‌ها بر اساس اطلاعات بیمار و پژوهش‌ها</p>
      </div>
      <div className="v-treat-card">
        <span className="v-icon"><Icon name="users" /></span>
        <strong dir="ltr">Flok Health</strong>
        <p>فیزیوتراپی با ویزیت ویدیویی فوری؛ کاهش زمان انتظار (نیازمند راستی‌آزمایی)</p>
      </div>
      <div className="v-treat-card">
        <span className="v-icon"><Icon name="notes" /></span>
        <strong>مدیریت اطلاعات</strong>
        <p>خلاصه‌ی پرونده و پیش‌نویس گزارش ویزیت</p>
      </div>
      <div className="v-treat-card is-wide">
        <span className="v-icon"><Icon name="cpu" /></span>
        <strong dir="ltr">da Vinci</strong>
        <div className="v-davinci">
          <span className="is-human">جراح</span>
          <Icon name="arrowLeft" />
          <span>کنسول</span>
          <Icon name="arrowLeft" />
          <span>ربات: دقت و ثبات حرکت</span>
        </div>
        <p>عمدتاً خودمختار نیست؛ «پزشکی تقویت‌شده».</p>
      </div>
    </div>
  );
}

function ProductsVisual() {
  return (
    <div className="v-products">
      <div className="v-table">
        <div className="v-table-head">
          <span>نرم‌افزار</span>
          <span>کشور / شرکت</span>
          <span>کاربرد</span>
          <span>نحوه‌ی عملکرد</span>
        </div>
        {products.map((p) => (
          <div key={p.name} className="v-table-row">
            <strong dir="ltr">{p.name}</strong>
            <span>{p.origin}</span>
            <span>{p.use}</span>
            <span>{p.how}</span>
          </div>
        ))}
      </div>
      <div className="v-assistants">
        <span className="v-assistants-title">دستیارهای سلامت و LLM</span>
        {assistants.map((a) => (
          <div key={a.name}>
            <b dir="ltr">{a.name}</b>
            <small>{a.text}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChallengesVisual() {
  return (
    <div className="v-challenges">
      <div className="v-challenge-grid">
        {challenges.map((c) => (
          <div key={c.title} className="v-challenge">
            <span className="v-icon"><Icon name={c.icon as IconName} /></span>
            <strong>{c.title}</strong>
            <p>{c.text}</p>
          </div>
        ))}
      </div>
      <div className="v-regs">
        {regulations.map((r) => (
          <div key={r.name}>
            <b dir="ltr">{r.name}</b>
            <small>{r.text}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

function AutonomyVisual() {
  return (
    <div className="v-autonomy">
      <div className="v-levels">
        {autonomyLevels.map((l) => (
          <div key={l.level} className={`v-level${l.level <= 3 ? " is-in" : ""}${l.level === 3 ? " is-cap" : ""}`} style={{ height: `${30 + l.level * 14}%` }}>
            <b>{fa(l.level)}</b>
            <small>{l.text}</small>
            {l.level === 3 && <span className="v-cap-tag">سقف احتمالی پزشکی · Topol</span>}
          </div>
        ))}
      </div>
      <div className="v-skills">
        <span className="v-skills-title">مهارت‌هایی که ارزشمندتر می‌شوند</span>
        <div>
          {["ارتباط", "همدلی", "رهبری", "هوش هیجانی", "علم داده", "اخلاق و حقوق"].map((s) => <span key={s}>{s}</span>)}
        </div>
      </div>
    </div>
  );
}

export const sideVisuals: Partial<Record<VisualKind, () => ReactNode>> = {
  why: WhyVisual,
  aiNested: AiNestedVisual,
  pipeline: PipelineVisual,
  neuralNet: NeuralNetVisual,
  imaging: ImagingVisual,
  masai: MasaiVisual,
  idxdr: IdxDrVisual,
  metrics: MetricsVisual,
  miniProject: MiniProjectVisual,
  monitoring: MonitoringVisual,
  drug: DrugVisual,
  treatment: TreatmentVisual,
  products: ProductsVisual,
  challenges: ChallengesVisual,
  autonomy: AutonomyVisual,
  projectData: ProjectDataVisual,
  projectModel: ProjectModelVisual,
  projectThreshold: ProjectThresholdVisual,
  projectResults: ProjectResultsVisual,
  projectSystem: ProjectSystemVisual,
  projectLimits: ProjectLimitsVisual,
  plMap: PlMapVisual,
  plDsl: PlDslVisual,
  plTypes: PlTypesVisual,
  plFeatures: PlFeaturesVisual,
  plLessons: PlLessonsVisual,
};
