import React, { useMemo, useState } from "react";
import "./Grid.css";

export default function Grid({ rows, cols, grid, playhead, onToggle, cellSize = 36 }) {
  const groups = useMemo(() => {
    const by = new Map();
    rows.forEach((r, idx) => {
      if (!by.has(r.inst)) by.set(r.inst, []);
      by.get(r.inst).push({ rowObj: r, rowIndex: idx });
    });
    const order = ["piano", "guitar", "flute", "drums"];
    return order
      .filter((k) => by.has(k))
      .map((k) => ({ key: k, title: titleFor(k), rows: by.get(k) }));
  }, [rows]);

  const [open, setOpen] = useState(() => {
    const o = {};
    ["piano", "guitar", "flute", "drums"].forEach((k) => (o[k] = true));
    return o;
  });

  const toggleGroup = (k) => setOpen((prev) => ({ ...prev, [k]: !prev[k] }));

  return (
    <div className="gridWrapper" dir="rtl">
      <div
        className="grid"
        style={{
          gridTemplateColumns: `180px repeat(${cols}, var(--cell-size))`,
          ["--cell-size"]: `${cellSize}px`,
        }}
      >
        <div className="rowLabel headerCell stickyHeader">כלי / תווים</div>
        {Array.from({ length: cols }).map((_, c) => (
          <div key={`colh-${c}`} className={`colHeader stickyHeader ${playhead === c ? "playcol" : ""}`}>
            {c + 1}
          </div>
        ))}

        {groups.map((g) => (
          <React.Fragment key={`group-${g.key}`}>
            <div className="groupHeader rowLabel" title={g.title}>
              <button className="groupToggle" onClick={() => toggleGroup(g.key)}>
                {open[g.key] ? "▾" : "▸"} {g.title}
              </button>
            </div>
            {Array.from({ length: cols }).map((_, c) => (
              <div key={`gh-${g.key}-${c}`} className="groupHeaderCell" />
            ))}

            {open[g.key] &&
              g.rows.map(({ rowObj, rowIndex }) => (
                <React.Fragment key={rowObj.key}>
                  <div className="rowLabel">{rowObj.label}</div>
                  {Array.from({ length: cols }).map((_, c) => {
                    const active = grid[rowIndex]?.[c] ?? false;
                    const isPlayCol = playhead === c;
                    return (
                      <button
                        key={`${rowIndex}-${c}`}
                        onClick={() => onToggle(rowIndex, c)}
                        className={`cell ${active ? "active" : ""} ${isPlayCol ? "playcol" : ""}`}
                        title={`${rowObj.label} – צעד ${c + 1}`}
                      >
                        {active ? "●" : ""}
                      </button>
                    );
                  })}
                </React.Fragment>
              ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function titleFor(inst) {
  switch (inst) {
    case "piano":
      return "🎹 פסנתר";
    case "guitar":
      return "🎸 גיטרה";
    case "flute":
      return "🎼 חליל";
    case "drums":
      return "🥁 תופים";
    default:
      return inst;
  }
}