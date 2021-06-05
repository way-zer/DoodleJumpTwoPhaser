import {Main} from './Main'
import Phaser from 'phaser'
import {Platform} from './Platform'
import {Player} from './Player'
import TileSprite = Phaser.GameObjects.TileSprite
import Container = Phaser.GameObjects.Container
import Group = Phaser.Physics.Arcade.Group

export class BG extends TileSprite {
    constructor(scene: Main) {
        super(scene, 0, 0, scene.width, scene.height, 'bg')
        this.originX = this.originY = 0
    }

    move(delta: number) {
        this.tilePositionY -= delta
    }

    reset() {
        this.tilePositionY = 0
    }
}

export class TheWorld extends Container {
    bg: BG
    constructor(public scene: Main,private platforms: Group, private players: Phaser.Physics.Arcade.Group) {
        super(scene)
        this.bg = new BG(scene)
        scene.add.existing(this.bg)

        this.height = scene.height
        this.width = scene.width
        this.y = 0
    }

    move(delta: number) {
        this.y += delta
        this.bg.move(delta)
    }

    /**
     * 获取世界的相对位置点
     * @param point 0-1的位置,0代表底部,1代表顶部
     */
    worldHeight(point: number){
        return this.y + this.height*point
    }

    place(platform: Platform, y: number, clampedX: number = (Math.random())) {
        platform.y = this.height - y
        platform.x = clampedX * this.width
        this.platforms.add(platform)
        this.add(platform)
        platform.addedToScene()
        // this.scene.add.existing(platform)
    }

    spawn(platform: Player, y: number, clampedX: number = (Math.random())) {
        platform.y = this.height - y
        platform.x = clampedX * this.width
        this.players.add(platform)
        this.add(platform)
        platform.addedToScene()
    }

    reset() {
        this.y = 0
        this.bg.reset()
        this.platforms.clear(true)
        this.players.clear(true)
        this.removeAll(true)
    }

    remove(child: Phaser.GameObjects.GameObject): this {
        this.platforms.remove(child, true)
        this.players.remove(child, true)
        if (child instanceof Platform)
            this.scene.theGame.platforms.delete(child.id)
        return super.remove(child, true)
    }


    conv2Height(y: number): number {
        return -(y - this.height)
    }
}