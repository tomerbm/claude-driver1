// Generate sounds using the Web Audio API — no external files needed

function ctx() {
  if (!window._audioCtx) {
    window._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return window._audioCtx;
}

function beep({ frequency = 880, duration = 0.12, type = "sine", volume = 0.4, delay = 0 } = {}) {
  try {
    const c = ctx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, c.currentTime + delay);

    gain.gain.setValueAtTime(0, c.currentTime + delay);
    gain.gain.linearRampToValueAtTime(volume, c.currentTime + delay + 0.01);
    gain.gain.linearRampToValueAtTime(0, c.currentTime + delay + duration);

    osc.start(c.currentTime + delay);
    osc.stop(c.currentTime + delay + duration + 0.01);
  } catch (_) {}
}

// Two ascending tones — package recognized
export function playSuccess() {
  beep({ frequency: 880, duration: 0.1, delay: 0 });
  beep({ frequency: 1320, duration: 0.15, delay: 0.1 });
}

// Low descending buzz — unrecognized barcode
export function playError() {
  beep({ frequency: 220, duration: 0.18, type: "sawtooth", volume: 0.35, delay: 0 });
  beep({ frequency: 160, duration: 0.22, type: "sawtooth", volume: 0.25, delay: 0.15 });
}
