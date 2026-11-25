import DotMatrixHeading from "./components/DotMatrixHeading";

interface AboutProps {
  theme?: "light" | "dark";
}

export default function About({ theme = "light" }: AboutProps) {
  return (
    <div className={`about-track ${theme} linen`}>
      <style>{`
        .about-track {
          --ink: #292929;
          --cream: #d8d5ce;
          padding: 12px;
          position: relative;
          box-sizing: border-box;
          transition: background .3s ease;
        }
        .about-track.dark {
          --frame: var(--cream);
          --card-bg: var(--ink);
          --card-text: var(--cream);
          background: var(--frame);
        }
        .about-track.light {
          --frame: var(--ink);
          --card-bg: var(--cream);
          --card-text: var(--ink);
          background: var(--frame);
        }
        .about-card {
          position: relative;
          overflow: clip;
          border-radius: 40px;
          background-color: var(--card-bg) !important;
          color: var(--card-text);
          box-sizing: border-box;
          transition: background-color .3s ease, color .3s ease;
        }
      `}</style>
      <div className="about-card linen">
        <DotMatrixHeading length={2.5} />
      </div>
    </div>
  );
}
