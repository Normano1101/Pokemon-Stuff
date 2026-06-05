import { Scene } from 'phaser';

export class Boot extends Scene
{
    constructor ()
    {
        super('Boot');
    }

    preload ()
    {
        // Boot only initializes the game and moves to Preloader.
    }

    create ()
    {
        this.time.delayedCall(500, () => {
            this.scene.start('Preloader');
        });
    }
}