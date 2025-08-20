import React, { useState } from "react";
import "./App.css";
import InstrumentPicker from "./components/pages/grid/InstrumentPicker";
import Controls from "./components/pages/grid/Controls";
import Grid from "./components/pages/grid/Grid";
import useRows from "./hooks/useRows";
import useGrid from "./hooks/useGrid";
import useAudioEngine from "./hooks/useAudioEngine";
import { DEFAULT_SELECTED } from "./lib/constants";
import { getStateById,getLatestState,postSaveState } from "./lib/api";

export default function App() {
  const [selected, setSelected] = useState(DEFAULT_SELECTED);
  const [cols, setCols] = useState(8);
  const [bpm, setBpm] = useState(110);
  const [loopEnabled, setLoopEnabled] = useState(true);
  const [volumeDb, setVolumeDb] = useState(-6);
  const [stateIdToLoad, setStateIdToLoad] = useState("");
  const [lastMessage, setLastMessage] = useState(null);
  const rows = useRows(selected);
  const { grid, setGrid, toggleCell, clearGrid } = useGrid(rows, cols);

  const {
    isPlaying, playhead, handlePlay, handleStop,
    loadingSamples, loadSamplesForSelected,
    rewindToStart, setPlayhead,
  } = useAudioEngine({ volumeDb, bpm, rows, cols, grid, loopEnabled });

  const toggleInstrument = (key) => setSelected((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSave = async () => {
    const payload = {
      bpm, cols, loopEnabled, volumeDb,
      instrumentsSelected: selected,
      rows: rows.map(r => r.label),
      grid,
      savedAt: Date.now(),
      userName:localStorage.getItem("userName")
    };
    const resp = await postSaveState(payload);
    setLastMessage(resp?.ok ? `נשמר לשרת! (מזהה: ${resp.id})` : "שמירה נכשלה");
  };

  const applyLoadedState = (state) => {
    if (!state) return;
    const sel = { piano: false, guitar: false, flute: false, drums: false };
    for (const lbl of state.rows || []) {
      if (/^Piano\b/i.test(lbl)) sel.piano = true;
      else if (/^Guitar\b/i.test(lbl)) sel.guitar = true;
      else if (/^Flute\b/i.test(lbl)) sel.flute = true;
      else if (/^Drums\b/i.test(lbl)) sel.drums = true;
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

  const handleLoadLatest = async () => {
    const state = await getLatestState();
    if (!state) return setLastMessage("לא נמצא מצב אחרון לטעינה.");
    applyLoadedState(state);
  };

  const handleLoadById = async () => {
    if (!stateIdToLoad.trim()) return;
    const state = await getStateById(stateIdToLoad.trim());
    if (!state) return setLastMessage("מצב לא נמצא לפי המזהה שסופק.");
    applyLoadedState(state);
  };

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <div className="titleBlock">
            <h1 className="title">בונה מקצבים</h1>
           
          </div>

          <Controls
            cols={cols} setCols={setCols}
            bpm={bpm} setBpm={setBpm}
            loopEnabled={loopEnabled} setLoopEnabled={setLoopEnabled}
            volumeDb={volumeDb} setVolumeDb={setVolumeDb}
            isPlaying={isPlaying}
            onPlay={handlePlay} onStop={handleStop} onRewind={rewindToStart}
            onLoadSamples={() => loadSamplesForSelected(selected, setLastMessage)}
            loadingSamples={loadingSamples}
            onSave={handleSave}
            onLoadLatest={handleLoadLatest}
            stateIdToLoad={stateIdToLoad} setStateIdToLoad={setStateIdToLoad}
            onLoadById={handleLoadById}
            lastMessage={lastMessage}
          >
            <InstrumentPicker selected={selected} onToggle={toggleInstrument} />
          </Controls>
        </header>
        <Grid rows={rows} cols={cols} grid={grid} playhead={playhead} onToggle={toggleCell} />
        <p className="hint">
          {' '}<button className="btn btn-ghost" onClick={clearGrid}>נקה</button>
        </p>
      </div>
    </div>
  );
}