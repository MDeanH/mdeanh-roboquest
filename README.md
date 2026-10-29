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
| Space / Z | Jump (hold for higher) |
| Shift / X | Sprint (after installing the battery) |
| C | Sonar ping (after installing the sensor) |
| E | Use repair benches and code gates |
| Enter | Choose an answer / advance scenes |
| M | Mute |

## The levels

| Level | Component taught |
|---|---|
| 1 · Power Plant | Survive brownouts, collect energy, then sprint across five-tile gaps |
| 2 · Sensor Fields | Ping to reveal hidden platforms and cross a dark pit |
| 3 · Motor Works | Push heavy crates with gearbox torque to climb four-tile walls |
| 4 · Circuit City | Program three IF/THEN code gates to build a bridge, open a door, and turn on lights |
| Final · Scrap Throne | Quiz boss — answer questions by standing on pads |

Walk past information beacons to learn quick robot facts. At each repair bench,
diagnose BOLT's problem and install the part that makes the next challenge
possible. The final boss tests the ideas you used along the way.

## Deploy on Netlify

This repo is deploy-ready (`netlify.toml` sets `publish = "."`, no build):

1. In Netlify: **Add new site → Import an existing project → GitHub** and pick this repo.
2. Leave **Build command** empty, **Publish directory** = `/`.
3. Deploy — done. Every push to `main` redeploys automatically.

Or with the CLI: `netlify deploy --prod --dir .`
