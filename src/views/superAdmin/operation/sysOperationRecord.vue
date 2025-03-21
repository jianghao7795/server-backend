<template>
  <div>
    <div class="search-box">
      <el-form :inline="true" :model="searchInfo" @keyup.enter.native="onSubmit">
        <el-form-item>
          <el-select v-model="searchInfo.type_port" placeholder="前后台" filterable>
            <el-option label="前台请求" :value="1"></el-option>
            <el-option label="后台请求" :value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="请求方法">
          <el-input v-model="searchInfo.method" placeholder="搜索条件" />
        </el-form-item>
        <el-form-item label="请求路径">
          <el-input v-model="searchInfo.path" placeholder="搜索条件" />
        </el-form-item>
        <el-form-item label="结果状态码">
          <el-input v-model="searchInfo.status" placeholder="搜索条件" />
        </el-form-item>
        <el-form-item>
          <el-button size="small" type="primary" icon="search" @click="onSubmit">查询</el-button>
          <el-button size="small" icon="refresh" @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table-box">
      <div class="btn-list">
        <el-popover v-model:visible="deleteVisible" placement="top" width="160">
          <p>确定要删除吗？</p>
          <div style="text-align: right; margin-top: 8px">
            <el-button size="small" link type="primary" @click="deleteVisible = false">取消</el-button>
            <el-button size="small" type="primary" @click="onDelete">确定</el-button>
          </div>
          <template #reference>
            <el-button icon="delete" size="small" style="margin-left: 10px" :disabled="!multipleSelection.length" @click="deleteVisible = true">删除</el-button>
          </template>
        </el-popover>
      </div>
      <el-table ref="multipleTable" :data="tableData" style="width: 100%" tooltip-effect="dark" row-key="ID" @selection-change="handleSelectionChange" v-loading="loading">
        <el-table-column align="left" type="selection" width="55" />
        <el-table-column align="left" label="操作人" width="160">
          <template #default="scope">
            <div>{{ scope.row.user.userName }}({{ scope.row.user.nickName || scope.row.user.name }})</div>
          </template>
        </el-table-column>
        <el-table-column align="left" label="日期" width="180">
          <template #default="scope">{{ formatDate(scope.row.CreatedAt) }}</template>
        </el-table-column>
        <el-table-column align="left" label="状态码" prop="status" width="120">
          <template #default="scope">
            <div>
              <el-tag type="success">{{ scope.row.status }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="left" label="请求IP" prop="ip" width="120" />
        <el-table-column align="left" label="请求方法" prop="method" width="120" />
        <el-table-column align="left" label="请求路径" prop="path" width="240" />
        <el-table-column align="left" label="请求" prop="path" width="80">
          <template #default="scope">
            <div>
              <el-popover v-if="scope.row.body" placement="left-start" trigger="click" :width="445">
                <div class="popover-box">
                  <pre>{{ fmtBody(scope.row.body) }}</pre>
                </div>
                <template #reference>
                  <el-icon style="cursor: pointer">
                    <warning color="green" />
                  </el-icon>
                </template>
              </el-popover>

              <span v-else>无</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="left" label="响应" prop="path" width="80">
          <template #default="scope">
            <div>
              <el-popover v-if="scope.row.resp" placement="left-start" trigger="click" :width="445">
                <div class="popover-box">
                  <pre>{{ fmtBody(scope.row.resp) }}</pre>
                </div>
                <template #reference>
                  <el-icon style="cursor: pointer">
                    <warning color="#f00" />
                  </el-icon>
                </template>
              </el-popover>
              <span v-else>无</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="left" label="操作">
          <template #default="scope">
            <el-popover v-model:visible="scope.row.visible" placement="top" width="160">
              <p>确定要删除吗？</p>
              <div style="text-align: right; margin-top: 8px">
                <el-button size="small" link type="primary" @click="scope.row.visible = false">取消</el-button>
                <el-button size="small" type="primary" @click="deleteSysOperationRecordFunc(scope.row)">确定</el-button>
              </div>
              <template #reference>
                <el-button icon="delete" size="small" link type="primary" @click="scope.row.visible = true">删除</el-button>
              </template>
            </el-popover>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination background :current-page="page" :page-size="pageSize" :page-sizes="[10, 30, 50, 100]" :total="total" layout="total, sizes, prev, pager, next, jumper" @current-change="handleCurrentChange" @size-change="handleSizeChange" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { deleteSysOperationRecord, getSysOperationRecordList, deleteSysOperationRecordByIds } from "@/api/sysOperationRecord"; // 此处请自行替换地址
import { formatDate } from "@/utils/format";
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";

const page = ref(1);
const total = ref(0);
const pageSize = ref(10);
const tableData = ref([]);
const searchInfo = ref({ type_port: 0 });
const loading = ref(false);
const onReset = () => {
  searchInfo.value = {};
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
  loading.value = true;
  const table = await getSysOperationRecordList({
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
  getTableData(searchInfo.value);
});

const deleteVisible = ref(false);
const multipleSelection = ref([]);
const handleSelectionChange = (val) => {
  multipleSelection.value = val;
};
const onDelete = async () => {
  const ids = [];
  multipleSelection.value &&
    multipleSelection.value.forEach((item) => {
      ids.push(item.ID);
    });
  const res = await deleteSysOperationRecordByIds({ ids });
  if (res.code === 200) {
    ElMessage({
      type: "success",
      message: "删除成功",
    });
    if (tableData.value.length === ids.length && page.value > 1) {
      page.value--;
    }
    deleteVisible.value = false;
    getTableData();
  }
};
const deleteSysOperationRecordFunc = async (row) => {
  row.visible = false;
  const res = await deleteSysOperationRecord({ ID: row.ID });
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
const fmtBody = (value) => {
  try {
    return JSON.parse(value);
  } catch (err) {
    return err;
  }
};
</script>

<script>
export default {
  name: "SysOperationRecord",
};
</script>

<style lang="scss">
.table-expand {
  padding-left: 60px;
  font-size: 0;

  label {
    width: 90px;
    color: #99a9bf;

    .el-form-item {
      margin-right: 0;
      margin-bottom: 0;
      width: 50%;
    }
  }
}

.popover-box {
  background: #112435;
  color: #f08047;
  height: 600px;
  width: 420px;
  overflow: auto;
}

.popover-box::-webkit-scrollbar {
  display: none;
  /* Chrome Safari */
}
</style>
