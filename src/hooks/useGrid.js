import { useEffect, useRef, useState } from "react";

export default function useGrid(rows, cols) {
  const [grid, setGrid] = useState(() =>
    Array.from({ length: rows.length }, () => Array(cols).fill(false))
  );

  useEffect(() => {
    setGrid((prev) =>
      prev.map((row) =>
        cols > row.length ? [...row, ...Array(cols - row.length).fill(false)] : row.slice(0, cols)
      )
    );
  }, [cols]);

  const prevRowKeysRef = useRef([]);
  useEffect(() => {
    setGrid((prev) => {
      const next = Array.from({ length: rows.length }, () => Array(cols).fill(false));
      const prevKeys = prevRowKeysRef.current;
      const map = new Map(prevKeys.map((k, i) => [k, i]));

      rows.forEach((rowObj, newIdx) => {
        const prevIdx = map.get(rowObj.key);
        if (prevIdx != null && prev[prevIdx]) {
          const oldRow = prev[prevIdx];
          next[newIdx] =
            cols > oldRow.length ? [...oldRow, ...Array(cols - oldRow.length).fill(false)]
                                 : oldRow.slice(0, cols);
        }
      });
      prevRowKeysRef.current = rows.map((r) => r.key);
      return next;
    });
  }, [rows, cols]);

  const toggleCell = (r, c) => {
    setGrid((prev) => {
      const copy = prev.map((row) => row.slice());
      if (!copy[r]) copy[r] = Array(cols).fill(false);
      if (copy[r].length < cols) copy[r] = [...copy[r], ...Array(cols - copy[r].length).fill(false)];
      copy[r][c] = !copy[r][c];
      return copy;
    });
  };

  const clearGrid = () => {
    setGrid(Array.from({ length: rows.length }, () => Array(cols).fill(false)));
  };

  return { grid, setGrid, toggleCell, clearGrid };
}
