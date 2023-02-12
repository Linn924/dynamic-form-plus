//获取char对应的长度（实际，字符为1，中文为2）
const getByteLen = (sChar: string): number => {
    if (sChar.match(/[\u4e00-\u9fa5]/g)) {
        //中文
        return 2
    } else if (
        sChar.match(
            /[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/g
        )
    ) {
        // 中文标点
        return 2
    } else if (sChar.match(/[\uff00-\uffff]/g)) {
        //全角
        return 2
    } else {
        return 1
    }
}
//计算字节长度。字符为1，中文为2
const getByteLength = (sSrc: string): number => {
    let nTotalLength = 0
    if (!!sSrc) {
        for (let i = 0, nLen = sSrc.length; i < nLen; i++) {
            nTotalLength += getByteLen(sSrc[i])
        }
    }
    return nTotalLength
}
//日期格式化
const date2Str = function (oDate: any, sFormatStr: string) {
    var str = sFormatStr
    var Week = ['日', '一', '二', '三', '四', '五', '六']
    str = str.replace(/yyyy|YYYY/, '' + oDate.getFullYear())
    str = str.replace(
        /yy|YY/,
        oDate.getYear() % 100 > 9
            ? (oDate.getYear() % 100).toString()
            : '0' + (oDate.getYear() % 100)
    )
    str = str.replace(
        /MM/,
        oDate.getMonth() + 1 > 9
            ? (oDate.getMonth() + 1).toString()
            : '0' + (oDate.getMonth() + 1)
    )
    str = str.replace(/M/g, oDate.getMonth() + 1)
    str = str.replace(/w|W/g, Week[oDate.getDay()])
    str = str.replace(
        /dd|DD/,
        oDate.getDate() > 9 ? oDate.getDate().toString() : '0' + oDate.getDate()
    )
    str = str.replace(/d|D/g, oDate.getDate())
    str = str.replace(
        /hh|HH/,
        oDate.getHours() > 9
            ? oDate.getHours().toString()
            : '0' + oDate.getHours()
    )
    str = str.replace(/h|H/g, oDate.getHours())
    str = str.replace(
        /mm/,
        oDate.getMinutes() > 9
            ? oDate.getMinutes().toString()
            : '0' + oDate.getMinutes()
    )
    str = str.replace(/m/g, oDate.getMinutes())
    str = str.replace(
        /ss|SS/,
        oDate.getSeconds() > 9
            ? oDate.getSeconds().toString()
            : '0' + oDate.getSeconds()
    )
    str = str.replace(/s|S/g, oDate.getSeconds())
    return str
}
//日期计算
const dateAdd = (oDate: any, sInterval: string, nStep: any) => {
    var oldDate = oDate,
        nOldTime = oldDate.getTime() // 原始日期的毫秒数
    // 新的日期因超出当月自动化为下月（如 2017/02/29 -> 2017/03/01），设为当月最后一天
    var fChargeDate = function (oDate: any) {
        if (oDate.getDate() !== oldDate.getDate()) {
            oDate.setDate(0)
        }
        return oDate
    }
    switch (sInterval) {
        case 'S':
        case 's':
            return new Date(nOldTime + 1000 * nStep)
        case 'm':
            return new Date(nOldTime + 60000 * nStep)
        case 'H':
        case 'h':
            return new Date(nOldTime + 3600000 * nStep)
        case 'D':
        case 'd':
            return new Date(nOldTime + 86400000 * nStep)
        case 'W':
        case 'w':
            return new Date(nOldTime + 86400000 * 7 * nStep)
        case 'Q':
        case 'q':
            return fChargeDate(
                new Date(
                    new Date(nOldTime).setMonth(oldDate.getMonth() + nStep * 3)
                )
            )
        case 'M':
            return fChargeDate(
                new Date(
                    new Date(nOldTime).setMonth(oldDate.getMonth() + nStep)
                )
            )
        case 'Y':
        case 'y':
            return fChargeDate(
                new Date(
                    new Date(nOldTime).setFullYear(
                        oldDate.getFullYear() + nStep
                    )
                )
            )
    }
}
//生成唯一键
const generateGuid = (opts?: any) => {
    opts = {
        key: '',
        pattern: 'xxxyxxxy',
        ...opts
    }
    const guid = opts.pattern.replace(/[xy]/g, (c: any) => {
        let r = (Math.random() * 16) | 0,
            v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
    })
    return (opts.key || '') + guid
}
//验证方法
const validator = {
    //必填
    required: (value: any) => {
        const val = typeof value === 'number' ? value.toString() : value || ''
        return val && val.length > 0
    },
    //必须为数字
    number: (value: any) => {
        const val = typeof value === 'number' ? value.toString() : value || ''
        return !val || /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(val)
    },
    //必须为数字，范围：{0}~{1}
    numberRange: (value: any, limit: any) => {
        if (Array.isArray(limit)) {
            let val =
                    typeof value === 'number' ? value.toString() : value || '',
                min = limit[0],
                max = limit[1]
            if (val) {
                if (typeof min == 'undefined') {
                    limit[0] = '不限'
                }
                if (typeof max == 'undefined') {
                    limit[1] = '不限'
                }
            } else {
                return true
            }
            if (/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(val)) {
                // 非空，首先验证数字，同 number 的规则
                val = Number(val) // 转换为数字
                if (
                    (typeof min != 'undefined' && val < min) || // 定义了最小值，但不符合
                    (typeof max != 'undefined' && val > max)
                ) {
                    // 定义了最大值，但不符合
                    return false
                }
            } else {
                // 有值，但是非数字
                return false
            }
        }
        return true
    },
    //必须为整数
    int: (value: any) => {
        const val = typeof value === 'number' ? value.toString() : value || ''
        return !val || /^-?\d+$/.test(val)
    },
    //必须填{0}个字
    length: (value: any, limit: any) => {
        if (typeof limit === 'number') {
            const val =
                typeof value === 'number' ? value.toString() : value || ''
            return !val || val.length === limit
        }
        return true
    },
    //限制{0}-{1}个字
    lengthRange: (value: any, limit: any) => {
        if (Array.isArray(limit)) {
            const val =
                    typeof value === 'number' ? value.toString() : value || '',
                length = val.length,
                min = limit[0],
                max = limit[1]

            if (val) {
                if (typeof min === 'undefined' && typeof max !== 'undefined') {
                    if (length > max) {
                        return false
                    }
                } else if (
                    typeof min !== 'undefined' &&
                    typeof max === 'undefined'
                ) {
                    if (length < min) {
                        return false
                    }
                } else if (
                    typeof min !== 'undefined' &&
                    typeof max !== 'undefined'
                ) {
                    if (length < min || length > max) {
                        return false
                    }
                }
            }
        }
        return true
    },
    //必须填{0}个字符（中文计为2个字符）
    byteLength: (value: any, limit: any) => {
        if (typeof limit == 'number') {
            const val =
                typeof value === 'number' ? value.toString() : value || ''
            return !val || getByteLength(val) === limit
        }
        return true
    },
    //限制{0}-{1}个字符（中文计为2个字符）
    byteLengthRange: (value: any, limit: any) => {
        if (Array.isArray(limit)) {
            const val =
                    typeof value === 'number' ? value.toString() : value || '',
                length = getByteLength(val),
                min = limit[0],
                max = limit[1]

            if (val) {
                if (typeof min === 'undefined' && typeof max !== 'undefined') {
                    if (length > max) {
                        return false
                    }
                } else if (
                    typeof min !== 'undefined' &&
                    typeof max === 'undefined'
                ) {
                    if (length < min) {
                        return false
                    }
                } else if (
                    typeof min !== 'undefined' &&
                    typeof max !== 'undefined'
                ) {
                    if (length < min || length > max) {
                        return false
                    }
                }
            }
        }
        return true
    },
    //联系方式（手机/电话/座机皆可验证）
    phone: (value: any, limit = 'phone') => {
        const val = typeof value === 'number' ? value.toString() : value || '',
            mobileRex = /^1\d{10}$/,
            telRex = /^(0[0-9]{2,3}\-?)?([2-9][0-9]{6,7})+(\-[0-9]{1,4})?$/

        switch (limit) {
            case 'phone':
                return (
                    !val ||
                    telRex.test(val) ||
                    (val.length == 11 && mobileRex.test(val))
                )
            case 'mobile':
                return !val || (val.length == 11 && mobileRex.test(val))
            case 'tel':
                return !val || telRex.test(val)
        }
    },
    //用户名（必须由字母、数字、下划线组成）
    username: (value: any) => {
        const val = typeof value === 'number' ? value.toString() : value || '',
            cardNoRex = /(^[\da-zA-Z_]+$)/
        return !val || cardNoRex.test(val)
    },
    //电子邮箱
    email: (value: any) => {
        const val = typeof value === 'number' ? value.toString() : value || '',
            email = /^[a-zA-Z\d][-\.\w]*@(?:[-\w]+\.)+(?:[a-zA-Z])+$/

        return !val || email.test(val)
    },
    //邮政编码
    postcode: (value: any) => {
        const val = typeof value === 'number' ? value.toString() : value || '',
            PostalCode = /^\d{6}$/

        return !val || PostalCode.test(val)
    },
    //身份证号
    IDCard: (value: any, limit = 'cn') => {
        const isCardNo = (val: any) => {
            const _cardNoVali = (idcard: any) => {
                idcard = idcard.toString().toUpperCase() // 将末位的x装换成X
                // 身份证号码为15位或者18位，15位时全为数字，18位前17位为数字，最后一位是校验位，可能为数字或字符X
                if (!/(^\d{15}$)|(^\d{17}([0-9]|X)$)/i.test(idcard))
                    return false
                const paritybit = [
                    '1',
                    '0',
                    'X',
                    '9',
                    '8',
                    '7',
                    '6',
                    '5',
                    '4',
                    '3',
                    '2'
                ] // 校验位取值
                const power_list = [
                    7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2
                ] // 加权因子

                const fifteenToEighteen = function (str: any) {
                    let s = 0
                    let newid =
                        str.substring(0, 6) +
                        '19' +
                        str.substring(6, str.length)
                    for (let i = 0; i < newid.length; i++) {
                        s +=
                            parseInt(newid.substring(i, i + 1), 10) *
                            power_list[i]
                    }
                    return newid + paritybit[s % 11]
                }
                /**验证1位校验码（18位）*/
                const checkcodeValidation = function (str: any) {
                    let i = 0,
                        s = 0
                    for (i; i < str.length - 1; i++) {
                        s += parseInt(str[i], 10) * power_list[i]
                    }
                    return paritybit[s % 11] == str[17]
                }
                /**验证6位地址码（前6位）? 2位*/
                const locationValidation = function (str: any) {
                    const provincesAndCities = [
                        '11',
                        '12',
                        '13',
                        '14',
                        '15',
                        '21',
                        '22',
                        '23',
                        '31',
                        '32',
                        '33',
                        '34',
                        '35',
                        '36',
                        '37',
                        '41',
                        '42',
                        '43',
                        '44',
                        '45',
                        '46',
                        '50',
                        '51',
                        '52',
                        '53',
                        '54',
                        '61',
                        '62',
                        '63',
                        '64',
                        '65',
                        '71',
                        '81',
                        '82',
                        '91'
                    ]
                    /**省、直辖市代码*/
                    return provincesAndCities.indexOf(str) != -1
                }
                /**验证8位生日数字（7到14位）*/
                const birthdayValidation = function (str: any) {
                    let year = str.substring(0, 4)
                    let month = str.substring(4, 6)
                    let day = str.substring(6, 8)
                    let birthday = year + '/' + month + '/' + day
                    //var date = new Date(year,parseInt(month, 10)-1,day);// ie8 下 parseInt() 默认基数为8， 08,09 会变成 0
                    let date = new Date(birthday)
                    /**大于等于当前日期 或 小于1900年1月1日*/
                    if (date >= new Date() || date <= new Date(1900, 0, 1))
                        return false
                    return date2Str(date, 'yyyy/MM/dd') === birthday
                }
                if (15 == idcard.length) {
                    // 15位转18位
                    idcard = fifteenToEighteen(idcard)
                }
                return (
                    locationValidation(idcard.substring(0, 2)) && // 验证6位地址码（前6位）? 2位
                    birthdayValidation(idcard.substring(6, 14)) && // 验证8位生日数字（7到14位）
                    checkcodeValidation(idcard)
                ) // 验证1位校验码（18位）
            }
            return !val || _cardNoVali(val)
        }
        if (limit) {
            const val =
                    typeof value === 'number' ? value.toString() : value || '',
                hkmoCode = /^[HMhm]{1}([0-9]{10}|[0-9]{8})$/, //港澳通行证
                twCode1 = /^[0-9]{8}$/, //台湾通行证
                twCode2 = /^[0-9]{10}$/

            switch (limit) {
                case 'hm': //港澳居民来往内地通行证
                    return !val || hkmoCode.test(val)
                case 't': //台湾居民来往大陆通行证
                    return !val || twCode1.test(val) || twCode2.test(val)
                case 'hmt': //合并 hm 和 tw
                    return (
                        !val ||
                        hkmoCode.test(val) ||
                        twCode1.test(val) ||
                        twCode2.test(val)
                    )
                case 'cn': //中国身份证（不含港澳台身份证及通行证）
                    return !val || isCardNo(val)
                case 'cnhmt': //中国身份证（含港澳台身份证及通行证）
                    return (
                        !val ||
                        hkmoCode.test(val) ||
                        twCode1.test(val) ||
                        twCode2.test(val) ||
                        isCardNo(val)
                    )
            }
        }
        return true
    },
    //统一社会信用代码
    tyshxy: (value: any) => {
        const aWs = [
                1, 3, 9, 27, 19, 26, 16, 17, 20, 29, 25, 13, 8, 24, 10, 30, 28
            ], //机构代码
            sStr = '0123456789ABCDEFGHJKLMNPQRTUWXY',
            rRex = /^([0-9A-Z]){2}([0-9]){6}([0-9A-Z]){8}[0-9|X][0-9A-Z]$/

        const val = typeof value === 'number' ? value.toString() : value || ''

        let bStatus,
            nSum = 0,
            i = 0,
            nC9,
            sC9Val

        if (val.length === 18) {
            //统一社会信用代码    9-17位套用组织机构代码校验   18位为校验位
            for (i; i < 17; i++) {
                nSum += sStr.indexOf(val.charAt(i)) * aWs[i]
            }
            nC9 = 31 - (nSum % 31)
            nC9 === 31 && (nC9 = 0)
            sC9Val = sStr.substring(nC9, nC9 + 1)
            bStatus = rRex.test(val) && sC9Val === val.substring(17)
        } else {
            bStatus = false
        }
        return !val || bStatus
    },
    //工商登记码
    gsdj: (value: any) => {
        let nLen, bStatus

        let fGetGB17710 = (sCode: any) => {
            let nJgnum = 10,
                i = 0,
                nNum,
                nLen = sCode.length - 1

            for (i; i < nLen; i++) {
                nJgnum += parseInt(sCode.charAt(i))
                nNum = nJgnum % 10
                nJgnum = nNum ? nNum : 10
                nJgnum = (nJgnum * 2) % 11
            }
            nJgnum = (nJgnum + parseInt(sCode.charAt(nLen))) % 10
            return nJgnum
        }
        /**
         * 数据为15位的数字字符串，前6位为登记机关的行政区划代码（划分到县级局），第7到第14位数为顺序码，
         * 第15位为校验码（根据前14位数自动生成）；GB/T 17710 MOD 11,10 算法
         * */

        const val = typeof value === 'number' ? value.toString() : value || ''

        nLen = val.length
        if (nLen === 15) {
            bStatus = fGetGB17710(val) == 1
        } else {
            bStatus = !val
        }
        return bStatus
    },
    //组织机构代码
    zzjg: (value: any) => {
        const aWs = [3, 7, 9, 10, 5, 8, 4, 2],
            sStr = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            rRex = /^([0-9A-Z]){8}-[0-9|X]$/

        let nLen,
            nSum = 0,
            i = 0,
            nC9,
            sC9Val

        let val = typeof value === 'number' ? value.toString() : value || ''

        nLen = val.length
        if (!val) return true
        if (val.indexOf('-') < 0) {
            // 若不含 -，则在最后第二位添加
            val =
                val.substring(0, nLen - 1) + '-' + val.substring(nLen - 1, nLen)
            nLen++
        }
        if (nLen < 10) {
            return false
        }
        for (i; i < 8; i++) {
            nSum += sStr.indexOf(val.charAt(i)) * aWs[i]
        }
        nC9 = 11 - (nSum % 11)
        nC9 === 11 && (nC9 = 0)
        sC9Val = nC9 === 10 ? 'X' : nC9 + ''
        return rRex.test(val) && sC9Val == val.substring(9, 10)
    },
    //税务登记号
    swdj: (value: any) => {
        let nLen
        const val = typeof value === 'number' ? value.toString() : value || ''

        nLen = val.length
        return (
            !val ||
            nLen == 7 ||
            nLen == 9 ||
            nLen == 15 ||
            nLen == 16 ||
            nLen == 18 ||
            nLen == 20
        )
    }
}

//验证提示信息
const oMessage = {
    required: '必填',
    number: '必须为数字',
    numberRange: '必须为数字，范围：{0}~{1}',
    int: '必须为整数',
    length: '必须填{0}个字',
    lengthRange: '限制{0}-{1}个字',
    byteLength: '必须填{0}个字符（中文计为2个字符）',
    byteLengthRange: '限制{0}-{1}个字符（中文计为2个字符）',
    username: '必须由字母、数字、下划线组成',
    phone: '电话号码格式错误',
    email: '电子邮箱格式错误',
    postcode: '邮政编码格式错误',
    IDCard: '身份证号格式错误',
    tyshxy: '统一社会信用代码格式错误',
    gsdj: '工商登记码格式错误',
    zzjg: '组织机构代码格式错误',
    swdj: '税务登记号格式错误'
}

//验证方法工厂函数
const getValidateRule = (
    sRule: string,
    limit?: any,
    sCustomMessage?: string,
    sCustomTrigger: string = 'blur'
) => {
    const bValidate = sRule === 'required'

    const fValidate = (rule: any, value: any, callback: any) => {
        return validator[sRule](value, limit)
            ? callback()
            : callback(new Error())
    }

    const fMessage = (sMessage = '') => {
        let aArr = limit

        if (limit) {
            Array.isArray(limit) || (aArr = [limit])
            aArr.forEach((nNum: any, nIdx: number) => {
                if (typeof nNum === 'undefined') {
                    nNum = '∞'
                }
                sMessage = sMessage.replace(
                    new RegExp('\\{' + nIdx + '\\}', 'g'),
                    nNum
                )
            })
        }
        return sMessage
    }

    return {
        ...(bValidate ? { required: true } : {}),
        validator: fValidate,
        message: fMessage(sCustomMessage || oMessage[sRule]),
        trigger: sCustomTrigger
    }
}

export { validator, getValidateRule, date2Str, dateAdd, generateGuid }
