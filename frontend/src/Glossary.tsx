const TERMS: { term: string; definition: string }[] = [
  { term: "ACWR", definition: "Acute:chronic workload ratio. This week's training load compared with the past four weeks' average. Near 1.0 is the standard optimal range." },
  { term: "RPE", definition: "Rate of perceived exertion, 0 to 10. How hard the session felt to the athlete, not a device measurement." },
  { term: "Stable", definition: "ACWR sits in the standard optimal range. No flag raised." },
  { term: "Watch", definition: "ACWR is trending low or into caution territory. Worth a check-in, not an emergency." },
  { term: "Elevated", definition: "ACWR is above the standard caution threshold. This is a load-management flag, not an injury diagnosis." },
  { term: "Confidence", definition: "How much logged history backs this score. Under 28 days of data, scores are marked less reliable." },
];

export function Glossary() {
  return (
    <div className="glossary">
      <p className="section-title">What these terms mean</p>
      {TERMS.map(({ term, definition }) => (
        <details className="glossary-item" key={term}>
          <summary>{term}</summary>
          <p>{definition}</p>
        </details>
      ))}
    </div>
  );
}