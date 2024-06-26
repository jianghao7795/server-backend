<template>
  <div>
    <div class="search-box">
      <el-form :inline="true" :model="searchInfo">
        <el-form-item label="展示值">
          <el-input v-model="searchInfo.label" placeholder="搜索条件" />
        </el-form-item>
        <el-form-item label="字典值">
          <el-input v-model="searchInfo.value" placeholder="搜索条件" />
        </el-form-item>
        <el-form-item label="启用状态" prop="status">
          <el-select v-model="searchInfo.status" placeholder="请选择">
            <el-option key="true" label="是" value="true" />
            <el-option key="false" label="否" value="false" />
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
        <el-button size="small" type="primary" icon="plus" @click="openDialog">新增字典项</el-button>
      </div>
      <el-table ref="multipleTable" :data="tableData" style="width: 100%" tooltip-effect="dark" row-key="ID">
        <el-table-column type="selection" width="55" />
        <el-table-column align="left" label="日期" width="180">
          <template #default="scope">{{ formatDate(scope.row.CreatedAt) }}</template>
        </el-table-column>

        <el-table-column align="left" label="展示值" prop="label" width="120" />

        <el-table-column align="left" label="字典值" prop="value" width="120" />

        <el-table-column align="left" label="启用状态" prop="status" width="120">
          <template #default="scope">{{ formatBoolean(scope.row.status) }}</template>
        </el-table-column>

        <el-table-column align="left" label="排序标记" prop="sort" width="120" />

        <el-table-column align="left" label="操作">
          <template #default="scope">
            <el-button size="small" link type="primary" icon="edit"
              @click="updateSysDictionaryDetailFunc(scope.row)">编辑</el-button>
            <el-popconfirm placement="top" width="160" title="确定要删除吗?" confirm-button-text="确定" cancel-button-text="取消"
              @confirm="deleteSysDictionaryDetailFunc(scope.row)">
              <!-- <p>确定要删除吗？</p>
              <div style="text-align: right; margin-top: 8px">
                <el-button size="small" link type="primary" @click="scope.row.visible = false">
                  取消
                </el-button>
                <el-button
                  type="primary"
                  size="small"
                  @click="deleteSysDictionaryDetailFunc(scope.row)"
                >
                  确定
                </el-button>
              </div> -->
              <template #reference>
                <el-button link type="primary" icon="delete" size="small"
                  @click="scope.row.visible = true">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination background :current-page="page" :page-size="pageSize" :page-sizes="[10, 30, 50, 100]"
          :total="total" layout="total, sizes, prev, pager, next, jumper" @current-change="handleCurrentChange"
          @size-change="handleSizeChange" />
      </div>
    </div>

    <el-dialog v-model="dialogFormVisible" :before-close="closeDialog" title="字典项">
      <el-form ref="dialogForm" :model="formData" :rules="rules" size="default" label-width="110px">
        <el-form-item label="展示值" prop="label">
          <el-input v-model="formData.label" placeholder="请输入展示值" clearable :style="{ width: '100%' }" />
        </el-form-item>
        <el-form-item label="字典值" prop="value">
          <el-input-number v-model.number="formData.value" step-strictly :step="1" placeholder="请输入字典值" clearable
            :style="{ width: '100%' }" />
        </el-form-item>
        <el-form-item label="启用状态" prop="status" required>
          <el-switch v-model="formData.status" active-text="开启" inactive-text="停用" />
        </el-form-item>
        <el-form-item label="排序标记" prop="sort">
          <el-input-number v-model.number="formData.sort" placeholder="排序标记" />
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
  name: "SysDictionaryDetail",
};
</script>

<script setup>
import {
  createSysDictionaryDetail,
  deleteSysDictionaryDetail,
  updateSysDictionaryDetail,
  findSysDictionaryDetail,
  getSysDictionaryDetailList,
} from "@/api/sysDictionaryDetail"; //  此处请自行替换地址
import { ref } from "vue";
import { useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { formatBoolean, formatDate } from "@/utils/format";
const route = useRoute();

const formData = ref({
  label: null,
  value: null,
  status: true,
  sort: null,
});
const rules = ref({
  label: [
    {
      required: true,
      message: "请输入展示值",
      trigger: "blur",
    },
  ],
  value: [
    {
      required: true,
      message: "请输入字典值",
      trigger: "blur",
    },
  ],
  sort: [
    {
      required: true,
      message: "排序标记",
      trigger: "blur",
    },
  ],
});

const page = ref(1);
const total = ref(0);
const pageSize = ref(10);
const tableData = ref([]);
const searchInfo = ref({ sysDictionaryID: Number(route.params.id) });
const onReset = () => {
  searchInfo.value = { sysDictionaryID: Number(route.params.id) };
};

// 条件搜索前端看此方法
const onSubmit = () => {
  page.value = 1;
  pageSize.value = 10;
  if (searchInfo.value.status === "") {
    searchInfo.value.status = null;
  }
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

// 查询
const getTableData = async () => {
  const table = await getSysDictionaryDetailList({
    page: page.value,
    pageSize: pageSize.value,
    ...searchInfo.value,
  });
  if (table.code === 200) {
    tableData.value = table.data.list;
    total.value = table.data.total;
    page.value = table.data.page;
    pageSize.value = table.data.pageSize;
  }
};

getTableData();

const type = ref("");
const dialogFormVisible = ref(false);
const updateSysDictionaryDetailFunc = async (row) => {
  const res = await findSysDictionaryDetail({ ID: row.ID });
  type.value = "update";
  if (res.code === 200) {
    formData.value = res.data;
    dialogFormVisible.value = true;
  }
};

const closeDialog = () => {
  dialogFormVisible.value = false;
  formData.value = {
    label: null,
    value: null,
    status: true,
    sort: null,
    sysDictionaryID: "",
  };
};
const deleteSysDictionaryDetailFunc = async (row) => {
  row.visible = false;
  const res = await deleteSysDictionaryDetail({ ID: row.ID });
  if (res.code === 200) {
    ElMessage({
      type: "success",
      message: "删除成功",
    });
    if (tableData.value.length === 1 && page.value > 1) {
      page.value--;
    }
    getTableData();
  }
};

const dialogForm = ref(null);
const enterDialog = async () => {
  formData.value.sysDictionaryID = Number(route.params.id);
  dialogForm.value.validate(async (valid) => {
    if (!valid) return;
    let res;
    switch (type.value) {
      case "create":
        res = await createSysDictionaryDetail(formData.value);
        break;
      case "update":
        res = await updateSysDictionaryDetail(formData.value);
        break;
      default:
        res = await createSysDictionaryDetail(formData.value);
        break;
    }
    if (res.code === 200) {
      ElMessage({
        type: "success",
        message: "创建/更改成功",
      });
      closeDialog();
      getTableData();
    }
  });
};
const openDialog = () => {
  type.value = "create";
  dialogFormVisible.value = true;
};
</script>

<style></style>
