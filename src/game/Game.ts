import {Platform, PlatformType} from './Platform'
import {Player} from './Player'
import {EventKey} from '../utils/Event'
import {Main} from './Main'

export class Game {
    static event_requirePlatform = new EventKey<{ y: number }>('requirePlatform')
    static displayMode = window.location.toString().includes('display')
    gaming = false
    player: Player
    other?: Player
    dead = false
    highestScore: number = 0
    anotherHighest = 0
    platformY = 30
    platforms = new Map<number, Platform>()

    get waiting() {
        return this.other == undefined
    }

    constructor(public scene: Main) {
        let player0: string
        this.scene.network.on(Player.event_sync, (obj) => {
            if (Game.displayMode) {
                if (this.player.local) {
                    player0 = obj.sender.id
                    this.player.local = false
                }
                if (player0 == obj.sender.id) {
                    this.player.readSync(obj)
                } else {
                    if (!this.other) {
                        this.other = new Player(this.scene, false)
                        this.other.alpha = 1
                        this.scene.world.spawn(this.other, 90)
                    }
                    this.other.readSync(obj)
                }
                return
            }

            if (!this.other) {
                this.other = new Player(this.scene, false)
                this.scene.world.spawn(this.other, 90)
            }
            this.other.readSync(obj)
        })
        this.scene.network.on(this.scene.network.event_quitPlayer, ({sender}) => {
            if (Game.displayMode && sender.id == player0 && this.other) {//大屏模式掉线转移
                this.scene.world.remove(this.player)
                this.scene.world.move(-99999)
                this.player = this.other
                this.other = undefined
                this.update()
            }
        })
        this.scene.network.on(Platform.event_sync, (obj) => {
            if (!this.platforms.has(obj.id)) {
                const newPlatformY = this.scene.world.conv2Height(obj.y) + 60
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
        this.anotherHighest = 0
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
        let players = [this.player, this.other || {} as Player]
        if (Game.displayMode)
            players = players.sort((a, b) => -(world.conv2Height(a.y) - world.conv2Height(b.y)))
        let playerH = world.conv2Height(players[0].y)
        const delta = playerH - world.worldHeight(0.5)
        if (delta > 0) {
            world.move(delta)
            this.highestScore = world.worldHeight(0)
        }
        this.requirePlatform(world.worldHeight(1))
        if (playerH < world.worldHeight(0)) {
            const {highestScore} = this
            this.scene.reset()
            this.highestScore = highestScore
            this.dead = true
        }
        if (this.other) {
            const playerL = world.conv2Height(players[1].y)
            if (playerL < world.worldHeight(0)) {
                this.anotherHighest = Math.max(this.anotherHighest, playerL - world.height / 2)
            }
        }
    }

    private requirePlatform(y: number) {
        if (this.waiting || Game.displayMode) return
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