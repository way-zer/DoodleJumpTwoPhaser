import {Main} from './Main'
import {EventKey} from '../utils/Event'
import {Player} from './Player'
import Vector2 = Phaser.Math.Vector2

export type PlatformType = 'normal' | 'move' | 'break' | 'once' | 'base'
type Sync = { id: number, x: number, y: number, velocity: Vector2, type: PlatformType, broken: boolean }

export class Platform extends Phaser.GameObjects.TileSprite {
    static lastId = 0
    declare body: Phaser.Physics.Arcade.Body
    id = Platform.lastId++
    broken = false

    constructor(public scene: Main, public type: PlatformType = 'normal') {
        super(scene, 0, 0, 0, 0, 'doodle')
    }


    addedToScene() {
        super.addedToScene()
        this.body.allowGravity = false
        this.body.setImmovable(true)
        this.body.checkCollision.up = true
        this.body.checkCollision.down = false
        this.body.checkCollision.left = false
        this.body.checkCollision.right = false
        this.updateTexture()
        this.addToUpdateList()
    }

    updateTexture() {
        let name = 'platform_' + this.type
        if (this.type == 'break' && this.broken)
            name += '_broken'
        this.setFrame(name)
        // @ts-ignore
        this.setSize(this.displayFrame.realWidth, this.displayFrame.realHeight)
        if (this.type == 'base') {
            this.width = +this.scene.game.config.width
        }
        this.body.setSize(this.width,this.height)
        console.log(this)
    }

    preUpdate() {
        if (this.type == 'move') {
            if (this.x > this.parentContainer.width)
                this.body.setVelocityX(-200)
            else if (this.x < 0 || this.body.velocity.x == 0)
                this.body.setVelocityX(200)
        }
        if (this.type == 'break' && this.broken && !this.body.allowGravity) {
            this.body.allowGravity = true
            this.body.setVelocityY(300)
        }
        if (this.scene.world.conv2Height(this.y) < this.scene.world.y || (this.type == 'once' && this.broken))
            this.scene.world.remove(this)
    }

    onIt(player: Player) {
        if (this.type == 'break') {
            this.broken = true
            this.sendSync()
            this.updateTexture()
        } else {
            player.jump()
        }
        if (this.type == 'once') {
            this.broken = true
            this.sendSync()
        }
    }

    sendSync() {
        const {id, x, y, type, broken} = this
        this.scene.network.send(Platform.event_sync, {id, x, y, velocity: this.body.velocity, type, broken}, true)
    }

    readSync(obj: Sync) {
        this.id = obj.id
        this.x = obj.x
        this.y = obj.y
        this.body.setVelocity(obj.velocity.x, obj.velocity.y)
        this.type = obj.type
        this.broken = obj.broken
        this.update()
    }

    static event_sync = new EventKey<Sync>('platformSync')
}