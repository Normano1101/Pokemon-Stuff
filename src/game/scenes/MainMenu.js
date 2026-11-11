// Start screen. Change the image/text in config.js -> START_SCREEN.
import { Scene } from 'phaser';
import { START_SCREEN } from '../config';

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        const { width, height } = this.scale;

        this.add.image(0, 0, 'start-screen')
            .setOrigin(0, 0)
            .setDisplaySize(width, height);

        if (START_SCREEN.title) {
            this.add.text(width / 2, 300, START_SCREEN.title, {
                fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
                stroke: '#000000', strokeThickness: 10,
                align: 'center'
            }).setOrigin(0.5);
        }

        if (START_SCREEN.prompt) {
            this.add.text(width / 2, 460, START_SCREEN.prompt, {
                fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
                stroke: '#000000', strokeThickness: 8,
                align: 'center'
            }).setOrigin(0.5);
        }

        this.input.once('pointerdown', () => this.scene.start('Game'));
    }
}
