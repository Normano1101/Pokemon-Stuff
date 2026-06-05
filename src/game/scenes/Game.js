import { Scene } from 'phaser';

export class Game extends Scene {
    constructor() {
        super('Game');
    }

    init(data) {
        console.log('Game.init data:', data);
        // Prefer explicit data, fallback to registry flag (set by MainMenu)
        const fromData = !!(data && data.showSongUI);
        const fromRegistry = !!this.registry.get('showSongUI');
        this.showSongUI = fromData || fromRegistry;
        // clear registry flag once consumed
        if (fromRegistry) this.registry.set('showSongUI', false);
    }

    preload() {
        // MAP
        this.load.tilemapTiledJSON('map', 'assets/maps/wedding.tmj');

        // TILES
        this.load.image('tiles', 'assets/tiles/Outside.png');

        // STATIC CHARACTERS (sprite sheets: rows = directions, cols = frames)
        // Load both Mimikyu and Dragonite at their native 64x64 frame size,
        // then force them to display at a single 32x32 tile size.
        this.load.spritesheet('mimikyu', 'assets/sprites/MIMIKYU.png', {
            frameWidth: 64,
            frameHeight: 64
        });
        this.load.spritesheet('dragonite', 'assets/sprites/DRAGONITE.png', {
            frameWidth: 64,
            frameHeight: 64
        });
    }

    create() {
        console.log('Game.create showSongUI:', this.showSongUI);
        // DEBUG: force UI on to verify rendering (remove when verified)
        this.showSongUI = true;
        console.log('DEBUG: forcing showSongUI = true');
        const map = this.make.tilemap({ key: 'map' });
        const tileset = map.addTilesetImage('Pokeomon', 'tiles');

        map.createLayer('Tile Layer 1', tileset, 0, 0);
        const walls = map.createLayer('Tile Layer 2', tileset, 0, 0);
        map.createLayer('Tile Layer 3', tileset, 0, 0);

        walls.setCollisionByExclusion([-1]);

        this.map = map;
        this.wallsLayer = walls;

        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.centerOn(map.widthInPixels / 2, map.heightInPixels / 2);

        const tileSize = 32;
        this.tileSize = tileSize;

        this.createDirectionalAnimations('mimikyu');
        this.createDirectionalAnimations('dragonite');
        this.createIdleAnimation('mimikyu');
        this.createIdleAnimation('dragonite');

        const placeTileSprite = (key, tileX, tileY, frame = 0, xOffset = 0, yOffset = 0) => {
            const x = tileX * tileSize + tileSize / 2 + xOffset;
            const y = tileY * tileSize + tileSize + yOffset;
            const sprite = this.add.sprite(x, y, key, frame)
                .setOrigin(0.5, 1)
                .setDisplaySize(tileSize * 1.8, tileSize * 1.8)
                .setDepth(2);

            sprite.tileX = tileX;
            sprite.tileY = tileY;
            sprite.isMoving = false;
            sprite.currentDirection = 'down';
            sprite.walkAnims = {
                down: `walk-${key}-down`,
                left: `walk-${key}-left`,
                right: `walk-${key}-right`,
                up: `walk-${key}-up`
            };
            sprite.idleAnim = `idle-${key}`;
            sprite.idleFrameByDirection = {
                down: 0,
                left: 4,
                right: 8,
                up: 12
            };

            return sprite;
        };

        this.mimikyu = placeTileSprite('mimikyu', 15, 16, 1, 0, -2);
        this.dragonite = placeTileSprite('dragonite', 16, 16, 0, 0, 0);

        this.mimikyu.anims.play(this.mimikyu.idleAnim);
        this.dragonite.anims.play(this.dragonite.idleAnim);

        // start dance only if the tween timeline API exists (Phaser 3).
        // Some builds use Phaser 4 where `this.tweens.timeline` may not exist —
        // guard to avoid uncaught TypeError that prevents the rest of the scene from running.
        if (this.tweens && typeof this.tweens.timeline === 'function') {
            this.startDance(this.mimikyu);
            this.startDance(this.dragonite);
        } else {
            console.warn('Tweens.timeline not available on this Phaser build — skipping automatic dance.');
        }

        // Small on-screen debug label to show whether UI should be created
        const debugLabel = this.add.text(8, 8, `showSongUI: ${this.showSongUI}`, {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#ff0000',
            backgroundColor: 'rgba(0,0,0,0.4)'
        }).setScrollFactor(0).setDepth(3000);

        if (this.showSongUI) {
            // Song button UI (visual only for now)
            const songNames = ['Garden Song', 'Evening Song', 'Mystic Song'];
            let currentSongIndex = 0;
            const cam = this.cameras.main;
            // Place the UI on the left side of the viewport
            const buttonWidth = 360;
            const buttonHeight = 40;
            const iconButtonWidth = 30;
            const buttonSpacing = 8;
            const buttonX = cam.worldView.x + 20;
            const buttonY = cam.worldView.y + 20;

            const buttonBg = this.add.rectangle(buttonX, buttonY, buttonWidth, buttonHeight, 0x222222, 0.95)
                .setOrigin(0, 0)
                .setStrokeStyle(2, 0xffffff)
                .setScrollFactor(0)
                .setDepth(10);

            const buttonLabel = this.add.text(buttonX + 12, buttonY + 10, `Play ${songNames[currentSongIndex]}`, {
                fontFamily: 'Arial',
                fontSize: '18px',
                color: '#ffffff'
            }).setScrollFactor(0)
                .setDepth(11);

            const leftButtonX = buttonX + buttonWidth - iconButtonWidth * 3 - buttonSpacing * 2;
            const playButtonX = leftButtonX + iconButtonWidth + buttonSpacing;
            const rightButtonX = playButtonX + iconButtonWidth + buttonSpacing;

            const leftButton = this.add.rectangle(leftButtonX, buttonY + 8, iconButtonWidth, 24, 0x444444, 1)
                .setOrigin(0, 0)
                .setScrollFactor(0)
                .setDepth(11)
                .setInteractive({ useHandCursor: true });
            const leftText = this.add.text(leftButtonX + 8, buttonY + 12, '<', {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#ffffff'
            }).setScrollFactor(0)
                .setDepth(12);

            const playButton = this.add.rectangle(playButtonX, buttonY + 8, iconButtonWidth, 24, 0x444444, 1)
                .setOrigin(0, 0)
                .setScrollFactor(0)
                .setDepth(11)
                .setInteractive({ useHandCursor: true });
            const playText = this.add.text(playButtonX + 6, buttonY + 12, '▶', {
                fontFamily: 'Arial',
                fontSize: '14px',
                color: '#ffffff'
            }).setScrollFactor(0)
                .setDepth(12);

            const rightButton = this.add.rectangle(rightButtonX, buttonY + 8, iconButtonWidth, 24, 0x444444, 1)
                .setOrigin(0, 0)
                .setScrollFactor(0)
                .setDepth(11)
                .setInteractive({ useHandCursor: true });
            const rightText = this.add.text(rightButtonX + 8, buttonY + 12, '>', {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#ffffff'
            }).setScrollFactor(0)
                .setDepth(12);

            const updateSongLabel = () => {
                buttonLabel.setText(`Play ${songNames[currentSongIndex]}`);
            };

            buttonBg.on('pointerover', () => buttonBg.setFillStyle(0x444444, 1));
            buttonBg.on('pointerout', () => buttonBg.setFillStyle(0x222222, 0.95));
            buttonBg.on('pointerdown', () => {
                // TODO: play the song and start the garden rotation animation
            });

            leftButton.on('pointerdown', () => {
                currentSongIndex = (currentSongIndex - 1 + songNames.length) % songNames.length;
                updateSongLabel();
            });

            playButton.on('pointerdown', () => {
                // TODO: play the selected song now
            });

            rightButton.on('pointerdown', () => {
                currentSongIndex = (currentSongIndex + 1) % songNames.length;
                updateSongLabel();
            });

            leftButton.on('pointerover', () => leftButton.setFillStyle(0x666666, 1));
            leftButton.on('pointerout', () => leftButton.setFillStyle(0x444444, 1));
            playButton.on('pointerover', () => playButton.setFillStyle(0x666666, 1));
            playButton.on('pointerout', () => playButton.setFillStyle(0x444444, 1));
            rightButton.on('pointerover', () => rightButton.setFillStyle(0x666666, 1));
            rightButton.on('pointerout', () => rightButton.setFillStyle(0x444444, 1));
            // Ensure UI renders above all game layers and sprites
            buttonBg.setDepth(1000);
            buttonLabel.setDepth(1001);
            leftButton.setDepth(1001);
            leftText.setDepth(1002);
            playButton.setDepth(1001);
            playText.setDepth(1002);
            rightButton.setDepth(1001);
            rightText.setDepth(1002);

            // Bring explicitly to top in the display list (useful if other code later adds children)
            this.children.bringToTop(buttonBg);
            this.children.bringToTop(buttonLabel);
            this.children.bringToTop(leftButton);
            this.children.bringToTop(leftText);
            this.children.bringToTop(playButton);
            this.children.bringToTop(playText);
            this.children.bringToTop(rightButton);
            this.children.bringToTop(rightText);

            // Debug: log UI and camera state so we can inspect in the browser console
            console.log('UI debug:', {
                buttonBgX: buttonBg.x,
                buttonBgY: buttonBg.y,
                buttonBgDepth: buttonBg.depth,
                camWidth: this.cameras.main.width,
                camHeight: this.cameras.main.height,
                camScrollX: this.cameras.main.scrollX,
                camScrollY: this.cameras.main.scrollY
            });

            // Add a high-visibility debug marker at the top-left of the camera
            const debugMarker = this.add.rectangle(cam.worldView.x + 0, cam.worldView.y + 0, 24, 24, 0xff0000, 1)
                .setOrigin(0, 0)
                .setScrollFactor(0)
                .setDepth(2001);
            this.children.bringToTop(debugMarker);
            // --- Patrol button and logic ---
            const patrolButtonX = cam.worldView.x + 20;
            const patrolButtonY = buttonY + buttonHeight + 12;
            const patrolBg = this.add.rectangle(patrolButtonX, patrolButtonY, 140, 30, 0x225522, 1)
                .setOrigin(0, 0)
                .setScrollFactor(0)
                .setDepth(1000)
                .setInteractive({ useHandCursor: true });
            const patrolText = this.add.text(patrolButtonX + 12, patrolButtonY + 6, 'Start Patrol', {
                fontFamily: 'Arial', fontSize: '14px', color: '#ffffff'
            }).setScrollFactor(0).setDepth(1001);

            this.patrolActive = false;

            const waypoints = [
                [{ x: 12, y: 13 }, { x: 12, y: 14 }],
                [{ x: 15, y: 11 }, { x: 16, y: 11 }],
                [{ x: 19, y: 13 }, { x: 19, y: 14 }],
                // return to spawn (use original tile positions)
                [{ x: this.mimikyu.tileX, y: this.mimikyu.tileY }, { x: this.dragonite.tileX, y: this.dragonite.tileY }]
            ];

            patrolBg.on('pointerdown', async () => {
                this.patrolActive = !this.patrolActive;
                patrolText.setText(this.patrolActive ? 'Stop Patrol' : 'Start Patrol');
                if (this.patrolActive) {
                    this.startPatrol(waypoints);
                } else {
                    await this.stopPatrol();
                }
            });
        }
    }

    createDirectionalAnimations(textureKey) {
        const directions = [
            { dir: 'down', start: 0 },
            { dir: 'left', start: 4 },
            { dir: 'right', start: 8 },
            { dir: 'up', start: 12 }
        ];

        directions.forEach(({ dir, start }) => {
            this.anims.create({
                key: `walk-${textureKey}-${dir}`,
                frames: this.anims.generateFrameNumbers(textureKey, {
                    start,
                    end: start + 3
                }),
                frameRate: 4,
                repeat: -1,
                yoyo: false
            });
        });
    }

    createIdleAnimation(textureKey) {
        this.anims.create({
            key: `idle-${textureKey}`,
            frames: this.anims.generateFrameNumbers(textureKey, {
                start: 0,
                end: 3
            }),
            frameRate: 4,
            repeat: -1
        });
    }

    moveTileCharacter(character, dx, dy, direction) {
        if (character.isMoving) {
            return;
        }

        character.isMoving = true;
        character.currentDirection = direction;
        const animKey = character.walkAnims[direction];
        character.anims.play(animKey, true);

        character.tileX += dx;
        character.tileY += dy;

        const targetX = character.tileX * this.tileSize + this.tileSize / 2;
        const targetY = character.tileY * this.tileSize + this.tileSize;

        this.tweens.add({
            targets: character,
            x: targetX,
            y: targetY,
            duration: 320,
            ease: 'Linear',
            onComplete: () => {
                this.stopTileCharacter(character);
            }
        });
    }

    stopTileCharacter(character) {
        character.isMoving = false;
        character.anims.stop();
        const idleFrame = character.idleFrameByDirection[character.currentDirection] || 0;
        character.setFrame(idleFrame);
    }

    // Move a character smoothly to a tile coordinate (tileX, tileY). Returns a Promise.
    moveCharacterTo(character, tileX, tileY, duration = 420) {
        return new Promise((resolve) => {
            if (!character) return resolve();
            if (character.tileX === tileX && character.tileY === tileY) return resolve();
            if (character.isMoving) {
                // if already moving, we still queue movement; but ignore for now
            }

            const dx = tileX - character.tileX;
            const dy = tileY - character.tileY;
            // determine direction for animations; prefer a pre-set `currentDirection` (set by applyStep)
            let dir = 'down';
            if (character.currentDirection) {
                dir = character.currentDirection;
            } else {
                if (Math.abs(dx) > Math.abs(dy)) dir = dx > 0 ? 'right' : 'left';
                else if (Math.abs(dy) > 0) dir = dy > 0 ? 'down' : 'up';
            }

            character.isMoving = true;
            character.currentDirection = dir;
            const animKey = character.walkAnims && character.walkAnims[dir];
            // debug log to help verify facing/animation mapping
            try {
                console.log('moveCharacterTo', character.texture && character.texture.key, 'dir=', dir, 'animKey=', animKey);
            } catch (e) {}
            if (animKey) character.anims.play(animKey, true);

            character.tileX = tileX;
            character.tileY = tileY;

            const targetX = tileX * this.tileSize + this.tileSize / 2;
            const targetY = tileY * this.tileSize + this.tileSize;

            this.tweens.add({
                targets: character,
                x: targetX,
                y: targetY,
                duration,
                ease: 'Linear',
                onComplete: () => {
                    this.stopTileCharacter(character);
                    resolve();
                }
            });
        });
    }

    // Spin both characters slowly through a small sequence
    // Orientational "spin" (no visual rotation) for both characters.
    spinCharacters(stepDelay = 400) {
        return Promise.all([
            this.spinOrientations(this.mimikyu, stepDelay),
            this.spinOrientations(this.dragonite, stepDelay)
        ]);
    }

    // Cycle facing directions to simulate a spin without rotating the sprite.
    spinOrientations(character, stepDelay = 400) {
        const dirs = ['down', 'up', 'left', 'right'];
        return new Promise(async (resolve) => {
            for (let i = 0; i < dirs.length; i++) {
                const dir = dirs[i];
                character.currentDirection = dir;
                const frame = character.idleFrameByDirection[dir] || 0;
                character.setFrame(frame);
                // wait
                await new Promise((res) => this.time.delayedCall(stepDelay, res));
            }
            // restore to down idle
            character.currentDirection = 'down';
            character.setFrame(character.idleFrameByDirection['down'] || 0);
            resolve();
        });
    }

    async startPatrol(waypoints) {
        // Implement explicit step sequences per your request.
        // Each phase contains exactly 6 atomic steps for each character.
        const phases = [
            {
                // phase 1 steps
                mimikyu: ['left','left','left','up','up','up'],
                dragonite: ['left','left','left','left','up','up'],
                spin: ['right','down','left','up']
            },
            {
                // phase 2 steps
                mimikyu: ['up','up','right','right','right','right'],
                dragonite: ['up','up','up','right','right','right'],
                spin: ['down','left','up','right']
            },
            {
                // phase 3 steps
                mimikyu: ['right','right','right','down','down','down'],
                dragonite: ['right','right','right','right','down','down'],
                spin: ['left','up','right','down']
            },
            {
                // phase 4 steps (return to spawn)
                mimikyu: ['down','down','left','left','left','left'],
                dragonite: ['down','down','down','left','left','left'],
                spin: ['up','right','down','left']
            }
        ];

        // helper to apply a single directional step for a character
        const applyStep = (character, dir) => {
            if (!dir) return Promise.resolve();
            // set facing and play walk anim for that direction before moving
            character.currentDirection = dir;
            const walkKey = character.walkAnims && character.walkAnims[dir];
            if (walkKey) character.anims.play(walkKey, true);

            const tx = character.tileX + (dir === 'right' ? 1 : dir === 'left' ? -1 : 0);
            const ty = character.tileY + (dir === 'down' ? 1 : dir === 'up' ? -1 : 0);
            return this.moveCharacterTo(character, tx, ty, 320);
        };

        // initial orientation sequence before movement
        const initialOrient = ['left','up','right','down'];
        const applyOrientationSeq = async (sequence, delay = 200) => {
            for (let d of sequence) {
                [this.mimikyu, this.dragonite].forEach((c) => {
                    c.currentDirection = d;
                    const frame = c.idleFrameByDirection[d] || 0;
                    c.setFrame(frame);
                });
                await new Promise((r) => this.time.delayedCall(delay, r));
            }
        };

        while (this.patrolActive) {
            // initial face sequence
            await applyOrientationSeq(initialOrient, 200);

            for (let p = 0; p < phases.length; p++) {
                if (!this.patrolActive) break;
                const ph = phases[p];
                const steps = Math.max(ph.mimikyu.length, ph.dragonite.length);

                for (let s = 0; s < steps; s++) {
                    if (!this.patrolActive) break;
                    const stepA = ph.mimikyu[s];
                    const stepB = ph.dragonite[s];
                    await Promise.all([
                        applyStep(this.mimikyu, stepA),
                        applyStep(this.dragonite, stepB)
                    ]);
                }

                if (!this.patrolActive) break;

                // after finishing phase steps, run the spin orientation sequence for both simultaneously
                await Promise.all([
                    this.spinOrientations(this.mimikyu, 300),
                    this.spinOrientations(this.dragonite, 300)
                ]);
            }
        }

        // when stopping, return characters to spawn and resume idle animation
        await Promise.all([
            this.moveCharacterTo(this.mimikyu, 15, 16),
            this.moveCharacterTo(this.dragonite, 16, 16)
        ]);

        // ensure idle animation plays
        if (this.mimikyu && this.mimikyu.idleAnim) this.mimikyu.anims.play(this.mimikyu.idleAnim);
        if (this.dragonite && this.dragonite.idleAnim) this.dragonite.anims.play(this.dragonite.idleAnim);
    }

    async stopPatrol() {
        // flips patrolActive to false handled by caller; ensure they stop gracefully
        this.patrolActive = false;
    }

    startDance(character) {
        const tileSize = this.tileSize;
        const moveDuration = 420;
        const spinDuration = 360;

        const updateTilePosition = (character, dx, dy) => {
            character.tileX += dx;
            character.tileY += dy;
            character.x = character.tileX * tileSize + tileSize / 2;
            character.y = character.tileY * tileSize + tileSize;
        };

        this.tweens.timeline({
            targets: character,
            ease: 'Linear',
            loop: -1,
            tweens: [
                {
                    rotation: '+=6.28319',
                    duration: spinDuration
                },
                {
                    x: character.x - tileSize * 3,
                    duration: moveDuration,
                    onComplete: () => updateTilePosition(character, -3, 0)
                },
                {
                    y: character.y - tileSize * 3,
                    duration: moveDuration,
                    onComplete: () => updateTilePosition(character, 0, -3)
                },
                {
                    rotation: '+=6.28319',
                    duration: spinDuration
                },
                {
                    x: character.x + tileSize * 3,
                    duration: moveDuration,
                    onComplete: () => updateTilePosition(character, 3, 0)
                },
                {
                    y: character.y + tileSize * 3,
                    duration: moveDuration,
                    onComplete: () => updateTilePosition(character, 0, 3)
                }
            ]
        });
    }

    update() {
        // No player input movement; the sprites dance automatically.
    }
}
