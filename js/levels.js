// levels.js — level construction + all educational content.
window.RQ = window.RQ || {};

RQ.levels = (() => {
  const H = 12;

  function build(spec) {
    const W = spec.width;
    const grid = Array.from({ length: H }, () => Array(W).fill('.'));
    spec.meta = { gates: [], doors: [], bridges: [], darkness: [] };
    const put = (x, y, ch, w = 1) => {
      for (let i = 0; i < w; i++) if (grid[y] && x + i >= 0 && x + i < W) grid[y][x + i] = ch;
    };
    const ground = (x0, x1) => { for (let y = 9; y < H; y++) put(x0, y, '#', x1 - x0 + 1); };
    const plat = (x, y, w) => put(x, y, '-', w);
    const hiddenPlat = (x, y, w) => put(x, y, '=', w);
    const spikes = (x, w) => put(x, 8, '^', w);
    const arc = (x) => put(x, 8, '~');
    const screw = (x, y) => put(x, y, 'o');
    const term = (x) => put(x, 8, 'T');
    const crawl = (x) => put(x, 8, 'C');
    const fly = (x, y) => put(x, y, 'F');
    const spawn = (x) => put(x, 8, 'P');
    const goal = (x, y = 8) => put(x, y, 'G');
    const cell = (x, y = 7) => put(x, y, 'E');
    const crate = (x) => put(x, 8, 'B');
    const bench = (x) => put(x, 8, 'R');
    const barrier = (x) => { for (let y = 0; y < 9; y++) put(x, y, '|'); spec.meta.barrierX = x; };
    const gate = (x, id) => { put(x, 8, 'K'); spec.meta.gates.push({ x, id }); };
    const door = (x, y, h, id) => {
      for (let i = 0; i < h; i++) put(x, y + i, 'D');
      spec.meta.doors.push({ x, y, h, id });
    };
    const bridge = (x, y, len, id) => {
      put(x, y, 'b', len);
      spec.meta.bridges.push({ x, y, len, id });
    };
    const darkFrom = (x, id) => spec.meta.darkness.push({ x, id });
    spec.build({ put, ground, plat, hiddenPlat, spikes, arc, screw, term, crawl, fly, spawn, goal, cell, crate, bench, barrier, gate, door, bridge, darkFrom });
    return grid.map(r => r.join(''));
  }

  const THEMES = {
    power: {
      name: 'LEVEL 1 // POWER PLANT', part: 'part_battery', partName: 'BATTERY CORE',
      skyTop: '#0a0a24', skyBot: '#241a55', far: '#1d1445', near: '#120d30',
      dirt: '#463a78', dirtDark: '#2c2350', edge: '#ffd23f', plat: '#6a5aa8',
      accent: '#ffd23f', deco: 'pylon',
    },
    sensor: {
      name: 'LEVEL 2 // SENSOR FIELDS', part: 'part_sensor', partName: 'SENSOR ARRAY',
      skyTop: '#06241f', skyBot: '#0f4a3d', far: '#0d3b32', near: '#082720',
      dirt: '#1e5a48', dirtDark: '#123c30', edge: '#7dd069', plat: '#2e7a5f',
      accent: '#7dd069', deco: 'dish',
    },
    motor: {
      name: 'LEVEL 3 // MOTOR WORKS', part: 'part_motor', partName: 'GEARBOX',
      skyTop: '#2a1008', skyBot: '#5a2410', far: '#411a0c', near: '#2a1206',
      dirt: '#6b3a1e', dirtDark: '#4a2812', edge: '#f0883b', plat: '#8a5230',
      accent: '#f0883b', deco: 'gear',
    },
    circuit: {
      name: 'LEVEL 4 // CIRCUIT CITY', part: 'part_cpu', partName: 'CONTROLLER',
      skyTop: '#050818', skyBot: '#101d3f', far: '#0c1630', near: '#070d20',
      dirt: '#1d2c55', dirtDark: '#121d3a', edge: '#59d8ff', plat: '#2a3f78',
      accent: '#59d8ff', deco: 'chip',
    },
    boss: {
      name: 'FINAL // SCRAP THRONE', skyTop: '#20060c', skyBot: '#4a1420',
      far: '#32090f', near: '#1d0509', dirt: '#4a2430', dirtDark: '#301520',
      edge: '#d94f6a', plat: '#5e3342', accent: '#d94f6a', deco: 'scrap',
    },
  };

  const FACTS = {
    power: [
      "The POWER SUPPLY is the robot's lunchbox — it feeds energy to every wire, motor, and chip. No power, no robot.",
      "Most robots run on BATTERIES. Small bots use Li-ion packs; an electric car is basically a giant battery robot.",
      "VOLTAGE is electrical pressure. Too much fries the circuits — a REGULATOR keeps it smooth and safe.",
      "Smart robots watch their own charge and dock themselves before they run dry.",
    ],
    sensor: [
      "SENSORS are the robot's senses — they turn light, sound, and touch into numbers the brain can read.",
      "ULTRASONIC sensors shout a ping and time the echo — that's how a robot 'sees' distance, like a bat.",
      "GYROSCOPES + ACCELEROMETERS feel tilt and motion — that's the sense that tells a robot which way is up.",
      "CAMERAS feed pictures to vision code — that's how robots spot faces, read signs, and follow lines.",
    ],
    motor: [
      "ACTUATORS are the robot's muscles — they turn electricity into motion. Wheels, arms, grippers: all actuators.",
      "DC MOTORS spin fast for wheels. Add a GEARBOX and you trade speed for muscle — that muscle is called torque.",
      "SERVO motors snap to exact angles — that's how robot arms wave hello and steering wheels turn.",
      "Legs, propellers, claws — if it makes the robot move, it's an actuator doing the moving.",
    ],
    circuit: [
      "The CONTROLLER is the robot's brain — a tiny computer that reads sensors and orders motors.",
      "Every robot runs one loop forever: SENSE the world > THINK about it > ACT on it. Repeat.",
      "The PROGRAM is the recipe the brain follows: IF ball rolls left THEN turn left.",
      "Hardware without software is a paperweight — the program turns parts into a robot.",
    ],
  };

  const BENCHES = [
    { part: 'battery', ability: 'sprint',
      problem: "BOLT keeps BROWNING OUT. His motors starve the moment he moves. What does he need?",
      options: [
        { label: 'Battery pack', icon: 'part_battery', ok: true, why: '' },
        { label: 'Bigger wheels', icon: 'opt_wheel', ok: false, why: "Bigger wheels need MORE energy to turn. The problem is the power SUPPLY." },
        { label: 'Antenna', icon: 'opt_antenna', ok: false, why: "An antenna sends and receives signals. It doesn't store energy." },
      ],
      unlock: "ABILITY: SPRINT (hold SHIFT or X)",
      lesson: "The battery stores energy and a regulator keeps the voltage steady, so motors can run at full power." },
    { part: 'sensor', ability: 'sonar',
      problem: "It's pitch black. BOLT needs to find platforms he can't see. Which part measures distance?",
      options: [
        { label: 'Gyroscope', icon: 'opt_gyro', ok: false, why: "A gyroscope senses tilt and rotation. Great for balance, but it can't measure distance." },
        { label: 'Ultrasonic sensor', icon: 'part_sensor', ok: true, why: '' },
        { label: 'Speaker', icon: 'opt_speaker', ok: false, why: "A speaker only makes sound. It can't hear the echo coming back." },
      ],
      unlock: "ABILITY: SONAR PING (press C)",
      lesson: "Ultrasonic sensors send out a sound ping and time how long the echo takes to come back. Longer echo means farther away." },
    { part: 'motor', ability: 'torque',
      problem: "The crate won't budge. BOLT's motor spins FAST but it's too WEAK. What should he add?",
      options: [
        { label: 'Faster motor', icon: 'opt_motor', ok: false, why: "More speed doesn't add strength. The wheels would just spin faster." },
        { label: 'Bigger battery', icon: 'part_battery', ok: false, why: "Power isn't the problem here. The motor needs leverage." },
        { label: 'Gearbox', icon: 'part_motor', ok: true, why: '' },
      ],
      unlock: "ABILITY: TORQUE (walk into crates to push)",
      lesson: "Gears trade speed for strength. Slower but stronger, and that turning strength is called TORQUE." },
    { part: 'cpu', ability: 'cpu',
      problem: "The code gates need a robot that can READ sensors and DECIDE what to do. Which part does that?",
      options: [
        { label: 'Chassis', icon: 'opt_chassis', ok: false, why: "The chassis is the robot's body frame. It holds parts but can't think." },
        { label: 'Controller', icon: 'part_cpu', ok: true, why: '' },
        { label: 'Battery', icon: 'part_battery', ok: false, why: "The battery powers the brain, but it can't make decisions." },
      ],
      unlock: "ABILITY: PROGRAM CODE GATES (press E at a gate)",
      lesson: "The controller runs the loop SENSE > THINK > ACT. It reads sensors, runs code, then drives motors." },
  ];

  const GATES = [
    { goal: "Extend the bridge when BOLT walks up to the pit.",
      ifOpts: [
        { label: 'Proximity sensor sees BOLT', ok: true, why: '' },
        { label: 'Light sensor sees darkness', ok: false, why: "Darkness has nothing to do with BOLT arriving. Sense the thing you care about." },
        { label: 'Timer hits 60 minutes', ok: false, why: "BOLT would wait an hour! React to what the sensor detects, not a random timer." },
      ],
      thenOpts: [
        { label: 'Sound the alarm', ok: false, why: "An alarm doesn't help BOLT cross. The ACT step must solve the problem." },
        { label: 'Extend the bridge', ok: true, why: '' },
        { label: 'Retract the bridge', ok: false, why: "That's the opposite. The bridge would vanish right when BOLT needs it." },
      ] },
    { goal: "Open the door ONLY for BOLT, not for scrap bots.",
      ifOpts: [
        { label: 'Any motion detected', ok: false, why: "Scrap bots move too. That rule lets anyone in." },
        { label: "Camera sees BOLT's badge", ok: true, why: '' },
        { label: 'Door is closed', ok: false, why: "The door is ALWAYS closed before it opens, so this rule would open it for everyone." },
      ],
      thenOpts: [
        { label: 'Open the door', ok: true, why: '' },
        { label: 'Lock the door', ok: false, why: "It's already locked. BOLT needs it OPEN." },
        { label: 'Flash the lights', ok: false, why: "Pretty, but the door stays shut." },
      ] },
    { goal: "Turn the lights on when the room gets dark.",
      ifOpts: [
        { label: 'Light sensor reads DARK', ok: true, why: '' },
        { label: 'Light sensor reads BRIGHT', ok: false, why: "Turning lights on when it's already bright wastes power and doesn't help in the dark." },
        { label: 'Bumper is pressed', ok: false, why: "Touch doesn't tell you how bright the room is. Use the light sensor." },
      ],
      thenOpts: [
        { label: 'Turn the lights OFF', ok: false, why: "Backwards! It's dark, so BOLT needs light." },
        { label: 'Spin the wheels', ok: false, why: "Moving won't make the room brighter." },
        { label: 'Turn the lights ON', ok: true, why: '' },
      ] },
  ];

  const LEVELS = [
    {
      theme: THEMES.power, facts: FACTS.power, width: 150, partAEnd: 37, partBStart: 39,
      build(b) {
        b.ground(0, 13); b.ground(16, 37); b.bench(34); b.barrier(38);
        b.ground(39, 49); b.ground(55, 63); b.ground(69, 78); b.ground(84, 149);
        b.spikes(23, 2); b.screw(8, 7); b.screw(25, 7); b.term(5); b.term(30);
        b.cell(11, 8); b.cell(21, 8); b.cell(29, 8);
        b.spawn(3);
        b.goal(144);
      },
    },
    {
      theme: THEMES.sensor, facts: FACTS.sensor, width: 160, dark: true, partAEnd: 32, partBStart: 36,
      build(b) {
        b.ground(0, 12); b.ground(16, 32); b.bench(30); b.barrier(35);
        b.ground(36, 48); b.ground(79, 159);
        b.hiddenPlat(49, 7, 5); b.hiddenPlat(56, 7, 5); b.hiddenPlat(63, 7, 5);
        b.hiddenPlat(70, 7, 5); b.hiddenPlat(76, 7, 3);
        b.term(6); b.term(28); b.screw(9, 7); b.screw(24, 7);
        b.spawn(3);
        b.goal(154);
      },
    },
    {
      theme: THEMES.motor, facts: FACTS.motor, width: 160, partAEnd: 42, partBStart: 45,
      build(b) {
        b.ground(0, 25); b.ground(28, 42); b.bench(39); b.barrier(44);
        b.ground(45, 159);
        b.put(14, 7, '#', 5);
        b.crate(12); b.crate(55); b.crate(82);
        b.put(59, 5, '#'); b.put(59, 6, '#'); b.put(59, 7, '#'); b.put(59, 8, '#');
        b.put(86, 5, '#'); b.put(86, 6, '#'); b.put(86, 7, '#'); b.put(86, 8, '#');
        b.term(7); b.term(37); b.screw(22, 7);
        b.spawn(3);
        b.goal(154);
      },
    },
    {
      theme: THEMES.circuit, facts: FACTS.circuit, width: 160, partAEnd: 10, partBStart: 12,
      build(b) {
        b.ground(0, 27); b.ground(37, 159); b.bench(7); b.barrier(11);
        b.gate(22, 0); b.bridge(28, 9, 9, 0);
        b.gate(50, 1); b.door(58, 7, 2, 1);
        b.gate(82, 2); b.darkFrom(90, 2);
        b.term(5); b.term(49); b.term(80);
        b.spawn(3);
        b.goal(150);
      },
    },
  ];

  const QUIZ = [
    { q: "What is the robot's POWER SUPPLY for?", a: ["To store and provide energy", "To measure distance", "To balance the robot", "To write code"], c: 0, hint: "The power supply feeds energy to every wire, motor, and chip." },
    { q: "What does a VOLTAGE REGULATOR do?", a: ["Keeps voltage steady", "Makes motors louder", "Sees in the dark", "Stores the program"], c: 0, hint: "Voltage is pressure — a regulator keeps it smooth and safe." },
    { q: "How does an ULTRASONIC sensor measure distance?", a: ["By timing a sound echo", "By sensing tilt", "By taking a picture", "By feeling touch"], c: 0, hint: "Send a ping, time the echo coming back: longer time means farther away." },
    { q: "Which part helps a robot keep its BALANCE?", a: ["LED lights", "Touch bumper", "Speaker", "Gyroscope"], c: 3, hint: "A gyroscope senses tilt and rotation to help the robot stay balanced." },
    { q: "A GEARBOX gives a motor more...", a: ["Speed only", "Torque — turning strength", "Light", "Battery charge"], c: 1, hint: "Gears trade speed for strength. That turning strength is torque." },
    { q: "Which actuator moves to an EXACT ANGLE?", a: ["DC motor", "Servo motor", "Propeller", "Spring"], c: 1, hint: "A servo is position-precise: it can point to a chosen angle." },
    { q: "The controller is the brain: what loop does it run?", a: ["SENSE > THINK > ACT", "ACT > EAT > SLEEP", "THINK > SENSE > STOP", "MOVE > WAIT > MOVE"], c: 0, hint: "The controller reads sensor data, decides, then drives actuators." },
    { q: "IF proximity sensor sees BOLT THEN ___", a: ["Extend the bridge", "Retract the bridge", "Sound an alarm", "Wait an hour"], c: 0, hint: "A program combines a sensed condition (IF) with a useful action (THEN)." },
  ];

  const INTRO = [
    "BOLT was the factory's top teaching bot — until MEGA-SCRAP smashed him for parts.",
    "Rebuild him one system at a time: POWER it, let it SENSE, make it MOVE, give it a BRAIN.",
    "Use every new part to cross the factory. Then face the scrap king's FINAL EXAM.",
  ];

  function audit() {
    const lines = [], failures = [];
    const requireRule = (condition, message) => { if (!condition) failures.push(message); };
    LEVELS.forEach((spec, idx) => {
      const map = build(spec);
      const gaps = [];
      let x = 0;
      while (x < spec.width) {
        if (map[9][x] === '#') { x++; continue; }
        const start = x;
        while (x < spec.width && map[9][x] !== '#') x++;
        if (start > 0 && x < spec.width) gaps.push({ x: start, width: x - start });
      }
      const walls = [];
      for (let tx = 0; tx < spec.width; tx++) {
        let height = 0;
        for (let ty = 8; ty >= 0 && map[ty][tx] === '#'; ty--) height++;
        if (height > 0) walls.push({ x: tx, height });
      }
      const aGaps = gaps.filter(g => g.x <= spec.partAEnd);
      const bGaps = gaps.filter(g => g.x >= spec.partBStart);
      const aWalls = walls.filter(w => w.x <= spec.partAEnd);
      const benchX = map[8].indexOf('R');
      const barrierX = spec.meta.barrierX;
      const goalX = map[8].indexOf('G');
      requireRule(benchX >= 0 && benchX < barrierX && barrierX < spec.partBStart, `L${idx + 1} needs a bench and barrier between Part A and Part B`);
      requireRule(goalX >= spec.partBStart && goalX >= spec.width - 20, `L${idx + 1} goal must be at the end of Part B`);
      requireRule(aGaps.every(g => g.width <= 3), `L${idx + 1} Part A has a gap wider than 3 tiles`);
      requireRule(aWalls.every(w => w.height <= 3), `L${idx + 1} Part A has a wall taller than 3 tiles`);
      if (idx === 0) {
        requireRule(bGaps.filter(g => g.width === 5).length >= 3, 'L1 Part B needs at least three 5-tile gaps');
        requireRule(gaps.every(g => g.width <= 5), 'L1 has a gap wider than 5 tiles');
      }
      if (idx === 1) {
        requireRule(map.some(row => row.includes('=')), 'L2 needs hidden platforms');
        requireRule(bGaps.some(g => g.width > 5), 'L2 Part B needs its hidden-platform pit');
      }
      if (idx === 2) {
        const fourWalls = walls.filter(w => w.height === 4 && w.x >= spec.partBStart);
        requireRule(fourWalls.length >= 2, 'L3 Part B needs at least two 4-tile walls');
        const crates = [];
        for (let ty = 0; ty < H; ty++) for (let tx = 0; tx < spec.width; tx++) if (map[ty][tx] === 'B') crates.push(tx);
        requireRule(fourWalls.every(w => crates.some(cx => cx < w.x && w.x - cx <= 5 && map[9][cx] === '#')), 'L3 needs a crate on each wall ground segment');
      }
      if (idx === 3) {
        requireRule(spec.meta.gates.length === 3, 'L4 needs three code gates');
        requireRule(spec.meta.gates.every((g, i) => g.id === i) &&
          spec.meta.gates.every((g, i) => i === 0 || g.x > spec.meta.gates[i - 1].x), 'L4 gates must be ordered 0, 1, 2 by x');
        requireRule(spec.meta.bridges.some(b => b.id === 0) && spec.meta.doors.some(d => d.id === 1) &&
          spec.meta.darkness.some(d => d.id === 2), 'L4 needs bridge, door, and darkness effects');
      }
      const gapText = gaps.length ? gaps.map(g => `x${g.x}-${g.x + g.width - 1}:${g.width}`).join(', ') : 'none';
      const wallText = walls.length ? walls.map(w => `x${w.x}:${w.height}`).join(', ') : 'none';
      lines.push(`L${idx + 1}: gaps [${gapText}] | walls [${wallText}] | bench x${benchX}, barrier x${barrierX}, goal x${goalX} | stage boundary A<=${spec.partAEnd}, B>=${spec.partBStart}`);
    });
    const output = lines.join('\n') + (failures.length ? `\nFAIL: ${failures.join('; ')}` : '\nPASS: all level geometry rules satisfied');
    console.log(output);
    if (failures.length) throw new Error(failures.join('; '));
    return { ok: true, output };
  }

  return { LEVELS, THEMES, FACTS, BENCHES, GATES, QUIZ, INTRO, H, build, audit };
})();
