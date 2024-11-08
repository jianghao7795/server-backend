import axios from "axios"; // 引入axios
import { ElMessage, ElMessageBox, ElNotification } from "element-plus";
import { useUserStore } from "@/pinia/modules/user";
import { emitter } from "@/utils/bus.js";
import router from "@/router/index";
// import { de } from "element-plus/es/locale";
// import { useAuthorityStore } from "@/pinia/modules/authority";

// const authorityStore =

const service = axios.create({
  baseURL: import.meta.env.VITE_BASE_API,
  timeout: 9999,
  timeoutErrorMessage: "",
});
let dataStatus = true;
const showLoading = () => {
  emitter.emit("showLoading");
};

const closeLoading = () => {
  emitter.emit("closeLoading");
};
// http request 拦截器
service.interceptors.request.use(
  (config) => {
    if (!config.donNotShowLoading) {
      showLoading();
    }
    const userStore = useUserStore();
    if (config.headers["Content-Type"]) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${userStore.token}`,
        Accept: "application/json",
        // "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,GET,DELETE,PATCH,POST,PUT",
        "Access-Control-Allow-Credentials": "true",
        "x-user-id": userStore.userInfo.ID,
      };
    } else {
      if (config.data instanceof FormData) {
        config.headers = {
          Authorization: `Bearer ${userStore.token}`,
          ...config.headers,
        };
      } else {
        config.headers = {
          Accept: "application/json",
          Authorization: `Bearer ${userStore.token}`,
          "Content-Type": "application/json; charset=utf-8",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,GET,DELETE,PATCH,POST,PUT",
          "Access-Control-Allow-Credentials": "true",
          "x-user-id": userStore.userInfo.ID,
          ...config.headers,
        };
      }
    }
    return config;
  },
  (error) => {
    closeLoading();
    ElMessage({
      showClose: true,
      message: error,
      type: "error",
    });
    return Promise.reject(error);
  },
);

// http response 拦截器
service.interceptors.response.use(
  (response) => {
    closeLoading();
    if (response.data.code === 200 || response.headers.success === "true") {
      if (response.headers.msg) {
        response.data.msg = decodeURI(response.headers.msg);
      }
      return response.data;
    }
    return response.data;
  },
  (error) => {
    closeLoading();
    if (error.response && error.response.status >= 400 && error.response.status < 500) {
      const response = error.response;
      // ElMessage({
      //   showClose: true,
      //   message: response?.data?.data?.msg || response?.data?.msg || decodeURI(response?.headers?.msg),
      //   type: "error",
      // });
      ElNotification({
        title: `请求错误：${error.response.status}`,
        type: "error",
        message: response?.data?.msg || response.data.msg || decodeURI(response?.headers?.msg),
        duration: 10000,
      });
      if ((response.data && response.data.reload) || response.status === 401) {
        const userStore = useUserStore();
        userStore.token = "";
        localStorage.clear();
        if (router.currentRoute?.value?.path !== "/login") {
          router.push({ name: "Login", replace: true });
        }
      }
      return response.data.msg ? response.data : response;
    }
    if (!error.response && dataStatus) {
      ElMessageBox.confirm(
        `
        <p>检测到请求错误</p>
        <p>${error}</p>
        `,
        "请求报错",
        {
          dangerouslyUseHTMLString: true,
          distinguishCancelAndClose: true,
          confirmButtonText: "稍后重试",
          cancelButtonText: "取消",
        },
      );
      dataStatus = false;
      return;
    }

    switch (error.response.status) {
      case 502:
        ElMessageBox.confirm(
          `
        <p>检测到接口错误${error}</p>
        <p>错误码<span style="color:red"> 500 </span>：此类错误内容常见于后台panic，请先查看后台日志，如果影响您正常使用可强制登出清理缓存</p>
        `,
          "接口报错",
          {
            dangerouslyUseHTMLString: true,
            distinguishCancelAndClose: true,
            confirmButtonText: "清理缓存",
            cancelButtonText: "取消",
          },
        ).then(() => {
          const userStore = useUserStore();
          userStore.token = "";
          localStorage.clear();
          router.push({ name: "Login", replace: true });
        });
        break;
      case 500:
        ElMessageBox.confirm(
          `
        <p>检测到接口错误${error}</p>
        <p>错误码<span style="color:red"> 500 </span>：此类错误内容常见于后台panic，请先查看后台日志，如果影响您正常使用可强制登出清理缓存</p>
        `,
          "接口报错",
          {
            dangerouslyUseHTMLString: true,
            distinguishCancelAndClose: true,
            confirmButtonText: "清理缓存",
            cancelButtonText: "取消",
          },
        ).then(() => {
          const userStore = useUserStore();
          userStore.token = "";
          localStorage.clear();
          router.push({ name: "Login", replace: true });
        });
        break;
      case 404:
        ElMessageBox.confirm(
          `
          <p>检测到接口错误${error}</p>
          <p>错误码<span style="color:red"> 404 </span>：此类错误多为接口未注册（或未重启）或者请求路径（方法）与api路径（方法）不符--如果为自动化代码请检查是否存在空格</p>
          `,
          "接口报错",
          {
            dangerouslyUseHTMLString: true,
            distinguishCancelAndClose: true,
            confirmButtonText: "我知道了",
            cancelButtonText: "取消",
          },
        );
        break;
      default:
        ElMessageBox.confirm(
          `
          <p>检测到接口错误${error}</p>
          <p>错误码<span style="color:red"> 5xx </span>：服务器错误， 请检查服务器</p>
          `,
          "接口报错",
          {
            dangerouslyUseHTMLString: true,
            distinguishCancelAndClose: true,
            confirmButtonText: "我知道了",
            cancelButtonText: "取消",
          },
        );
    }

    return error;
  },
);
export default service;
