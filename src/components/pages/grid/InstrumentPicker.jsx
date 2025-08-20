export default function InstrumentPicker({ selected, onToggle }) {
    return (
      <fieldset className="control" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <legend style={{ fontSize: 12, color: "var(--muted)" }}>כלים</legend>
        <label><input type="checkbox" checked={selected.piano}  onChange={() => onToggle("piano")}  /> פסנתר</label>
        <label><input type="checkbox" checked={selected.drums}  onChange={() => onToggle("drums")}  /> תופים</label>
        <label><input type="checkbox" checked={selected.guitar} onChange={() => onToggle("guitar")} /> גיטרה</label>
        <label><input type="checkbox" checked={selected.flute}  onChange={() => onToggle("flute")}  /> חליל</label>
      </fieldset>
    );
  }
  