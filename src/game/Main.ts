import * as Phaser from 'phaser'
import grid from '@/assets/grid.png?url'
import doodlePng from '@/assets/doodle.png?url'
// @ts-ignore
import doodleJson from '@/assets/doodle.json'
import {NetworkMgr} from './NetworkMgr'
import {BG, TheWorld} from './TheWorld'
import {ControlMgr} from './ControlMgr'
import {Player} from './Player'
import {Platform} from './Platform'
import {Game} from './Game'
import {TheUI} from './TheUI'

export class Main extends Phaser.Scene {
    network = new NetworkMgr(this)
    control: ControlMgr
    world: TheWorld
    theUI: TheUI
    theGame: Game
    platforms: Phaser.Physics.Arcade.Group
    players: Phaser.Physics.Arcade.Group

    height: number
    width: number

    constructor() {
        super({})
    }

    preload() {
        this.load.image('bg', grid)
        this.load.atlas('doodle', doodlePng, doodleJson)
    }

    create() {
        this.height = +this.game.canvas.height
        this.width = +this.game.canvas.width

        this.control = new ControlMgr(this)
        const bg = new BG(this)
        this.add.existing(bg)
        this.platforms = this.physics.add.group()
        this.players = this.physics.add.group()
        this.world = new TheWorld(this, bg, this.platforms, this.players)
        this.add.existing(this.world)
        this.theUI = new TheUI(this)
        // this.add.existing(this.theUI)

        this.theGame = new Game(this)
        this.physics.add.collider(this.players, this.platforms, (player, other) => {
            (player as Player).onPlatform(other as Platform)
        })
        this.physics.world.createDebugGraphic()
        this.players.world.drawDebug = true
        //     this.addChild(TheUI)
    }

    update(time: number, delta: number) {
        super.update(time, delta)
        this.theGame.update()
        this.world.update()
        this.theUI.update()
    }

    reset() {
        this.theGame.reset()
        this.world.reset()
        this.network.disconnect().then()
    }
}