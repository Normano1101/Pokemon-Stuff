// =====================================================================
//  GAME SETTINGS — change things here.
//  All paths are relative to the `public/` folder.
// =====================================================================

// ---------------------------------------------------------------------
//  START SCREEN
// ---------------------------------------------------------------------
export const START_SCREEN = {
    background: 'assets/start-screen.png', // any image; stretched to fill the screen
    title: 'Phaser',                       // big text; set to '' to hide it
    prompt: 'Play :3'                      // smaller "click to start" text
};

// ---------------------------------------------------------------------
//  TILEMAP  (made in Tiled, exported as .tmj / JSON)
//
//  To swap the map:
//    1. Put the new .tmj in public/assets/maps/ and point `file` at it.
//    2. List the tileset PNG(s) in `tilesetImages`, in the SAME ORDER as
//       the Tilesets panel in Tiled.
//    3. In Tiled, tilesets must be EMBEDDED in the map (Phaser can't read
//       separate .tsx files). Tilesets panel -> select tileset -> "Embed Tileset".
//
//  Layer names and the tileset name don't matter: every tile layer is
//  drawn automatically, in the order they appear in Tiled.
// ---------------------------------------------------------------------
export const MAP = {
    file: 'assets/maps/wedding.tmj',
    tilesetImages: ['assets/tiles/Outside.png'],
    tileSize: 32,
    caption: 'OUR FUTURE WEDDING :)'       // text bar at the bottom; '' to hide
};

// ---------------------------------------------------------------------
//  CHARACTER SPRITES
//
//  Each sprite sheet is a 4x4 grid:
//    row 1 = walking down, row 2 = left, row 3 = right, row 4 = up
//    (4 frames per row)
//
//  `key` is the name used in movement.js (PATROL_ROUTE) to refer to it.
//  `startTile` is the tile the character stands on (x = column, y = row,
//  counting from 0 at the top-left of the map).
// ---------------------------------------------------------------------
export const CHARACTERS = [
    {
        key: 'mimikyu',
        image: 'assets/sprites/MIMIKYU.png',
        frameWidth: 64,
        frameHeight: 64,
        startTile: { x: 15, y: 16 },
        yOffset: -2                         // nudge up/down in pixels
    },
    {
        key: 'dragonite',
        image: 'assets/sprites/DRAGONITE.png',
        frameWidth: 64,
        frameHeight: 64,
        startTile: { x: 16, y: 16 },
        yOffset: 0
    }
];

// How big characters are drawn, in tiles (1.8 = a bit under 2 tiles tall).
export const CHARACTER_SCALE = 1.8;

// ---------------------------------------------------------------------
//  MUSIC  (pressing ▶ plays the song and starts the walking routine)
// ---------------------------------------------------------------------
export const SONGS = [
    { title: 'Completely Beloved Every Dearly Beloved At Once', file: 'assets/songs/Completely Beloved Every Dearly Beloved At Once.mp3' },
    { title: 'The Stranglers - Golden Brown SLOWED BEST PART LOOPED', file: 'assets/songs/The Stranglers - Golden Brown SLOWED BEST PART LOOPED.mp3' },
    { title: 'Young beautiful but its only the best part..', file: 'assets/songs/Young beautiful but its only the best part..mp3' }
];

export const SONG_VOLUME = 0.5;
