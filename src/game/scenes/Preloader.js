// Loads every asset listed in config.js while showing a progress bar.
import { Scene } from 'phaser';
import { START_SCREEN, MAP, CHARACTERS, SONGS } from '../config';
import { songKey } from '../ui/SongPlayer';

export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    init() {
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);
        const bar = this.add.rectangle(282, 384, 4, 28, 0xffffff).setOrigin(0, 0.5);
        this.load.on('progress', (progress) => bar.setSize(4 + 460 * progress, 28));
    }

    preload() {
        this.load.image('start-screen', START_SCREEN.background);

        this.load.tilemapTiledJSON('map', MAP.file);
        MAP.tilesetImages.forEach((path, i) => this.load.image(`tileset-${i}`, path));

        CHARACTERS.forEach(({ key, image, frameWidth, frameHeight }) => {
            this.load.spritesheet(key, image, { frameWidth, frameHeight });
        });

        SONGS.forEach(({ file }, i) => this.load.audio(songKey(i), file));
    }

    create() {
        this.scene.start('MainMenu');
    }
}
