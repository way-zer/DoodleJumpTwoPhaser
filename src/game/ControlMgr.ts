import {Main} from './Main'
import CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys

const keys = {
    W: Phaser.Input.Keyboard.KeyCodes.W,
    A: Phaser.Input.Keyboard.KeyCodes.A,
    S: Phaser.Input.Keyboard.KeyCodes.W,
    D: Phaser.Input.Keyboard.KeyCodes.D,
}
type KeyState = {
    [key in keyof typeof keys]: Phaser.Input.Keyboard.Key
}

export class ControlMgr {
    cursors: CursorKeys
    keys: KeyState
    get pointer(){
        return this.scene.input.activePointer
    }

    constructor(public scene: Main) {
        this.cursors = scene.input.keyboard.createCursorKeys()
        this.keys = scene.input.keyboard.addKeys(keys) as KeyState
    }

    left(): boolean {
        const touchL = this.pointer.primaryDown&&this.pointer.worldX < (+this.scene.game.config.width) / 2
        return this.cursors.left.isDown || this.keys.A.isDown || touchL
    }

    right(): boolean {
        const touchR = this.pointer.primaryDown&&this.pointer.worldX > (+this.scene.game.config.width) / 2
        return this.cursors.right.isDown || this.keys.W.isDown || touchR
    }
}