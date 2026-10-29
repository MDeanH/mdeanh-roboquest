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
      "The CONTROLLER is the robot's brain — a tiny computer (Arduino, Raspberry Pi) that reads sensors and orders motors.",
      "Every robot runs one loop forever: SENSE the world > THINK about it > ACT on it. Repeat.",
      "The PROGRAM is the recipe the brain follows: IF ball rolls left THEN turn left. Robots only do what code says.",
      "Hardware without software is a paperweight — the program is what turns a pile of parts into a robot.",
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
      q: "Which part is the robot's ENERGY source?",
      a: ["Antenna", "Power supply", "Wheels", "Camera"],
      c: 1, hint: "Think lunchbox: the power supply feeds energy to every other part.",
    },
    {
      q: "What does a VOLTAGE REGULATOR do?",
      a: ["Keeps power steady", "Makes motors louder", "Sees in the dark", "Stores the program"],
      c: 0, hint: "Voltage is pressure — the regulator keeps it smooth so circuits don't fry.",
    },
    {
      q: "Which sensor uses SOUND to measure distance?",
      a: ["Camera", "Gyroscope", "Ultrasonic sensor", "Touch bumper"],
      c: 2, hint: "It's the bat trick: ping a sound, time the echo.",
    },
    {
      q: "What helps a robot keep its BALANCE?",
      a: ["LED lights", "Touch bumper", "Speaker", "Gyroscope"],
      c: 3, hint: "The same sense that tells you which way is up.",
    },
    {
      q: "Which actuator snaps to an EXACT ANGLE?",
      a: ["DC motor", "Servo motor", "Propeller", "Spring"],
      c: 1, hint: "Servos are position-precise — arms and steering, not wheels.",
    },
    {
      q: "A GEARBOX trades speed for...",
      a: ["Fancier colors", "Less weight", "Torque — muscle", "Longer battery life"],
      c: 2, hint: "Gears: slower but stronger. That strength is called torque.",
    },
    {
      q: "What's the robot's BRAIN called?",
      a: ["The chassis", "The controller", "The gearbox", "The sensor"],
      c: 1, hint: "It's the little computer running the whole show.",
    },
    {
      q: "Every robot repeats which loop forever?",
      a: ["Act-Think-Sense", "Think-Act-Sense", "Sense-Think-Act", "Eat-Sleep-Repeat"],
      c: 2, hint: "SENSE first — a robot can't think about data it never gathered.",
    },
  ];

  const INTRO = [
    "BOLT was the factory's top teaching bot — until MEGA-SCRAP smashed him for parts.",
    "Rebuild him one system at a time: POWER it, let it SENSE, make it MOVE, give it a BRAIN.",
    "Collect the parts. Read the terminals. Then face the scrap king's FINAL EXAM.",
  ];

  return { LEVELS, THEMES, FACTS, QUIZ, INTRO, H, build };
})();
