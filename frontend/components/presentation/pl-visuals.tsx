import { fa } from "@/lib/format";

const languages = [
  { name: "TypeScript / TSX", role: "رابط کاربری", typing: "ایستا · ساختاری · تدریجی", run: "ترجمه به JS · نوع‌ها پاک می‌شوند", paradigm: "اعلانی (React) + رویدادمحور" },
  { name: "Python", role: "API و هماهنگی", typing: "پویا · قوی · Duck typing", run: "bytecode روی ماشین مجازی CPython", paradigm: "چندپارادایمی: شیءگرا، دستوری، تابعی" },
  { name: "PyTorch DSL", role: "تعریف مدل", typing: "Tensor · شکل فقط در زمان اجرا", run: "eager (مفسری) یا torch.compile", paradigm: "Define-by-run" },
  { name: "C++ / CUDA", role: "محاسبه‌ی تانسور", typing: "ایستا · اسمی", run: "از پیش کامپایل‌شده", paradigm: "دستوری، سطح پایین" },
  { name: "JSON · CSS", role: "قرارداد و ظاهر", typing: "بدون طرح‌واره‌ی اجباری", run: "داده / اعلانی", paradigm: "اعلانی" },
];

export function PlMapVisual() {
  return (
    <div className="pl-map">
      <div className="pl-flow" dir="ltr">
        <span className="is-ts">TSX</span>
        <i>fetch · JSON</i>
        <span className="is-py">Python</span>
        <i>binding</i>
        <span className="is-cpp">C++ / CUDA</span>
      </div>
      <div className="pl-table">
        <div className="pl-row is-head">
          <span>زبان</span>
          <span>نقش</span>
          <span>سیستم نوع</span>
          <span>مدل اجرا</span>
        </div>
        {languages.map((l) => (
          <div key={l.name} className="pl-row">
            <b dir="ltr">{l.name}</b>
            <span>{l.role}</span>
            <span>{l.typing}</span>
            <span>{l.run}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PlDslVisual() {
  return (
    <div className="pl-dsl">
      <div className="pl-steps">
        <div className="pl-step">
          <span className="pl-step-n">{fa(1)}</span>
          <strong>همان Python</strong>
          <p>مدل با نحو معمولی نوشته می‌شود: لایه‌ها پشت سر هم صدا زده می‌شوند.</p>
        </div>
        <div className="pl-step">
          <span className="pl-step-n">{fa(2)}</span>
          <strong>گراف هنگام اجرا</strong>
          <p>هر محاسبه ثبت می‌شود تا بعداً بشود از خروجی به عقب برگشت و یاد گرفت.</p>
        </div>
        <div className="pl-step">
          <span className="pl-step-n">{fa(3)}</span>
          <strong>یادگیری خودکار</strong>
          <p>با یک دستور، سیستم می‌فهمد هر وزن چقدر باید تغییر کند.</p>
        </div>
      </div>
      <div className="pl-graph" dir="ltr">
        {["تصویر", "کانولوشن", "ReLU", "Pool", "کانولوشن", "Pool", "تصمیم"].map((n, i) => (
          <span key={`${n}-${i}`}>{n}</span>
        ))}
      </div>
      <div className="pl-modes">
        <div>
          <b>اجرای عادی</b>
          <small>مثل مفسر · خط‌به‌خط · خطایابی آسان</small>
        </div>
        <div>
          <b>torch.compile</b>
          <small>مثل کامپایلر · سریع‌تر</small>
        </div>
        <div className="is-old">
          <b>روش قدیمی</b>
          <small>اول گراف، بعد اجرا</small>
        </div>
      </div>
    </div>
  );
}

export function PlTypesVisual() {
  return (
    <div className="pl-types">
      <div className="pl-steps">
        <div className="pl-step">
          <span className="pl-step-n">{fa(1)}</span>
          <strong>داخل برنامه</strong>
          <p>هر مقدار برچسب دارد و اشتباه پیش از اجرا گرفته می‌شود.</p>
          <div className="pl-chips" dir="ltr">
            <i className="is-ok">&quot;Pneumonia&quot; ✓</i>
            <i className="is-no">&quot;pneumonia&quot; ✗</i>
          </div>
        </div>
        <div className="pl-step is-break">
          <span className="pl-step-n">{fa(2)}</span>
          <strong>عبور از شبکه</strong>
          <p>فقط متن ساده می‌رسد؛ برچسب‌ها اینجا پاک می‌شوند.</p>
          <div className="pl-chips" dir="ltr">
            <i className="is-json">JSON</i>
          </div>
        </div>
        <div className="pl-step">
          <span className="pl-step-n">{fa(3)}</span>
          <strong>آن‌سوی مرز</strong>
          <p>باید دوباره بررسی کنیم، نه اینکه فقط باور کنیم.</p>
          <div className="pl-chips">
            <i className="is-ok">بررسی هنگام اجرا</i>
          </div>
        </div>
      </div>
      <div className="pl-type-notes">
        <span className="is-good"><b>خوب است:</b> اشتباه تایپی در نام برچسب، پیش از اجرا دیده می‌شود.</span>
        <span className="is-bad"><b>خطرناک است:</b> اگر به کامپایلر بگوییم «اعتماد کن» و سرور چیز دیگری بفرستد، خطا دیر پیدا می‌شود.</span>
      </div>
    </div>
  );
}

const features = [
  { concept: "دکوراتور", en: "Decorator", text: "برچسبی بالای تابع که می‌گوید: این تابع جواب درخواست‌های تشخیص را می‌دهد." },
  { concept: "مدیریت منبع", en: "with", text: "مثل دری که خودش بسته می‌شود؛ قفل مدل حتی هنگام خطا هم آزاد می‌شود." },
  { concept: "ناهم‌زمانی", en: "async / await", text: "منتظر جواب ماندن بدون معطل کردن بقیه؛ مثل گارسونی که پشت میز نمی‌ایستد." },
  { concept: "بستار", en: "Closure", text: "تابع کوچکی که اطرافش را به یاد دارد؛ جواب دیررس را نادیده می‌گیرد." },
  { concept: "ترکیب توابع", en: "Compose", text: "پیش‌پردازش تصویر زنجیره‌ای از قطعه‌های کوچک است: تغییر اندازه، سپس تبدیل به عدد." },
  { concept: "زنجیره‌ی خطا", en: "raise … from", text: "وقتی خطا را به پیام کاربر تبدیل می‌کنیم، علت اصلی گم نمی‌شود." },
];

export function PlFeaturesVisual() {
  return (
    <div className="pl-features">
      {features.map((f, i) => (
        <div key={f.concept} className="pl-feature">
          <div className="pl-feature-head">
            <span className="pl-feature-num">{fa(i + 1)}</span>
            <div>
              <b>{f.concept}</b>
              <small dir="ltr">{f.en}</small>
            </div>
          </div>
          <p>{f.text}</p>
        </div>
      ))}
      <div className="pl-critique">
        <b>نقد صادقانه:</b> محاسبه‌ی سنگین مدل داخل تابع ناهم‌زمان، بقیه‌ی درخواست‌ها را موقتاً معطل می‌کند؛ راه‌حل ساده: تابع معمولی.
      </div>
    </div>
  );
}

const lessons = [
  { title: "هر بخش، زبان خودش", text: "Python برای آزمایش مدل، TypeScript برای رابط قابل‌اعتماد، C++ برای سرعت." },
  { title: "مرز را دوباره چک کن", text: "برچسب‌ها در شبکه پاک می‌شوند؛ داده‌ی ورودی را همان‌جا بررسی کنید." },
  { title: "زبان تخصصی خوب", text: "ظاهر آشنا + توانایی تازه؛ PyTorch همان Python است با معنای یادگیری عمیق." },
  { title: "نوع داده یعنی ایمنی", text: "هر خطایی که پیش از اجرا گرفته شود، به بیمار نمی‌رسد." },
];

export function PlLessonsVisual() {
  return (
    <div className="pl-lessons">
      <div className="pl-lesson-grid">
        {lessons.map((l, i) => (
          <div key={l.title} className="pl-lesson">
            <span>{fa(i + 1)}</span>
            <strong>{l.title}</strong>
            <p>{l.text}</p>
          </div>
        ))}
      </div>
      <p className="pl-keyline">«در نرم‌افزار پزشکی، هر خطایی که کامپایلر بگیرد، خطایی است که به بیمار نمی‌رسد.»</p>
    </div>
  );
}
