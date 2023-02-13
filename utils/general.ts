import type { IFormData, IGroupData, IExpendObj, IExpendGruoupObj } from '@/form'

// 处理表单项配置
const resetOpts = (formdata: IFormData[], opt: IExpendObj | IExpendObj[]): IFormData[] => {
    const optArr = Array.isArray(opt) ? opt : [opt]
    const map = new Map()
    optArr.forEach(opt => {
        map.set(opt.zmbm, opt)
    })
    return formdata.map(form => {
        if (map.has(form.zmbm)) {
            const opts = map.get(form.zmbm)
            if (opts.zmbmInDt) {
                form = {
                    ...form,
                    formdata: form.formdata.map(dtForm => {
                        if (dtForm.zmbm === opts.zmbmInDt) {
                            dtForm = {
                                ...dtForm,
                                ...opts.opt
                            }
                        }
                        return dtForm
                    })
                }
            } else {
                form = {
                    ...form,
                    ...opts.opt
                }
            }
        }
        return form
    })
}

// 处理tab、分组配置
const resetGroupOpts = (groupdata: IGroupData[], opt: IExpendGruoupObj): IGroupData[] => {
    const optArr = Array.isArray(opt) ? opt : [opt]
    const tabMap = new Map()
    const fzMap = new Map()
    optArr.forEach(opt => {
        if (opt.tabbm) {
            tabMap.set(opt.tabbm, opt.opt)
        } else if (opt.fzbm) {
            fzMap.set(opt.fzbm, opt.opt)
        }
    })
    return groupdata.map(group => {
        const isTabOpt = tabMap.has(group.tabbm)
        return {
            ...group,
            fzlist: group.fzlist.map(fz => {
                return {
                    ...fz,
                    ...(fzMap.has(fz.fzbm) ? fzMap.get(fz.fzbm) : {})
                }
            }),
            ...(isTabOpt ? tabMap.get(group.tabbm) : {})
        }
    })
}

export { resetOpts, resetGroupOpts }
