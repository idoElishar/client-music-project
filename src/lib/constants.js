export const API_BASE = "http://localhost:8008";

export const PIANO_NOTES  = ["C4","D4","E4","F4","G4","A4","B4","C5"];
export const GUITAR_NOTES = ["E3","A3","D4","G4","B4","E5"];
export const FLUTE_NOTES  = ["C5","D5","E5","F5","G5","A5","B5","C6"];
export const DRUM_ROWS    = ["Kick","Snare","Hi-Hat"];

export const DEFAULT_SELECTED = {
  piano: true, drums: false, guitar: false, flute: false,
};

export const SAMPLE_MAPS = {
  piano: {
    C4: "/samples/piano/C4.mp3", D4: "/samples/piano/D4.mp3",
    E4: "/samples/piano/E4.mp3", F4: "/samples/piano/F4.mp3",
    G4: "/samples/piano/G4.mp3", A4: "/samples/piano/A4.mp3",
    B4: "/samples/piano/B4.mp3", C5: "/samples/piano/C5.mp3",
  },
  guitar: {
    E3: "/samples/guitar/E3.mp3", A3: "/samples/guitar/A3.mp3",
    D4: "/samples/guitar/D4.mp3", G4: "/samples/guitar/G4.mp3",
    B4: "/samples/guitar/B4.mp3", E5: "/samples/guitar/E5.mp3",
  },
  flute: {
    C5: "/samples/flute/C5.mp3", D5: "/samples/flute/D5.mp3",
    E5: "/samples/flute/E5.mp3", F5: "/samples/flute/F5.mp3",
    G5: "/samples/flute/G5.mp3", A5: "/samples/flute/A5.mp3",
    B5: "/samples/flute/B5.mp3", C6: "/samples/flute/C6.mp3",
  },
  drums: {
    Kick: "/samples/drums/kick.mp3",
    Snare: "/samples/drums/snare.mp3",
    "Hi-Hat": "/samples/drums/hihat.mp3",
  },
};
