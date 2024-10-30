<template>
  <div>
    <el-upload :accept="accept" :multiple="multiple" :action="`${path}/fileUploadAndDownload/upload`" :before-upload="checkFile" :headers="{ Authorization: `Bearer ${userStore.token}` }" :on-error="uploadError" :on-success="uploadSuccess" :show-file-list="false" class="upload-btn">
      <el-button size="small" type="primary">普通上传</el-button>
    </el-upload>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import { useUserStore } from "@/pinia/modules/user";
import { fileSize } from "@/core/config";

const props = defineProps({
  accept: {
    type: String,
    required: false,
    default: "",
  },
  multiple: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const emit = defineEmits(["on-success"]);
const path = ref(import.meta.env.VITE_BASE_API);

const userStore = useUserStore();
const fullscreenLoading = ref(false);
const accept = computed(() => (props.accept === "" ? ".png,.jpg,.jpeg,.svg" : props.accept));
const checkFile = (file) => {
  fullscreenLoading.value = true;
  const isJPG = file.type === "image/jpeg";
  const isPng = file.type === "image/png";
  const isSvg = file.type === "image/svg+xml";
  const isGif = file.type === "image/gif";
  const isLt2M = file.size / 1024 / 1024 < fileSize;
  if (!(isJPG || isPng || isSvg || isGif)) {
    ElMessage.error("上传图片只能是 jpg、png、gif或svg格式!");
    fullscreenLoading.value = false;
  }
  if (!isLt2M) {
    ElMessage.error(`未压缩未见上传图片大小不能超过 ${fileSize}MB，请使用压缩上传`);
    fullscreenLoading.value = false;
  }
  return (isPng || isJPG || isSvg || isGif) && isLt2M;
};

const uploadSuccess = (res) => {
  const { code, data, msg } = res;
  if (code === 200) {
    emit("on-success", data.file.url);
  } else {
    ElMessage({
      showClose: true,
      message: msg,
      type: "error",
    });
  }
};

const uploadError = () => {
  ElMessage({
    type: "error",
    message: "上传失败",
  });
  fullscreenLoading.value = false;
};
</script>

<script>
export default {
  name: "UploadCommon",
};
</script>
