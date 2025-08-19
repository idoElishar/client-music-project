import { useMemo } from "react";
import { PIANO_NOTES, GUITAR_NOTES, FLUTE_NOTES, DRUM_ROWS } from "../lib/constants";

export default function useRows(selected) {
  return useMemo(() => {
    const list = [];
    if (selected.piano) {
      PIANO_NOTES.forEach((note) =>
        list.push({ key: `piano:${note}`, inst: "piano", label: `Piano ${note}`, value: note })
      );
    }
    if (selected.guitar) {
      GUITAR_NOTES.forEach((note) =>
        list.push({ key: `guitar:${note}`, inst: "guitar", label: `Guitar ${note}`, value: note })
      );
    }
    if (selected.flute) {
      FLUTE_NOTES.forEach((note) =>
        list.push({ key: `flute:${note}`, inst: "flute", label: `Flute ${note}`, value: note })
      );
    }
    if (selected.drums) {
      DRUM_ROWS.forEach((part) =>
        list.push({ key: `drums:${part}`, inst: "drums", label: `Drums ${part}`, value: part })
      );
    }
    return list;
  }, [selected]);
}
