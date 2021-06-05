import Text = Phaser.GameObjects.Text
import {Main} from './Main'

export class TheUI {
    private center: Text
    private score: Text
    private belowScore: Text
    private touchEnabled = true

    constructor(public scene: Main) {
        const center = this.scene.add.text(360, 0, 'Click to start')
        center.setFontSize(64)
        center.setColor('#ff0000')
        center.setOriginFromFrame()
        center.y = (+scene.game.config.height) * 0.6
        this.center = center

        const score = this.scene.add.text(360, 0, '000')
        score.setFontSize(48)
        score.setColor('#000000')
        score.setOriginFromFrame()
        score.y = 16 + 24
        this.score = score

        const belowScore = this.scene.add.text(360, 0, '000')
        belowScore.setFontSize(48)
        belowScore.setColor('#4c1818')
        belowScore.setOriginFromFrame()
        belowScore.y = (+scene.game.config.height) - 24
        this.belowScore = belowScore

        scene.input.on('pointerdown', (e: Phaser.Input.Pointer) => {
            if (this.touchEnabled) {
                console.log(e)
                e.event.stopPropagation()
                scene.theGame.start()
            }
        })
    }

    update() {
        this.center.visible = true
        this.touchEnabled = true
        if (this.scene.theGame.dead) {
            this.center.text = 'You are dead'
        } else if (!this.scene.theGame.gaming) {
            this.center.text = 'Click to Start'
        } else if (this.scene.theGame.waiting) {
            this.center.text = 'Waiting for peer'
            this.touchEnabled = false
        } else {
            this.center.visible = false
            this.touchEnabled = false
        }
        this.score.text = Math.round(this.scene.theGame.highestScore).toString()

        const belowScore = Math.round(this.scene.theGame.anotherHighest)
        this.belowScore.visible = belowScore < this.scene.world.worldHeight(0)
        this.belowScore.text = '🔻 ' + belowScore
    }
}