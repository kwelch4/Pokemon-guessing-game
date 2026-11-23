export default function Field({ label, value, onChange, options, disabled }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}