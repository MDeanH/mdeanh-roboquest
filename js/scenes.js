// scenes.js — title, story, repair benches, code gates, workshop, quiz, HUD.
window.RQ = window.RQ || {};

RQ.scenes = (() => {
  const VW = 320, VH = 180;
  const FONT = '"Press Start 2P", monospace';
  const FONT_BODY = '"VT323", "Press Start 2P", monospace';

  function text(ctx, str, x, y, size = 8, color = '#f2f4f8', align = 'left', font = FONT) {
    ctx.font = size + 'px ' + font;
    ctx.textAlign = align;
    // 1px shadow for readability over busy backgrounds
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillText(str, x + 1, y + 1);
    ctx.fillStyle = color;
    ctx.fillText(str, x, y);
  }

  // Body copy in VT323 — far more readable at small sizes than Press Start 2P
  function text2(ctx, str, x, y, size = 13, color = '#f2f4f8', align = 'left') {
    text(ctx, str, x, y, size, color, align, FONT_BODY);
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
    text2(ctx, 'learn the parts of a robot!', VW / 2, 88 + bob, 13, '#9fd4ff', 'center');

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
    text2(ctx, 'a game about the parts of a robot', VW / 2, 175, 11, '#8b93a8', 'center');
    return input.enterPressed ? 'story' : null;
  }

  // ---------- STORY ----------
  function story(ctx, G, input, dt) {
    ctx.fillStyle = '#06060f';
    ctx.fillRect(0, 0, VW, VH);
    panel(ctx, 20, 22, VW - 40, 136, '#b06fd8');
    let y = 46;
    for (const line of RQ.levels.INTRO) {
      for (const wl of wrap(line, 38)) {
        text2(ctx, wl, 32, y, 14, '#f2f4f8');
        y += 14;
      }
      y += 5;
    }
    if (((G.t * 2) | 0) % 2) text(ctx, 'ENTER >>', VW - 74, 170, 8, '#ffd23f');
    return input.enterPressed ? 'play' : null;
  }

  function overlayWorld(ctx, G, w) {
    RQ.game.render(ctx, w);
    hud(ctx, w, G);
    ctx.fillStyle = 'rgba(4,5,12,0.76)';
    ctx.fillRect(0, 0, VW, VH);
  }

  function bench(ctx, G, input) {
    const w = G.world;
    const data = RQ.levels.BENCHES[G.levelIdx];
    const ui = w.benchUI || (w.benchUI = { phase: 'question', selected: 0 });
    overlayWorld(ctx, G, w);
    text(ctx, 'REPAIR BENCH // CHOOSE THE RIGHT PART', VW / 2, 13, 7, '#ffd23f', 'center');

    if (ui.phase === 'installed') {
      panel(ctx, 20, 24, VW - 40, 132, '#7dd069');
      text(ctx, 'INSTALLED: ' + data.part.toUpperCase(), VW / 2, 42, 8, '#7dd069', 'center');
      const icon = RQ.sprites.get(data.options.find(option => option.ok).icon);
      if (icon) ctx.drawImage(icon, VW / 2 - 8, 49);
      text2(ctx, data.unlock, 34, 79, 13, '#ffd23f');
      wrap(data.lesson, 44).forEach((line, i) => text2(ctx, line, 34, 99 + i * 12, 12, '#f2f4f8'));
      text(ctx, 'ENTER: INSTALL & CONTINUE', VW / 2, 151, 6, '#ffd23f', 'center');
      if (input.enterPressed) return { installed: true, part: data.part, ability: data.ability };
      return null;
    }

    panel(ctx, 15, 20, VW - 30, 37, ui.phase === 'wrong' ? '#e23b3b' : '#59d8ff');
    const question = ui.phase === 'wrong' ? ui.message : data.problem;
    wrap(question, 48).slice(0, 3).forEach((line, i) =>
      text2(ctx, line, VW / 2, 34 + i * 11, 12, ui.phase === 'wrong' ? '#ff9d9d' : '#f2f4f8', 'center'));

    data.options.forEach((option, i) => {
      const x = 12 + i * 99;
      panel(ctx, x, 67, 91, 77, ui.selected === i ? '#ffd23f' : '#3b4661', '#0d0d17');
      const icon = RQ.sprites.get(option.icon);
      if (icon) ctx.drawImage(icon, x + 37, 72);
      wrap(option.label, 13).slice(0, 2).forEach((line, li) =>
        text2(ctx, line, x + 45, 111 + li * 12, 11, '#f2f4f8', 'center'));
    });
    text(ctx, 'LEFT/RIGHT: SELECT     ENTER: CHOOSE', VW / 2, 160, 6, '#ffd23f', 'center');

    if (input.leftPressed || input.rightPressed) {
      ui.selected = (ui.selected + (input.rightPressed ? 1 : 2)) % 3;
      ui.phase = 'question';
    }
    if (input.enterPressed) {
      const option = data.options[ui.selected];
      if (ui.phase === 'wrong') {
        ui.phase = 'question';
      } else if (option.ok) {
        ui.phase = 'installed';
        RQ.audio.good();
      } else {
        ui.phase = 'wrong';
        ui.message = option.why;
        RQ.audio.bad();
      }
    }
    return null;
  }

  function codeGate(ctx, G, input, gate) {
    const w = G.world;
    const data = RQ.levels.GATES[gate.id];
    const ui = w.gateUI || (w.gateUI = { phase: 'program', slot: 0, ifIndex: 0, thenIndex: 0 });
    overlayWorld(ctx, G, w);
    text(ctx, 'CODE GATE ' + (gate.id + 1) + ' // PROGRAM A RULE', VW / 2, 14, 8, '#59d8ff', 'center');
    wrap(data.goal, 48).forEach((line, i) => text2(ctx, line, VW / 2, 33 + i * 12, 13, '#f2f4f8', 'center'));

    const ifOption = data.ifOpts[ui.ifIndex];
    const thenOption = data.thenOpts[ui.thenIndex];
    panel(ctx, 22, 54, VW - 44, 38, ui.slot === 0 ? '#ffd23f' : '#3b4661');
    text(ctx, 'IF', 32, 68, 7, '#ffd23f');
    wrap(ifOption.label, 39).slice(0, 2).forEach((line, i) => text2(ctx, line, 55, 69 + i * 12, 13, '#f2f4f8'));
    panel(ctx, 22, 101, VW - 44, 38, ui.slot === 1 ? '#ffd23f' : '#3b4661');
    text(ctx, 'THEN', 32, 115, 6, '#ffd23f');
    wrap(thenOption.label, 39).slice(0, 2).forEach((line, i) => text2(ctx, line, 63, 116 + i * 12, 13, '#f2f4f8'));

    if (ui.phase === 'wrong') {
      panel(ctx, 28, 143, VW - 56, 23, '#e23b3b');
      wrap(ui.message, 48).slice(0, 2).forEach((line, i) => text2(ctx, line, VW / 2, 152 + i * 10, 11, '#ff9d9d', 'center'));
    } else {
      text(ctx, 'UP/DOWN SLOT   LEFT/RIGHT OPTION   ENTER RUN', VW / 2, 159, 5, '#ffd23f', 'center');
    }

    if (ui.phase === 'wrong') {
      if (input.enterPressed) ui.phase = 'program';
      return null;
    }
    if (input.upPressed || input.downPressed) ui.slot = input.downPressed ? 1 : 0;
    if (input.leftPressed || input.rightPressed) {
      const delta = input.rightPressed ? 1 : 2;
      if (ui.slot === 0) ui.ifIndex = (ui.ifIndex + delta) % data.ifOpts.length;
      else ui.thenIndex = (ui.thenIndex + delta) % data.thenOpts.length;
    }
    if (input.enterPressed) {
      if (!ifOption.ok) {
        ui.phase = 'wrong'; ui.message = ifOption.why; RQ.audio.bad();
      } else if (!thenOption.ok) {
        ui.phase = 'wrong'; ui.message = thenOption.why; RQ.audio.bad();
      } else {
        RQ.game.solveGate(w, gate.id);
        w.gateUI = null;
        return { solved: true };
      }
    }
    return null;
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

    let y = 66;
    text(ctx, 'WHAT YOU LEARNED', 160, y, 7, '#3ec9a7');
    y += 13;
    for (const f of (G.lastFacts || []).slice(0, 2)) {
      for (const wl of wrap(f, 28)) {
        text2(ctx, wl, 160, y, 11, '#e2e8f4');
        y += 11;
      }
      y += 3;
    }

    // component slots bottom-left
    const slots = ['battery', 'sensor', 'motor', 'cpu'];
    slots.forEach((s, i) => {
      const x = 24 + i * 22, y2 = 160;
      panel(ctx, x, y2, 16, 14, G.parts.includes(s) ? '#ffd23f' : '#232833', '#0d0d17');
      if (G.parts.includes(s)) {
        ctx.drawImage(RQ.sprites.get('part_' + s), x + 1, y2 + 1);
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
    let y = 20;
    if (w.idx === 0 && !w.abilities.has('sprint')) {
      text(ctx, 'POWER', 4, y + 5, 5, '#ffd23f');
      ctx.fillStyle = '#101018';
      ctx.fillRect(29, y, 56, 7);
      ctx.fillStyle = w.energy < 20 ? '#e23b3b' : '#ffd23f';
      ctx.fillRect(30, y + 1, 54 * Math.max(0, w.energy) / 100, 5);
      text(ctx, String(Math.ceil(w.energy)), 89, y + 6, 5, '#f2f4f8');
      y += 9;
    }
    const abilities = [
      ['sprint', 'battery', 'SHIFT', '#ffd23f'],
      ['sonar', 'sensor', 'C', '#59d8ff'],
      ['torque', 'motor', 'PUSH', '#f0883b'],
      ['cpu', 'cpu', 'E', '#7dd069'],
    ];
    let abilityX = 4;
    for (const [ability, part, key, color] of abilities) {
      if (!w.abilities.has(ability)) continue;
      ctx.drawImage(RQ.sprites.get('part_' + part), abilityX, y);
      text2(ctx, key, abilityX + 18, y + 12, 11, color);
      abilityX += 54;
    }
    if (w.toast) {
      const lines = wrap(w.toast.text, 55).slice(0, 3);
      const entering = Math.min(1, (w.toast.duration - w.toast.life) / 0.18);
      const x = 16 - (1 - Math.max(0, entering)) * 330;
      const height = 8 + lines.length * 10;
      panel(ctx, x, 48, 288, height, '#59d8ff', 'rgba(8,12,24,0.96)');
      lines.forEach((line, i) => text2(ctx, line, x + 8, 57 + i * 10, 12, '#f2f4f8'));
    }
  }

  // ---------- QUIZ OVERLAY ----------
  function quizUI(ctx, w) {
    const q = w.quiz;
    if (!q || w.boss.dead) return;
    const qq = RQ.levels.QUIZ[q.order[q.qi]];

    // question banner
    panel(ctx, 24, 24, VW - 48, 34, '#d94f6a');
    text(ctx, 'MEGA-SCRAP ASKS:', 32, 34, 6, '#d94f6a');
    wrap(qq.q, 44).forEach((l, i) => text2(ctx, l, 32, 48 + i * 12, 12, '#f2f4f8'));

    // answers in a fixed strip under the question — pads only carry A/B/C/D chips
    for (let i = 0; i < 4; i++) {
      const bx = 14 + i * 74, bw = 68;
      const active = q.locked === i;
      panel(ctx, bx, 64, bw, 34, active ? '#ffd23f' : '#2b3a5e');
      text(ctx, 'ABCD'[i], bx + 6, 75, 7, '#ffd23f');
      wrap(qq.a[i], 13).slice(0, 2).forEach((l, li) =>
        text2(ctx, l, bx + 18, 74 + li * 12, 11, '#f2f4f8'));
    }

    if (q.msgT > 0 && q.msg) {
      const lines = wrap(q.msg, 52);
      panel(ctx, 30, 102, VW - 60, 14 + lines.length * 12, q.msg.startsWith('CORRECT') ? '#7dd069' : '#e23b3b');
      lines.forEach((l, i) => text2(ctx, l, VW / 2, 116 + i * 12, 11, '#f2f4f8', 'center'));
    }
    text2(ctx, 'ARROWS/WASD: MOVE   STAND ON A-D TO ANSWER', VW / 2, 174, 10, '#9fd4ff', 'center');
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
    text2(ctx, 'you know the parts of a robot now!', VW / 2, 154, 12, '#9fd4ff', 'center');
    if (((G.t * 2) | 0) % 2) text(ctx, 'ENTER: PLAY AGAIN', VW / 2, 168, 7, '#ffd23f', 'center');
    return input.enterPressed ? 'restart' : null;
  }

  // ---------- GAME OVER ----------
  function gameover(ctx, G, input, dt) {
    RQ.game.render(ctx, G.world);
    ctx.fillStyle = 'rgba(10,4,8,0.75)';
    ctx.fillRect(0, 0, VW, VH);
    text(ctx, 'BOLT IS SCRAP...', VW / 2, 76, 14, '#e23b3b', 'center');
    text2(ctx, G.world.isBoss ? 'MEGA-SCRAP wins this round' : 'the factory claims another bot', VW / 2, 100, 13, '#c8d0e0', 'center');
    if (((G.t * 2) | 0) % 2) text(ctx, 'ENTER: TRY AGAIN', VW / 2, 120, 8, '#ffd23f', 'center');
    return input.enterPressed ? 'retry' : null;
  }

  return { title, story, bench, codeGate, workshop, hud, quizUI, victory, gameover, drawRobot };
})();
