import { Scene } from 'phaser';

export class Game extends Scene {
    constructor() {
        super('Game');
    }

    init(data) {
        this.showSongUI = Boolean(data?.showSongUI);
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

        // Audio songs loaded from public/assets/songs
        this.load.audio('song-1', 'assets/songs/Completely Beloved Every Dearly Beloved At Once.mp3');
        this.load.audio('song-2', 'assets/songs/The Stranglers - Golden Brown SLOWED BEST PART LOOPED.mp3');
        this.load.audio('song-3', 'assets/songs/Young beautiful but its only the best part..mp3');
    }

    create() {
        const map = this.make.tilemap({ key: 'map' });
        const tileset = map.addTilesetImage('Pokeomon', 'tiles');

        map.createLayer('Tile Layer 1', tileset, 0, 0);
        map.createLayer('Tile Layer 2', tileset, 0, 0);
        map.createLayer('Tile Layer 3', tileset, 0, 0);

        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.centerOn(map.widthInPixels / 2, map.heightInPixels / 2);

        const cam = this.cameras.main;
        const captionX = cam.width / 2;
        const captionY = cam.height - 60;
        this.add.rectangle(captionX, captionY, 520, 60, 0x000000, 0.55)
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(3001);
        this.add.text(captionX, captionY, 'OUR FUTURE WEDDING :)', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(3002);

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

        if (this.tweens && typeof this.tweens.timeline === 'function') {
            this.startDance(this.mimikyu);
            this.startDance(this.dragonite);
        } else {
            console.warn('Tween timelines are unavailable; skipping the dance animation.');
        }

        if (this.showSongUI) {
            const songs = [
                { key: 'song-1', title: 'Completely Beloved Every Dearly Beloved At Once' },
                { key: 'song-2', title: 'The Stranglers - Golden Brown SLOWED BEST PART LOOPED' },
                { key: 'song-3', title: 'Young beautiful but its only the best part..' }
            ];
            let currentSongIndex = 0;
            let currentSong = null;
            let currentSongKey = null;
            const buttonWidth = 570;
            const buttonHeight = 60;
            const iconButtonWidth = 45;
            const buttonSpacing = 9;
            const buttonX = 20;
            const buttonY = 20;

            this.add.rectangle(buttonX, buttonY, buttonWidth, buttonHeight, 0x222222, 0.95)
                .setOrigin(0, 0)
                .setStrokeStyle(2, 0xffffff)
                .setScrollFactor(0)
                .setDepth(1000);

            const buttonLabel = this.add.text(buttonX + 18, buttonY + 15, `Play ${songs[currentSongIndex].title}`, {
                fontFamily: 'Arial',
                fontSize: '27px',
                color: '#ffffff'
            }).setScrollFactor(0)
                .setDepth(1001);

            const leftButtonX = buttonX + buttonWidth - iconButtonWidth * 4 - buttonSpacing * 3;
            const playButtonX = leftButtonX + iconButtonWidth + buttonSpacing;
            const pauseButtonX = playButtonX + iconButtonWidth + buttonSpacing;
            const rightButtonX = pauseButtonX + iconButtonWidth + buttonSpacing;

            const labelWidth = leftButtonX - (buttonX + 18) - 6;
            buttonLabel.setFixedSize(labelWidth, buttonHeight).setAlign('left');

            const addControl = (x, label, textOffset, fontSize, onClick) => {
                const button = this.add.rectangle(x, buttonY + 12, iconButtonWidth, 36, 0x444444)
                    .setOrigin(0, 0)
                    .setScrollFactor(0)
                    .setDepth(1001)
                    .setInteractive({ useHandCursor: true });
                this.add.text(x + textOffset, buttonY + 18, label, {
                    fontFamily: 'Arial',
                    fontSize,
                    color: '#ffffff'
                }).setScrollFactor(0).setDepth(1002);

                button.on('pointerdown', onClick);
                button.on('pointerover', () => button.setFillStyle(0x666666));
                button.on('pointerout', () => button.setFillStyle(0x444444));
            };

            const stopSong = () => {
                if (currentSong?.isPlaying) currentSong.stop();
                currentSong = null;
                currentSongKey = null;
                updateSongLabel();
            };

            const playSelectedSong = () => {
                stopSong();
                const song = songs[currentSongIndex];
                currentSong = this.sound.add(song.key, { loop: true, volume: 0.5 });
                currentSong.play();
                currentSongKey = song.key;
                buttonLabel.setText(`Playing ${song.title}`);
            };

            const startSongAndPatrol = () => {
                if (this.patrolActive) return;
                playSelectedSong();
                this.patrolActive = true;
                this.startPatrol();
            };

            const pausePlayback = () => {
                this.stopPatrol();
                stopSong();
            };

            const updateSongLabel = () => {
                const song = songs[currentSongIndex];
                const isPlaying = currentSong?.isPlaying && currentSongKey === song.key;
                buttonLabel.setText(`${isPlaying ? 'Playing' : 'Play'} ${song.title}`);
            };

            addControl(leftButtonX, '<', 12, '24px', () => {
                currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
                updateSongLabel();
            });
            addControl(playButtonX, '▶', 9, '21px', startSongAndPatrol);
            addControl(pauseButtonX, '||', 12, '21px', pausePlayback);
            addControl(rightButtonX, '>', 12, '24px', () => {
                currentSongIndex = (currentSongIndex + 1) % songs.length;
                updateSongLabel();
            });

            this.patrolActive = false;
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
                repeat: -1
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

    stopTileCharacter(character) {
        character.anims.stop();
        const idleFrame = character.idleFrameByDirection[character.currentDirection] || 0;
        character.setFrame(idleFrame);
    }

    // Move a character smoothly to a tile coordinate (tileX, tileY). Returns a Promise.
    moveCharacterTo(character, tileX, tileY, duration = 420) {
        return new Promise((resolve) => {
            if (character.tileX === tileX && character.tileY === tileY) {
                resolve();
                return;
            }

            const direction = character.currentDirection;
            character.anims.play(character.walkAnims[direction], true);

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

    async spinOrientations(character, stepDelay = 400) {
        for (const direction of ['down', 'up', 'left', 'right']) {
            character.currentDirection = direction;
            character.setFrame(character.idleFrameByDirection[direction]);
            await new Promise((resolve) => this.time.delayedCall(stepDelay, resolve));
        }

        character.currentDirection = 'down';
        character.setFrame(character.idleFrameByDirection.down);
    }

    async startPatrol() {
        const phases = [
            {
                mimikyu: ['left','left','left','up','up','up'],
                dragonite: ['left','left','left','left','up','up']
            },
            {
                mimikyu: ['up','up','right','right','right','right'],
                dragonite: ['up','up','up','right','right','right']
            },
            {
                mimikyu: ['right','right','right','down','down','down'],
                dragonite: ['right','right','right','right','down','down']
            },
            {
                mimikyu: ['down','down','left','left','left','left'],
                dragonite: ['down','down','down','left','left','left']
            }
        ];

        const offsets = {
            right: [1, 0],
            left: [-1, 0],
            down: [0, 1],
            up: [0, -1]
        };
        const applyStep = (character, direction) => {
            character.currentDirection = direction;
            const [dx, dy] = offsets[direction];
            return this.moveCharacterTo(character, character.tileX + dx, character.tileY + dy, 320);
        };

        const applyOrientationSeq = async (directions, delay = 200) => {
            for (const direction of directions) {
                [this.mimikyu, this.dragonite].forEach((character) => {
                    character.currentDirection = direction;
                    character.setFrame(character.idleFrameByDirection[direction]);
                });
                await new Promise((resolve) => this.time.delayedCall(delay, resolve));
            }
        };

        while (this.patrolActive) {
            await applyOrientationSeq(['left', 'up', 'right', 'down']);

            for (const phase of phases) {
                if (!this.patrolActive) break;
                const steps = Math.max(phase.mimikyu.length, phase.dragonite.length);

                for (let s = 0; s < steps; s++) {
                    if (!this.patrolActive) break;
                    await Promise.all([
                        applyStep(this.mimikyu, phase.mimikyu[s]),
                        applyStep(this.dragonite, phase.dragonite[s])
                    ]);
                }

                if (!this.patrolActive) break;

                await Promise.all([
                    this.spinOrientations(this.mimikyu, 300),
                    this.spinOrientations(this.dragonite, 300)
                ]);
            }
        }

        await Promise.all([
            this.moveCharacterTo(this.mimikyu, 15, 16),
            this.moveCharacterTo(this.dragonite, 16, 16)
        ]);

        // ensure idle animation plays
        if (this.mimikyu && this.mimikyu.idleAnim) this.mimikyu.anims.play(this.mimikyu.idleAnim);
        if (this.dragonite && this.dragonite.idleAnim) this.dragonite.anims.play(this.dragonite.idleAnim);
    }

    stopPatrol() {
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

}
