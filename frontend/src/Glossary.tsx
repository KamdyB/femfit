// frontend/src/Glossary.tsx
import { useState } from "react";

const TERMS: { term: string; definition: string }[] = [
  { term: "ACWR", definition: "Acute:chronic workload ratio. This week's training load compared with the past four weeks' average. Near 1.0 is the standard optimal range." },
  { term: "RPE", definition: "Rate of perceived exertion, 0 to 10. How hard the session felt to the athlete, not a device measurement." },
  { term: "Stable", definition: "ACWR sits in the standard optimal range. No flag raised." },
  { term: "Watch", definition: "ACWR is trending low or into caution territory. Worth a check-in, not an emergency." },
  { term: "Elevated", definition: "ACWR is above the standard caution threshold. This is a load-management flag, not an injury diagnosis." },
  { term: "Confidence", definition: "How much logged history backs this score. Under 28 days of data, scores are marked less reliable." },
];

export function Glossary() {
  const [openTerm, setOpenTerm] = useState<string | null>(null);

  return (
    <div className="glossary">
      <p className="section-title">What these terms mean</p>
      {TERMS.map(({ term, definition }) => {
        const isOpen = openTerm === term;
        return (
          <div className="glossary-item" key={term}>
            <button
              type="button"
              className="glossary-item__trigger"
              onClick={() => setOpenTerm(isOpen ? null : term)}
              aria-expanded={isOpen}
            >
              <span>{term}</span>
              <span className={`glossary-item__chevron ${isOpen ? "is-open" : ""}`} aria-hidden="true">
                &#8250;
              </span>
            </button>
            <div className={`glossary-item__body ${isOpen ? "is-open" : ""}`}>
              <div className="glossary-item__inner">
                <p>{definition}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}