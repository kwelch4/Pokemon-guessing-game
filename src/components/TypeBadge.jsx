import { TYPE_COLORS } from "../utils";

export default function TypeBadge({ type }) {
  return (
    <span className="type-badge" style={{ background: TYPE_COLORS[type] }}>
      {type}
    </span>
  );
}