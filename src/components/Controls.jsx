import React from "react";

export default function Controls({
  cols, setCols,
  bpm, setBpm,            
  loopEnabled, setLoopEnabled,
  volumeDb, setVolumeDb,
  isPlaying, onPlay, onStop, onRewind,
  onLoadSamples, loadingSamples,
  onSave, onLoadLatest, stateIdToLoad, setStateIdToLoad, onLoadById,
  lastMessage,
  children
}) {

  const baseBpm = 110;
  const speedFactor = +(bpm / baseBpm).toFixed(1);
  const speedPercent = Math.round(((volumeDb + 60) / 60) * 100);
  const volumePercent = Math.round(((volumeDb + 60) / 60) * 100);

  return (
    <div className="controlsBar" dir="rtl">
      <div className="controlsGroup">{children}</div>
      <div className="controlsGroup">
        <label className="ctrl">
          <span className="ctrlLabel">מספר צעדים</span>
          <input
            type="number"
            min={1}
            max={64}
            value={cols}
            onChange={(e) =>
              setCols(Math.max(1, Math.min(64, Number(e.target.value) || 1)))
            }
            className="input inputSm"
          />
        </label>

        <label className="ctrl">
          <span className="ctrlLabel">מהירות נגינה (פי)</span>
          <input
            type="range"
            min={0.5}
            max={3}
            step={0.1}
            value={speedFactor}
            onChange={(e) => {
              const factor = Number(e.target.value);
              setBpm(Math.round(baseBpm * factor));
            }}
            className="slider"
          />
          <div className="subNote">
            <span>×{speedFactor.toFixed(1)}</span>
            <span className="dot">•</span>
            <span>{bpm} BPM</span>
          </div>
        </label>

        <label className="ctrl">
          <span className="ctrlLabel">עוצמה</span>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={volumePercent}
            onChange={(e) => {
              const percent = Number(e.target.value);
              const db = (percent / 100) * 60 - 60; 
              setVolumeDb(db);
            }}
            className="slider"
          />
          <div className="subNote">{volumePercent}%</div>
        </label>
      </div>

      <div className="controlsGroup">
        {!isPlaying ? (
          <button onClick={onPlay} className="btn btnPrimary">▶︎ נגן</button>
        ) : (
          <button onClick={onStop} className="btn btnDanger">■ עצור</button>
        )}
        <button onClick={onRewind} className="btn btnGhost">↺ להתחלה</button>

        <button
          onClick={() => setLoopEnabled(v => !v)}
          className={`btn btnToggle ${loopEnabled ? "on" : "off"}`}
          title="הפעל/כבה לולאה"
        >
          לולאה: {loopEnabled ? "פעיל" : "כבוי"}
        </button>
      </div>

      <div className="controlsGroup">
        <button
          onClick={onLoadSamples}
          className="btn btnPrimary"
          disabled={loadingSamples}
          title="טען קבצי אודיו"
        >
          {loadingSamples ? "טוען דגימות..." : "טען דגימות"}
        </button>

        <button onClick={onSave} className="btn btnGhost">שמור מצב</button>
        <button onClick={onLoadLatest} className="btn btnGhost">טען מצב אחרון</button>

        <div className="ctrl idLoader">
          <input
            value={stateIdToLoad}
            onChange={(e) => setStateIdToLoad(e.target.value)}
            placeholder="מזהה מצב (ID)"
            className="input inputMd"
          />
          <button onClick={onLoadById} className="btn btnSecondary">טען</button>
        </div>
      </div>

      {lastMessage && <div className="toast">{lastMessage}</div>}
    </div>
  );
}
