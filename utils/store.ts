import axios from 'axios'
const store = {
    state: {
        dictCode: [], //已经发起请求的字典code
        dictList: {} //存储的字典数据
    },
    has(key: string) {
        return this.state.dictCode.indexOf(key as never) > -1
    },
    get(key: string) {
        return this.state.dictList[key]
    },
    set(key: string, dictUrl: string) {
        const getDictList = () => {
            axios({
                method: 'post',
                url: dictUrl,
                data: {
                    dictCode: key
                },
                responseType: 'json'
            })
                .then(({ data: res }) => {
                    this.state.dictList = Object.assign({}, this.state.dictList, {
                        [key]: res.data || []
                    })
                })
                .catch(error => {
                    this.state.dictList = Object.assign({}, this.state.dictList, {
                        [key]: []
                    })
                })
        }
        if (!this.has(key)) {
            getDictList()
        }
        this.state.dictCode.push(key as never)
    }
}

export default store
