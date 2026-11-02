import { Game as GameScene } from './scenes/Game';
import { MainMenu } from './scenes/MainMenu';
import { Preloader } from './scenes/Preloader';
import { CANVAS, Game as PhaserGame, Scale } from 'phaser';

const config = {
    // The full tileset exceeds WebGL texture limits on some browsers.
    type: CANVAS,
    width: 1024,
    height: 768,
    scale: {
        mode: Scale.FIT,
        autoCenter: Scale.CENTER_BOTH
    },

    scene: [Preloader, MainMenu, GameScene]
};

const StartGame = (parent) => new PhaserGame({ ...config, parent });

export default StartGame;
