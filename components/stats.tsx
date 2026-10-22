const STATS = [
  { value: "03", label: "Compositions in the archive" },
  { value: "2024", label: "Year of the first accord" },
  { value: "300+", label: "Raw materials in the organ" },
  { value: "21%", label: "Parfum concentration, Vol. I" },
];

export default function Stats() {
  return (
    <section
      className="section section--dark stats"
      aria-label="NOIRÉ at a glance"
    >
      <ul className="stats-grid edge" data-reveal-group>
        {STATS.map((stat) => (
          <li className="stat" key={stat.label} data-reveal-child>
            <span className="stat-value">{stat.value}</span>
            <span className="stat-label">{stat.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
