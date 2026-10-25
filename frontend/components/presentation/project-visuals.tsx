import Link from "next/link";
import { Icon } from "@/components/icons";
import { fa } from "@/lib/format";
import { project, projectLimits, projectNext, projectStack } from "@/lib/presentation-content";

const pct = (v: number, digits = 1) => `${(v * 100).toFixed(digits)}%`;

function Matrix({ tn, fp, fn, tp, caption }: { tn: number; fp: number; fn: number; tp: number; caption: string }) {
  return (
    <div className="p-cm">
      <span className="p-cm-caption">{caption}</span>
      <div className="v-cm is-numeric">
        <span className="v-cm-corner" />
        <span className="v-cm-head">پیش‌بینی پنومونی</span>
        <span className="v-cm-head">پیش‌بینی نرمال</span>
        <span className="v-cm-side">واقعاً پنومونی</span>
        <span className="v-cm-cell is-good"><b>TP</b>{tp}</span>
        <span className="v-cm-cell is-bad"><b>FN</b>{fn}</span>
        <span className="v-cm-side">واقعاً نرمال</span>
        <span className="v-cm-cell is-bad"><b>FP</b>{fp}</span>
        <span className="v-cm-cell is-good"><b>TN</b>{tn}</span>
      </div>
    </div>
  );
}

export function ProjectDataVisual() {
  const max = 4708;
  return (
    <div className="p-data">
      <div className="p-data-head">
        <div>
          <strong dir="ltr">{project.dataset}</strong>
          <small>{project.collection} · {project.source}</small>
        </div>
        <span className="p-shape" dir="ltr">{project.inputShape}</span>
      </div>
      <div className="p-splits">
        {project.splits.map((split) => (
          <div key={split.name} className="p-split">
            <div className="p-split-label">
              <b dir="ltr">{split.name}</b>
              <span>{fa(split.total)} تصویر</span>
            </div>
            <div className="p-split-track">
              {split.normal !== null && split.pneumonia !== null ? (
                <>
                  <span className="p-seg is-normal" style={{ width: `${(split.normal / max) * 100}%` }} />
                  <span className="p-seg is-pneu" style={{ width: `${(split.pneumonia / max) * 100}%` }} />
                </>
              ) : (
                <span className="p-seg is-unknown" style={{ width: "100%" }} />
              )}
            </div>
            <small className="p-split-note">
              {split.normal !== null && split.pneumonia !== null ? `${fa(split.normal)} نرمال · ${fa(split.pneumonia)} پنومونی · ` : ""}
              {split.note}
            </small>
          </div>
        ))}
      </div>
      <div className="p-legend">
        <span><i className="is-normal" /> نرمال</span>
        <span><i className="is-pneu" /> پنومونی</span>
        <span className="p-legend-ratio">نسبت پنومونی به نرمال ≈ ۲٫۹ در Validation</span>
      </div>
    </div>
  );
}

export function ProjectModelVisual() {
  const layers = ["Input 1×28×28", "Conv 16 · 3×3", "MaxPool", "Conv 32 · 3×3", "MaxPool", "Linear 64", "Linear 2"];
  return (
    <div className="p-model">
      <div className="p-arch" dir="ltr">
        {layers.map((layer, i) => (
          <span key={`${layer}-${i}`} className={i === 0 ? "is-in" : i === layers.length - 1 ? "is-out" : ""}>{layer}</span>
        ))}
      </div>
      <div className="p-decisions">
        <div className="p-decision">
          <span className="v-icon"><Icon name="scale" /></span>
          <strong>Loss وزن‌دار</strong>
          <p>جبران عدم توازن: کلاس نرمال کم‌تعداد نادیده گرفته نشود.</p>
        </div>
        <div className="p-decision">
          <span className="v-icon"><Icon name="eye" /></span>
          <strong>آستانه = ۰٫۳</strong>
          <p>انتخاب روی Validation؛ Test فقط یک بار برای گزارش نهایی.</p>
        </div>
        <div className="p-decision">
          <span className="v-icon"><Icon name="zap" /></span>
          <strong>مدل کوچک</strong>
          <p>اجرای سریع روی CPU؛ مناسب یادگیری و دموی زنده.</p>
        </div>
      </div>
      <div className="p-params">
        <span className="p-params-title">تعداد پارامترها</span>
        <div className="p-param-row">
          <b dir="ltr">PneumoniaCNN</b>
          <span className="p-param-bar is-mine" style={{ width: "1.2%" }} />
          <em dir="ltr">105,346</em>
        </div>
        <div className="p-param-row">
          <b dir="ltr">ResNet-18</b>
          <span className="p-param-bar" style={{ width: "100%" }} />
          <em dir="ltr">≈ 11M</em>
        </div>
      </div>
    </div>
  );
}

export function ProjectThresholdVisual() {
  const W = 320;
  const H = 230;
  const x = (t: number) => 46 + ((t - 0.3) / 0.4) * (W - 72);
  const y = (v: number) => 14 + (1 - (v - 0.85) / 0.15) * (H - 50);
  const line = (key: "sens" | "spec") => project.sweep.map((r) => `${x(r.t)},${y(r[key])}`).join(" ");
  return (
    <div className="p-threshold">
      <div className="p-chart">
        <svg viewBox={`0 0 ${W} ${H}`} aria-label="Sensitivity و Specificity بر حسب آستانه">
          {[0.85, 0.9, 0.95, 1].map((v) => (
            <g key={v}>
              <line x1="40" x2={W - 20} y1={y(v)} y2={y(v)} className="p-grid" />
              <text x="34" y={y(v) + 4} className="p-axis-label" textAnchor="end">{Math.round(v * 100)}%</text>
            </g>
          ))}
          <rect x={x(0.3) - 12} y="8" width="24" height={H - 38} rx="6" className="p-chosen" />
          <polyline points={line("sens")} className="p-line is-sens" />
          <polyline points={line("spec")} className="p-line is-spec" />
          {project.sweep.map((r) => (
            <g key={r.t}>
              <circle cx={x(r.t)} cy={y(r.sens)} r="4" className="p-dot is-sens" />
              <circle cx={x(r.t)} cy={y(r.spec)} r="4" className="p-dot is-spec" />
              <text x={x(r.t)} y={H - 12} className="p-axis-label" textAnchor="middle">{r.t.toFixed(1)}</text>
            </g>
          ))}
        </svg>
        <div className="p-chart-legend">
          <span><i className="is-sens" /> Sensitivity</span>
          <span><i className="is-spec" /> Specificity</span>
          <span className="p-chosen-tag">انتخاب: ۰٫۳</span>
        </div>
      </div>
      <div className="p-sweep">
        <div className="p-sweep-row is-head" dir="ltr">
          <span>t</span><span>Acc</span><span>FN</span><span>FP</span>
        </div>
        {project.sweep.map((r) => (
          <div key={r.t} className={`p-sweep-row${r.t === project.threshold ? " is-chosen" : ""}`} dir="ltr">
            <span>{r.t.toFixed(1)}</span>
            <span>{pct(r.acc)}</span>
            <span className="is-fn">{r.fn}</span>
            <span className="is-fp">{r.fp}</span>
          </div>
        ))}
        <small>Validation · ۵۲۴ تصویر</small>
      </div>
    </div>
  );
}

export function ProjectResultsVisual() {
  const v = project.validation;
  const t = project.test;
  const rows = [
    { k: "Accuracy", a: v.acc, b: t.acc },
    { k: "Sensitivity", a: v.sens, b: t.sens },
    { k: "Specificity", a: v.spec, b: t.spec, alert: true },
    { k: "Precision", a: v.precision, b: t.precision },
  ];
  return (
    <div className="p-results">
      <div className="p-cms">
        <Matrix caption="Validation · آستانه ۰٫۳ · ۵۲۴ تصویر" tn={v.tn} fp={v.fp} fn={v.fn} tp={v.tp} />
        <Matrix caption="Test · آستانه ۰٫۳ · ۶۲۴ تصویر" tn={t.tn} fp={t.fp} fn={t.fn} tp={t.tp} />
      </div>
      <div className="p-compare">
        <div className="p-compare-head">
          <span />
          <span><i className="is-val" /> Validation</span>
          <span><i className="is-test" /> Test</span>
        </div>
        {rows.map((r) => (
          <div key={r.k} className={`p-compare-row${r.alert ? " is-alert" : ""}`}>
            <b dir="ltr">{r.k}</b>
            <div className="p-bars">
              <span className="p-bar is-val" style={{ width: `${r.a * 100}%` }}><em dir="ltr">{pct(r.a)}</em></span>
              <span className="p-bar is-test" style={{ width: `${r.b * 100}%` }}><em dir="ltr">{pct(r.b)}</em></span>
            </div>
          </div>
        ))}
        <div className="p-bench">
          <span>بنچمارک MedMNIST v2 روی همین Test:</span>
          <b><bdi dir="ltr">ResNet-18 (28)</bdi>: <bdi dir="ltr">0.854</bdi></b>
          <span>در برابر</span>
          <b className="is-mine">مدل ما: <bdi dir="ltr">0.849</bdi> با حدود ۱٪ پارامترها</b>
        </div>
      </div>
    </div>
  );
}

export function ProjectSystemVisual() {
  return (
    <div className="p-system">
      <div className="p-stack">
        {projectStack.map((item, i) => (
          <div key={item.layer} className="p-stack-item">
            <span className="p-stack-num">{fa(i + 1)}</span>
            <div>
              <strong>{item.layer} <small dir="ltr">{item.tech}</small></strong>
              <p>{item.text}</p>
            </div>
            {i < projectStack.length - 1 && <span className="p-stack-arrow"><Icon name="arrowLeft" /></span>}
          </div>
        ))}
      </div>
      <div className="p-demo">
        <div className="p-demo-result">
          <span className="p-demo-badge"><Icon name="alert" /> Pneumonia</span>
          <strong dir="ltr">99.68%</strong>
          <small>احتمال پنومونی · آستانه ۰٫۳</small>
          <p>«مطمئن» بودن مدل با «درست» بودن آن یکی نیست؛ احتمال‌ها کالیبره نشده‌اند.</p>
        </div>
        <Link href="/" className="p-demo-link">
          <Icon name="scan" /> اجرای دموی زنده
        </Link>
      </div>
    </div>
  );
}

export function ProjectLimitsVisual() {
  return (
    <div className="p-limits-wrap">
    <div className="p-limits">
      <div className="p-limits-col is-limit">
        <h3><Icon name="alert" /> محدودیت‌ها</h3>
        <ul>{projectLimits.map((l) => <li key={l}>{l}</li>)}</ul>
      </div>
      <div className="p-limits-col is-next">
        <h3><Icon name="arrowLeft" /> قدم بعدی</h3>
        <ul>{projectNext.map((l) => <li key={l}>{l}</li>)}</ul>
      </div>
    </div>
    <p className="p-keyline">«مدل کوچک ساختم تا فرایند را بفهمم، نه تا تشخیص بدهم؛ و یاد گرفتم که عدد Validation، وعده‌ی دنیای واقعی نیست.»</p>
    </div>
  );
}
