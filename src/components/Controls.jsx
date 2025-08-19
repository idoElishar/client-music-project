export default function Controls({
    cols, setCols, bpm, setBpm,
    loopEnabled, setLoopEnabled,
    volumeDb, setVolumeDb,
    isPlaying, onPlay, onStop, onRewind,
    onLoadSamples, loadingSamples,
    onSave, onLoadLatest, stateIdToLoad, setStateIdToLoad, onLoadById,
    lastMessage,
    children
  }) {
    return (
      <div className="controls">
        {children }
  
        <label className="control">
          <span>עמודות</span>
          <input type="number" min={1} max={64} value={cols}
            onChange={(e) => setCols(Math.max(1, Math.min(64, Number(e.target.value) || 1)))}
            className="input" />
        </label>
  
        <label className="control">
          <span>BPM</span>
          <input type="number" min={40} max={220} value={bpm}
            onChange={(e) => setBpm(Math.max(40, Math.min(220, Number(e.target.value) || 40)))}
            className="input" />
        </label>
  
        {!isPlaying ? (
          <button onClick={onPlay} className="btn btn-primary">▶︎ נגן</button>
        ) : (
          <button onClick={onStop} className="btn btn-danger">■ עצור</button>
        )}
        <button onClick={onRewind} className="btn btn-ghost">↺ להתחלה</button>
  
        <button
          onClick={() => setLoopEnabled(v => !v)}
          className={`btn btn-toggle ${loopEnabled ? "on" : "off"}`}
          title="לופ על הגריד"
        >
          {loopEnabled ? "Loop: ON" : "Loop: OFF"}
        </button>
  
        <label className="control volume">
          <span>ווליום</span>
          <input type="range" min={-60} max={0} step={1} value={volumeDb}
            onChange={(e) => setVolumeDb(Number(e.target.value))}
            className="slider" />
          <span className="volValue">{volumeDb} dB</span>
        </label>
  
        <button onClick={onLoadSamples} className="btn btn-primary" disabled={loadingSamples}>
          {loadingSamples ? "טוען דגימות..." : "טען דגימות"}
        </button>
  
        <button onClick={onSave} className="btn btn-ghost" title="שמור מצב לשרת">שמור מצב</button>
        <button onClick={onLoadLatest} className="btn btn-ghost" title="טען מצב אחרון">טען מצב אחרון</button>
  
        <div className="control" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            value={stateIdToLoad}
            onChange={(e) => setStateIdToLoad(e.target.value)}
            placeholder="מזהה מצב לטעינה"
            className="input"
            style={{ width: 220 }}
          />
          <button onClick={onLoadById} className="btn btn-primary">טען לפי מזהה</button>
        </div>
  
        {lastMessage && <span className="subtitle" style={{ marginInlineStart: 8 }}>{lastMessage}</span>}
      </div>
    );
  }
  