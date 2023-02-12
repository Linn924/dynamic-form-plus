export interface IProvideForm {
    value: any
    mode: string
    scene: string
    labelWidth: string
    dictUrl: string
    cityData: any
    cityZmbmSuffix: string
    handleUploadResult: (result: any, file: any) => any
}

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

export interface IFormData {
    id?: string
    dtysj_id?: string
    swh?: number
    imgmc?: string
    imgid?: string
    url?: string
    formdata: IFormData[]
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

export interface IFzData {
    fzmc: string
    fzbm: string
    ysj_sfycmc?: string
    _prj_visible?: boolean | string
    _prj_disabled?: boolean
}

export interface IGroupData {
    tabmc: string
    tabbm: string
    fzlist: IFzData[]
    _prj_visible?: boolean | string
    _prj_disabled?: boolean
}

export interface IExpendObj {
    zmbm: string
    zmbmInDt?: string
    opt: any
}

export interface IExpendGruoupObj {
    tabbm?: string
    fzbm?: string
    opt: any
}

export interface IDynamicOpts {
    formdata: IFormData[]
    groupdata: IGroupData[]
}

export interface IDynamicPlus {
    formOptsUrl: string
    uploadUrl: string
    previewUrl: string
    dictUrl: string
    getUploadHeaders: () => any
    handleUploadResult: (result?: any, file?: any) => any
    resetOpts: (formdata: IFormData[], opt: IExpendObj) => any
    resetGroupOpts: (groupdata: IGroupData[], opt: IExpendGruoupObj) => any
}
