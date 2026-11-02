import { Scene } from 'phaser';

export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    init() {
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);
        const bar = this.add.rectangle(282, 384, 4, 28, 0xffffff);
        this.load.on('progress', (progress) => bar.setSize(4 + 460 * progress, 28));
    }

    preload() {
        this.load.setPath('assets');
        this.load.image('background', 'image1.png');
    }

    create() {
        this.scene.start('MainMenu');
    }
}
