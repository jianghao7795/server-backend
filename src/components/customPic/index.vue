<template>
  <span class="headerAvatar">
    <template v-if="picType === 'avatar'">
      <el-avatar v-if="userStore.userInfo.headerImg" :size="30" :src="avatar" />
      <el-avatar v-else :size="30" :src="noAvatar" />
    </template>
    <template v-if="picType === 'img'">
      <img v-if="userStore.userInfo.headerImg" :src="avatar" class="avatar" />
      <img v-else :src="noAvatar" class="avatar" />
    </template>
    <template v-if="picType === 'file'">
      <el-icon v-if="file === '/'"><icon-picture /></el-icon>
      <img :src="file" class="file" :onerror="defaultImage">
      </img>
    </template>
  </span>
</template>

<script setup name="CustomPic">
import noAvatarPng from "@/assets/noBody.png";
import { useUserStore } from "@/pinia/modules/user";
import { computed, ref } from "vue";
import { Picture as IconPicture } from "@element-plus/icons-vue";
const props = defineProps({
  picType: {
    type: String,
    required: false,
    default: "avatar",
  },
  picSrc: {
    type: String,
    required: false,
    default: "",
  },
});

const path = ref(import.meta.env.VITE_BASE_API + "/");
const count = ref(0);
count.value++;
const noAvatar = ref(noAvatarPng);

const userStore = useUserStore();

const defaultImage = img => {
  console.log(img)
  img.srcElement.style.display = "none";
}

const avatar = computed(() => {
  if (props.picSrc === "") {
    if (userStore.userInfo.headerImg !== "" && userStore.userInfo.headerImg.slice(0, 4) === "http") {
      return userStore.userInfo.headerImg;
    }
    return path.value + userStore.userInfo.headerImg;
  } else {
    if (props.picSrc !== "" && props.picSrc.slice(0, 4) === "http") {
      return props.picSrc;
    }
    return path.value + props.picSrc;
  }
});
const file = computed(() => {
  if (props.picSrc && props.picSrc.slice(0, 4) === "http") {
    return props.picSrc;
  } else {
    return path.value + props.picSrc;
  }
  // return `/${props.picSrc}`;
});
console.log(file)
</script>

<style scoped>
.headerAvatar {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 8px;
}

.file {
  height: 80px;
  position: relative;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-size: 30px;
}
</style>
