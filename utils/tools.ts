import { IFrom, TFormData, TElementPlusRules } from './types'
import { validator, getValidateRule, date2Str, dateAdd } from './wiv'

//常见文件的格式
const typeSet = {
    audio: [
        'AC3',
        'AU',
        'MP2',
        'MP3',
        'OGG',
        'CD',
        'WMA',
        'WAV',
        'MP3PRO',
        'RM',
        'REAL',
        'APE',
        'MODULE',
        'MIDI',
        'VQF'
    ],
    video: ['3GP', 'MP4', 'MPEG', 'MPG', 'PEG', 'AVI', 'NAVI', 'MOV', 'WMV', 'MKV', 'FLV', 'VOB'],
    image: ['BMP', 'DWG', 'DXF', 'GIF', 'JP2', 'JPE', 'JPEG', 'JPG', 'PNG', 'SVF', 'TIF', 'TIFF'],
    doc: ['DOC', 'DOCX', 'XLS', 'XLSX', 'PPT', 'PPTX', 'PDF', 'TXT']
}

//解析校验规则(转换成element校验规则)
const parsedFormRule = (oOpt: IFrom, oRules = {}) => {
    const aChangeValidateComp = [
        'select',
        'selectMultiple',
        'radio',
        'checkbox',
        'date',
        'cascader'
    ] //此类组件一般触发验证的方式是change
    const bTriggerIsChange = aChangeValidateComp.indexOf(oOpt.ysj_bxxs) > -1 //当前表现形式是否存在于aChangeValidateComp中
    const fIsNumber = validator.number //判断是否是数字
    const fSplitYsjcd = (sYsjcd: string) => {
        //分割字符串
        let aYsjcd = sYsjcd.split(',').map(item => {
            return item.trim() === '' || item.trim() === 'undefined' ? undefined : item
        })
        if (aYsjcd.length === 1) {
            return aYsjcd[0] !== undefined
                ? fIsNumber(aYsjcd[0])
                    ? Number(aYsjcd[0])
                    : undefined
                : undefined
        } else {
            return [
                aYsjcd[0] !== undefined
                    ? fIsNumber(aYsjcd[0])
                        ? Number(aYsjcd[0])
                        : undefined
                    : undefined,
                aYsjcd[1] !== undefined
                    ? fIsNumber(aYsjcd[1])
                        ? Number(aYsjcd[1])
                        : undefined
                    : undefined
            ]
        }
    }
    const aRules: TElementPlusRules = []

    if (oOpt.ysj_bxxs === 'edittable' || oOpt.ysj_bxxs === 'editcard') return []

    if (!oOpt.designer_rule) {
        if (oOpt.sfbt === '1') {
            switch (oOpt.ysj_bxxs) {
                case 'upload-text':
                case 'upload-picture':
                    aRules.push({
                        required: true,
                        type: 'array',
                        message: '至少上传1个文件',
                        trigger: 'change'
                    })
                    break
                default:
                    aRules.push({
                        ...getValidateRule('required'),
                        ...(bTriggerIsChange ? { message: '必选', trigger: 'change' } : {})
                    })
            }
        }

        //上传组件验证处理
        if (oOpt.ysj_bxxs === 'upload-text' || oOpt.ysj_bxxs === 'upload-picture') {
            let aUploadVali = oOpt.ysj_cd ? fSplitYsjcd(oOpt.ysj_cd) : [undefined, undefined]
            if (aUploadVali?.[0]) {
                aRules.push({
                    validator: (rule: any, value: any, callback: any) => {
                        if (value.length < aUploadVali?.[0]) {
                            return callback(new Error(`至少上传${aUploadVali?.[0]}个文件`))
                        }
                        return callback()
                    }
                })
            }
        }

        switch (oOpt.ysj_rule) {
            case 'numberRange': //范围：{0}~{1}
                aRules.push(
                    getValidateRule(
                        'numberRange',
                        oOpt.ysj_cd ? fSplitYsjcd(oOpt.ysj_cd) : [undefined, undefined]
                    )
                )
                break
            case 'int': //必须为整数
                aRules.push(getValidateRule('int'))
                break
            case 'intRange': //必须为整数，范围：{0} ~{1}
                aRules.push(
                    getValidateRule('int'),
                    getValidateRule(
                        'numberRange',
                        oOpt.ysj_cd ? fSplitYsjcd(oOpt.ysj_cd) : [undefined, undefined]
                    )
                )
                break
            case 'length': //必须填{0}个字
                aRules.push(getValidateRule('length', Number(oOpt.ysj_cd)))
                break
            case 'lengthRange': //限制{0}-{1}个字
                aRules.push(
                    getValidateRule(
                        'lengthRange',
                        oOpt.ysj_cd ? fSplitYsjcd(oOpt.ysj_cd) : [undefined, undefined]
                    )
                )
                break
            case 'byteLength': //必须填{0}个字符（中文计为2个字符）
                aRules.push(getValidateRule('byteLength', oOpt.ysj_cd))
                break
            case 'byteLengthRange': //限制{0}-{1}个字符（中文计为2个字符）
                aRules.push(
                    getValidateRule(
                        'byteLengthRange',
                        oOpt.ysj_cd ? fSplitYsjcd(oOpt.ysj_cd) : [undefined, undefined]
                    )
                )
                break
            case 'phone': //联系方式(手机/电话皆可)验证
                aRules.push(getValidateRule('phone'))
                break
            case 'mobile': //手机号验证
                aRules.push(getValidateRule('phone', 'mobile'))
                break
            case 'tel': //座机验证
                aRules.push(getValidateRule('phone', 'tel'))
                break
            case 'username': //用户名（必须由字母、数字、下划线组成）
                aRules.push(getValidateRule('username'))
                break
            case 'email': //电子邮箱
                aRules.push(getValidateRule('email'))
                break
            case 'postcode': //邮政编码
                aRules.push(getValidateRule('postcode'))
                break
            case 'IDCard_cn': //中国身份证（不含港澳台身份证及通行证验证）
            case 'IDCard_hm': //港澳居民来往内地通行证
            case 'IDCard_t': //台湾居民来往大陆通行证
            case 'IDCard_hmt': //合并 hm 和 tw
            case 'IDCard_cnhmt': //中国身份证（含港澳台身份证及通行证）
                aRules.push(getValidateRule('IDCard', oOpt.ysj_rule.split('_')[1]))
                break
            case 'tyshxy': //统一社会信用代码
                aRules.push(getValidateRule('tyshxy'))
                break
            case 'gsdj': //工商登记码
                aRules.push(getValidateRule('gsdj'))
                break
            case 'zzjg': //组织机构代码
                aRules.push(getValidateRule('zzjg'))
                break
            case 'swdj': //税务登记号
                aRules.push(getValidateRule('swdj'))
                break
            default: //未做声明的规则
        }
    }

    if (oRules[oOpt.zmbm]) {
        //rules中是否有当前自定义验证规则
        aRules.push(...oRules[oOpt.zmbm]) //添加自定义验证规则
    }
    return aRules
}

//验证编辑表格、编辑卡片的数量是否符合配置
const validateExtra = (sVal: string, aList: any[]) => {
    let aVal = []
    if (sVal) {
        //编辑表格的行数应是范围
        aVal = sVal.split(',').map(item => {
            return item === undefined || item === 'undefined' || item === ''
                ? undefined
                : Number(item)
        })
        if (aVal[0] === undefined && aVal[1] !== undefined) {
            if (aList.length > aVal[1]) return false
        }
        if (aVal[1] === undefined && aVal[0] !== undefined) {
            if (aList.length < aVal[0]) return false
        }
        if (aVal[0] !== undefined && aVal[1] !== undefined) {
            if (aList.length < aVal[0] || aList.length > aVal[1]) return false
        }
    }
    return true
}

//配置项处理(返回表单项字段与表单项默认值、表单项校验规则、表单项宽度处理后的formdata、需要校验的子组件)
const parseOpts = (oData: any) => {
    const { opts: aOpts, mode, rules, scene } = oData //结构赋值
    const oOptValue = {} //配置项的初始值
    const oRulesValue = {} //配置项的验证规则
    let aFormData = [] //处理后的formdata

    const fFormatDate = (oDate: any, sYsjgs: string) => {
        oDate.setHours('0')
        oDate.setMinutes('0')
        oDate.setSeconds('0')
        return date2Str(oDate, sYsjgs)
    }

    aFormData = aOpts.map((oOpt: IFrom, nIdx: number) => {
        if (mode === 'edit') {
            //rules 后续不支持修改，因此不需要考虑变更的情况。业务中如果需要修改规则，应在传入的验证方法中修改判断逻辑
            oOpt.dynamicform_rules = parsedFormRule(oOpt, rules) //解析验证规则
        }

        //解析表单项label的宽度
        if (oOpt.ysj_bxxs === 'text') {
            // 可编辑表格、文本内容不显示form-label
            oOpt.dynamicform_thcols = '0'
        } else {
            oOpt.dynamicform_thcols =
                oOpt.thcols && /^\d+$/.test(oOpt.thcols) && oOpt.thcols !== '0'
                    ? `${oOpt.thcols}px`
                    : oOpt.thcols
        }

        //取出表单所有属性和值
        switch (oOpt.ysj_bxxs) {
            case 'number':
            case 'input':
            case 'textarea':
                oOptValue[oOpt.zmbm] = oOpt.ysj_mrz || ''
                break
            case 'date': //日期控件的ysj_mrz 既支持特殊字符串'today'、'yesterday' 又支持普通日期字符串
                if (oOpt.ysj_mrz) {
                    switch (oOpt.ysj_mrz) {
                        case 'today':
                            oOptValue[oOpt.zmbm] = fFormatDate(
                                new Date(),
                                oOpt.ysj_gs || 'yyyy-MM-dd'
                            )
                            break
                        case 'yesterday':
                            oOptValue[oOpt.zmbm] = fFormatDate(
                                dateAdd(new Date(), 'd', '-1'),
                                oOpt.ysj_gs || 'yyyy-MM-dd'
                            )
                            break
                        default:
                            oOptValue[oOpt.zmbm] = oOpt.ysj_mrz
                    }
                } else {
                    oOptValue[oOpt.zmbm] = ''
                }
                break
            case 'edittable':
            case 'editcard':
                //编辑表格、编辑卡片的label样式调整
                oOpt.dynamicform_class = `_${oOpt.ysj_bxxs}`
                oOptValue[oOpt.zmbm] = oOpt.ysj_zdmrz || []
                //当前是移动端时，将编辑表格转换成编辑卡片
                scene === 'mobile' && (oOpt.ysj_bxxs = 'editcard')
                break
            case 'upload-text':
            case 'upload-picture':
                oOptValue[oOpt.zmbm] = []
                break
            case 'button':
                break
            default:
                oOptValue[oOpt.zmbm] = oOpt.ysj_zdmrz || ''
        }

        oOpt.dynamicform_tdcols = scene === 'mobile' || !oOpt.tdcols ? 24 : Number(oOpt.tdcols) // 表单项的宽度 不传默认整行（24列；当前是移动端时，默认整行（24列）

        /**
         * 若当前项有parentid
         *      父子关系 -> oOpt.parentid === aOpts[nIdx - 1].id 不换行
         *      兄弟关系 - > oOpt.parentid === aOpts[nIdx - 1].parentid 不换行
         * 若当前项没有parentid
         *      前一项有 parentid => 非父子、 非兄弟 => 换行
         *      前一项没有 parentid => 兄弟关系 => 不换行
         */
        if (nIdx === 0) {
            oOpt.dynamicform_linefeed = false
        } else {
            oOpt.dynamicform_linefeed = !(
                oOpt.parentid === aOpts[nIdx - 1].id || oOpt.parentid === aOpts[nIdx - 1].parentid
            )
        }

        return oOpt
    })

    return {
        oOptValue,
        oRulesValue,
        aFormData
    }
}

//递归判断当前项是否显示
const deepJudge = (
    oOpt: IFrom | any,
    aFormData: TFormData,
    value: any,
    sType?: string,
    form?: any
): any => {
    const fJudgeStatus = (
        oOpt: IFrom,
        aFormData: TFormData,
        value: any,
        sType?: string,
        form?: any
    ): any => {
        return value[oOpt.parentzmbm]
            ? value[oOpt.parentzmbm].split(';').indexOf(oOpt.parentzdz) > -1 &&
                  deepJudge(findOpts(oOpt, aFormData), aFormData, value, sType, form)
            : false
    }
    return typeof oOpt._prj_visible === 'boolean'
        ? oOpt._prj_visible
        : //默认为 'auto'，由于除 boolean 类型外部包括其他值
        oOpt.parentid
        ? sType === 'monomer' //如果当前项是单体内的表单项，从单体中找不到父级 就从单体外寻找父级
            ? fJudgeStatus(oOpt, aFormData, value, sType, form) ||
              fJudgeStatus(oOpt, form.aFormData, form.value)
            : fJudgeStatus(oOpt, aFormData, value)
        : true
}

//找到指定编码对应的配置项
const findOpts = (oOpt: IFrom, aFormData: TFormData) => {
    let oData = {}
    if (aFormData) {
        aFormData.some(oItem => {
            if (oItem.id === oOpt.parentid && oItem.zmbm === oOpt.parentzmbm) {
                oData = oItem
                return true
            }
        })
    }
    return oData
}

//数据处理（将下拉数据中的mc替换成name）
const dealDictList = (data: any) => {
    if (!(data && data.length)) return []
    if (!data[0].mc) return data
    return data.map((oItem: any) => {
        return {
            ...oItem,
            name: oItem.mc
        }
    })
}

//获取表单项最终校验规则的配置对象
const getRelValidateOpt = (oOpt: any, oFormValue: any, nIndex: number) => {
    return {
        ...oOpt,
        dynamicform_rules:
            (oOpt.designer_rule
                ? ruleHandler(oOpt.designer_rule, oFormValue, nIndex)
                : oOpt.dynamicform_rules) || []
    }
}

//设计器验证规则处理
const ruleHandler = (aRule: any, oFormValue: any, nIndex: number) => {
    interface rule {
        rule: any
        limit: any
        message: any
        trigger: any
        validator: any
    }
    return aRule.map(({ rule, limit, message, trigger, validator }: rule) => {
        return {
            ...(validator
                ? {
                      validator: (rule: any, value: any, callback: any) => {
                          eval(`(${validator})`).call(null, {
                              value,
                              oFormValue,
                              $index: nIndex,
                              callback
                          })
                      },
                      message,
                      trigger: trigger || 'blur'
                  }
                : getValidateRule(rule, limit, message, trigger))
        }
    })
}

export {
    parsedFormRule,
    validateExtra,
    parseOpts,
    deepJudge,
    findOpts,
    dealDictList,
    getRelValidateOpt,
    ruleHandler,
    typeSet
}
