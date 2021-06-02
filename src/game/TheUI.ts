import Container = Phaser.GameObjects.Container
import {Main} from './Main'
import Text = Phaser.GameObjects.Text

export class TheUI{
    private center: Text
    private score: Text
    private touchEnabled = true
    constructor(public scene: Main) {
        const center = this.scene.add.text(360,0,'Click to start')
        center.setFontSize(64)
        center.setColor('#ff0000')
        center.setOriginFromFrame()
        center.y = (+scene.game.config.height)*0.6
        this.center = center

        const score = this.scene.add.text(360,0,'000')
        score.setFontSize(48)
        score.setColor('#000000')
        score.setOriginFromFrame()
        score.y = 16+24
        this.score = score

        scene.input.on('pointerdown',(e:Phaser.Input.Pointer)=>{
            if(this.touchEnabled){
                console.log(e)
                e.event.stopPropagation()
                scene.theGame.start()
            }
        })
    }

    update(){
        this.center.visible = true
        this.touchEnabled = true
        if (this.scene.theGame.dead){
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
    }
}