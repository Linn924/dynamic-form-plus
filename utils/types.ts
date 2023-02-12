type TBxss =
    | 'button'
    | 'text'
    | 'number'
    | 'input'
    | 'textarea'
    | 'date'
    | 'select'
    | 'select-multiple'
    | 'radio'
    | 'checkbox'
    | 'cascader'
    | 'upload-text'
    | 'upload-picture'
    | 'template-value'
    | 'edittable'
    | 'editcard'

type TGroupData = ITab[]

interface ITab {
    tabmc: string
    tabbm: string
    fzlist: IFz[]
    _prj_visible?: boolean | string
    _prj_disabled?: boolean
}

interface IFz {
    fzmc: string
    fzbm: string
    ysj_sfycmc?: string
    _prj_visible?: boolean | string
    _prj_disabled?: boolean
}

type TFormData = IFrom[]

interface IFrom {
    id?: string
    dtysj_id?: string
    swh?: number
    imgmc?: string
    imgid?: string
    url?: string
    formdata: IFrom[]
    fzbm: string
    zmbm: string
    mcbm?: string
    zmmc?: string
    tdcols?: string
    thcols?: string
    zwcols?: string
    sfbt?: string
    sfzd?: string
    wzms?: string
    placeholder?: string
    dlDw?: string
    dlDwgs?: string
    ysj_bxxs: TBxss
    ysj_extra?: string
    ysj_gs?: string
    ysj_mrz?: string
    ysj_zdmrz?: string
    ysj_zdlist?: any
    ysj_rule?: string
    ysj_cd?: string
    ysj_zdbm?: string
    _prj_visible?: boolean | string
    _prj_disabled?: boolean
    _prj_button?: any
    [prop: string]: any
}

interface IExpendObj {
    zmbm: string
    zmbmInDt?: string
    opt: any
}

interface IExpendGruoupObj {
    tabbm?: string
    fzbm?: string
    opt: any
}

type TElementPlusRules = IElementPlusRule[]
interface IElementPlusRule {
    required?: boolean
    type?: string
    message?: string
    trigger?: string
    [prop: string]: any
}

export type {
    TGroupData,
    TFormData,
    ITab,
    IFz,
    IFrom,
    IExpendObj,
    IExpendGruoupObj,
    TElementPlusRules
}
