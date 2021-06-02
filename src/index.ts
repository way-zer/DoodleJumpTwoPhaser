import * as Phaser from 'phaser'
import {Main} from './game/Main'
import ScaleModes = Phaser.Scale.ScaleModes
import Center = Phaser.Scale.Center

new Phaser.Game({
    type: Phaser.AUTO,
    scale: {
        mode: ScaleModes.FIT,
        autoCenter: Center.CENTER_BOTH,
    },
    width: 720,
    height: 1280,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 1600},
        },
    },
    scene: [
        new Main(),
    ],
})