import type { Metadata } from "next";
import { PresentationDeck } from "@/components/presentation/deck";
import "./presentation.css";

export const metadata: Metadata = {
  title: "ارائه · کاربرد هوش مصنوعی در پزشکی",
  description: "ارائه‌ی دانشگاهی حدود ۲۰ دقیقه‌ای درباره‌ی کاربردها، نرم‌افزارها، چرایی استفاده و چالش‌های هوش مصنوعی در پزشکی.",
};

export default function PresentationPage() {
  return <PresentationDeck />;
}
