<template>
  <div>
    <div class="clirc-fire">
      <el-input v-model="filterText" class="fitler" placeholder="筛选" />
      <el-button size="small" type="primary" @click="authApiEnter">确 定</el-button>
    </div>
    <el-tree ref="apiTree" :data="apiTreeData" :default-checked-keys="apiTreeIds" :props="apiDefaultProps" highlight-current node-key="onlyId" show-checkbox :filter-node-method="filterNode" @check="nodeChange" />
  </div>
</template>
<script>
export default {
  name: "Apis",
};
</script>

<script setup>
import { getAllApis } from "@/api/api";
import { UpdateCasbin, getPolicyPathByAuthorityId } from "@/api/casbin";
import { ref, watch } from "vue";
import { ElMessage } from "element-plus";
const props = defineProps({
  row: {
    default: function () {
      return {};
    },
    type: Object,
  },
});

const apiDefaultProps = ref({
  children: "children",
  label: "description",
});

const filterText = ref("");

const apiTreeData = ref([]);
const apiTreeIds = ref([]);
const activeUserId = ref("");
const init = async () => {
  const res2 = await getAllApis();
  const apis = res2.data;

  apiTreeData.value = buildApiTree(apis);
  const res = await getPolicyPathByAuthorityId({
    id: props.row.authorityId,
  });
  activeUserId.value = props.row.authorityId;
  apiTreeIds.value = [];
  res.data &&
    res.data.forEach((item) => {
      apiTreeIds.value.push("p:" + item.path + "m:" + item.method);
    });
};

init();

const needConfirm = ref(false);
const nodeChange = () => {
  needConfirm.value = true;
};
// 暴露给外层使用的切换拦截统一方法
const enterAndNext = () => {
  authApiEnter();
};

// 创建api树方法
const buildApiTree = (apis) => {
  const apiObj = {};
  apis &&
    apis.forEach((item) => {
      item.onlyId = "p:" + item.path + "m:" + item.method;
      if (Object.prototype.hasOwnProperty.call(apiObj, item.api_group)) {
        apiObj[item.api_group].push(item);
      } else {
        Object.assign(apiObj, { [item.api_group]: [item] });
      }
    });
  const apiTree = [];
  for (const key in apiObj) {
    const treeNode = {
      ID: key,
      description: key + "组",
      children: apiObj[key],
    };
    apiTree.push(treeNode);
  }
  return apiTree;
};

// 关联关系确定
const apiTree = ref(null);
const authApiEnter = async () => {
  const checkArr = apiTree.value.getCheckedNodes(true);
  var casbinInfos = [];
  checkArr &&
    checkArr.forEach((item) => {
      var casbinInfo = {
        path: item.path,
        method: item.method,
      };
      casbinInfos.push(casbinInfo);
    });
  const res = await UpdateCasbin({
    authorityId: activeUserId.value,
    casbinInfos,
  });
  if (res.code === 200) {
    ElMessage({ type: "success", message: "api设置成功" });
  }
};

defineExpose({
  needConfirm,
  enterAndNext,
});

const filterNode = (value, data) => {
  if (!value) return true;
  return data.description.includes(value);
};

watch(filterText, (val) => {
  console.log(val);
  // apiTree.value.filter(val);
  console.log(apiTree.value.filter(val));
});
</script>

<style lang="scss">
.clirc-fire {
  display: flex;
  justify-content: flex-end;
}
</style>
