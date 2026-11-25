import WorkInProgress from "./components/WorkInProgress";

interface SectionProps {
  theme?: "light" | "dark";
}

export default function Work({ theme = "light" }: SectionProps) {
  return (
    <div className={`work-section ${theme} linen`}>
      <style>{`
        .work-section {
          --ink: #292929;
          --cream: #d8d5ce;
          min-height: 100vh;
          padding: 12px;
          box-sizing: border-box;
          transition: background .3s, color .3s;
        }
        .work-section.dark {
          --frame: var(--cream);
          --card-bg: var(--ink);
          --card-text: var(--cream);
          background: var(--frame);
        }
        .work-section.light {
          --frame: var(--ink);
          --card-bg: var(--cream);
          --card-text: var(--ink);
          background: var(--frame);
        }
        .work-section * { box-sizing: border-box; }
        .work-card {
          position: relative;
          overflow: clip;
          min-height: calc(100vh - 24px);
          border-radius: 40px;
          background-color: var(--card-bg) !important;
          color: var(--card-text);
          box-sizing: border-box;
          transition: background-color .3s ease, color .3s ease;
        }
      `}</style>
      <div className="work-card linen">
        <WorkInProgress />
      </div>
    </div>
  );
}
