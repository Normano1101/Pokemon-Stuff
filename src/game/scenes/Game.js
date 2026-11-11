// The main scene: draws the map, places the characters, adds the music bar.
//   - What map / sprites / songs:  ../config.js
//   - How characters move:         ../movement.js
//   - Music bar UI:                ../ui/SongPlayer.js
import { Scene } from 'phaser';
import { MAP, CHARACTERS, CHARACTER_SCALE } from '../config';
import { placeCharacter, Patrol } from '../movement';
import { createSongPlayer } from '../ui/SongPlayer';

export class Game extends Scene {
    constructor() {
        super('Game');
    }

    create() {
        const map = this.createMap();
        this.addCaption();

        const characters = {};
        for (const def of CHARACTERS) {
            characters[def.key] = placeCharacter(this, def, MAP.tileSize, CHARACTER_SCALE);
        }

        const patrol = new Patrol(this, characters);
        createSongPlayer(this, {
            onPlay: () => patrol.start(),
            onPause: () => patrol.stop()
        });
        this.events.once('shutdown', () => patrol.stop());

        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.centerOn(map.widthInPixels / 2, map.heightInPixels / 2);
    }

    createMap() {
        const map = this.make.tilemap({ key: 'map' });

        // Match each tileset in the Tiled file (by order) to an image from config.
        const tilesets = map.tilesets.map((ts, i) => {
            if (i >= MAP.tilesetImages.length) {
                throw new Error(
                    `Map uses tileset "${ts.name}" but config.js MAP.tilesetImages only lists ` +
                    `${MAP.tilesetImages.length} image(s). Add one per tileset, in Tiled's order.`
                );
            }
            const tileset = map.addTilesetImage(ts.name, `tileset-${i}`);
            if (!tileset) {
                throw new Error(
                    `Couldn't load tileset "${ts.name}". If the map uses an external .tsx tileset, ` +
                    `open it in Tiled and click "Embed Tileset", then re-export the .tmj.`
                );
            }
            return tileset;
        });

        // Draw every tile layer, bottom to top, exactly as ordered in Tiled.
        map.layers.forEach((layer) => map.createLayer(layer.name, tilesets, 0, 0));

        return map;
    }

    addCaption() {
        if (!MAP.caption) return;
        const cam = this.cameras.main;
        const x = cam.width / 2;
        const y = cam.height - 60;

        this.add.rectangle(x, y, 520, 60, 0x000000, 0.55)
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(3001);
        this.add.text(x, y, MAP.caption, {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(3002);
    }
}
