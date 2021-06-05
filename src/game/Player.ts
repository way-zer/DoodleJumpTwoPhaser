import {Platform} from './Platform'
import {EventKey} from '../utils/Event'
import {Main} from './Main'
import Vector2 = Phaser.Math.Vector2
import {Game} from './Game'

export class Player extends Phaser.Physics.Arcade.Sprite {
    declare body: Phaser.Physics.Arcade.Body

    constructor(public scene: Main, public local: boolean) {
        super(scene, 0, 0, 'doodle')
        if (!this.local)
            this.alpha = 0.5
    }

    addedToScene() {
        super.addedToScene()
        this.scene.physics.world.enableBody(this)
        this.updateTexture()
        this.body.setMaxVelocityX(720)
        this.body.setSize(60, this.frame.height)
        this.addToUpdateList()
    }

    updateTexture() {
        let dir = this.body.velocity.x > 0 ? 'right' : 'left'
        const vy = -this.body.velocity.y
        if (420 < vy && vy < 900) dir += '_land'
        this.setFrame('char_' + dir)
    }

    preUpdate() {
        if (this.local) {
            const f = (this.scene.control.right() ? 1 : 0) - (this.scene.control.left() ? 1 : 0)
            this.setAccelerationX(f * 720)
            if (f != 0)
                this.sendSync()
        }
        if (this.x < 0)
            this.x = this.parentContainer.width
        if (this.x > this.parentContainer.width)
            this.x = 0
        this.updateTexture()
    }

    onPlatform(other: Platform) {
        if (!this.local || this.body.velocity.y < 0) return
        other.onIt(this)
    }

    jump() {
        this.setVelocityY(-1000)
        this.sendSync()
    }

    sendSync() {
        if(Game.displayMode&&this.local)return
        const {x, y} = this
        this.scene.network.send(Player.event_sync, {x, y, velocity: this.body.velocity}, true)
    }

    readSync(obj: { x: number, y: number, velocity: Vector2 }) {
        this.x = obj.x
        this.y = obj.y
        this.setVelocity(obj.velocity.x, obj.velocity.y)
        this.update()
    }

    static event_sync = new EventKey<{ x: number, y: number, velocity: Vector2 }>('playerSync')
}