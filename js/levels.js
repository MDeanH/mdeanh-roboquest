// levels.js — level construction + all educational content.
// Maps are built on a grid (H=12, tile=16px) via a tiny builder API.
window.RQ = window.RQ || {};

RQ.levels = (() => {
  const H = 12;

  function build(spec) {
    const W = spec.width;
    const grid = Array.from({ length: H }, () => Array(W).fill('.'));

    const put = (x, y, ch, w = 1) => {
      for (let i = 0; i < w; i++) if (grid[y] && x + i >= 0 && x + i < W) grid[y][x + i] = ch;
    };
    const ground = (x0, x1) => { for (let y = 9; y < H; y++) put(x0, y, '#', x1 - x0 + 1); };
    const plat   = (x, y, w) => put(x, y, '-', w);
    const spikes = (x, w) => put(x, 8, '^', w);
    const arc    = (x) => put(x, 8, '~');
    const screw  = (x, y) => put(x, y, 'o');
    const term   = (x) => put(x, 8, 'T');
    const crawl  = (x) => put(x, 8, 'C');
    const fly    = (x, y) => put(x, y, 'F');
    const spawn  = (x) => put(x, 8, 'P');
    const goal   = (x, y = 7) => put(x, y, 'G');

    spec.build({ put, ground, plat, spikes, arc, screw, term, crawl, fly, spawn, goal });
    return grid.map(r => r.join(''));
  }

  // ---------- THEMES ----------
  const THEMES = {
    power: {
      name: 'LEVEL 1 // POWER PLANT',
      part: 'part_battery', partName: 'BATTERY CORE',
      skyTop: '#0a0a24', skyBot: '#241a55',
      far: '#1d1445', near: '#120d30',
      dirt: '#463a78', dirtDark: '#2c2350', edge: '#ffd23f', plat: '#6a5aa8',
      accent: '#ffd23f', deco: 'pylon',
    },
    sensor: {
      name: 'LEVEL 2 // SENSOR FIELDS',
      part: 'part_sensor', partName: 'SENSOR ARRAY',
      skyTop: '#06241f', skyBot: '#0f4a3d',
      far: '#0d3b32', near: '#082720',
      dirt: '#1e5a48', dirtDark: '#123c30', edge: '#7dd069', plat: '#2e7a5f',
      accent: '#7dd069', deco: 'dish',
    },
    motor: {
      name: 'LEVEL 3 // MOTOR WORKS',
      part: 'part_motor', partName: 'SERVO MOTOR',
      skyTop: '#2a1008', skyBot: '#5a2410',
      far: '#411a0c', near: '#2a1206',
      dirt: '#6b3a1e', dirtDark: '#4a2812', edge: '#f0883b', plat: '#8a5230',
      accent: '#f0883b', deco: 'gear',
    },
    circuit: {
      name: 'LEVEL 4 // CIRCUIT CITY',
      part: 'part_cpu', partName: 'CPU BRAIN',
      skyTop: '#050818', skyBot: '#101d3f',
      far: '#0c1630', near: '#070d20',
      dirt: '#1d2c55', dirtDark: '#121d3a', edge: '#59d8ff', plat: '#2a3f78',
      accent: '#59d8ff', deco: 'chip',
    },
    boss: {
      name: 'FINAL // SCRAP THRONE',
      skyTop: '#20060c', skyBot: '#4a1420',
      far: '#32090f', near: '#1d0509',
      dirt: '#4a2430', dirtDark: '#301520', edge: '#d94f6a', plat: '#5e3342',
      accent: '#d94f6a', deco: 'scrap',
    },
  };

  // ---------- FACT CONTENT ----------
  const FACTS = {
    power: [
      "A robot's POWER SUPPLY feeds energy to every other part. No power... no robot.",
      "Most robots run on BATTERIES — Li-ion packs in small bots, bigger packs in machines like cars and drones.",
      "VOLTAGE is electrical pressure. Every component needs the right amount — a REGULATOR keeps it steady.",
      "Robots watch their own charge level and must recharge or swap batteries before they run dry.",
    ],
    sensor: [
      "SENSORS are a robot's eyes and ears — they turn the real world into data the brain can use.",
      "ULTRASONIC sensors fire a sound ping and time the echo to measure distance — like a bat in the dark.",
      "GYROSCOPES and ACCELEROMETERS feel tilt and motion, so robots can balance and know which way is up.",
      "CAMERAS plus vision code let robots spot objects, read signs, and follow lines on the floor.",
    ],
    motor: [
      "ACTUATORS make robots move — they turn electrical energy into motion.",
      "DC MOTORS spin fast and drive wheels. A GEARBOX trades speed for strength — that strength is called torque.",
      "SERVO motors snap to exact angles — perfect for steering wheels and robot arms.",
      "Grippers, wheels, legs and propellers all count as actuators — anything that moves the bot.",
    ],
    circuit: [
      "The CONTROLLER is the robot's brain — a microcontroller like an Arduino, or a computer like a Raspberry Pi.",
      "Every robot runs the same loop: SENSE (read sensors) > THINK (run code) > ACT (drive motors).",
      "The PROGRAM is a list of instructions: IF obstacle ahead THEN turn left. Code decides everything.",
      "Without software, the best hardware is a paperweight — the program is what makes it a robot.",
    ],
  };

  // ---------- LEVEL SPECS ----------
  const LEVELS = [
    {
      theme: THEMES.power, facts: FACTS.power,
      width: 150,
      build(b) {
        b.ground(0, 29); b.ground(33, 58); b.ground(62, 95); b.ground(100, 149);
        b.spikes(40, 4); b.spikes(126, 3);
        b.arc(70); b.arc(112);
        b.plat(12, 7, 5); b.plat(36, 5, 7); b.plat(66, 7, 5); b.plat(80, 6, 6);
        b.plat(104, 5, 7); b.plat(118, 7, 7); b.plat(142, 8, 7);
        b.screw(13, 6); b.screw(15, 6); b.screw(38, 4); b.screw(40, 4);
        b.screw(67, 6); b.screw(69, 6); b.screw(82, 5); b.screw(106, 4);
        b.screw(108, 4); b.screw(120, 6); b.screw(122, 6);
        b.screw(25, 8); b.screw(52, 8); b.screw(88, 8); b.screw(135, 8);
        b.term(14); b.term(55); b.term(105);
        b.crawl(48); b.crawl(85); b.fly(118, 5);
        b.spawn(3);
        b.goal(145, 7);
      },
    },
    {
      theme: THEMES.sensor, facts: FACTS.sensor,
      width: 160,
      build(b) {
        b.ground(0, 24); b.ground(28, 55); b.ground(60, 88); b.ground(93, 130); b.ground(134, 159);
        b.spikes(75, 3); b.spikes(120, 3);
        b.arc(50); b.arc(110);
        b.plat(8, 7, 5); b.plat(30, 6, 7); b.plat(40, 4, 7); b.plat(62, 7, 7);
        b.plat(78, 5, 7); b.plat(96, 7, 7); b.plat(112, 5, 7); b.plat(124, 6, 7);
        b.plat(140, 4, 7); b.plat(152, 8, 7);
        b.screw(9, 6); b.screw(11, 6); b.screw(32, 5); b.screw(42, 3);
        b.screw(44, 3); b.screw(64, 6); b.screw(80, 4); b.screw(98, 6);
        b.screw(114, 4); b.screw(126, 5); b.screw(142, 3); b.screw(144, 3);
        b.screw(36, 8); b.screw(84, 8); b.screw(104, 8); b.screw(150, 8);
        b.term(6); b.term(64); b.term(98); b.term(136);
        b.crawl(35); b.crawl(70); b.crawl(116); b.fly(58, 4); b.fly(126, 3);
        b.spawn(3);
        b.goal(155, 7);
      },
    },
    {
      theme: THEMES.motor, facts: FACTS.motor,
      width: 160,
      build(b) {
        b.ground(0, 20); b.ground(24, 50); b.ground(55, 82); b.ground(87, 115); b.ground(120, 159);
        b.spikes(30, 3); b.spikes(66, 3); b.spikes(100, 4); b.spikes(140, 3);
        b.arc(46); b.arc(92); b.arc(128);
        b.plat(10, 7, 5); b.plat(26, 6, 7); b.plat(34, 4, 7); b.plat(57, 7, 7);
        b.plat(72, 6, 7); b.plat(80, 4, 5); b.plat(96, 7, 7); b.plat(108, 5, 7);
        b.plat(122, 7, 7); b.plat(136, 5, 7); b.plat(152, 8, 7);
        b.screw(11, 6); b.screw(28, 5); b.screw(36, 3); b.screw(38, 3);
        b.screw(59, 6); b.screw(74, 5); b.screw(82, 3); b.screw(98, 6);
        b.screw(110, 4); b.screw(124, 6); b.screw(138, 4); b.screw(154, 7);
        b.screw(16, 8); b.screw(44, 8); b.screw(78, 8); b.screw(146, 8);
        b.term(12); b.term(60); b.term(124);
        b.crawl(38); b.crawl(76); b.crawl(105); b.crawl(145);
        b.fly(84, 4); b.fly(132, 3);
        b.spawn(3);
        b.goal(155, 7);
      },
    },
    {
      theme: THEMES.circuit, facts: FACTS.circuit,
      width: 170,
      build(b) {
        b.ground(0, 18); b.ground(22, 48); b.ground(52, 78); b.ground(82, 110);
        b.ground(114, 142); b.ground(146, 169);
        b.spikes(26, 3); b.spikes(58, 4); b.spikes(88, 3); b.spikes(120, 4); b.spikes(150, 3);
        b.arc(42); b.arc(74); b.arc(106); b.arc(138);
        b.plat(6, 7, 5); b.plat(24, 6, 7); b.plat(36, 4, 7); b.plat(54, 7, 7);
        b.plat(66, 5, 7); b.plat(84, 7, 7); b.plat(96, 4, 7); b.plat(116, 6, 7);
        b.plat(130, 4, 7); b.plat(146, 7, 7); b.plat(156, 5, 7); b.plat(163, 8, 6);
        b.screw(7, 6); b.screw(26, 5); b.screw(38, 3); b.screw(56, 6);
        b.screw(68, 4); b.screw(86, 6); b.screw(98, 3); b.screw(118, 5);
        b.screw(132, 3); b.screw(148, 6); b.screw(158, 4); b.screw(165, 7);
        b.screw(14, 8); b.screw(45, 8); b.screw(102, 8); b.screw(133, 8);
        b.term(8); b.term(55); b.term(85); b.term(147);
        b.crawl(33); b.crawl(65); b.crawl(95); b.crawl(125); b.crawl(155);
        b.fly(45, 4); b.fly(110, 3); b.fly(140, 4);
        b.spawn(3);
        b.goal(166, 7);
      },
    },
  ];

  // ---------- BOSS QUIZ ----------
  const QUIZ = [
    {
      q: "Which part gives a robot its ENERGY?",
      a: ["The antenna", "The power supply", "The wheels", "The camera"],
      c: 1, hint: FACTS.power[0],
    },
    {
      q: "What does a VOLTAGE REGULATOR do?",
      a: ["Keeps power steady", "Makes motors louder", "Sees in the dark", "Stores the program"],
      c: 0, hint: FACTS.power[2],
    },
    {
      q: "Which sensor pings SOUND to measure distance?",
      a: ["Camera", "Gyroscope", "Ultrasonic", "Touch sensor"],
      c: 2, hint: FACTS.sensor[1],
    },
    {
      q: "Which sensor helps a robot keep its BALANCE?",
      a: ["Heat sensor", "Touch bumper", "LED", "Gyroscope"],
      c: 3, hint: FACTS.sensor[2],
    },
    {
      q: "Which actuator snaps to an EXACT ANGLE?",
      a: ["DC motor", "Servo motor", "Propeller", "Spring"],
      c: 1, hint: FACTS.motor[2],
    },
    {
      q: "A GEARBOX trades speed for...",
      a: ["Color", "Weight", "Torque (strength)", "Battery life"],
      c: 2, hint: FACTS.motor[1],
    },
    {
      q: "What is the robot's BRAIN called?",
      a: ["The chassis", "The controller", "The gearbox", "The sensor"],
      c: 1, hint: FACTS.circuit[0],
    },
    {
      q: "Every robot runs which loop?",
      a: ["Act-Think-Sense", "Think-Act-Sense", "Sense-Think-Act", "Sleep-Eat-Act"],
      c: 2, hint: FACTS.circuit[1],
    },
  ];

  const INTRO = [
    "BOLT was the factory's best teaching bot — until MEGA-SCRAP tore him apart.",
    "Rebuild BOLT piece by piece: BATTERY, SENSORS, MOTORS, CPU.",
    "Learn what each part does... then take the final exam from the scrap king himself.",
  ];

  return { LEVELS, THEMES, FACTS, QUIZ, INTRO, H, build };
})();
