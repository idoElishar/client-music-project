import React from "react";

export default function Grid({ rows, cols, grid, playhead, onToggle, cellSize = 36 }) {
  return (
    <div className="gridWrapper">
      <div
        className="grid"
        style={{
          gridTemplateColumns: `180px repeat(${cols}, var(--cell-size))`,
          ["--cell-size"]: `${cellSize}px`,
        }}
      >
        <div className="rowLabel headerCell">שורה / צעד</div>
        {Array.from({ length: cols }).map((_, c) => (
          <div key={`colh-${c}`} className={`colHeader ${playhead === c ? "playcol" : ""}`}>
            {c + 1}
          </div>
        ))}

        {rows.map((rowObj, r) => (
          <React.Fragment key={rowObj.key}>
            <div className="rowLabel">{rowObj.label}</div>
            {Array.from({ length: cols }).map((_, c) => {
              const active = grid[r]?.[c] ?? false;
              const isPlayCol = playhead === c;
              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => onToggle(r, c)}
                  className={`cell ${active ? "active" : ""} ${isPlayCol ? "playcol" : ""}`}
                  title={`${rowObj.label} @ צעד ${c + 1}`}
                >
                  {active ? "●" : ""}
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
