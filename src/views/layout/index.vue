<template>
  <el-container class="layout-cont">
    <el-container :class="[isSider ? 'openside' : 'hideside', isMobile ? 'mobile' : '']">
      <el-row :class="[isShadowBg ? 'shadowBg' : '']" @click="changeShadow()" />
      <el-aside class="main-cont main-left">
        <div class="tilte" :style="{ background: backgroundColor }" @click="returnHome">
          <img alt class="logoimg" :src="$ADMIN.appLogo" />
          <h2 v-if="isSider" class="tit-text" :style="{ color: textColor }">{{ $ADMIN.appName }}</h2>
        </div>
        <Aside class="aside" />
        <el-backtop :right="100" :bottom="100"></el-backtop>
      </el-aside>
      <!-- 分块滑动功能 -->
      <el-main class="main-cont main-right"
        :style="{ width: `calc(100% - ${isMobile ? '0px' : isCollapse ? '50px' : '220px'})` }">
        <transition :duration="{ enter: 800, leave: 100 }" mode="out-in" name="el-fade-in-linear">
          <div class="topfix">
            <el-row>
              <el-col>
                <el-header class="header-cont">
                  <el-row class="pd-0">
                    <el-col :xs="2" :lg="1" :md="1" :sm="1" :xl="1" style="z-index: 100">
                      <div class="menu-total" @click="totalCollapse">
                        <!-- <div
                          v-if="isCollapse"
                          class="Icon Icon-arrow-double-right"
                        />
                        <div v-else class="Icon Icon-arrow-double-left" /> -->
                        <el-icon v-if="isCollapse">
                          <Expand />
                        </el-icon>
                        <el-icon v-else>
                          <Fold />
                        </el-icon>
                      </div>
                    </el-col>
                    <el-col :xs="10" :lg="14" :md="14" :sm="9" :xl="14" :pull="1">
                      <el-breadcrumb class="breadcrumb">
                        <el-breadcrumb-item v-for="item in matched.slice(1, matched.length)" :key="item.path">
                          {{ fmtTitle(item.meta.title, route) }}
                        </el-breadcrumb-item>
                      </el-breadcrumb>
                    </el-col>
                    <el-col :xs="12" :lg="9" :md="9" :sm="14" :xl="9">
                      <div class="right-box">
                        <el-dropdown trigger="click">
                          <span class="el-dropdown-link">
                            <translate theme="filled" size="20" fill="#333" strokeLinejoin="miter"
                              strokeLinecap="square" />
                            {{ languageSelect[language] }}
                            <el-icon>
                              <CaretBottom />
                            </el-icon>
                          </span>
                          <template #dropdown>
                            <el-dropdown-menu @click="toggle">
                              <el-dropdown-item :disabled="language === 'en'">English</el-dropdown-item>
                              <el-dropdown-item :disabled="language === 'zh-CN'">中文</el-dropdown-item>
                            </el-dropdown-menu>
                          </template>
                        </el-dropdown>
                        <Search />
                        <el-dropdown @visible-change="changeMouse" trigger="click">
                          <div>
                            <span class="header-avatar" style="cursor: pointer">
                              <CustomPic />
                              <span style="margin-left: 5px">
                                {{ userStore.userInfo.nickName }}
                              </span>
                              <el-icon :class="mouseLeaveOrEnter ? 'switch-mouse mouse-enter-leave' : 'switch-mouse'">
                                <arrow-down />
                              </el-icon>
                            </span>
                          </div>
                          <template #dropdown>
                            <el-dropdown-menu class="dropdown-group">
                              <el-dropdown-item>
                                <span style="font-weight: 600">当前角色：
                                  {{
                                    userStore.userInfo.authority?.authorityName
                                  }}
                                </span>
                              </el-dropdown-item>
                              <template v-if="userStore.userInfo.authorities">
                                <el-dropdown-item
                                  v-for="item in userStore.userInfo.authorities.filter((i) => i.authorityId !== userStore.userInfo.authorityId)"
                                  :key="item.authorityId" @click="changeUserAuth(item.authorityId)">
                                  <span>切换为：{{ item.authorityName }}</span>
                                </el-dropdown-item>
                              </template>
                              <el-dropdown-item icon="avatar" @click="toPerson">个人信息</el-dropdown-item>
                              <el-dropdown-item icon="right" @click="userStore.LoginOut">登 出</el-dropdown-item>
                            </el-dropdown-menu>
                          </template>
                        </el-dropdown>
                      </div>
                    </el-col>
                  </el-row>
                </el-header>
              </el-col>
            </el-row>
            <!-- 当前面包屑用路由自动生成可根据需求修改 -->
            <!--
            :to="{ path: item.path }" 暂时注释不用-->
            <HistoryComponent ref="layoutHistoryComponent" />
          </div>
        </transition>
        <router-view v-if="reloadFlag" v-slot="{ Component, route }" v-loading="loadingFlag"
          element-loading-text="正在加载中" class="admin-box">
          <div v-bind:id="'refreshView'">
            <!-- el-fade-in-linear -->
            <transition mode="out-in" name="el-fade-in-linear" type="transition" :appear="true">
              <keep-alive :include="routerStore.keepAliveRouters">
                <component :is="Component" :key="route.name" />
              </keep-alive>
            </transition>
          </div>
        </router-view>
        <BottomInfo />
        <setting />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
  export default {
    name: "Layout",
  };
</script>

<script setup>
  import Aside from "@/views/layout/aside/index.vue";
  import HistoryComponent from "@/views/layout/aside/historyComponent/history.vue";
  import Search from "@/views/layout/search/search.vue";
  import BottomInfo from "@/views/layout/bottomInfo/bottomInfo.vue";
  import CustomPic from "@/components/customPic/index.vue";
  import Setting from "./setting/index.vue";
  import { setUserAuthority } from "@/api/user";
  import { emitter } from "@/utils/bus.js";
  import { computed, ref, onMounted, nextTick, inject } from "vue";
  import { useRouter, useRoute } from "vue-router";
  import { useUserStore } from "@/pinia/modules/user";
  import { useAuthorityStore } from "@/pinia/modules/authority";
  import { useRouterStore } from "@/pinia/modules/router";
  import { fmtTitle } from "@/utils/fmtRouterTitle";
  import { Translate } from "@icon-park/vue-next";
  // import { useRefreshStore } from "@/pinia/modules/refresh";

  // const refreshStore = useRefreshStore();

  // watchEffect(() => {
  //   console.log(refreshStore.isRefresh);
  // });

  // const locale = inject("locale");
  const toggle = inject("toggle");
  const language = inject("language");
  // console.log(locale, language);
  const languageSelect = {
    en: "English",
    "zh-CN": "简体中文",
  };

  const router = useRouter();
  const route = useRoute();
  const routerStore = useRouterStore();
  const authorityStore = useAuthorityStore();
  // 三种窗口适配
  const isCollapse = ref(false);
  const isSider = ref(true);
  const isMobile = ref(false);
  const initPage = () => {
    const screenWidth = document.body.clientWidth;
    if (screenWidth < 1000) {
      isMobile.value = true;
      isSider.value = false;
      isCollapse.value = true;
    } else if (screenWidth >= 1000 && screenWidth < 1200) {
      isMobile.value = false;
      isSider.value = false;
      isCollapse.value = true;
    } else {
      isMobile.value = false;
      isSider.value = true;
      isCollapse.value = false;
    }
  };

  initPage();

  const loadingFlag = ref(false);
  onMounted(() => {
    // 挂载一些通用的事件
    emitter.emit("collapse", isCollapse.value); // emit 是值 fire an event
    emitter.emit("mobile", isMobile.value);
    emitter.on("reload", reload); // on 倾听所有事件 // emitter.all.clear() clearing all events
    emitter.on("showLoading", () => {
      loadingFlag.value = true;
    });
    emitter.on("closeLoading", () => {
      loadingFlag.value = false;
    });
    window.onresize = () => {
      // onresize 是调整浏览器尺寸时触发
      return (() => {
        initPage();
        emitter.emit("collapse", isCollapse.value);
        emitter.emit("mobile", isMobile.value);
      })();
    };
    if (userStore.loadingInstance) {
      userStore.loadingInstance.close();
    }

    authorityStore.getAuthority();
  });
  const userStore = useUserStore();
  const textColor = computed(() => {
    if (userStore.sideMode === "dark") {
      return "#fff";
    } else if (userStore.sideMode === "light") {
      return "#191a23";
    } else {
      return userStore.baseColor;
    }
  });

  const backgroundColor = computed(() => {
    if (userStore.sideMode === "dark") {
      return "#191a23";
    } else if (userStore.sideMode === "light") {
      return "#fff";
    } else {
      return userStore.sideMode;
    }
  });

  const matched = computed(() => route.meta.matched);

  const changeUserAuth = async (id) => {
    const res = await setUserAuthority({
      authorityId: id,
    });
    if (res.code === 200) {
      emitter.emit("closeAllPage");
      setTimeout(() => {
        window.location.reload();
      }, 1);
    }
  };

  const reloadFlag = ref(true);

  // watchEffect((newValue, oldValue) => {
  //   console.log(reloadFlag.value);
  // });
  let reloadTimer = null;
  const reload = async () => {
    if (reloadTimer) {
      window.clearTimeout(reloadTimer);
    }
    // reloadTimer = window.setTimeout(async () => {
    //   if (route.meta.keepAlive) {
    //     reloadFlag.value = false;
    //     await nextTick();
    //     reloadFlag.value = true;
    //   } else {
    //     const title = route.meta.title;
    //     router.push({ name: "Reload", params: { title } });
    //   }
    // }, 400);
    if (route.meta.keepAlive) {
      reloadFlag.value = false;
      await nextTick();
      reloadFlag.value = true;
    } else {
      const title = route.meta.title;
      router.push({ name: "Reload", params: { title } });
    }
  };

  const isShadowBg = ref(false);
  const totalCollapse = () => {
    isCollapse.value = !isCollapse.value;
    isSider.value = !isCollapse.value;
    isShadowBg.value = !isCollapse.value;
    emitter.emit("collapse", isCollapse.value);
  };

  const toPerson = () => {
    router.push({ name: "person" });
  };
  const changeShadow = () => {
    isShadowBg.value = !isShadowBg.value;
    isSider.value = !!isCollapse.value;
    totalCollapse();
  };

  const returnHome = () => {
    router.push({ name: "dashboard" });
  };

  const mouseLeaveOrEnter = ref(false);

  const changeMouse = (e) => {
    mouseLeaveOrEnter.value = e;
  };
</script>

<style lang="scss">
  @import "@/style/mobile.scss";

  .dark {
    background-color: #191a23 !important;
    color: #fff !important;
  }

  .light {
    background-color: #fff !important;
    color: #000 !important;
  }

  .mouse-enter-leave {
    transform: rotate(180deg);
  }

  .switch-mouse {
    transition: transform 0.5s;
  }

  .el-dropdown-link {
    margin-right: 15px;
    display: flex;
    align-items: center;
  }
</style>
