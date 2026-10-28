// main.js — boot, input, state machine, fixed-ish timestep loop.
(() => {
  const cv = document.getElementById('game');
  const ctx = cv.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const PARTS = ['battery', 'sensor', 'motor', 'cpu'];

  // ---------- INPUT ----------
  const keys = {};
  const pressed = {};
  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
    RQ.audio.unlock();
    const k = e.key.toLowerCase();
    if (!keys[k]) pressed[k] = true;
    keys[k] = true;
    if (k === 'm') { const m = RQ.audio.toggleMute(); flashMsg = m ? 'MUTED' : 'SOUND ON'; flashT = 1.5; }
  });
  window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

  const input = {
    get left()  { return !!(keys['arrowleft'] || keys['a']); },
    get right() { return !!(keys['arrowright'] || keys['d']); },
    get jump()  { return !!(keys[' '] || keys['arrowup'] || keys['w'] || keys['z']); },
    get use()   { return !!(keys['e'] || keys['arrowdown'] || keys['s'] || keys['enter']); },
  };
  function edge() {
    input.jumpPressed  = !!(pressed[' '] || pressed['arrowup'] || pressed['w'] || pressed['z']);
    input.usePressed   = !!(pressed['e'] || pressed['arrowdown'] || pressed['s']);
    input.enterPressed = !!(pressed['enter']);
    for (const k in pressed) pressed[k] = false;
  }

  // ---------- GAME STATE ----------
  const G = {
    scene: 'title', levelIdx: 0, world: null,
    parts: [], score: 0, t: 0,
    justInstalled: null, lastFacts: [],
  };
  window.G = G; // debug hook
  window.__input = input;
  window.__pressed = pressed;
  window.__keys = keys;
  let flashMsg = '', flashT = 0;

  function startLevel(i) {
    G.levelIdx = i;
    G.world = RQ.game.loadLevel(i);
    G.scene = 'play';
    RQ.audio.music('level');
  }
  function startBoss() {
    G.world = RQ.game.loadBoss();
    G.scene = 'play';
    RQ.audio.music('boss');
  }
  function restart() {
    G.parts = []; G.score = 0; G.levelIdx = 0;
    G.world = null;
    G.scene = 'title';
    RQ.audio.music('title');
  }

  function transitionPlay() {
    const w = G.world;
    if (w.openTerminal) {
      w.dialogT = 0;
      G.scene = 'dialog';
      return;
    }
    if (w.dead) { G.scene = 'gameover'; RQ.audio.music(null); return; }
    if (w.complete) {
      if (w.isBoss) {
        G.score += w.score + 500;
        G.scene = 'victory';
        RQ.audio.music('victory');
      } else {
        const part = PARTS[G.levelIdx];
        if (!G.parts.includes(part)) G.parts.push(part);
        G.score += w.score;
        G.justInstalled = w.theme.partName;
        G.lastFacts = w.facts;
        G.scene = 'workshop';
        RQ.audio.music('workshop');
      }
    }
  }

  // ---------- MAIN LOOP ----------
  let last = performance.now();
  function frame(now) {
    let dt = Math.min((now - last) / 1000, 1 / 20);
    last = now;
    G.t += dt;
    if (flashT > 0) flashT -= dt;

    edge();
    const S = RQ.scenes;

    switch (G.scene) {
      case 'title': {
        if (!RQ.audio.musicStarted) { RQ.audio.music('title'); RQ.audio.musicStarted = true; }
        const n = S.title(ctx, G, input, dt);
        if (n === 'story') { G.scene = 'story'; RQ.audio.select(); }
        break;
      }
      case 'story': {
        const n = S.story(ctx, G, input, dt);
        if (n === 'play') { RQ.audio.select(); startLevel(0); }
        break;
      }
      case 'play': {
        RQ.game.update(G.world, input, dt);
        RQ.game.render(ctx, G.world);
        S.hud(ctx, G.world, G);
        if (G.world.isBoss) S.quizUI(ctx, G.world);
        transitionPlay();
        break;
      }
      case 'dialog': {
        const n = S.dialog(ctx, G, input, dt);
        if (n === 'play') { G.world.openTerminal = null; G.scene = 'play'; RQ.audio.blip(); }
        break;
      }
      case 'workshop': {
        const n = S.workshop(ctx, G, input, dt);
        if (n === 'next') {
          RQ.audio.select();
          if (G.levelIdx + 1 < RQ.levels.LEVELS.length) startLevel(G.levelIdx + 1);
          else startBoss();
        }
        break;
      }
      case 'victory': {
        const n = S.victory(ctx, G, input, dt);
        if (n === 'restart') restart();
        break;
      }
      case 'gameover': {
        const n = S.gameover(ctx, G, input, dt);
        if (n === 'retry') {
          RQ.audio.select();
          if (G.world.isBoss) startBoss();
          else startLevel(G.levelIdx);
        }
        break;
      }
    }

    if (flashT > 0) {
      ctx.font = '7px "Press Start 2P", monospace';
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffd23f';
      ctx.fillText(flashMsg, 316, 20);
    }

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
