# ROBOQUEST — Build-a-Bot Adventure

A 16-bit retro platformer that teaches the parts of a robot. Play as **BOLT**,
a teaching bot torn apart by the scrap king MEGA-SCRAP — rebuild him piece by
piece across four factory lands, then pass the final exam.

**Pure static site — no build step, no dependencies, no assets.** All pixel art
is generated in code and all sound is synthesized with WebAudio.

## Play it

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Controls

| Input | Action |
|---|---|
| Arrows / WASD | Move |
| Space / Z / Up | Jump (hold for higher) |
| E / Down | Read data terminal |
| Enter | Advance screens |
| M | Mute |

## The levels

| Level | Component taught |
|---|---|
| 1 · Power Plant | Battery & power supply (voltage, regulators, charge) |
| 2 · Sensor Fields | Sensors (ultrasonic, gyro, accelerometer, cameras) |
| 3 · Motor Works | Actuators (DC motors, servos, gearboxes, torque) |
| 4 · Circuit City | Controller / CPU (Sense-Think-Act, programs) |
| Final · Scrap Throne | Quiz boss — answer questions by standing on pads |

Read the glowing **data terminals** in each level — the final boss only asks
questions the terminals answered.

## Deploy on Netlify

This repo is deploy-ready (`netlify.toml` sets `publish = "."`, no build):

1. In Netlify: **Add new site → Import an existing project → GitHub** and pick this repo.
2. Leave **Build command** empty, **Publish directory** = `/`.
3. Deploy — done. Every push to `main` redeploys automatically.

Or with the CLI: `netlify deploy --prod --dir .`
