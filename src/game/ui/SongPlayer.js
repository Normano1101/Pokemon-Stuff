// Music bar in the top-left: [ Play <song title>   <  ▶  ||  > ]
import { SONGS, SONG_VOLUME } from '../config';

const BAR = { x: 20, y: 20, width: 570, height: 60 };
const BTN = { width: 45, height: 36, spacing: 9 };
const DEPTH = 1000;

export const songKey = (index) => `song-${index}`;

/**
 * @param scene     Phaser scene
 * @param onPlay    called when ▶ is pressed
 * @param onPause   called when || is pressed
 */
export function createSongPlayer(scene, { onPlay, onPause }) {
    if (SONGS.length === 0) return;

    let index = 0;
    let current = null; // Phaser sound currently playing

    scene.add.rectangle(BAR.x, BAR.y, BAR.width, BAR.height, 0x222222, 0.95)
        .setOrigin(0, 0)
        .setStrokeStyle(2, 0xffffff)
        .setScrollFactor(0)
        .setDepth(DEPTH);

    const firstBtnX = BAR.x + BAR.width - BTN.width * 4 - BTN.spacing * 3;
    const label = scene.add.text(BAR.x + 18, BAR.y + 15, '', {
        fontFamily: 'Arial',
        fontSize: '27px',
        color: '#ffffff'
    }).setScrollFactor(0)
        .setDepth(DEPTH + 1)
        .setFixedSize(firstBtnX - (BAR.x + 18) - 6, BAR.height);

    const updateLabel = () => {
        const playing = current?.isPlaying && current.key === songKey(index);
        label.setText(`${playing ? 'Playing' : 'Play'} ${SONGS[index].title}`);
    };

    const stopSong = () => {
        current?.stop();
        current?.destroy();
        current = null;
        updateLabel();
    };

    const playSong = () => {
        stopSong();
        current = scene.sound.add(songKey(index), { loop: true, volume: SONG_VOLUME });
        current.play();
        updateLabel();
    };

    const addButton = (slot, text, fontSize, onClick) => {
        const x = firstBtnX + slot * (BTN.width + BTN.spacing);
        const button = scene.add.rectangle(x, BAR.y + 12, BTN.width, BTN.height, 0x444444)
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(DEPTH + 1)
            .setInteractive({ useHandCursor: true });
        scene.add.text(x + BTN.width / 2, BAR.y + 12 + BTN.height / 2, text, {
            fontFamily: 'Arial',
            fontSize,
            color: '#ffffff'
        }).setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(DEPTH + 2);

        button.on('pointerdown', onClick);
        button.on('pointerover', () => button.setFillStyle(0x666666));
        button.on('pointerout', () => button.setFillStyle(0x444444));
    };

    addButton(0, '<', '24px', () => {
        index = (index - 1 + SONGS.length) % SONGS.length;
        updateLabel();
    });
    addButton(1, '▶', '21px', () => {
        playSong();
        onPlay?.();
    });
    addButton(2, '||', '21px', () => {
        stopSong();
        onPause?.();
    });
    addButton(3, '>', '24px', () => {
        index = (index + 1) % SONGS.length;
        updateLabel();
    });

    updateLabel();
    scene.events.once('shutdown', stopSong);
}
