const faNumber = new Intl.NumberFormat("fa-IR");
const faDecimal = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 1 });

/** Persian digits for an integer value. */
export function fa(value: number) {
  return faNumber.format(value);
}

/** Probability (0–1) → "۸۷٪" */
export function faPercent(probability: number) {
  return `${faNumber.format(Math.round(probability * 100))}٪`;
}

export function formatSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${faNumber.format(Math.max(1, Math.round(bytes / 1024)))} کیلوبایت`
    : `${faDecimal.format(bytes / (1024 * 1024))} مگابایت`;
}

/** Seconds → "۱۲:۰۵" */
export function faClock(totalSeconds: number) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${faNumber.format(minutes)}:${faNumber.format(seconds).padStart(2, "۰")}`;
}
