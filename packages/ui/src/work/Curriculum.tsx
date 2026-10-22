// The BSc program by year and quartile (Notes). Each course: code, name with its type, credits (read as "5 ECTS").
export interface CurriculumYear {
  n: number;
  /** "Sep 2025 – Jul 2026" */
  dates: string;
  /** "complete · 60 ECTS" */
  line: string;
  quartiles: { state: string; courses: { code: string; name: string; type: string; ects?: number }[] }[];
}

export function Curriculum({ years }: { years: CurriculumYear[] }) {
  return years.map((y) => (
    <div className="cur col-full" key={y.n}>
      <h3 className="cur__year">{`Year ${y.n} `}<span className="mono">{y.dates}</span> <span className="mono">{y.line}</span></h3>
      <ol className="cur__q">
        {y.quartiles.map((q, i) => (
          <li className="cur__quart" key={i}>
            <h4 className="cur__qname">{`Q${i + 1} · ${q.state}`}</h4>
            <ul className="cur__list">
              {q.courses.map((c, j) => (
                <li className="cur__course" key={j}>
                  <span className="cur__code">{c.code}</span>
                  <span className="cur__name">{`${c.name} `}<span className="cur__type">{c.type}</span></span>
                  <span className="cur__ects">{c.ects !== undefined && <>{c.ects}<span className="vh"> ECTS</span></>}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  ));
}
