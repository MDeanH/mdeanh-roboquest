// audio.js — procedural chiptune SFX via WebAudio. No assets needed.
window.RQ = window.RQ || {};

RQ.audio = (() => {
  let ctx = null;
  let muted = false;
  let musicTimer = null;
  let musicStep = 0;
  let musicMode = null;

  function ensure() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { ctx = null; }
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // One square/triangle/noise blip. freq in Hz, dur in seconds.
  function tone(freq, dur, type = 'square', vol = 0.08, slideTo = null, delay = 0) {
    const c = ensure();
    if (!c || muted) return;
    const t0 = c.currentTime + delay;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + dur);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  function noise(dur, vol = 0.08, delay = 0) {
    const c = ensure();
    if (!c || muted) return;
    const t0 = c.currentTime + delay;
    const len = Math.max(1, Math.floor(c.sampleRate * dur));
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = c.createBufferSource();
    const g = c.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.buffer = buf;
    src.connect(g).connect(c.destination);
    src.start(t0);
  }

  // ---- Tiny looping basslines per scene (square wave, 8 steps) ----
  const TRACKS = {
    title:    [110, 0, 110, 0, 131, 0, 98, 0],
    level:    [130.8, 0, 164.8, 0, 196, 0, 164.8, 0],
    workshop: [98, 0, 123.5, 0, 147, 0, 123.5, 0],
    boss:     [82.4, 82.4, 0, 82.4, 98, 0, 73.4, 0],
    victory:  [131, 0, 165, 0, 196, 0, 262, 0],
  };

  function musicTick() {
    if (!musicMode || muted) return;
    const seq = TRACKS[musicMode];
    if (!seq) return;
    const f = seq[musicStep % seq.length];
    if (f) {
      tone(f, 0.22, 'triangle', 0.035);
      if (musicStep % 4 === 0) tone(f * 2, 0.08, 'square', 0.02);
    }
    musicStep++;
  }

  function music(mode) {
    musicMode = mode;
    musicStep = 0;
    if (musicTimer) clearInterval(musicTimer);
    if (mode) musicTimer = setInterval(musicTick, 240);
  }

  return {
    unlock: ensure,
    toggleMute() { muted = !muted; return muted; },
    get muted() { return muted; },
    music,
    jump()    { tone(300, 0.14, 'square', 0.07, 620); },
    pickup()  { tone(660, 0.08, 'square', 0.06); tone(990, 0.12, 'square', 0.05, null, 0.06); },
    hurt()    { tone(220, 0.22, 'sawtooth', 0.09, 60); noise(0.12, 0.06); },
    stomp()   { tone(500, 0.1, 'square', 0.07, 140); noise(0.06, 0.05); },
    blip()    { tone(880, 0.05, 'square', 0.045); },
    term()    { tone(520, 0.06, 'square', 0.05); tone(780, 0.07, 'square', 0.04, null, 0.07); },
    good()    { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.12, 'square', 0.06, null, i * 0.07)); },
    bad()     { tone(180, 0.35, 'sawtooth', 0.1, 90); },
    bossHit() { tone(300, 0.18, 'square', 0.08, 90); noise(0.15, 0.08); },
    zap()     { tone(1200, 0.12, 'sawtooth', 0.05, 300); noise(0.08, 0.04); },
    part()    { [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, 0.14, 'square', 0.07, null, i * 0.09)); },
    fanfare() {
      [523, 523, 523, 659, 784, 784, 1047].forEach((f, i) =>
        tone(f, 0.16, 'square', 0.07, null, i * 0.13));
    },
    death()   { tone(440, 0.5, 'square', 0.08, 55); },
    select()  { tone(440, 0.05, 'square', 0.05); tone(660, 0.06, 'square', 0.05, null, 0.05); },
  };
})();
