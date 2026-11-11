# Pokemon-Stuff

this is a little something i made for my future wifey :3

## Run it

```bash
npm install     # first time only
npm run dev     # opens http://localhost:5173
npm run build   # makes the dist/ folder for hosting
```

## Where to change things

| I want to change...              | Edit this                                   |
| -------------------------------- | ------------------------------------------- |
| Start screen image / text        | `src/game/config.js` → `START_SCREEN`       |
| The map (tilemap) / tileset PNG  | `src/game/config.js` → `MAP`                |
| Character sprites / start spots  | `src/game/config.js` → `CHARACTERS`         |
| Songs                            | `src/game/config.js` → `SONGS`              |
| Where characters walk (the dance)| `src/game/movement.js` → `PATROL_ROUTE`     |
| How walking works (speed, etc.)  | `src/game/movement.js`                      |
| Music bar buttons                | `src/game/ui/SongPlayer.js`                 |

Image, map, and song files go in `public/assets/`:

```
public/assets/
  start-screen.png   start screen background
  maps/              Tiled maps (.tmj) + Pokeomon.tsx (for editing in Tiled)
  tiles/             tileset images
  sprites/           character sprite sheets (4x4: down, left, right, up)
  songs/             mp3s
```

### Swapping the tilemap

1. Make the map in Tiled and **File → Export As → JSON (.tmj)** into `public/assets/maps/`.
2. In Tiled, tilesets must be **embedded**. Phaser can't read separate `.tsx` files.
   In the Tilesets panel, select the tileset and click **Embed Tileset** before exporting.
3. Set `MAP.file` in `config.js` to the new file, and list the tileset PNG(s) in
   `MAP.tilesetImages`, in the same order as Tiled's Tilesets panel.

Layer names and the tileset name don't matter. Every tile layer is drawn
automatically, in the same order as in Tiled.

### Swapping the start screen

Drop the image at `public/assets/start-screen.png` (or change `START_SCREEN.background`).

## Code layout

```
src/game/
  config.js          ← all the swappable stuff
  movement.js        ← walking + the dance routine
  main.js            Phaser setup (screen size, scene list)
  scenes/
    Preloader.js     loads everything in config.js
    MainMenu.js      start screen
    Game.js          draws the map, places characters, adds music bar
  ui/SongPlayer.js   music bar
```
