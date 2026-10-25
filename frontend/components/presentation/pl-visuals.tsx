import type { ReactNode } from "react";
import { fa } from "@/lib/format";

/* ------------------------------------------------------------------ */
/*  Tiny syntax highlighter (Python / TypeScript snippets only)        */
/* ------------------------------------------------------------------ */

const TOKEN =
  /(#.*$|\/\/.*$)|("[^"]*"|'[^']*')|(@[\w.]+)|\b(def|class|return|async|await|with|from|import|raise|as|type|const|let|if|in|None|self|true|false|null)\b|\b(\d+(?:\.\d+)?)\b/g;

function highlight(line: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(line)) !== null) {
    if (m.index > last) out.push(line.slice(last, m.index));
    const cls = m[1] ? "tk-com" : m[2] ? "tk-str" : m[3] ? "tk-dec" : m[4] ? "tk-kw" : "tk-num";
    out.push(<span key={m.index} className={cls}>{m[0]}</span>);
    last = m.index + m[0].length;
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}

function Code({ lang, lines, mark = [] }: { lang: string; lines: string[]; mark?: number[] }) {
  return (
    <div className="pl-code" dir="ltr">
      <span className="pl-code-lang">{lang}</span>
      <pre>
        {lines.map((line, i) => (
          <code key={i} className={mark.includes(i) ? "is-mark" : undefined}>
            {highlight(line)}
            {"\n"}
          </code>
        ))}
      </pre>
    </div>
  );
}

/* ------------------------------------------------------------------ */

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
      <Code
        lang="Python · PyTorch"
        mark={[2, 3]}
        lines={[
          "def forward(self, image):",
          "    # plain Python syntax, tensor semantics",
          "    image = self.pool1(torch.relu(self.conv1(image)))",
          "    image = self.pool2(torch.relu(self.conv2(image)))",
          "    image = torch.flatten(image, start_dim=1)",
          "    return self.fc2(torch.relu(self.fc1(image)))",
          "",
          "logits = model(image)   # __call__ → forward",
          "loss.backward()         # reverse-mode autodiff",
        ]}
      />
      <div className="pl-graph" dir="ltr">
        {["conv1", "relu", "pool1", "conv2", "relu", "pool2", "flatten", "fc1", "fc2"].map((n, i) => (
          <span key={`${n}-${i}`}>{n}</span>
        ))}
      </div>
      <div className="pl-arrows">
        <span className="is-fwd">← forward: گراف هم‌زمان با اجرا ساخته می‌شود</span>
        <span className="is-bwd">backward: گرادیان از انتها به ابتدا →</span>
      </div>
      <div className="pl-modes">
        <div>
          <b>Eager</b>
          <small>مثل مفسر · دیباگ آسان · if و for معمولی</small>
        </div>
        <div>
          <b dir="ltr">torch.compile</b>
          <small>مثل JIT · گرفتن گراف · کد بهینه</small>
        </div>
        <div className="is-old">
          <b>TF 1.x</b>
          <small>Define-and-run · اول گراف، بعد اجرا</small>
        </div>
      </div>
    </div>
  );
}

export function PlTypesVisual() {
  return (
    <div className="pl-types">
      <div className="pl-types-grid">
        <Code
          lang="TypeScript · فرانت‌اند"
          mark={[1, 6]}
          lines={[
            "type Prediction = {",
            '  prediction: "Normal" | "Pneumonia";',
            "  probabilities: { Normal: number; ... };",
            "  threshold: number;",
            "};",
            "",
            "const r = (await res.json()) as Prediction;",
            'if ("detail" in r) { /* narrowing */ }',
          ]}
        />
        <div className="pl-boundary">
          <span>JSON</span>
          <small>نوع‌ها اینجا پاک می‌شوند</small>
        </div>
        <Code
          lang="Python · بک‌اند"
          mark={[0, 4]}
          lines={[
            "model: PneumoniaCNN | None = None",
            "",
            '@app.post("/predict")',
            "async def predict(",
            "    file: UploadFile = File(...),",
            ") -> dict[str, object]:",
            "    ...",
            "",
            "self.fc1 = nn.Linear(32 * 7 * 7, 64)  # 1568",
          ]}
        />
      </div>
      <div className="pl-type-notes">
        <span className="is-good"><b>Literal Union</b> مقدار نامعتبر در زمان کامپایل رد می‌شود</span>
        <span className="is-bad"><b dir="ltr">as</b> ادعا است، نه بررسی؛ سیستم نوع ناسالم</span>
        <span className="is-good"><b>Reflection</b> FastAPI از type hint اعتبارسنجی می‌سازد</span>
        <span className="is-bad"><b>Shape</b> ۱۵۶۸ فقط در زمان اجرا چک می‌شود</span>
      </div>
    </div>
  );
}

const features = [
  { concept: "Decorator", fa: "تابع مرتبه‌بالا · فرابرنامه‌نویسی", lang: "Python", code: ['@app.post("/predict")', "async def predict(file): ..."], note: "معادل predict = app.post(...)(predict)" },
  { concept: "Context Manager", fa: "مدیریت منبع (شبیه RAII) · حوزه‌ی پویا", lang: "Python", code: ["with model_lock, torch.inference_mode():", "    logits = model(image)"], note: "قفل و حالت بدون‌گراد حتماً آزاد می‌شوند" },
  { concept: "async / await", fa: "هم‌روال · حلقه‌ی رویداد", lang: "Python + TS", code: ["contents = await file.read(MAX + 1)", "const res = await fetch(url)"], note: "هم‌روندی همکارانه، نه موازی" },
  { concept: "Closure", fa: "بستار · چرخه‌ی عمر", lang: "TypeScript", code: ["let active = true;", "return () => { active = false; };"], note: "پاسخ دیررس بعد از unmount نادیده گرفته می‌شود" },
  { concept: "Composition", fa: "ترکیب توابع · سبک تابعی", lang: "Python", code: ["preprocess = transforms.Compose(", "    [Resize((28, 28)), ToTensor()])"], note: "خط لوله‌ی پیش‌پردازش از توابع کوچک" },
  { concept: "Exception chaining", fa: "مدیریت خطا · حفظ علت", lang: "Python", code: ["except UnidentifiedImageError as error:", "    raise HTTPException(400) from error"], note: "علت اصلی در __cause__ باقی می‌ماند" },
];

export function PlFeaturesVisual() {
  return (
    <div className="pl-features">
      {features.map((f, i) => (
        <div key={f.concept} className="pl-feature">
          <div className="pl-feature-head">
            <span className="pl-feature-num">{fa(i + 1)}</span>
            <div>
              <b dir="ltr">{f.concept}</b>
              <small>{f.fa}</small>
            </div>
          </div>
          <Code lang={f.lang} lines={f.code} />
          <p>{f.note}</p>
        </div>
      ))}
      <div className="pl-critique">
        <b>نقد کد خودم:</b> استنتاج CPU‌بر داخل <bdi dir="ltr">async def</bdi> حلقه‌ی رویداد را مسدود می‌کند؛ بهتر است <bdi dir="ltr">def</bdi> معمولی باشد تا FastAPI آن را در threadpool اجرا کند.
      </div>
    </div>
  );
}

const lessons = [
  { title: "هر لایه، زبان خودش", text: "پویایی Python برای آزمایش مدل، ایستایی TypeScript برای رابط قابل اعتماد، C++ برای سرعت." },
  { title: "مرز را در زمان اجرا چک کن", text: "نوع‌ها در JSON پاک می‌شوند؛ Pydantic در سرور، Zod در کلاینت، یا تولید نوع از OpenAPI." },
  { title: "DSL خوب = نحو آشنا + معنای تخصصی", text: "PyTorch بدون نحو جدید، با Operator Overloading و Autograd، زبان یادگیری عمیق شد." },
  { title: "نوع، ایمنی دامنه را رمز می‌کند", text: "برچسب تشخیص به‌صورت Literal Type؛ در آینده شکل تانسور به‌صورت نوع." },
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
