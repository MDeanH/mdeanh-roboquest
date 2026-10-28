// scenes.js — every screen that isn't pure gameplay: title, story, terminal
// dialog, workshop assembly, quiz overlay, victory, game over, HUD.
window.RQ = window.RQ || {};

RQ.scenes = (() => {
  const VW = 320, VH = 180;
  const FONT = '"Press Start 2P", monospace';

  function text(ctx, str, x, y, size = 8, color = '#f2f4f8', align = 'left') {
    ctx.font = size + 'px ' + FONT;
    ctx.textAlign = align;
    ctx.fillStyle = color;
    ctx.fillText(str, x, y);
  }

  function wrap(str, maxChars) {
    const words = str.split(' ');
    const lines = [];
    let cur = '';
    for (const wd of words) {
      if ((cur + ' ' + wd).trim().length > maxChars) { lines.push(cur.trim()); cur = wd; }
      else cur += ' ' + wd;
    }
    if (cur.trim()) lines.push(cur.trim());
    return lines;
  }

  function panel(ctx, x, y, w, h, border = '#59d8ff', fill = '#0d0d17') {
    ctx.fillStyle = border;
    ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
  }

  // ---------- TITLE ----------
  function title(ctx, G, input, dt) {
    ctx.fillStyle = '#06060f';
    ctx.fillRect(0, 0, VW, VH);

    // starfield
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    for (let i = 0; i < 60; i++) {
      const sx = (i * 89) % VW, sy = (i * 47) % VH;
      if (((i + ((G.t * 2) | 0)) % 8) > 1) ctx.fillRect(sx, sy, 1, 1);
    }

    const bob = Math.sin(G.t * 2) * 3;
    // logo
    text(ctx, 'ROBOQUEST', VW / 2, 56 + bob, 24, '#3ec9a7', 'center');
    text(ctx, 'BUILD-A-BOT ADVENTURE', VW / 2, 74 + bob, 8, '#59d8ff', 'center');

    // BOLT sprite big
    ctx.save();
    ctx.translate(VW / 2 - 32, 92 + Math.sin(G.t * 3) * 2);
    ctx.scale(4, 4);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(RQ.sprites.get('player_idle'), 0, 0);
    ctx.restore();

    if (((G.t * 2) | 0) % 2) {
      text(ctx, 'PRESS ENTER', VW / 2, 162, 8, '#ffd23f', 'center');
    }
    text(ctx, 'a game about the parts of a robot', VW / 2, 174, 6, '#4a5163', 'center');
    return input.enterPressed ? 'story' : null;
  }

  // ---------- STORY ----------
  function story(ctx, G, input, dt) {
    ctx.fillStyle = '#06060f';
    ctx.fillRect(0, 0, VW, VH);
    panel(ctx, 20, 22, VW - 40, 130, '#b06fd8');
    let y = 42;
    for (const line of RQ.levels.INTRO) {
      for (const wl of wrap(line, 30)) {
        text(ctx, wl, 32, y, 8, '#f2f4f8');
        y += 12;
      }
      y += 6;
    }
    if (((G.t * 2) | 0) % 2) text(ctx, 'ENTER >>', VW - 74, 170, 8, '#ffd23f');
    return input.enterPressed ? 'play' : null;
  }

  // ---------- TERMINAL DIALOG ----------
  function dialog(ctx, G, input, dt) {
    const w = G.world;
    RQ.game.render(ctx, w); // frozen world behind the panel

    const t = w.openTerminal;
    const fact = w.facts[t.idx % w.facts.length];

    // typewriter
    w.dialogT = (w.dialogT || 0) + dt;
    const shown = Math.floor(w.dialogT * 40);
    const full = 'DATA TERMINAL // ' + w.theme.partName;
    const body = wrap(fact, 32);

    panel(ctx, 18, 108, VW - 36, 62, w.theme.edge);
    text(ctx, full, 26, 122, 7, w.theme.edge);
    let y = 136;
    let count = 0;
    for (const line of body) {
      const visible = line.slice(0, Math.max(0, shown - count));
      text(ctx, visible, 26, y, 8, '#f2f4f8');
      count += line.length;
      y += 11;
    }
    if (shown > fact.length + 20 && ((w.t * 2) | 0) % 2) {
      text(ctx, 'E/ENTER: CLOSE', VW - 100, 164, 6, '#4a5163');
    }
    return (input.usePressed || input.enterPressed) && shown > fact.length * 0.4 ? 'play' : null;
  }

  // ---------- WORKSHOP ----------
  function drawRobot(ctx, G, cx, cy, scale = 4) {
    const parts = G.parts; // ['battery','sensor','motor','cpu'] collected so far
    const has = (p) => parts.includes(p);
    const px = (x, y, w2, h2, c) => { ctx.fillStyle = c; ctx.fillRect(cx + x * scale, cy + y * scale, w2 * scale, h2 * scale); };
    const lit = has('battery');
    const bodyC = lit ? '#3ec9a7' : '#2a3040';
    const darkC = lit ? '#1e7a66' : '#1a1e2a';
    const steelC = has('motor') ? '#8b93a8' : '#232433';

    // legs
    px(-5, 14, 4, 6, steelC); px(1, 14, 4, 6, steelC);
    px(-6, 19, 5, 2, darkC); px(1, 19, 5, 2, darkC);
    // torso
    px(-7, 2, 14, 12, bodyC);
    px(-5, 4, 10, 8, darkC);
    // chest core — the battery
    if (has('battery')) {
      px(-3, 6, 6, 4, '#ffd23f');
      px(-2, 7, 4, 2, '#ffe9a3');
    }
    // arms
    px(-10, 4, 3, 8, steelC); px(7, 4, 3, 8, steelC);
    px(-10, 12, 3, 2, darkC); px(7, 12, 3, 2, darkC);
    // head
    px(-6, -7, 12, 9, bodyC);
    px(-4, -5, 8, 4, '#101018');
    if (has('sensor')) {
      const blink = ((G.t * 2) | 0) % 7 === 0;
      px(-3, -4, 2, 2, blink ? '#f2f4f8' : '#59d8ff');
      px(1, -4, 2, 2, blink ? '#f2f4f8' : '#59d8ff');
    }
    // antenna + cpu glow
    if (has('cpu')) {
      px(0, -10, 1, 3, '#8b93a8');
      px(-1, -12, 3, 2, ((G.t * 4) | 0) % 2 ? '#e23b3b' : '#ffd23f');
      px(-4, -1, 8, 1, '#59d8ff'); // circuitry line on head
    }
  }

  function workshop(ctx, G, input, dt) {
    ctx.fillStyle = '#0a0c14';
    ctx.fillRect(0, 0, VW, VH);

    // workbench
    ctx.fillStyle = '#161a26';
    ctx.fillRect(0, 140, VW, 40);
    ctx.fillStyle = '#232833';
    ctx.fillRect(0, 140, VW, 3);
    // overhead lamp cone
    ctx.fillStyle = 'rgba(89,216,255,0.06)';
    ctx.beginPath();
    ctx.moveTo(96, 0); ctx.lineTo(56, 140); ctx.lineTo(136, 140); ctx.closePath();
    ctx.fill();

    drawRobot(ctx, G, 96, 74, 4);

    text(ctx, 'WORKSHOP', 24, 22, 10, '#59d8ff');
    text(ctx, 'BOLT v' + G.parts.length + '.0', 24, 34, 7, '#f2f4f8');
    text(ctx, 'PART INSTALLED:', 160, 40, 7, '#4a5163');
    text(ctx, G.justInstalled || '', 160, 52, 8, '#ffd23f');

    let y = 68;
    text(ctx, 'WHAT YOU LEARNED', 160, y, 7, '#3ec9a7');
    y += 12;
    for (const f of (G.lastFacts || []).slice(0, 3)) {
      for (const wl of wrap(f, 26)) {
        text(ctx, wl, 160, y, 6, '#c8d0e0');
        y += 8;
      }
      y += 2;
    }

    // component slots bottom-left
    const slots = ['battery', 'sensor', 'motor', 'cpu'];
    slots.forEach((s, i) => {
      const x = 24 + i * 22, y2 = 160;
      panel(ctx, x, y2, 16, 14, G.parts.includes(s) ? '#ffd23f' : '#232833', '#0d0d17');
      if (G.parts.includes(s)) {
        ctx.drawImage(RQ.sprites.get('part_' + s === 'part_battery' ? 'part_battery' : 'part_' + s), x + 1, y2 + 1);
      }
    });

    if (((G.t * 2) | 0) % 2) text(ctx, 'ENTER >>', VW - 74, 170, 8, '#ffd23f');
    return input.enterPressed ? 'next' : null;
  }

  // ---------- HUD ----------
  function hud(ctx, w, G) {
    // hp cells
    for (let i = 0; i < (w.isBoss ? 5 : 3); i++) {
      RQ.sprites.draw(ctx, i < w.player.hp ? 'hp_full' : 'hp_empty', 4 + i * 10, 4);
    }
    text(ctx, 'SCORE ' + String(G.score).padStart(5, '0'), VW - 4, 10, 7, '#f2f4f8', 'right');
    text(ctx, w.isBoss ? 'FINAL EXAM' : w.theme.name, VW / 2, 9, 6, w.theme.edge, 'center');
    // part icons collected
    const slots = ['battery', 'sensor', 'motor', 'cpu'];
    slots.forEach((s, i) => {
      if (G.parts.includes(s)) {
        ctx.drawImage(RQ.sprites.get('part_' + s), VW / 2 - 40 + i * 20, 14);
      }
    });
  }

  // ---------- QUIZ OVERLAY ----------
  function quizUI(ctx, w) {
    const q = w.quiz;
    if (!q || w.boss.dead) return;
    const qq = RQ.levels.QUIZ[q.order[q.qi]];

    // question banner
    panel(ctx, 24, 26, VW - 48, 30, '#d94f6a');
    text(ctx, 'MEGA-SCRAP ASKS:', 32, 36, 6, '#d94f6a');
    wrap(qq.q, 36).forEach((l, i) => text(ctx, l, 32, 47 + i * 9, 7, '#f2f4f8'));

    // answers above pads
    ctx.font = '5px ' + FONT;
    ctx.textAlign = 'center';
    for (const pad of w.pads) {
      const label = 'ABCD'[pad.i] + ': ' + qq.a[pad.i];
      const px = pad.x - w.cam.x;
      const lines = wrap(label, 14);
      lines.forEach((l, i) => {
        ctx.fillStyle = '#0d0d17';
        const tw = l.length * 5 + 4;
        ctx.fillRect(px - tw / 2, 108 + i * 8 - 5, tw, 8);
        ctx.fillStyle = '#ffe9a3';
        ctx.fillText(l, px, 108 + i * 8);
      });
    }

    if (q.msgT > 0 && q.msg) {
      const lines = wrap(q.msg, 56);
      panel(ctx, 30, 62, VW - 60, 14 + lines.length * 9, q.msg.startsWith('CORRECT') ? '#7dd069' : '#e23b3b');
      lines.forEach((l, i) => text(ctx, l, VW / 2, 74 + i * 9, 6, '#f2f4f8', 'center'));
    }
  }

  // ---------- VICTORY ----------
  function victory(ctx, G, input, dt) {
    ctx.fillStyle = '#08140c';
    ctx.fillRect(0, 0, VW, VH);
    ctx.fillStyle = 'rgba(125,208,105,0.08)';
    for (let i = 0; i < 8; i++) ctx.fillRect(0, i * 24 + ((G.t * 20) % 24), VW, 2);

    text(ctx, 'BOLT REBUILT!', VW / 2, 34, 16, '#7dd069', 'center');
    text(ctx, 'MEGA-SCRAP DEFEATED', VW / 2, 52, 8, '#ffd23f', 'center');

    drawRobot(ctx, G, VW / 2 - 24, 74, 3);

    text(ctx, 'FINAL SCORE: ' + G.score, VW / 2, 138, 8, '#f2f4f8', 'center');
    text(ctx, 'you know the parts of a robot now!', VW / 2, 152, 6, '#4a5163', 'center');
    if (((G.t * 2) | 0) % 2) text(ctx, 'ENTER: PLAY AGAIN', VW / 2, 168, 7, '#ffd23f', 'center');
    return input.enterPressed ? 'restart' : null;
  }

  // ---------- GAME OVER ----------
  function gameover(ctx, G, input, dt) {
    RQ.game.render(ctx, G.world);
    ctx.fillStyle = 'rgba(10,4,8,0.75)';
    ctx.fillRect(0, 0, VW, VH);
    text(ctx, 'BOLT IS SCRAP...', VW / 2, 76, 14, '#e23b3b', 'center');
    text(ctx, G.world.isBoss ? 'MEGA-SCRAP wins this round' : 'the factory claims another bot', VW / 2, 96, 7, '#8b93a8', 'center');
    if (((G.t * 2) | 0) % 2) text(ctx, 'ENTER: TRY AGAIN', VW / 2, 120, 8, '#ffd23f', 'center');
    return input.enterPressed ? 'retry' : null;
  }

  return { title, story, dialog, workshop, hud, quizUI, victory, gameover, drawRobot };
})();
