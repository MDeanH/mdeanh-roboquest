// sprites.js — procedural pixel art: string grids -> canvases. No image assets.
window.RQ = window.RQ || {};

RQ.sprites = (() => {
  const PAL = {
    'K': '#101018', 'k': '#232433', 'W': '#f2f4f8', 'R': '#e23b3b', 'r': '#8f2233',
    'Y': '#ffd23f', 'y': '#c99a1e', 'O': '#f0883b', 'o': '#a8521f',
    'T': '#3ec9a7', 't': '#1e7a66', 'B': '#3b6fd4', 'b': '#22417e',
    'C': '#59d8ff', 'P': '#b06fd8', 'S': '#8b93a8', 's': '#4a5163',
    'D': '#262b38', 'L': '#3a404f', 'G': '#7dd069', 'g': '#3f8a3a',
    'M': '#d94f6a', 'E': '#ffe9a3', 'n': '#6b4f2e', 'N': '#a07545',
  };

  const cache = {};

  function make(name, rows) {
    const h = rows.length, w = rows[0].length;
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    const g = cv.getContext('2d');
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const c = PAL[rows[y][x]];
        if (c) { g.fillStyle = c; g.fillRect(x, y, 1, 1); }
      }
    }
    cache[name] = cv;
    return cv;
  }

  function get(name) { return cache[name]; }

  function draw(ctx, name, x, y, flip = false) {
    const img = cache[name];
    if (!img) return;
    x = Math.round(x); y = Math.round(y);
    if (flip) {
      ctx.save();
      ctx.translate(x + img.width, y);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0);
      ctx.restore();
    } else {
      ctx.drawImage(img, x, y);
    }
  }

  // ================= PLAYER: BOLT the robot (16x16) =================
  const HEAD = [
    "........R.......",
    "........K.......",
    ".....KKKKKKK....",
    "....KTTTTTTTK...",
    "....KTCCKCCTK...",
    "....KTCCKCCTK...",
    "....KTTTTTTTK...",
    "....KTKKKKKTK...",
    ".....KKKKKKK....",
    "....KSSSSSSK....",
    "...KSKSCCSKSK...",
    "...KSKSCCSKSK...",
  ];
  make('player_idle', HEAD.concat([
    "....KSK..KSK....",
    "....KSK..KSK....",
    "....KKK..KKK....",
    "....KKK..KKK....",
  ]));
  make('player_run1', HEAD.concat([
    "...KSK....KSK...",
    "..KSK......KSK..",
    "..KKK......KKK..",
    "..KKK......KKK..",
  ]));
  make('player_run2', HEAD.concat([
    ".....KSKSK......",
    ".....KSKSK......",
    ".....KKKKK......",
    ".....KKKKK......",
  ]));
  make('player_jump', HEAD.concat([
    "....KSK..KSK....",
    "....KKK..KKK....",
    "................",
    "................",
  ]));
  const HEAD_HURT = HEAD.map(r => r.replace(/T/g, 'M'));
  make('player_hurt', HEAD_HURT.concat([
    "....KSK..KSK....",
    "....KSK..KSK....",
    "....KKK..KKK....",
    "....KKK..KKK....",
  ]));

  // ================= ENEMIES =================
  // Crawler tread-bot (14x6 body + treads)
  make('crawler1', [
    "..KKKKKKKKKK..",
    ".KSSSSSSSSSSK.",
    ".KSRRKSSKRRSK.",
    ".KSSSSSSSSSSK.",
    "KLKLKLKLKLKLKL",
    "KLKLKLKLKLKLKL",
  ]);
  make('crawler2', [
    "..KKKKKKKKKK..",
    ".KSSSSSSSSSSK.",
    ".KSRRKSSKRRSK.",
    ".KSSSSSSSSSSK.",
    "LKLKLKLKLKLKLK",
    "LKLKLKLKLKLKLK",
  ]);
  // Spark drone (14x7)
  make('flyer1', [
    "K.K........K.K",
    ".KKK......KKK.",
    "...KSSSSSSK...",
    "..KSKWWWWKSK..",
    "..KSSKRRKSSK..",
    "...KKKKKKKK...",
    "....C....C....",
  ]);
  make('flyer2', [
    "..K........K..",
    "K.K.K....K.K.K",
    "...KSSSSSSK...",
    "..KSKWWWWKSK..",
    "..KSSKRRKSSK..",
    "...KKKKKKKK...",
    "....C....C....",
  ]);

  // ================= PICKUPS & OBJECTS =================
  make('screw', [
    "..KKKK..",
    ".KYYYYK.",
    ".KYWWYK.",
    ".KYYYYK.",
    "..KYK...",
    "..KYK...",
    "..KKK...",
  ]);
  make('terminal1', [
    "..KKKKKKKKKK..",
    ".KSSSSSSSSSSK.",
    ".KSCKKKKKKCSK.",
    ".KSKCCKKCCKSK.",
    ".KSKKKKKKKKSK.",
    ".KSCCCKKCCCSK.",
    ".KSSSSSSSSSSK.",
    "..KKKKKKKKKK..",
    ".....KKKK.....",
    "....KSSSSK....",
    "....KSSSSK....",
    "..KKKKKKKKKK..",
  ]);
  make('terminal2', [
    "..KKKKKKKKKK..",
    ".KSSSSSSSSSSK.",
    ".KSKKKKKKKKSK.",
    ".KSCCCCKCCCSK.",
    ".KSKKKKKKKKSK.",
    ".KSKCCKKCCKSK.",
    ".KSSSSSSSSSSK.",
    "..KKKKKKKKKK..",
    ".....KKKK.....",
    "....KSSSSK....",
    "....KSSSSK....",
    "..KKKKKKKKKK..",
  ]);
  make('spike', [
    ".K..K..K..K..K..",
    "KSK.KSK.KSK.KSK.",
    "KSKKSKKSKKSKKSKS",
    "KKKKKKKKKKKKKKKK",
  ]);

  // ================= COLLECTIBLE COMPONENT PARTS (16x16) =================
  make('part_battery', [
    "....KKKKKKKK....",
    "....KYYYYYYK....",
    "...KKKKKKKKKK...",
    "...KYYYYYYYYK...",
    "...KYYYKKYYYK...",
    "...KYYYKYYYYK...",
    "...KYYKYKYYYK...",
    "...KYYYKKYYYK...",
    "...KYYYYYKYYK...",
    "...KYYYYKYYYK...",
    "...KYYYKYYYYK...",
    "...KYYYYYYYYK...",
    "...KKKKKKKKKK...",
  ]);
  make('part_sensor', [
    ".....KKKKKK.....",
    "...KKWWWWWWKK...",
    "..KWWKKKKKKWWK..",
    "..KWKCCCCCKWK...",
    ".KWKCCKKCCKWK...",
    ".KWKCKWWKCKWK...",
    ".KWKCCKKCCKWK...",
    "..KWKCCCCCKWK...",
    "..KWWKKKKKKWWK..",
    "...KKWWWWWWKK...",
    ".....KKKKKK.....",
    "...KSSSSSSSSK...",
    "..KKKKKKKKKKKK..",
  ]);
  make('part_motor', [
    "....KKKKK.......",
    "...KKSSSKK......",
    "...KSSSSSKKKK...",
    "..KSSSKSSSSSKK..",
    "..KSKKSSSSSSSK..",
    "..KSSSSSSSSSSK..",
    "...KSSSSSSSK....",
    "....KKKKKKK.....",
    "....KKKKKKK.....",
    "...KSSSSSSSK....",
    "..KSSSKSSSSSK...",
    "..KSKKKKKKSSK...",
    "..KSSSSSSSSK....",
    "...KKKKKKKK.....",
  ]);
  make('part_cpu', [
    ".K.K.K.K.K.K.K..",
    ".KSKSKSKSKSKSK..",
    "KKKKKKKKKKKKKK..",
    "KSKKKKKKKKKKSK..",
    "KSKKCCCCCCKKSK..",
    "KSKCKKKKKKCKSK..",
    "KSKCKKKKKKCKSK..",
    "KSKKCCCCCCKKSK..",
    "KSKKKKKKKKKKSK..",
    "KKKKKKKKKKKKKK..",
    ".KSKSKSKSKSKSK..",
    ".K.K.K.K.K.K.K..",
  ]);

  // Boss zap bolt (8x4)
  make('bolt', [
    ".KK...KK",
    "KYKK.KYK",
    "KYYKKYYK",
    "KYYKKYYK",
  ]);

  // Heart / battery-cell HUD (8x7)
  make('hp_full', [
    ".KKKKKK.",
    "KYYYYYYK",
    "KYWWYYYK",
    "KYYYYYYK",
    "KYYYYYYK",
    "KYYYYYYK",
    ".KKKKKK.",
  ]);
  make('hp_empty', [
    ".KKKKKK.",
    "KskskskK",
    "KskskskK",
    "KskskskK",
    "KskskskK",
    "KskskskK",
    ".KKKKKK.",
  ]);

  return { make, get, draw, PAL };
})();
