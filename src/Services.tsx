import ServicesPanels from "./components/ServicesPanels";

interface ServicesProps {
  theme?: "light" | "dark";
}

export default function Services({ theme = "light" }: ServicesProps) {
  return (
    <div className={`services-section ${theme} linen`}>
      <style>{`
        .services-section {
          --ink: #292929;
          --cream: #d8d5ce;
          min-height: 100vh;
          padding: 12px;
          box-sizing: border-box;
          transition: background .3s ease, color .3s ease;
        }
        .services-section.dark {
          --frame: var(--cream);
          --card-bg: var(--ink);
          --card-text: var(--cream);
          background: var(--frame);
        }
        .services-section.light {
          --frame: var(--ink);
          --card-bg: var(--cream);
          --card-text: var(--ink);
          background: var(--frame);
        }
        .services-card {
          position: relative;
          overflow: clip;
          min-height: calc(100vh - 24px);
          border-radius: 40px;
          background-color: var(--card-bg) !important;
          color: var(--card-text);
          display: flex;
          flex-direction: column;
          align-items: stretch;
          justify-content: center;
          transition: background-color .3s ease, color .3s ease;
        }
      `}</style>
      <div className="services-card linen">
        <ServicesPanels />
      </div>
    </div>
  );
}
