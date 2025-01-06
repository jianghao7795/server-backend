/*
 * @Author: jianghao
 * @Date: 2022-09-05 07:56:08
 * @LastEditors: jianghao
 * @LastEditTime: 2022-10-18 10:57:23
 */
import { createApp } from "vue";
import "@/style/element_visiable.scss";
import router from "@/router/index";
import "@/permission";
import run from "@/core/vue-admin"; // 图标加载
import auth from "@/directive/auth"; // 权限
import { store } from "@/pinia";
import App from "./App.vue";
import "vue-cropper/dist/index.css";
import i18n from "@/locals/index"; //语言翻译 i18b

const app = createApp(App);
// app.config.productionTip = false;

app.use(run).use(store).use(auth).use(router).use(i18n).mount("#app");

export default app;
