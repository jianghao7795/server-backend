<template>
  <div id="app">
    <!-- <router-view /> -->
    <el-config-provider :locale="locale">
      <router-view />
    </el-config-provider>
  </div>
</template>

<script setup name="App">
import { computed, ref, provide } from "vue";
import zhCn from "element-plus/dist/locale/zh-cn.mjs";
import en from "element-plus/dist/locale/en.mjs";
const language = ref("zh-cn");
const locale = computed(() => (language.value === "zh-cn" ? zhCn : en));
const toggle = () => {
  language.value = language.value === "zh-cn" ? "en" : "zh-cn";
};
provide("locale", locale);
provide("toggle", toggle);
</script>

<style lang="scss">
// 引入初始化样式
@import "@/style/main.scss";
@import "@/style/base.scss";
@import "@/style/mobile.scss";
@import "@/style/newLogin.scss";
@import "@/style/element_visiable.scss";

#app {
  background: #eee;
  height: 100vh;
  overflow: hidden;
  font-weight: 400 !important;
}

.el-button {
  font-weight: 400 !important;
}

a {
  color: #1890ff;
  text-decoration: none;
  background-color: #0000;
  outline: none;
  cursor: pointer;
  transition: color 0.3s;
}

// 加载条的 css
#nprogress .bar {
  background-color: #409eff;
  height: 4px;
}
</style>
