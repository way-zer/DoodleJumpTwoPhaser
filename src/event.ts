export interface UserInfo {
    id: string
    master: boolean
}

type CustomEvent = { id: number, data: any }
type F<T = {}> = (obj: T) => void

export interface C2SEvents {
    joinRoom: F<{display:boolean}>
    broadcast: F<{ peer?: UserInfo, data: CustomEvent }>
}

export interface S2CEvents {
    infoUpdate: F<UserInfo>
    joinRoom: F<{ from: UserInfo }>
    levelRoom: F<{ from: UserInfo }>
    broadcast: F<{ from: UserInfo, data: CustomEvent }>
}