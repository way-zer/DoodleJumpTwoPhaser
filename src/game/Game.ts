import {Platform, PlatformType} from './Platform'
import {Player} from './Player'
import {EventKey} from '../utils/Event'
import {Main} from './Main'

export class Game {
    static event_requirePlatform = new EventKey<{ y: number }>('requirePlatform')
    gaming = false
    player: Player
    other?: Player
    dead = false
    highestScore: number = 0
    platformY = 30
    platforms = new Map<number, Platform>()

    get waiting() {
        return this.other == undefined
    }

    constructor(public scene: Main) {
        this.scene.network.on(Player.event_sync, (obj) => {
            if (!this.other) {
                this.other = new Player(this.scene, false)
                this.scene.world.spawn(this.other, 90)
            }
            this.other.readSync(obj)
        })
        this.scene.network.on(Platform.event_sync, (obj) => {
            if (!this.platforms.has(obj.id)) {
                const newPlatformY = -obj.y + this.scene.world.height + 60
                if (newPlatformY < this.platformY) return
                const p = new Platform(this.scene, obj.type)
                this.scene.world.place(p, obj.y)
                this.platforms.set(obj.id, p)
                this.platformY = newPlatformY
            }
            this.platforms.get(obj.id)?.readSync(obj)
        })
        this.scene.network.on(Game.event_requirePlatform, ({y}) => this.requirePlatform(y))
    }

    reset() {
        this.gaming = false
        this.other = undefined
        this.dead = false
        this.highestScore = 0
        this.platformY = 30
        this.platforms.clear()
    }

    start() {
        this.reset()
        const base = new Platform(this.scene, 'base')
        this.scene.world.place(base, 10, 0.5)
        this.player = new Player(this.scene, true)
        this.scene.world.spawn(this.player, 90)
        this.gaming = true

        this.scene.network.connect(() => {
            this.player.sendSync()
        }).then()
    }

    update() {
        if (!this.gaming) return
        const world = this.scene.world
        const playerH = world.conv2Height(this.player.y)
        const delta = playerH - world.y - world.height / 2
        if (delta > 0) {
            world.move(delta)
            this.highestScore = world.y / 10
        }
        this.requirePlatform(world.y + world.height)
        if (playerH < world.y) {
            const {highestScore} = this
            this.scene.reset()
            this.highestScore = highestScore
            this.dead = true
        }
    }

    private requirePlatform(y: number) {
        if (this.waiting) return
        if (!this.scene.network.isMaster) {
            if (this.platformY < y) {
                this.scene.network.send(Game.event_requirePlatform, {y}, true)
            }
            return
        }
        while (this.platformY < y) {
            function randomType(): PlatformType {
                const r = Math.random()
                if (r < 0.6)
                    return 'normal'
                if (r < 0.8)
                    return 'break'
                else if (r < 0.9)
                    return 'move'
                return 'once'
            }

            const p = new Platform(this.scene, randomType())
            this.scene.world.place(p, this.platformY)
            this.platforms.set(p.id, p)
            p.sendSync()
            this.platformY += 60
        }
    }
}