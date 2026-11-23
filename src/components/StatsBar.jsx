import { accuracy } from "../utils";

export default function StatsBar({ stats }) {
  return (
    <div className="stats">
      <div><strong>{stats.correct}</strong><span>correct</span></div>
      <div><strong>{stats.total}</strong><span>guesses</span></div>
      <div><strong>{accuracy(stats)}%</strong><span>accuracy</span></div>
    </div>
  );
}