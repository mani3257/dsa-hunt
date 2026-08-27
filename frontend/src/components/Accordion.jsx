import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export default function Accordion({
  title,
  subtitle,
  solved,
  total,
  defaultOpen = false,
  forceOpen = false,
  children,
}) {
  const [manuallyOpened, setManuallyOpened] = useState(defaultOpen);
  const sectionRef = useRef(null);
  const open = manuallyOpened || forceOpen;

  const percentage = total ? Math.round((solved / total) * 100) : 0;

  return (
    <section className="accordion" ref={sectionRef}>
      <button
        type="button"
        className="accordion-header"
        onClick={() => setManuallyOpened((v) => !v)}
        aria-expanded={open}
      >
        <div className="accordion-header-left">
          <ChevronDown size={16} className={`accordion-chevron ${open ? "open" : ""}`} />
          <div>
            <h2>{title}</h2>
            {subtitle && <span className="accordion-subtitle">{subtitle}</span>}
          </div>
        </div>

        <div className="accordion-header-right">
          <div className="accordion-mini-bar">
            <span style={{ width: `${percentage}%` }} />
          </div>
          <span className="accordion-count">
            {solved}/{total}
          </span>
        </div>
      </button>

      {open && <div className="accordion-body">{children}</div>}
    </section>
  );
}
