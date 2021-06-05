import {io, Socket} from 'socket.io-client'
import {EventKey, MyEventEmitter} from '../utils/Event'
import {Main} from './Main'
import {C2SEvents, S2CEvents, UserInfo} from '../event'
import {Game} from './Game'

export type Player = UserInfo

/**@implements MyEventEmitter broadcast event in room*/
export class NetworkMgr extends MyEventEmitter<{ sender: Player }> {
    event_joined = new EventKey('joined')
    event_newPlayer = new EventKey('newPlayer')
    event_quitPlayer = new EventKey('quitPlayer')//quit
    client: Socket<S2CEvents, C2SEvents>
    info: Player = {id: '', master: false}
    state: 'unConnect' | 'connecting' | 'reconnect' | 'gaming' = 'unConnect'

    constructor(public scene:Main) {
        super()
        this.client = io('ws://m.wayzer.cf:9999', {
            autoConnect: false,
        })
        this.listen()
    }

    async connect(start: () => void) {
        await this.client.connect()
        this.state = 'connecting'
        this.client.once('infoUpdate',(info)=>{
            this.info = info
            this.emit(this.event_joined, {sender: info})
            start()
            this.state = 'gaming'
        })
        await this.client.emit('joinRoom',{display: Game.displayMode})
    }

    async disconnect() {
        this.state = 'unConnect'
        this.info.master = false
        await this.client.close()
    }

    private listen() {
        this.client.on('infoUpdate',(info)=>{
            this.info = info
        })
        this.client.on('joinRoom', ({from}) => {
            this.emit(this.event_newPlayer, {sender: from})
        })
        this.client.on('levelRoom', ({from}) => {
            this.emit(this.event_quitPlayer, {sender: from})
        })
        this.client.on('disconnect', async () => {//PLAYER_ACTIVITY_CHANGED PLAYER_ROOM_LEFT
            if (this.state != 'gaming') return
            this.scene.reset()
        })
        this.client.on('broadcast', ({from, data: event}) => {
            const {id: eventId, data} = event
            const key = EventKey.getById(eventId)
            if (!key) {
                console.log('event (id:' + eventId + ') not support: ', data)
                return
            }
            this.emit(key, Object.assign({sender: from}, data))
        })
    }

    get isMaster(): boolean {
        return this.info.master
    }

    private send0<T>(event: EventKey<T>, arg: T, peer?: Player) {
        this.client.emit('broadcast', {peer, data: {id: event.id, data: arg}})
    }

    sendPeer<T>(event: EventKey<T>, arg: T, peer: Player) {
        this.send0(event, arg, peer)
    }

    send<T>(event: EventKey<T>, arg: T, excludeSelf: boolean = false) {
        this.send0(event, arg)
        if (!excludeSelf)
            this.emit(event, Object.assign({sender: this.info}, arg))
    }
}