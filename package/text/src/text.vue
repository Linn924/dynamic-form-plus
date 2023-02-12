<script lang="ts">
export default {
    name: 'DyText'
}
</script>
<script setup lang="ts">
const props = defineProps(['opt', 'mode'])

//定义组件名称
//defineOptions({
//    name: 'DyText'
//})
</script>

<template>
    <el-alert
        class="dyform-text"
        v-if="props.opt.wzms"
        :title="props.opt.wzms"
        :type="props.opt.ysj_gs || 'info'"
        :closable="false"
    />
</template>

