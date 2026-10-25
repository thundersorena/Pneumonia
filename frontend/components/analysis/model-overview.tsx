import Link from "next/link";
import { Icon } from "@/components/icons";

const layers = [
  { name: "ورودی", detail: "۱×۲۸×۲۸", note: "خاکستری" },
  { name: "Conv2d", detail: "۱۶ فیلتر ۳×۳", note: "ReLU" },
  { name: "MaxPool", detail: "۲×۲", note: "۱۴×۱۴" },
  { name: "Conv2d", detail: "۳۲ فیلتر ۳×۳", note: "ReLU" },
  { name: "MaxPool", detail: "۲×۲", note: "۷×۷" },
  { name: "Linear", detail: "۱۵۶۸ → ۶۴", note: "ReLU" },
  { name: "Linear", detail: "۶۴ → ۲", note: "Softmax" },
];

export function ModelOverview() {
  return (
    <section className="overview" id="model" aria-labelledby="model-title">
      <div className="overview-head">
        <p className="eyebrow"><span className="eyebrow-dot" /> درباره‌ی مدل</p>
        <h2 id="model-title">پشت صحنه‌ی PneumoniaCNN</h2>
        <p className="lead">یک شبکه‌ی عصبی کانولوشنی کوچک که برای یادگیری فرایند آموزش و ارزیابی ساخته شده است.</p>
      </div>

      <ol className="arch" aria-label="معماری لایه‌ها">
        {layers.map((layer, index) => (
          <li key={`${layer.name}-${index}`} className="arch-node">
            <span className="arch-name" dir="ltr">{layer.name}</span>
            <span className="arch-detail">{layer.detail}</span>
            <span className="arch-note">{layer.note}</span>
          </li>
        ))}
      </ol>

      <div className="results-band">
        <div className="results-band-head">
          <strong>نتایج روی Test</strong>
          <span>PneumoniaMNIST · ۶۲۴ تصویر دیده‌نشده · آستانه ۰٫۳</span>
        </div>
        <dl className="results-stats">
          <div><dt>Accuracy</dt><dd>۸۴٫۹٪</dd><span>در Validation: ۹۶٫۴٪</span></div>
          <div><dt>Sensitivity</dt><dd>۹۷٫۹٪</dd><span>۸ بیمار از ۳۹۰ جا افتاد</span></div>
          <div className="is-weak"><dt>Specificity</dt><dd>۶۳٫۲٪</dd><span>۸۶ نفر از ۲۳۴ سالم هشدار گرفتند</span></div>
          <div><dt>Precision</dt><dd>۸۱٫۶٪</dd><span>برای کلاس پنومونی</span></div>
        </dl>
      </div>

      <div className="overview-grid">
        <article className="info-card">
          <span className="info-icon"><Icon name="scale" size={18} /></span>
          <h3>آستانه‌ی تصمیم</h3>
          <p>
            خروجی مدل دو احتمال است. اگر احتمال پنومونی از آستانه بیشتر شود، برچسب «پنومونی» داده می‌شود. آستانه‌ی پایین‌تر حساسیت را بالا می‌برد و
            هشدار کاذب را بیشتر می‌کند.
          </p>
        </article>
        <article className="info-card">
          <span className="info-icon"><Icon name="eye" size={18} /></span>
          <h3>محدودیت‌ها</h3>
          <p>
            داده از کودکان است و وضوح ورودی ۲۸×۲۸. روی Test، حدود یک‌سوم تصاویر نرمال به اشتباه پنومونی تشخیص داده شدند و احتمال‌ها کالیبره نشده‌اند. نتیجه را مبنای هیچ تصمیم بالینی قرار ندهید.
          </p>
        </article>
        <article className="info-card">
          <span className="info-icon"><Icon name="lock" size={18} /></span>
          <h3>حریم خصوصی</h3>
          <p>تصویر فقط برای پیش‌بینی به سرویس محلی ارسال می‌شود و هیچ‌جا ذخیره نمی‌شود.</p>
        </article>
      </div>

      <div className="disclaimer">
        <span className="disclaimer-icon"><Icon name="shield" size={18} /></span>
        <p>
          <strong>توجه:</strong> این ابزار صرفاً برای اهداف آموزشی و پژوهشی است و جایگزین تشخیص، نظر یا توصیه‌ی پزشک نیست.
        </p>
        <Link className="disclaimer-link" href="/presentation">
          ارائه‌ی «هوش مصنوعی در پزشکی» <Icon name="arrowLeft" size={15} />
        </Link>
      </div>
    </section>
  );
}
