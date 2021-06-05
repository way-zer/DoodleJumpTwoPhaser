import {Server, Socket} from 'socket.io'
import {C2SEvents, S2CEvents, UserInfo} from './event'

const io = new Server<C2SEvents, S2CEvents>({
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
})

interface SocketExt {
    info: UserInfo
    serverInfo: {
        isDisplay: boolean
    }
}

type MySocket = Socket<C2SEvents, S2CEvents> & SocketExt

class Room<T extends MySocket = MySocket> {
    static rooms = new Map<string, Room>()

    private constructor(public name: string) {
    }

    static get(name: string): Room {
        if (!this.rooms.has(name)) {
            this.rooms.set(name, new Room(name))
        }
        return this.rooms.get(name)!
    }

    sockets = [] as T[]

    join(client: T) {
        client.on('disconnect', () => {
            this.leave(client)
        })
        client.on('broadcast', ({peer, data}) => {
            client.to(peer?.id || this.name).emit('broadcast', {from: client.info, data})
        })
        client.join(this.name)
        this.sockets.push(client)
        client.info.master = !client.serverInfo.isDisplay&&!this.sockets.some(it=>it.info.master)
        client.emit('infoUpdate', client.info)
        if(client.info.master)
            console.log("master is "+ client.info.id)
        client.in(this.name).emit('joinRoom', {from: client.info})
    }

    leave(client: T) {
        client.to(this.name).emit('levelRoom', {from: client.info})
        this.sockets = this.sockets.filter(it => it != client)
        if (client.info.master && this.sockets.length) {
            const newMaster = this.sockets.find(it=>!it.serverInfo.isDisplay)
            if(newMaster){
                newMaster.info.master = true
                newMaster.emit('infoUpdate', newMaster.info)
                console.log("master is "+ newMaster.info.id)
            }
        }
        if (this.sockets.length === 0) {
            Room.rooms.delete(this.name)
        }
    }
}

const testRoom = 'test'
io.on('connection', (client) => {
    (client as MySocket).info = {id: client.id, master: false};
    (client as MySocket).serverInfo = {isDisplay: false};
    client.on('joinRoom', ({display}) => {
        (client as MySocket).serverInfo.isDisplay = display
        const room = Room.get(testRoom)
        room.join(client as MySocket)
    })
})

io.listen(9999)
console.log('Host on 9999!')