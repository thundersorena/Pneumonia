import { AnalysisWorkspace } from "@/components/analysis/analysis-workspace";
import { ModelOverview } from "@/components/analysis/model-overview";
import { SiteHeader } from "@/components/site-header";
import "./analysis.css";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="page">
        <AnalysisWorkspace />
        <ModelOverview />
        <footer className="page-footer">
          <span>پالس · ابزار پژوهشی آموزشی</span>
          <span dir="ltr">PneumoniaCNN · 28×28 · PyTorch + FastAPI</span>
        </footer>
      </main>
    </>
  );
}
