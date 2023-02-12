import { defineComponent as d, resolveComponent as c, openBlock as r, createElementBlock as u, createVNode as a, withCtx as p, createTextVNode as m } from "vue";
const v = "dynamicformplus", f = "0.0.1", _ = "module", b = {
  add: "ts-node-esm build/bin/add.ts",
  del: "ts-node-esm build/bin/del.ts",
  entry: "ts-node-esm build/bin/build-entry.ts",
  serve: "vite --host --open",
  "build:lib": "vue-tsc --noEmit && vite build --config ./build/lib.config.ts"
}, y = {
  "@types/fs-extra": "^11.0.1",
  "@types/node": "^18.11.18",
  "@types/uppercamelcase": "^3.0.0",
  "@vitejs/plugin-vue": "^4.0.0",
  "core-js": "^3.27.2",
  "element-plus": "^2.2.28",
  "fs-extra": "^11.1.0",
  "ts-node": "^10.9.1",
  typescript: "^4.9.3",
  "unplugin-vue-define-options": "^1.2.0",
  uppercamelcase: "^3.0.0",
  vite: "^4.0.0",
  "vite-plugin-dts": "^1.7.2",
  vue: "^3.2.45",
  "vue-tsc": "^1.0.11"
}, U = {
  name: v,
  private: !0,
  version: f,
  type: _,
  scripts: b,
  devDependencies: y
}, g = {}, h = { class: "dynamicFormPlus-button" }, x = {
  name: "DynamicButton"
}, n = /* @__PURE__ */ d({
  ...x,
  setup(t) {
    return (e, o) => {
      const l = c("el-button");
      return r(), u("div", h, [
        a(l, null, {
          default: p(() => [
            m("测试")
          ]),
          _: 1
        })
      ]);
    };
  }
});
n.install = (t) => {
  t.component(n.name, n);
};
const w = [
  n
], i = (t, e = {}) => {
  w.forEach((o) => {
    t.component(o.name, o);
  }), t.provide("$DynamicFormPlus", {
    formOptsUrl: e.formOptsUrl || "",
    // 表单配置请求地址
    uploadUrl: e.uploadUrl || "",
    // 文件上传地址
    previewUrl: e.previewUrl || "",
    // 文件预览地址
    dictUrl: e.dictUrl || "",
    //字典list地址
    getUploadHeaders: e.getUploadHeaders,
    //获取项目中的自定义 headers
    handleUploadResult: e.handleUploadResult,
    //上传接口返回数据的处理方法
    ...g
    // 动态表单提供的方法
  });
}, s = window;
typeof s < "u" && s.Vue && i(s.Vue);
const V = {
  version: U.version,
  install: i
};
export {
  V as default
};
