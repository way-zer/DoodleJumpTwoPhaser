import {EventEmitter} from 'eventemitter3'

export class EventKey<T extends {} = {}> {
    private static array = [] as EventKey[]

    static getById(id: number): EventKey {
        return this.array[id]
    }

    readonly id: number

    constructor(public readonly name: string) {
        this.id = EventKey.array.push(this) - 1
    }

    get nameId() {
        return this.name + '#' + this.id
    }
}

export class MyEventEmitter<Ext = {}> {
    private impl = new EventEmitter()

    on<T>(event: EventKey<T>, listener: (payload: T & Ext) => any): this {
        this.impl.on(event.nameId, listener)
        return this
    }

    once<T>(event: EventKey<T>, listener: (payload: T & Ext) => any): this {
        this.impl.once(event.nameId, listener)
        return this
    }

    off<T>(event: EventKey<T>, listener: (payload: T & Ext) => any): this {
        this.impl.off(event.nameId, listener)
        return this
    }

    emit<T>(event: EventKey<T>, arg: T & Ext): boolean {
        return this.impl.emit(event.nameId, arg)
    }
}