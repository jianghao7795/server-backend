import { ElMessage } from "element-plus";
import request from "@/utils/request";
export const downloadImage = (imgsrc = "", name = "") => {
  // 下载图片地址和图片名
  var image = new Image();
  image.setAttribute("crossOrigin", "anonymous");
  image.onload = function () {
    console.log(this);
    var canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    var context = canvas.getContext("2d");
    context.drawImage(image, 0, 0, image.width, image.height);
    var url = canvas.toDataURL("image/png"); // 得到图片的base64编码数据

    var a = document.createElement("a"); // 生成一个a元素
    var event = new MouseEvent("click"); // 创建一个单击事件
    a.download = name || "photo"; // 设置图片名称
    a.href = url; // 将生成的URL设置为a.href属性
    a.dispatchEvent(event); // 触发a的单击事件
  };
  image.src = imgsrc;
};

/**
 * 下载文件
 * @param {String} path - 下载地址/下载请求地址。
 * @param {String} name - 下载文件的名字/重命名（考虑到兼容性问题，最好加上后缀名）
 */
export async function downloadFile(path, name) {
  try {
    const resp = await request.get(path, { responseType: "blob" });
    const url = URL.createObjectURL(resp);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    // console.log(error);
    ElMessage({
      showClose: true,
      message: error.msg || "下载失败",
      type: "error",
    });
  }

  // const xhr = new XMLHttpRequest();
  // xhr.open("get", path);
  // xhr.responseType = "blob";
  // xhr.send();
  // xhr.onload = function () {
  //   if (this.status === 200 || this.status === 304) {
  //     // 如果是IE10及以上，不支持download属性，采用msSaveOrOpenBlob方法，但是IE10以下也不支持msSaveOrOpenBlob
  //     if ("msSaveOrOpenBlob" in navigator) {
  //       navigator.msSaveOrOpenBlob(this.response, name);
  //       return;
  //     }
  //     // const blob = new Blob([this.response], { type: xhr.getResponseHeader('Content-Type') });
  //     // const url = URL.createObjectURL(blob);
  //     const url = URL.createObjectURL(this.response);
  //     const a = document.createElement("a");
  //     a.style.display = "none";
  //     a.href = url;
  //     a.download = name;
  //     document.body.appendChild(a);
  //     a.click();
  //     document.body.removeChild(a);
  //     URL.revokeObjectURL(url);
  //   } else {
  //     console.log(this);
  //     ElMessage({
  //       showClose: true,
  //       message: this.statusText || "下载失败",
  //       type: "error",
  //     });
  //   }
  // };
}
