<template>
  <div>
    <div class="search-box">
      <el-form ref="searchForm" :inline="true" :model="searchInfo" @keyup.enter.native="onSubmit">
        <el-form-item label="路径">
          <el-input v-model="searchInfo.path" ref="pathRef" placeholder="路径" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="searchInfo.description" placeholder="描述" />
        </el-form-item>
        <el-form-item label="API组">
          <el-input v-model="searchInfo.api_group" placeholder="api组" />
        </el-form-item>
        <el-form-item label="请求">
          <el-select v-model="searchInfo.method" clearable placeholder="请选择" style="width: 120px">
            <el-option v-for="item in methodOptions" :key="item.value" :label="`${item.label}(${item.value})`" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button size="small" type="primary" icon="search" @click="onSubmit">查询</el-button>
          <el-button size="small" icon="refresh" @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table-box">
      <div class="btn-list">
        <el-button size="small" type="primary" icon="plus" @click="openDialog('addApi')">新增</el-button>
        <el-popover v-model:visible="deleteVisible" placement="top" width="160">
          <p>确定要删除吗？</p>
          <div style="text-align: right; margin-top: 8px">
            <el-button size="small" link type="primary" @click="deleteVisible = false">取消</el-button>
            <el-button size="small" type="primary" @click="onDelete">确定</el-button>
          </div>
          <template #reference>
            <el-button icon="delete" size="small" :disabled="!apis.length" style="margin-left: 10px" @click="deleteVisible = true">删除</el-button>
          </template>
        </el-popover>
      </div>
      <el-table :data="tableData" @sort-change="sortChange" @selection-change="handleSelectionChange" stripe v-loading="loading">
        <el-table-column type="selection" width="55" />
        <el-table-column align="left" label="id" min-width="60" prop="ID" sortable="custom" />
        <el-table-column align="left" label="API路径" min-width="150" prop="path" sortable="custom" />
        <el-table-column align="left" label="API分组" min-width="150" prop="api_group" sortable="custom" />
        <el-table-column align="left" label="API简介" min-width="150" prop="description" sortable="custom" />
        <el-table-column align="left" label="请求" min-width="150" prop="method" sortable="custom">
          <template #default="scope">
            <div>{{ scope.row.method }} / {{ methodFiletr(scope.row.method) }}</div>
          </template>
        </el-table-column>

        <el-table-column align="left" fixed="right" label="操作" width="200">
          <template #default="scope">
            <el-button icon="edit" size="small" link type="primary" @click="editApiFunc(scope.row)">编辑</el-button>
            <el-button icon="delete" size="small" link type="primary" @click="deleteApiFunc(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination background :current-page="page" :page-size="pageSize" :page-sizes="[10, 30, 50, 100]" :total="total" layout="total, sizes, prev, pager, next, jumper" @current-change="handleCurrentChange" @size-change="handleSizeChange" />
      </div>
    </div>

    <el-dialog v-model="dialogFormVisible" :before-close="closeDialog" :title="dialogTitle">
      <el-form ref="apiForm" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="路径" prop="path">
          <el-input v-model="form.path" autocomplete="off" />
        </el-form-item>
        <el-form-item label="请求" prop="method">
          <el-select v-model="form.method" placeholder="请选择" style="width: 100%">
            <el-option v-for="item in methodOptions" :key="item.value" :label="`${item.label}(${item.value})`" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="api分组" prop="api_group">
          <el-input v-model="form.api_group" autocomplete="off" />
        </el-form-item>
        <el-form-item label="api简介" prop="description">
          <el-input v-model="form.description" autocomplete="off" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button size="small" @click="closeDialog">取 消</el-button>
          <el-button size="small" type="primary" @click="enterDialog">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Api",
};
</script>

<script setup>
import { getApiById, getApiList, createApi, updateApi, deleteApi, deleteApisByIds } from "@/api/api";
import { toSQLLine } from "@/utils/stringFun";
// import warningBar from "@/components/warningBar/warningBar.vue";
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

const methodFiletr = (value) => {
  const target = methodOptions.value.filter((item) => item.value === value)[0];
  return target && `${target.label}`;
};

const apis = ref([]);
const loading = ref(false);
const pathRef = ref();
const form = ref({
  path: "",
  api_group: "",
  method: "",
  description: "",
});
const methodOptions = ref([
  {
    value: "POST",
    label: "创建",
    type: "success",
  },
  {
    value: "GET",
    label: "查看",
    type: "",
  },
  {
    value: "PUT",
    label: "更新",
    type: "warning",
  },
  {
    value: "DELETE",
    label: "删除",
    type: "danger",
  },
]);

const type = ref("");
const rules = ref({
  path: [{ required: true, message: "请输入api路径", trigger: "blur" }],
  api_group: [{ required: true, message: "请输入组名称", trigger: "blur" }],
  method: [{ required: true, message: "请选择请求方式", trigger: "blur" }],
  description: [{ required: true, message: "请输入api介绍", trigger: "blur" }],
});

const page = ref(1);
const total = ref(0);
const pageSize = ref(10);
const tableData = ref([]);
const searchInfo = ref({});

const onReset = () => {
  searchInfo.value = {};
};
// 搜索

const onSubmit = () => {
  page.value = 1;
  pageSize.value = 10;
  getTableData();
};

// 分页
const handleSizeChange = (val) => {
  pageSize.value = val;
  getTableData();
};

const handleCurrentChange = (val) => {
  page.value = val;
  getTableData();
};

// 排序
const sortChange = ({ prop, order }) => {
  if (prop) {
    if (prop === "ID") {
      prop = "id";
    }
    searchInfo.value.orderKey = toSQLLine(prop);
    searchInfo.value.desc = order === "descending";
  }
  getTableData();
};

// 查询
const getTableData = async () => {
  loading.value = true;
  const table = await getApiList({
    page: page.value,
    pageSize: pageSize.value,
    ...searchInfo.value,
  });
  loading.value = false;
  if (table.code === 200) {
    tableData.value = table.data.list;
    total.value = table.data.total;
    page.value = table.data.page;
    pageSize.value = table.data.pageSize;
  }
};

onMounted(() => {
  getTableData();
  pathRef.value.focus();
});

// 批量操作
const handleSelectionChange = (val) => {
  apis.value = val;
};

const deleteVisible = ref(false);
const onDelete = async () => {
  const ids = apis.value.map((item) => item.ID);
  const res = await deleteApisByIds({ ids });
  if (res.code === 200) {
    ElMessage({
      type: "success",
      message: res.msg,
    });
    if (tableData.value.length === ids.length && page.value > 1) {
      page.value--;
    }
    deleteVisible.value = false;
    getTableData();
  }
};

// 弹窗相关
const apiForm = ref(null);
const initForm = () => {
  apiForm.value.resetFields();
  form.value = {
    path: "",
    api_group: "",
    method: "",
    description: "",
  };
};

const dialogTitle = ref("新增Api");
const dialogFormVisible = ref(false);
const openDialog = (key) => {
  switch (key) {
    case "addApi":
      dialogTitle.value = "新增Api";
      break;
    case "edit":
      dialogTitle.value = "编辑Api";
      break;
    default:
      break;
  }
  type.value = key;
  dialogFormVisible.value = true;
};
const closeDialog = () => {
  initForm();
  dialogFormVisible.value = false;
};

const editApiFunc = async (row) => {
  const res = await getApiById({ id: row.ID });
  // console.log(res);
  if (res.code === 200) {
    form.value = res.data;
    openDialog("edit");
  }
};

const enterDialog = async () => {
  apiForm.value.validate(async (valid) => {
    if (valid) {
      switch (type.value) {
        case "addApi":
          {
            const res = await createApi(form.value);
            if (res.code === 200) {
              ElMessage({
                type: "success",
                message: "添加成功",
                showClose: true,
              });
            }
            getTableData();
            closeDialog();
          }

          break;
        case "edit":
          {
            const res = await updateApi(form.value);
            if (res.code === 200) {
              ElMessage({
                type: "success",
                message: "编辑成功",
                showClose: true,
              });
            }
            getTableData();
            closeDialog();
          }
          break;
        default:
          // eslint-disable-next-line no-lone-blocks
          {
            ElMessage({
              type: "error",
              message: "未知操作",
              showClose: true,
            });
          }
          break;
      }
    }
  });
};

const deleteApiFunc = async (row) => {
  ElMessageBox.confirm("此操作将永久删除所有角色下该api, 是否继续?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    console.log(row);
    const res = await deleteApi(row);
    if (res.code === 200) {
      ElMessage({
        type: "success",
        message: "删除成功!",
      });
      if (tableData.value.length === 1 && page.value > 1) {
        page.value--;
      }
      getTableData();
    }
  });
};
</script>

<style scoped>
.button-box {
  padding: 10px 20px;

  .el-button {
    float: right;
  }
}

.warning {
  color: #dc143c;
}
</style>
