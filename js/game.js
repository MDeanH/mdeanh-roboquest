// game.js — platformer engine: tilemap, physics, entities, camera, render.
window.RQ = window.RQ || {};

RQ.game = (() => {
  const T = 16, VW = 320, VH = 180;
  const GRAV = 1500, MOVE = 95, JUMP = 430;
  const COYOTE = 0.09, BUFFER = 0.12, IFRAMES = 1.3;

  const solidAt = (map, tx, ty) => {
    if (ty < 0) return false;
    if (tx < 0 || tx >= map[0].length) return true;
    if (ty >= map.length) return false;
    return map[ty][tx] === '#';
  };
  const platAt = (map, tx, ty) => {
    if (tx < 0 || tx >= map[0].length || ty < 0 || ty >= map.length) return false;
    return map[ty][tx] === '-';
  };

  function loadLevel(idx) {
    const spec = RQ.levels.LEVELS[idx];
    const map = RQ.levels.build(spec);
    const w = {
      idx, map, theme: spec.theme, facts: spec.facts,
      W: map[0].length, H: map.length,
      t: 0, cam: { x: 0, y: 12 },
      screws: [], terms: [], enemies: [], arcs: [], spikes: [], parts: [],
      prompt: null, openTerminal: null, complete: false, dead: false,
      score: 0, factsRead: new Set(),
    };
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        const ch = map[y][x];
        const px = x * T, py = y * T;
        if (ch === 'o') w.screws.push({ x: px + 4, y: py + 4, got: false });
        else if (ch === 'T') w.terms.push({ x: px + 1, y: py - 2, idx: w.terms.length });
        else if (ch === 'C') w.enemies.push({ type: 'crawl', x: px + 1, y: py + 10, vx: -18, w: 14, h: 6, alive: true, anim: Math.random() });
        else if (ch === 'F') w.enemies.push({ type: 'fly', x: px, y: py, ox: px, oy: py, vx: 26, w: 14, h: 7, alive: true, anim: Math.random() });
        else if (ch === '~') w.arcs.push({ x: px + 3, y: py - 8, phase: Math.random() * 2.4 });
        else if (ch === '^') w.spikes.push({ x: px, y: py + 8 });
        else if (ch === 'G') w.goal = { x: px, y: py, bob: 0 };
        else if (ch === 'P') w.player = { x: px + 3, y: py, vx: 0, vy: 0, w: 10, h: 14, face: 1, onGround: false, coyote: 0, buffer: 0, hp: 3, iframes: 0, anim: 0, lastSafeX: px + 3, lastSafeY: py };
      }
    }
    return w;
  }

  // Boss arena reuses the same physics on a flat world.
  function loadBoss() {
    const w = {
      idx: -1, isBoss: true, theme: RQ.levels.THEMES.boss,
      map: [], W: 22, H: 12,
      t: 0, cam: { x: 0, y: 12 },
      screws: [], terms: [], enemies: [], arcs: [], spikes: [], parts: [],
      prompt: null, complete: false, dead: false,
      score: 0, factsRead: new Set(), facts: [],
    };
    const row = '#'.repeat(22);
    w.map = [];
    for (let y = 0; y < 12; y++) w.map[y] = y >= 9 ? row : '.'.repeat(22);
    w.player = { x: 36, y: 8 * T, vx: 0, vy: 0, w: 10, h: 14, face: 1, onGround: false, coyote: 0, buffer: 0, hp: 5, iframes: 0, anim: 0, lastSafeX: 36, lastSafeY: 8 * T };
    w.boss = { x: 272, y: 60, w: 56, h: 78, hp: 8, t: 0, flash: 0, attackT: 5.0, dead: false };
    w.bolts = [];
    w.pads = [30, 85, 140, 195].map((x, i) => ({ x, i, glow: 0 }));
    w.quiz = { order: RQ.levels.QUIZ.map((_, i) => i).sort(() => Math.random() - 0.5), qi: 0, locked: -1, msg: '', msgT: 0, done: false };
    return w;
  }

  function addParts(w, x, y, n, color) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = 30 + Math.random() * 60;
      w.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, life: 0.4 + Math.random() * 0.35, color, size: 1 + (Math.random() < 0.3 ? 1 : 0) });
    }
  }

  function hurt(w, dir = 0) {
    const p = w.player;
    if (p.iframes > 0 || w.complete) return;
    p.hp--;
    p.iframes = IFRAMES;
    p.vy = -220;
    p.vx = dir * 90;
    RQ.audio.hurt();
    addParts(w, p.x + p.w / 2, p.y + p.h / 2, 12, '#e23b3b');
    if (p.hp <= 0) { w.dead = true; RQ.audio.death(); }
  }

  function collideX(w, p) {
    const map = w.map;
    const x0 = Math.floor(p.x / T), x1 = Math.floor((p.x + p.w - 0.01) / T);
    const y0 = Math.floor(p.y / T), y1 = Math.floor((p.y + p.h - 0.01) / T);
    for (let ty = y0; ty <= y1; ty++) {
      for (let tx = x0; tx <= x1; tx++) {
        if (solidAt(map, tx, ty)) {
          if (p.vx > 0) p.x = tx * T - p.w - 0.01;
          else if (p.vx < 0) p.x = (tx + 1) * T + 0.01;
          p.vx = 0;
          return;
        }
      }
    }
  }

  function collideY(w, p, prevFeet) {
    const map = w.map;
    const x0 = Math.floor(p.x / T), x1 = Math.floor((p.x + p.w - 0.01) / T);
    const y0 = Math.floor(p.y / T), y1 = Math.floor((p.y + p.h - 0.01) / T);
    p.onGround = false;
    for (let ty = y0; ty <= y1; ty++) {
      for (let tx = x0; tx <= x1; tx++) {
        if (solidAt(map, tx, ty)) {
          if (p.vy > 0) { p.y = ty * T - p.h - 0.01; p.onGround = true; }
          else if (p.vy < 0) p.y = (ty + 1) * T + 0.01;
          p.vy = 0;
        } else if (platAt(map, tx, ty) && p.vy > 0) {
          const top = ty * T;
          if (prevFeet <= top + 1 && p.y + p.h >= top) {
            p.y = top - p.h - 0.01;
            p.vy = 0;
            p.onGround = true;
          }
        }
      }
    }
  }

  function updatePlayer(w, input, dt) {
    const p = w.player;
    const ax = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    p.vx = ax * MOVE;
    if (ax) p.face = ax;

    if (input.jumpPressed) p.buffer = BUFFER;
    else p.buffer -= dt;
    p.coyote -= dt;

    if (p.buffer > 0 && (p.onGround || p.coyote > 0)) {
      p.vy = -JUMP;
      p.buffer = 0; p.coyote = 0; p.onGround = false;
      RQ.audio.jump();
      addParts(w, p.x + p.w / 2, p.y + p.h, 5, '#8b93a8');
    }
    if (!input.jump && p.vy < -140) p.vy = -140; // variable jump height

    p.vy = Math.min(p.vy + GRAV * dt, 420);
    p.x += p.vx * dt;
    collideX(w, p);
    const prevFeet = p.y + p.h;
    p.y += p.vy * dt;
    const wasAir = !p.onGround;
    collideY(w, p, prevFeet);
    if (p.onGround) {
      p.coyote = COYOTE;
      p.lastSafeX = p.x; p.lastSafeY = p.y;
      if (wasAir && p.vy === 0) addParts(w, p.x + p.w / 2, p.y + p.h, 3, '#4a5163');
    }
    p.iframes -= dt;
    p.anim += dt * Math.abs(p.vx) / MOVE;

    // Fell into a pit: cost 1 HP, respawn at last safe ground.
    if (p.y > w.H * T + 24 && !w.dead) {
      p.hp--;
      RQ.audio.hurt();
      if (p.hp <= 0) { w.dead = true; RQ.audio.death(); return; }
      p.x = p.lastSafeX; p.y = p.lastSafeY - 4;
      p.vx = 0; p.vy = 0;
      p.iframes = IFRAMES;
    }
    p.x = Math.max(2, Math.min(p.x, w.W * T - p.w - 2));
  }

  function updateEntities(w, input, dt) {
    const p = w.player;

    for (const s of w.screws) {
      if (!s.got && Math.abs(p.x + p.w / 2 - s.x - 4) < 10 && Math.abs(p.y + p.h / 2 - s.y - 4) < 10) {
        s.got = true; w.score += 10;
        RQ.audio.pickup();
        addParts(w, s.x + 4, s.y + 4, 8, '#ffd23f');
      }
    }

    w.prompt = null; w.openTerminal = null;
    for (const t of w.terms) {
      if (Math.abs(p.x + p.w / 2 - t.x - 7) < 13 && Math.abs(p.y - t.y) < 22) {
        w.prompt = 'READ';
        if (input.usePressed) { w.openTerminal = t; w.factsRead.add(t.idx); RQ.audio.term(); }
      }
    }

    for (const e of w.enemies) {
      if (!e.alive) continue;
      e.anim += dt;
      if (e.type === 'crawl') {
        e.x += e.vx * dt;
        const ahead = e.vx > 0 ? e.x + e.w + 1 : e.x - 1;
        const tx = Math.floor(ahead / T);
        const footTy = Math.floor((e.y + e.h + 4) / T);
        const headTy = Math.floor((e.y + 2) / T);
        if (solidAt(w.map, tx, headTy) || (!solidAt(w.map, tx, footTy) && !platAt(w.map, tx, footTy))) {
          e.vx *= -1;
        }
      } else {
        e.x += e.vx * dt;
        e.y = e.oy + Math.sin(e.anim * 2.6) * 10;
        if (Math.abs(e.x - e.ox) > 72) e.vx *= -1;
      }
      if (p.iframes <= 0 &&
          p.x < e.x + e.w && p.x + p.w > e.x && p.y < e.y + e.h && p.y + p.h > e.y) {
        if (p.vy > 60 && p.y + p.h - e.y < 8) {
          e.alive = false; p.vy = -260; w.score += 25;
          RQ.audio.stomp();
          addParts(w, e.x + e.w / 2, e.y + e.h / 2, 10, '#8b93a8');
        } else {
          hurt(w, p.x + p.w / 2 < e.x + e.w / 2 ? -1 : 1);
        }
      }
    }

    for (const s of w.spikes) {
      if (p.x + 2 < s.x + 16 && p.x + p.w - 2 > s.x && p.y + p.h > s.y + 4 && p.y + p.h < s.y + 14) {
        hurt(w, 0);
      }
    }

    for (const a of w.arcs) {
      const cyc = (w.t + a.phase) % 2.4;
      a.on = cyc > 1.6;
      a.warn = cyc > 1.2 && cyc <= 1.6;
      if (a.on && p.x + p.w > a.x - 2 && p.x < a.x + 6 && p.y + p.h > a.y - 30 && p.y < a.y + 8) {
        hurt(w, 0);
      }
    }

    if (w.goal && !w.complete &&
        p.x < w.goal.x + 16 && p.x + p.w > w.goal.x && p.y < w.goal.y + 16 && p.y + p.h > w.goal.y) {
      w.complete = true;
      w.score += 100;
      RQ.audio.part();
      addParts(w, w.goal.x + 8, w.goal.y + 8, 26, w.theme.edge);
    }

    for (const pt of w.parts) {
      pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.vy += 300 * dt; pt.life -= dt;
    }
    w.parts = w.parts.filter(pt => pt.life > 0);
  }

  // ---------- BOSS ----------
  function updateBoss(w, input, dt) {
    const b = w.boss, p = w.player, q = w.quiz;
    b.t += dt; b.flash -= dt;
    b.y = 58 + Math.sin(b.t * 1.4) * 4;

    if (q.msgT > 0) q.msgT -= dt;

    // Boss periodically launches a bolt at the player while quiz runs.
    if (!b.dead) {
      b.attackT -= dt;
      if (b.attackT <= 0) {
        b.attackT = 4.6 - Math.min(1.0, (8 - b.hp) * 0.12);
        const fromY = b.y + 30;
        const dx = p.x - b.x, dy = p.y - fromY;
        const d = Math.hypot(dx, dy) || 1;
        w.bolts.push({ x: b.x, y: fromY, vx: dx / d * 78, vy: dy / d * 78, life: 4 });
        RQ.audio.zap();
      }
    }

    for (const bl of w.bolts) {
      bl.x += bl.vx * dt; bl.y += bl.vy * dt; bl.life -= dt;
      if (p.iframes <= 0 && p.x < bl.x + 8 && p.x + p.w > bl.x && p.y < bl.y + 4 && p.y + p.h > bl.y) {
        bl.life = 0;
        hurt(w, -1);
      }
    }
    w.bolts = w.bolts.filter(bl => bl.life > 0 && bl.x > -20 && bl.x < w.W * T + 20);

    for (const pad of w.pads) pad.glow -= dt;

    // Walk onto a pad to lock in an answer.
    if (q.locked < 0 && !b.dead) {
      for (const pad of w.pads) {
        if (p.onGround && p.x + p.w / 2 > pad.x - 12 && p.x + p.w / 2 < pad.x + 12) {
          q.locked = pad.i;
          pad.glow = 1;
          const qq = RQ.levels.QUIZ[q.order[q.qi]];
          p.iframes = Math.max(p.iframes, 1.6);
          if (pad.i === qq.c) {
            b.hp--; b.flash = 0.4;
            w.bolts = [];
            q.msg = 'CORRECT! MEGA-SCRAP takes damage!';
            RQ.audio.good(); RQ.audio.bossHit();
            addParts(w, b.x + 28, b.y + 30, 22, '#ffd23f');
          } else {
            p.hp--;
            q.msg = 'WRONG! ' + qq.hint;
            RQ.audio.bad();
            addParts(w, p.x + 5, p.y + 7, 14, '#e23b3b');
            if (p.hp <= 0) { w.dead = true; RQ.audio.death(); }
          }
          q.msgT = 2.6;
          q.qi = (q.qi + 1) % q.order.length;
          q.locked = pad.i;
          q.lockT = 0.9;
          if (b.hp <= 0) {
            b.dead = true;
            RQ.audio.fanfare();
            addParts(w, b.x + 28, b.y + 40, 60, '#f0883b');
            q.done = true;
          }
          break;
        }
      }
    }
    if (q.locked >= 0) {
      q.lockT -= dt;
      if (q.lockT <= 0) q.locked = -1;
    }
    if (b.dead && !w.complete) {
      w.winT = (w.winT || 0) + dt;
      if (w.winT > 2.2) w.complete = true;
    }
  }

  function update(w, input, dt) {
    w.t += dt;
    if (w.dead || w.complete) {
      for (const pt of w.parts) { pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.vy += 300 * dt; pt.life -= dt; }
      w.parts = w.parts.filter(pt => pt.life > 0);
      if (w.isBoss) { w.boss.t += dt; w.boss.y = 58 + Math.sin(w.boss.t * 1.4) * 4; if (w.boss.dead) w.boss.y += w.t * 0; }
      return;
    }
    updatePlayer(w, input, dt);
    if (w.isBoss) updateBoss(w, input, dt);
    else updateEntities(w, input, dt);

    const p = w.player;
    w.cam.x = Math.max(0, Math.min(p.x + p.w / 2 - VW / 2, w.W * T - VW));
    w.cam.y = Math.max(0, Math.min(p.y + p.h / 2 - VH / 2, w.H * T - VH));
  }

  // ================= RENDER =================
  function drawSky(ctx, w) {
    const th = w.theme;
    const g = ctx.createLinearGradient(0, 0, 0, VH);
    g.addColorStop(0, th.skyTop);
    g.addColorStop(1, th.skyBot);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, VW, VH);

    // stars
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    for (let i = 0; i < 40; i++) {
      const sx = (i * 137 + w.idx * 53) % (w.W * T);
      const sy = (i * 61) % 70;
      const px = sx - w.cam.x * 0.15;
      if (px >= -2 && px < VW + 2 && ((i * 7 + ((w.t * 2) | 0)) % 9) > 1) {
        ctx.fillRect(px | 0, sy, 1, 1);
      }
    }

    // far silhouette layer — theme deco shapes on the horizon
    ctx.fillStyle = th.far;
    const deco = w.theme.deco;
    for (let i = 0; i < w.W / 8 + 2; i++) {
      const wx = i * 128;
      const px = wx - w.cam.x * 0.35;
      if (px < -140 || px > VW + 10) continue;
      const base = VH - 30 - ((i * 17) % 26);
      if (deco === 'pylon') {
        ctx.fillRect(px, base, 10, VH - base);
        ctx.fillRect(px - 8, base + 8, 26, 4);
        ctx.fillRect(px - 4, base + 20, 18, 4);
      } else if (deco === 'dish') {
        ctx.fillRect(px + 6, base + 14, 4, VH - base);
        ctx.fillRect(px - 4, base, 24, 12);
        ctx.fillRect(px - 8, base + 3, 4, 6);
      } else if (deco === 'gear') {
        ctx.fillRect(px, base, 22, VH - base);
        ctx.fillRect(px - 4, base + 6, 30, 6);
        ctx.fillRect(px + 8, base - 6, 6, VH - base + 6);
      } else if (deco === 'chip') {
        ctx.fillRect(px, base + 8, 20, VH - base);
        for (let k = 0; k < 4; k++) ctx.fillRect(px - 4, base + 10 + k * 6, 4, 2);
        for (let k = 0; k < 4; k++) ctx.fillRect(px + 20, base + 10 + k * 6, 4, 2);
      } else {
        ctx.fillRect(px, base, 30, VH - base);
        ctx.fillRect(px + 8, base - 8, 14, 8);
      }
    }

    // near hills
    ctx.fillStyle = th.near;
    for (let i = 0; i < w.W / 4 + 2; i++) {
      const wx = i * 64;
      const px = wx - w.cam.x * 0.6;
      const hgt = 22 + ((i * 31) % 18);
      ctx.fillRect(px, VH - hgt, 64, hgt);
    }
  }

  function drawTiles(ctx, w) {
    const th = w.theme;
    const x0 = Math.max(0, (w.cam.x / T) | 0), x1 = Math.min(w.W - 1, ((w.cam.x + VW) / T | 0) + 1);
    for (let ty = 0; ty < w.H; ty++) {
      for (let tx = x0; tx <= x1; tx++) {
        const ch = w.map[ty][tx];
        const px = tx * T - w.cam.x, py = ty * T - w.cam.y;
        if (ch === '#') {
          const topOpen = !solidAt(w.map, tx, ty - 1);
          ctx.fillStyle = th.dirt;
          ctx.fillRect(px, py, T, T);
          ctx.fillStyle = th.dirtDark;
          ctx.fillRect(px + 2, py + 2, 3, 3);
          ctx.fillRect(px + 10, py + 8, 4, 3);
          ctx.fillRect(px + 5, py + 11, 3, 3);
          if (topOpen) {
            ctx.fillStyle = th.edge;
            ctx.fillRect(px, py, T, 3);
            ctx.fillStyle = th.dirtDark;
            ctx.fillRect(px + 3, py + 3, 2, 1);
            ctx.fillRect(px + 11, py + 3, 2, 1);
          }
        } else if (ch === '-') {
          ctx.fillStyle = th.plat;
          ctx.fillRect(px, py + 2, T, 5);
          ctx.fillStyle = th.edge;
          ctx.fillRect(px, py + 2, T, 2);
        } else if (ch === '^') {
          RQ.sprites.draw(ctx, 'spike', px, py + 12 - 0);
        }
      }
    }
  }

  function drawArcs(ctx, w) {
    for (const a of w.arcs) {
      const px = a.x - w.cam.x, py = a.y - w.cam.y;
      // emitter posts
      ctx.fillStyle = '#4a5163';
      ctx.fillRect(px - 1, py + 8, 8, 4);
      ctx.fillRect(px - 1, py - 30, 8, 4);
      if (a.on) {
        ctx.fillStyle = '#ffe9a3';
        let y = py - 28;
        let x = px + 3;
        while (y < py + 8) {
          ctx.fillRect(x, y, 2, 4);
          x += ((Math.random() * 5) | 0) - 2;
          y += 4;
        }
        ctx.fillStyle = '#59d8ff';
        ctx.fillRect(px, py - 30, 6, 2);
      } else if (a.warn) {
        ctx.fillStyle = '#e23b3b';
        if (((w.t * 8) | 0) % 2) ctx.fillRect(px + 2, py - 34, 2, 2);
      }
    }
  }

  function drawPlayer(ctx, w) {
    const p = w.player;
    if (p.iframes > 0 && ((w.t * 16) | 0) % 2) return; // blink
    let spr = 'player_idle';
    if (w.dead || p.iframes > IFRAMES - 0.4 && p.hp < 3) spr = 'player_hurt';
    if (!p.onGround) spr = 'player_jump';
    else if (Math.abs(p.vx) > 5) spr = ((p.anim * 8) | 0) % 2 ? 'player_run1' : 'player_run2';
    RQ.sprites.draw(ctx, spr, p.x - 3 - w.cam.x, p.y - 2 - w.cam.y, p.face < 0);
  }

  function drawBoss(ctx, w) {
    const b = w.boss;
    const px = b.x - w.cam.x, py = b.y - w.cam.y;
    const flash = b.flash > 0;
    const c1 = flash ? '#f2f4f8' : '#6b4f2e';
    const c2 = flash ? '#f2f4f8' : '#4a3020';
    const c3 = flash ? '#f2f4f8' : '#8b93a8';
    if (b.dead) {
      ctx.globalAlpha = Math.max(0, 1 - (w.winT || 0) / 2);
    }
    // treads
    ctx.fillStyle = c2;
    ctx.fillRect(px, py + 66, 56, 12);
    ctx.fillStyle = '#101018';
    for (let i = 0; i < 7; i++) ctx.fillRect(px + 2 + i * 8, py + 68, 5, 8);
    // torso — junk armor
    ctx.fillStyle = c1;
    ctx.fillRect(px + 4, py + 26, 48, 42);
    ctx.fillStyle = c2;
    ctx.fillRect(px + 8, py + 30, 40, 6);
    ctx.fillRect(px + 8, py + 40, 40, 4);
    ctx.fillStyle = '#d94f6a';
    ctx.fillRect(px + 24, py + 46, 8, 8); // core
    // head
    ctx.fillStyle = c3;
    ctx.fillRect(px + 12, py + 2, 32, 24);
    ctx.fillStyle = '#101018';
    ctx.fillRect(px + 16, py + 8, 24, 10);
    // single angry eye
    ctx.fillStyle = flash ? '#fff' : (((b.t * 3) | 0) % 5 === 0 ? '#8f2233' : '#e23b3b');
    ctx.fillRect(px + 24, py + 10, 8, 6);
    // antenna
    ctx.fillStyle = c3;
    ctx.fillRect(px + 26, py - 6, 2, 8);
    ctx.fillStyle = '#e23b3b';
    ctx.fillRect(px + 24, py - 9, 6, 4);
    // claw arm (left side, reaching toward player)
    ctx.fillStyle = c2;
    ctx.fillRect(px - 12, py + 34 + Math.sin(b.t * 2) * 2, 16, 8);
    ctx.fillStyle = c3;
    ctx.fillRect(px - 18, py + 30 + Math.sin(b.t * 2) * 2, 8, 16);
    ctx.globalAlpha = 1;
    // hp bar
    ctx.fillStyle = '#101018';
    ctx.fillRect(110, 20, 100, 7);
    ctx.fillStyle = '#d94f6a';
    ctx.fillRect(111, 21, (98 * Math.max(0, b.hp)) / 8, 5);
  }

  function render(ctx, w) {
    drawSky(ctx, w);
    drawTiles(ctx, w);
    drawArcs(ctx, w);

    for (const s of w.screws) {
      if (s.got) continue;
      const bob = Math.sin(w.t * 4 + s.x) * 2;
      RQ.sprites.draw(ctx, 'screw', s.x - w.cam.x, s.y - w.cam.y + bob);
    }
    for (const t of w.terms) {
      const spr = ((w.t * 2 + t.idx) | 0) % 2 ? 'terminal1' : 'terminal2';
      RQ.sprites.draw(ctx, spr, t.x - w.cam.x, t.y - w.cam.y);
    }
    for (const e of w.enemies) {
      if (!e.alive) continue;
      const spr = e.type === 'crawl'
        ? (((e.anim * 6) | 0) % 2 ? 'crawler1' : 'crawler2')
        : (((e.anim * 8) | 0) % 2 ? 'flyer1' : 'flyer2');
      RQ.sprites.draw(ctx, spr, e.x - w.cam.x, e.y - w.cam.y, e.vx < 0);
    }
    if (w.bolts) {
      for (const bl of w.bolts) {
        RQ.sprites.draw(ctx, 'bolt', bl.x - w.cam.x, bl.y - w.cam.y, bl.vx < 0);
      }
    }
    if (w.goal) {
      const bob = Math.sin(w.t * 3) * 2;
      RQ.sprites.draw(ctx, w.theme.part, w.goal.x - w.cam.x, w.goal.y - w.cam.y + bob);
      // beacon glow
      ctx.fillStyle = w.theme.edge + '44';
      ctx.fillRect(w.goal.x - 2 - w.cam.x, w.goal.y - 6 - w.cam.y + bob, 20, 2);
    }
    if (w.isBoss) drawBoss(ctx, w);

    // pads under quiz answers
    if (w.isBoss) {
      const th = w.theme;
      for (const pad of w.pads) {
        const px = pad.x - w.cam.x, py = 9 * T - w.cam.y;
        ctx.fillStyle = pad.glow > 0 ? '#ffd23f' : th.plat;
        ctx.fillRect(px - 12, py - 2, 24, 4);
        ctx.fillStyle = pad.glow > 0 ? '#fff' : th.edge;
        ctx.fillRect(px - 12, py - 4, 24, 2);
        // letter in a bright chip above the pad
        ctx.fillStyle = '#ffd23f';
        ctx.fillRect(px - 6, py - 18, 12, 11);
        ctx.font = '12px "VT323", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#1a1408';
        ctx.fillText('ABCD'[pad.i], px, py - 8);
      }
    }

    for (const pt of w.parts) {
      ctx.globalAlpha = Math.min(1, pt.life * 3);
      ctx.fillStyle = pt.color;
      ctx.fillRect(pt.x - w.cam.x, pt.y - w.cam.y, pt.size, pt.size);
    }
    ctx.globalAlpha = 1;

    drawPlayer(ctx, w);

    // interaction prompt
    if (w.prompt) {
      const p = w.player;
      ctx.font = '12px "VT323", monospace';
      ctx.textAlign = 'center';
      const label = 'E: ' + w.prompt;
      const px = p.x + 5 - w.cam.x, py = p.y - 12 - w.cam.y;
      const tw = label.length * 5 + 8;
      ctx.fillStyle = 'rgba(13,13,23,0.95)';
      ctx.fillRect(px - tw / 2, py - 9, tw, 12);
      ctx.fillStyle = '#ffe9a3';
      ctx.fillText(label, px, py + 1);
    }
  }

  return { loadLevel, loadBoss, update, render, T, VW, VH };
})();
