// =====================================================================
//  MOVEMENT — how characters walk, and the dance routine they do while
//  music plays.
// =====================================================================

// ---------------------------------------------------------------------
//  THE ROUTINE  (edit this to change where they walk)
//
//  The routine runs in phases. In each phase, every character takes one
//  step per beat, all at the same time. After each phase they spin
//  through all four directions. The whole thing loops until ‖ is pressed.
//
//  Keys must match `key` in config.js CHARACTERS. Each phase should bring
//  them back to where it started if you want a clean loop.
// ---------------------------------------------------------------------
export const PATROL_ROUTE = [
    {
        mimikyu:   ['left', 'left', 'left', 'up', 'up', 'up'],
        dragonite: ['left', 'left', 'left', 'left', 'up', 'up']
    },
    {
        mimikyu:   ['up', 'up', 'right', 'right', 'right', 'right'],
        dragonite: ['up', 'up', 'up', 'right', 'right', 'right']
    },
    {
        mimikyu:   ['right', 'right', 'right', 'down', 'down', 'down'],
        dragonite: ['right', 'right', 'right', 'right', 'down', 'down']
    },
    {
        mimikyu:   ['down', 'down', 'left', 'left', 'left', 'left'],
        dragonite: ['down', 'down', 'down', 'left', 'left', 'left']
    }
];

const STEP_DURATION = 320;   // ms per tile while patrolling
const RETURN_DURATION = 420; // ms to walk back home after stopping
const SPIN_DELAY = 300;      // ms per direction while spinning

// Sprite-sheet layout: first frame of each row.
const DIRECTION_FRAME = { down: 0, left: 4, right: 8, up: 12 };
const OFFSETS = { right: [1, 0], left: [-1, 0], down: [0, 1], up: [0, -1] };

// ---------------------------------------------------------------------
//  Character helpers
// ---------------------------------------------------------------------

/** Create walk + idle animations for a sprite sheet (once per game). */
export function createAnimations(scene, key) {
    for (const [dir, start] of Object.entries(DIRECTION_FRAME)) {
        const animKey = `walk-${key}-${dir}`;
        if (scene.anims.exists(animKey)) continue;
        scene.anims.create({
            key: animKey,
            frames: scene.anims.generateFrameNumbers(key, { start, end: start + 3 }),
            frameRate: 4,
            repeat: -1
        });
    }
    if (!scene.anims.exists(`idle-${key}`)) {
        scene.anims.create({
            key: `idle-${key}`,
            frames: scene.anims.generateFrameNumbers(key, { start: 0, end: 3 }),
            frameRate: 4,
            repeat: -1
        });
    }
}

/** Pixel position (bottom-centre) of a tile. */
function tileToWorld(tileX, tileY, tileSize, yOffset = 0) {
    return {
        x: tileX * tileSize + tileSize / 2,
        y: tileY * tileSize + tileSize + yOffset
    };
}

/** Put a character sprite on the map, standing on a tile. */
export function placeCharacter(scene, { key, startTile, yOffset = 0 }, tileSize, scale) {
    createAnimations(scene, key);

    const { x, y } = tileToWorld(startTile.x, startTile.y, tileSize, yOffset);
    const sprite = scene.add.sprite(x, y, key, 0)
        .setOrigin(0.5, 1)
        .setDisplaySize(tileSize * scale, tileSize * scale)
        .setDepth(2);

    sprite.key = key;
    sprite.tileSize = tileSize;
    sprite.yOffset = yOffset;
    sprite.home = { ...startTile };
    sprite.tileX = startTile.x;
    sprite.tileY = startTile.y;
    sprite.direction = 'down';

    sprite.anims.play(`idle-${key}`);
    return sprite;
}

export function face(character, direction) {
    character.direction = direction;
    character.anims.stop();
    character.setFrame(DIRECTION_FRAME[direction]);
}

/** Smoothly walk a character to a tile. Returns a Promise. */
export function moveTo(scene, character, tileX, tileY, duration) {
    return new Promise((resolve) => {
        if (character.tileX === tileX && character.tileY === tileY) {
            resolve();
            return;
        }

        character.anims.play(`walk-${character.key}-${character.direction}`, true);
        character.tileX = tileX;
        character.tileY = tileY;

        const target = tileToWorld(tileX, tileY, character.tileSize, character.yOffset);
        scene.tweens.add({
            targets: character,
            x: target.x,
            y: target.y,
            duration,
            ease: 'Linear',
            onComplete: () => {
                face(character, character.direction);
                resolve();
            }
        });
    });
}

/** Take one step in a direction. */
export function step(scene, character, direction, duration = STEP_DURATION) {
    // No character with that key, or its list is shorter in this phase.
    if (!character || !direction) return Promise.resolve();
    character.direction = direction;
    const [dx, dy] = OFFSETS[direction];
    return moveTo(scene, character, character.tileX + dx, character.tileY + dy, duration);
}

const wait = (scene, ms) => new Promise((resolve) => scene.time.delayedCall(ms, resolve));

// ---------------------------------------------------------------------
//  Patrol: runs PATROL_ROUTE in a loop until stopped
// ---------------------------------------------------------------------
export class Patrol {
    constructor(scene, characters) {
        this.scene = scene;
        this.characters = characters; // { mimikyu: sprite, dragonite: sprite }
        this.active = false;
        this.running = null;          // Promise of the current loop
    }

    async start() {
        this.wanted = true;
        if (this.active) return;
        // If a previous run is still walking home, let it finish first so
        // two loops never move the same characters at once.
        while (this.running) await this.running;
        if (!this.wanted || this.active) return; // paused again / started meanwhile
        this.active = true;
        this.running = this.#loop().finally(() => { this.running = null; });
    }

    stop() {
        this.wanted = false;
        this.active = false;
    }

    async #spinAll(directions, delay) {
        for (const direction of directions) {
            Object.values(this.characters).forEach((c) => face(c, direction));
            await wait(this.scene, delay);
        }
    }

    async #loop() {
        const scene = this.scene;
        const chars = this.characters;

        while (this.active) {
            await this.#spinAll(['left', 'up', 'right', 'down'], 200);

            for (const phase of PATROL_ROUTE) {
                if (!this.active) break;
                const steps = Math.max(...Object.values(phase).map((dirs) => dirs.length));

                for (let s = 0; s < steps && this.active; s++) {
                    await Promise.all(
                        Object.entries(phase).map(([key, dirs]) => step(scene, chars[key], dirs[s]))
                    );
                }
                if (!this.active) break;

                await this.#spinAll(['down', 'up', 'left', 'right'], SPIN_DELAY);
                Object.values(chars).forEach((c) => face(c, 'down'));
            }
        }

        // Stopped: walk everyone back to their start tile and idle.
        await Promise.all(
            Object.values(chars).map((c) => moveTo(scene, c, c.home.x, c.home.y, RETURN_DURATION))
        );
        Object.values(chars).forEach((c) => {
            face(c, 'down');
            c.anims.play(`idle-${c.key}`);
        });
    }
}
