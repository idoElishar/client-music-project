import React, { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import Controls from "./components/Controls";
import Grid from "./components/Grid";
import useAudioEngine from "./hooks/useAudioEngine";

export default function App() {
  const PIANO_NOTES = useMemo(() => ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"], []);
  const GUITAR_NOTES = useMemo(() => ["E3", "A3", "D4", "G4", "B4", "E5"], []);
  const FLUTE_NOTES = useMemo(() => ["C5", "D5", "E5", "F5", "G5", "A5", "B5", "C6"], []);
  const DRUM_ROWS = useMemo(() => ["Kick", "Snare", "Hi-Hat"], []);

  const [selected, setSelected] = useState({
    piano: true,
    drums: false,
    guitar: false,
    flute: false,
  });

  const [cols, setCols] = useState(8);
  const [bpm, setBpm] = useState(110);
  const [loopEnabled, setLoopEnabled] = useState(true);
  const [volumeDb, setVolumeDb] = useState(-6);

  const [lastMessage, setLastMessage] = useState(null);
  const [stateIdToLoad, setStateIdToLoad] = useState("");

  const rows = useMemo(() => {
    const list = [];
    if (selected.piano) PIANO_NOTES.forEach(n => list.push({ key: `piano:${n}`, inst: "piano", label: `פסנתר ${n}`, value: n }));
    if (selected.guitar) GUITAR_NOTES.forEach(n => list.push({ key: `guitar:${n}`, inst: "guitar", label: `גיטרה ${n}`, value: n }));
    if (selected.flute) FLUTE_NOTES.forEach(n => list.push({ key: `flute:${n}`, inst: "flute", label: `חליל ${n}`, value: n }));
    if (selected.drums) DRUM_ROWS.forEach(p => list.push({ key: `drums:${p}`, inst: "drums", label: `תופים ${p}`, value: p }));
    return list;
  }, [selected, PIANO_NOTES, GUITAR_NOTES, FLUTE_NOTES, DRUM_ROWS]);

  const [grid, setGrid] = useState(() =>
    Array.from({ length: rows.length }, () => Array(cols).fill(false))
  );

  useEffect(() => {
    setGrid(prev =>
      prev.map(row =>
        cols > row.length ? [...row, ...Array(cols - row.length).fill(false)] : row.slice(0, cols)
      )
    );
  }, [cols]);

  const prevRowKeysRef = useRef([]);
  useEffect(() => {
    setGrid(prev => {
      const next = Array.from({ length: rows.length }, () => Array(cols).fill(false));
      const prevKeys = prevRowKeysRef.current;
      const keyToPrevIndex = new Map(prevKeys.map((k, i) => [k, i]));

      rows.forEach((rowObj, newIdx) => {
        const prevIdx = keyToPrevIndex.get(rowObj.key);
        if (prevIdx != null && prev[prevIdx]) {
          const oldRow = prev[prevIdx];
          next[newIdx] =
            cols > oldRow.length
              ? [...oldRow, ...Array(cols - oldRow.length).fill(false)]
              : oldRow.slice(0, cols);
        }
      });

      prevRowKeysRef.current = rows.map(r => r.key);
      return next;
    });
  }, [rows, cols]);

  const {
    isPlaying, playhead,
    handlePlay, handleStop,
    rewindToStart, setPlayhead,
  } = useAudioEngine({
    volumeDb, bpm, rows, cols, grid, loopEnabled,
    autoLoad: true,
    selectedInstruments: selected,
  });

  const toggleCell = (r, c) => {
    if (isPlaying) handleStop();
    setGrid(prev => {
      const copy = prev.map(row => row.slice());
      if (!copy[r]) copy[r] = Array(cols).fill(false);
      if (copy[r].length < cols) copy[r] = [...copy[r], ...Array(cols - copy[r].length).fill(false)];
      copy[r][c] = !copy[r][c];
      return copy;
    });
    setPlayhead(-1);
  };

  const toggleInstrument = (k) => setSelected(prev => ({ ...prev, [k]: !prev[k] }));

  const onSave = async () => {
    const payload = {
      bpm, cols, loopEnabled, volumeDb,
      instrumentsSelected: selected,
      rows: rows.map(r => r.label),
      grid,
      savedAt: Date.now(),
    };
    const resp = await saveState(payload);
    setLastMessage(resp?.ok ? `נשמר לשרת! (id: ${resp.id})` : "שמירה נכשלה");
  };

  const applyLoadedState = (state) => {
    if (!state) return;
    const sel = { piano: false, guitar: false, flute: false, drums: false };
    for (const lbl of state.rows || []) {
      if (/^פסנתר\b/.test(lbl)) sel.piano = true;
      else if (/^גיטרה\b/.test(lbl)) sel.guitar = true;
      else if (/^חליל\b/.test(lbl)) sel.flute = true;
      else if (/^תופים\b/.test(lbl)) sel.drums = true;
    }
    setSelected(sel);
    setBpm(Number(state.bpm) || 110);
    setCols(Number(state.cols) || 8);
    setLoopEnabled(!!state.loopEnabled);
    setVolumeDb(typeof state.volumeDb === "number" ? state.volumeDb : -6);

    const srvRows = Array.isArray(state.grid) ? state.grid.length : 0;
    const srvCols = Array.isArray(state.grid?.[0]) ? state.grid[0].length : 0;
    const safeRows = Math.max(0, Math.min(srvRows, 256));
    const safeCols = Math.max(1, Math.min(srvCols || state.cols || 8, 128));

    const rebuilt = Array.from({ length: safeRows }, (_, r) =>
      Array.from({ length: safeCols }, (_, c) => !!state.grid?.[r]?.[c])
    );
    setGrid(rebuilt);
    setPlayhead(-1);
    setLastMessage(`נטען מצב מהשרת (id: ${state._id || "?"})`);
  };

  const onLoadLatest = async () => {
    const state = await getLatestState();
    if (!state) return setLastMessage("לא נמצא מצב אחרון לטעינה.");
    applyLoadedState(state);
  };

  const onLoadById = async () => {
    const id = stateIdToLoad.trim();
    if (!id) return;
    const state = await getStateById(id);
    if (!state) return setLastMessage("מצב לא נמצא לפי המזהה שסופק.");
    applyLoadedState(state);
  };
  const clearGrid = () => {
    setGrid(Array.from({ length: rows.length }, () => Array(cols).fill(false)));
    setPlayhead(-1);
  };

  return (
    <div className="app" dir="rtl">
      <div className="container">
        <header className="header">
          <div className="titleBlock">
            <h1 className="title">  בונה מקצבים </h1>
          </div>

          <Controls
            cols={cols} setCols={setCols}
            bpm={bpm} setBpm={setBpm}
            loopEnabled={loopEnabled} setLoopEnabled={setLoopEnabled}
            volumeDb={volumeDb} setVolumeDb={setVolumeDb}
            isPlaying={isPlaying}
            onPlay={handlePlay}
            onStop={handleStop}
            onRewind={rewindToStart}
            onSave={onSave}
            onLoadLatest={onLoadLatest}
            stateIdToLoad={stateIdToLoad}
            setStateIdToLoad={setStateIdToLoad}
            onLoadById={onLoadById}
            lastMessage={lastMessage}
          >
            <fieldset className="control instruments">
              <legend>בחירת כלים</legend>
              <label><input type="checkbox" checked={selected.piano} onChange={() => toggleInstrument("piano")} /> פסנתר</label>
              <label><input type="checkbox" checked={selected.drums} onChange={() => toggleInstrument("drums")} /> תופים</label>
              <label><input type="checkbox" checked={selected.guitar} onChange={() => toggleInstrument("guitar")} /> גיטרה</label>
              <label><input type="checkbox" checked={selected.flute} onChange={() => toggleInstrument("flute")} /> חליל</label>
              <small className="hintInline">
                * בחירה/ביטול כלי מוסיפה/מסירה שורות מלוח הנגינה.
              </small>
            </fieldset>
          </Controls>
        </header>

        <Grid
          rows={rows}
          cols={cols}
          grid={grid}
          playhead={playhead}
          onToggle={toggleCell}
          cellSize={36}
        />
        <p className="hint">
          {' '}<button className="btn btn-ghost" onClick={clearGrid}>נקה</button>
        </p>
      </div>
    </div>
  );
}
