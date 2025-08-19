import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import { fetchSamplesMapping } from "../lib/api";

export default function useAudioEngine({ volumeDb, bpm, rows, cols, grid, loopEnabled }) {
  const polysRef = useRef({ piano: null, guitar: null, flute: null });
  const drumsRef = useRef({ Kick: null, Snare: null, "Hi-Hat": null });
  const sampleSamplersRef = useRef({ piano: null, guitar: null, flute: null });
  const drumPlayersRef = useRef(null);

  const [useSamples, setUseSamples] = useState(false);
  const [loadingSamples, setLoadingSamples] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(-1);
  const repeatIdRef = useRef(null);

  const lastTriggerRef = useRef({ Kick: -Infinity, Snare: -Infinity, HiHat: -Infinity });

  useEffect(() => {
    polysRef.current.piano = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sawtooth" },
      envelope: { attack: 0.005, decay: 0.2, sustain: 0.2, release: 0.5 },
    }).toDestination();
    polysRef.current.guitar = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0.4, release: 0.6 },
    }).toDestination();
    polysRef.current.flute = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sine" },
      envelope: { attack: 0.15, decay: 0.05, sustain: 0.8, release: 1.2 },
    }).toDestination();
    Object.values(polysRef.current).forEach((p) => p.set({ volume: -6 }));

    drumsRef.current.Kick = new Tone.MembraneSynth({
      pitchDecay: 0.02, octaves: 6,
      envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 0.2 },
    }).toDestination();
    drumsRef.current.Snare = new Tone.NoiseSynth({
      noise: { type: "white" }, envelope: { attack: 0.001, decay: 0.2, sustain: 0 },
    }).toDestination();
    drumsRef.current["Hi-Hat"] = new Tone.NoiseSynth({
      noise: { type: "white" }, envelope: { attack: 0.001, decay: 0.05, sustain: 0 },
    }).toDestination();

    Tone.Destination.volume.value = volumeDb;

    return () => {
      try { Tone.Transport.cancel(); Tone.Transport.stop(); } catch {}
      if (repeatIdRef.current) Tone.Transport.clear(repeatIdRef.current);
      Object.values(polysRef.current).forEach((p) => p?.dispose?.());
      Object.values(drumsRef.current).forEach((d) => d?.dispose?.());
      Object.values(sampleSamplersRef.current).forEach((s) => s?.dispose?.());
      drumPlayersRef.current?.dispose?.();
    };
  }, []);

  useEffect(() => { Tone.Transport.bpm.value = bpm; }, [bpm]);
  useEffect(() => { Tone.Destination.volume.value = volumeDb; }, [volumeDb]);

  const rewindToStart = () => {
    setPlayhead(-1);
    lastTriggerRef.current = { Kick: -Infinity, Snare: -Infinity, HiHat: -Infinity };
    try { Tone.Transport.position = 0; } catch {}
  };

  const handlePlay = async () => {
    await Tone.start();
    try {
      Tone.Transport.cancel(0);
      if (repeatIdRef.current) Tone.Transport.clear(repeatIdRef.current);
    } catch {}
    rewindToStart();

    const EPS = 1e-3;
    repeatIdRef.current = Tone.Transport.scheduleRepeat((time) => {
      setPlayhead((prev) => {
        const next = (prev + 1) % cols;

        const act = [];
        for (let r = 0; r < rows.length; r++) if (grid[r]?.[next]) act.push(rows[r]);

        if (act.length) {
          if (useSamples) {
            const chordByInst = new Map();
            act.filter(r => r.inst !== "drums").forEach(r => {
              const a = chordByInst.get(r.inst) || []; a.push(r.value); chordByInst.set(r.inst, a);
            });
            chordByInst.forEach((notesArr, inst) => {
              const s = sampleSamplersRef.current[inst];
              if (s && notesArr.length) s.triggerAttackRelease(notesArr, "8n", time + EPS);
            });
            act.filter(r => r.inst === "drums").forEach(({ value: part }) => {
              const key = part === "Hi-Hat" ? "HiHat" : part;
              let t = time, last = lastTriggerRef.current[key] ?? -Infinity;
              if (!(t > last)) t = last + EPS;
              lastTriggerRef.current[key] = t;
              drumPlayersRef.current?.get(part)?.start(t);
            });
          } else {
            const chordByInst = new Map();
            act.filter(r => r.inst !== "drums").forEach(r => {
              const a = chordByInst.get(r.inst) || []; a.push(r.value); chordByInst.set(r.inst, a);
            });
            chordByInst.forEach((notesArr, inst) => {
              const p = polysRef.current[inst];
              if (p && notesArr.length) p.triggerAttackRelease(notesArr, "8n", time + EPS);
            });
            act.filter(r => r.inst === "drums").forEach(({ value: part }) => {
              const key = part === "Hi-Hat" ? "HiHat" : part;
              const s = key === "Kick" ? drumsRef.current.Kick
                      : key === "Snare" ? drumsRef.current.Snare
                      : drumsRef.current["Hi-Hat"];
              if (!s) return;
              let t = time, last = lastTriggerRef.current[key] ?? -Infinity;
              if (!(t > last)) t = last + EPS;
              lastTriggerRef.current[key] = t;
              if (key === "Kick") s.triggerAttackRelease("C2", "8n", t);
              else if (key === "Snare") s.triggerAttackRelease("16n", t);
              else s.triggerAttackRelease("32n", t);
            });
          }
        }

        if (!loopEnabled && next === cols - 1) {
          setTimeout(() => { Tone.Transport.stop(); setIsPlaying(false); }, 0);
        }
        return next;
      });
    }, "8n");

    Tone.Transport.start();
    setIsPlaying(true);
  };

  const handleStop = () => {
    Tone.Transport.stop();
    setIsPlaying(false);
    rewindToStart();
  };

  const loadSamplesForSelected = async (instruments, setLastMessage) => {
    setLoadingSamples(true);
    setLastMessage?.(null);
    await Tone.start();
    try {
      const melodic = ["piano", "guitar", "flute"];
      for (const inst of melodic) {
        if (!instruments[inst]) continue;
        const { mapping } = await fetchSamplesMapping(inst);
        sampleSamplersRef.current[inst]?.dispose?.();
        sampleSamplersRef.current[inst] = new Tone.Sampler(mapping).toDestination();
        sampleSamplersRef.current[inst]?.set({ volume: -6 });
      }
      if (instruments.drums) {
        const { mapping: drumMap } = await fetchSamplesMapping("drums");
        drumPlayersRef.current?.dispose?.();
        drumPlayersRef.current = new Tone.Players(drumMap).toDestination();
      }
      setUseSamples(true);
      setLastMessage?.("דגימות נטענו מהשרת/פולבאק בהצלחה.");
    } catch (e) {
      console.error(e);
      setUseSamples(false);
      setLastMessage?.("טעינת דגימות נכשלה — נמשיך עם סינתים.");
    } finally {
      setLoadingSamples(false);
    }
  };

  return {
    isPlaying, playhead, handlePlay, handleStop,
    useSamples, loadingSamples, loadSamplesForSelected,
    rewindToStart, setPlayhead,
  };
}
