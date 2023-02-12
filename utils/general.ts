import type {
    TGroupData,
    TFormData,
    IExpendObj,
    IExpendGruoupObj
} from './types'

// 处理表单项配置
const resetOpts = (
    aFormOpts: TFormData,
    opts: IExpendObj | IExpendObj[]
): TFormData => {
    const aData = Array.isArray(opts) ? opts : [opts]
    const oMap = new Map()
    aData.forEach(oData => {
        oMap.set(oData.zmbm, oData)
    })
    return aFormOpts.map(oOpt => {
        if (oMap.has(oOpt.zmbm)) {
            const opts = oMap.get(oOpt.zmbm)
            if (opts.zmbmInDt) {
                oOpt = {
                    ...oOpt,
                    formdata: oOpt.formdata.map(oDtOpt => {
                        if (oDtOpt.zmbm === opts.zmbmInDt) {
                            oDtOpt = {
                                ...oDtOpt,
                                ...opts.opt
                            }
                        }
                        return oDtOpt
                    })
                }
            } else {
                oOpt = {
                    ...oOpt,
                    ...opts.opt
                }
            }
        }
        return oOpt
    })
}

// 处理tab、分组配置
const resetGroupOpts = (
    aGroupOpts: TGroupData,
    opts: IExpendGruoupObj
): TGroupData => {
    const aData = Array.isArray(opts) ? opts : [opts]
    const oTabMap = new Map()
    const oFzMap = new Map()
    aData.forEach(oData => {
        if (oData.tabbm) {
            oTabMap.set(oData.tabbm, oData.opt)
        } else if (oData.fzbm) {
            oFzMap.set(oData.fzbm, oData.opt)
        }
    })
    return aGroupOpts.map(oGroup => {
        const bIsTabOpt = oTabMap.has(oGroup.tabbm)
        return {
            ...oGroup,
            fzlist: oGroup.fzlist.map(oFz => {
                return {
                    ...oFz,
                    ...(oFzMap.has(oFz.fzbm) ? oFzMap.get(oFz.fzbm) : {})
                }
            }),
            ...(bIsTabOpt ? oTabMap.get(oGroup.tabbm) : {})
        }
    })
}

export { resetOpts, resetGroupOpts }
