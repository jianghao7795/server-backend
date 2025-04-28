/*
 * @Author: jianghao
 * @Date: 2022-07-29 09:48:24
 * @LastEditors: jianghao
 * @LastEditTime: 2022-10-27 10:28:44
 */
// 权限按钮展示指令 权限
import { useUserStore } from "@/pinia/modules/user";
export default {
  install: (app, options) => {
    console.log(options); /// options 是 use(auth, {changeAuth: true})
    const userStore = useUserStore();
    app.directive("auth", {
      // 当被绑定的元素插入到 DOM 中时……
      mounted: function (el, binding) {
        const userInfo = userStore.userInfo;
        let type = "";
        switch (Object.prototype.toString.call(binding.value)) {
          case "[object Array]":
            type = "Array";
            break;
          case "[object String]":
            type = "String";
            break;
          case "[object Number]":
            type = "Number";
            break;
          default:
            type = "";
            break;
        }
        if (type === "") {
          el.parentNode.removeChild(el);
          return;
        }
        const waitUse = binding.value.toString().split(",");
        let flag = waitUse.some((item) => item === userInfo.authorityId);
        if (binding.modifiers.not) {
          flag = !flag;
        }
        if (!flag) {
          el.parentNode.removeChild(el);
        }
      },
    });
  },
};
