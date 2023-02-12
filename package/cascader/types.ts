export interface IShengJi {
    p: string
    c: IShiJi[]
    s?: string
    y?: string
}

export interface IShiJi {
    n: string
    a: IQuXian[]
    s?: string
    y?: string
}

export interface IQuXian {
    s: string
    y: string
    j?: IJieDao[]
}

export interface IJieDao {
    s: string
    y: string
    q?: ISheQu[]
}

export interface ISheQu {
    s: string
    y: string
}

export type TCascader = IShengJi | IShiJi | IQuXian | IJieDao | ISheQu

export type TCascaderList = TCascader[]
