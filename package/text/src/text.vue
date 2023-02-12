<script setup lang="ts">
const props = defineProps(['opt', 'mode'])

defineOptions({
    name: 'DyText'
})
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

