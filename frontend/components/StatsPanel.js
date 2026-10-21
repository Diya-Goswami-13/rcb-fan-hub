// Loaded lazily with next/dynamic (bundle size optimization):
// this code is only downloaded when the panel is rendered.
export default function StatsPanel({ players }) {
  const roles = ["Batter", "Wicket-keeper", "All-rounder", "Bowler"];
  const total = players.length || 1;
  return (
    <div className="stats">
      {roles.map((r) => {
        const count = players.filter((p) => p.role === r).length;
        return (
          <div key={r} className="stat">
            <div className="statTop">
              <span>{r}</span>
              <b>{count}</b>
            </div>
            <div className="bar">
              <div className="fill" style={{ width: `${(count / total) * 100}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
