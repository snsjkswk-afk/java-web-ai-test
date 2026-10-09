<template>
  <div class="clazz-container">
    <!-- 搜索区域 -->
    <el-card shadow="never" class="search-card">
      <el-form :model="queryParams" inline>
        <el-form-item label="班级名称">
          <el-input
            v-model="queryParams.name"
            placeholder="请输入班级名称"
            clearable
            @clear="handleSearch"
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="班主任">
          <el-input
            v-model="queryParams.masterName"
            placeholder="请输入班主任姓名"
            clearable
            @clear="handleSearch"
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item label="学科">
          <el-select v-model="queryParams.subject" placeholder="请选择学科" clearable style="width: 120px">
            <el-option label="Java" :value="1" />
            <el-option label="前端" :value="2" />
            <el-option label="Python" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="开课时间">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            @change="handleDateChange"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格区域 -->
    <el-card shadow="never" class="table-card">
      <el-button type="primary" :icon="Plus" @click="handleAdd" style="margin-bottom: 16px">
        新增班级
      </el-button>

      <el-table :data="clazzList" border stripe v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="70" align="center" />
        <el-table-column prop="name" label="班级名称" align="center" width="150" />
        <el-table-column prop="room" label="教室" align="center" width="100" />
        <el-table-column prop="masterName" label="班主任" align="center" width="100" />
        <el-table-column label="学科" align="center" width="100">
          <template #default="{ row }">
            {{ subjectMap[row.subject] || '未知' }}
          </template>
        </el-table-column>
        <el-table-column prop="beginDate" label="开课时间" align="center" width="120" />
        <el-table-column prop="endDate" label="结课时间" align="center" width="120" />
        <el-table-column label="状态" align="center" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">
              {{ row.status || '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" :icon="Edit" link @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" :icon="Delete" link @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[5, 10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadClazzList"
          @current-change="loadClazzList"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑班级' : '新增班级'"
      width="600px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="clazzForm"
        :rules="rules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="班级名称" prop="name">
              <el-input v-model="clazzForm.name" placeholder="请输入班级名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="教室" prop="room">
              <el-input v-model="clazzForm.room" placeholder="请输入教室" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开课时间" prop="beginDate">
              <el-date-picker
                v-model="clazzForm.beginDate"
                type="date"
                placeholder="请选择"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结课时间" prop="endDate">
              <el-date-picker
                v-model="clazzForm.endDate"
                type="date"
                placeholder="请选择"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="班主任" prop="masterId">
              <el-select v-model="clazzForm.masterId" placeholder="请选择班主任" style="width: 100%">
                <el-option
                  v-for="emp in masterOptions"
                  :key="emp.id"
                  :label="emp.name"
                  :value="emp.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学科" prop="subject">
              <el-select v-model="clazzForm.subject" placeholder="请选择学科" style="width: 100%">
                <el-option label="Java" :value="1" />
                <el-option label="前端" :value="2" />
                <el-option label="Python" :value="3" />
                <el-option label="大数据" :value="4" />
                <el-option label="UI设计" :value="5" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Search, Refresh } from '@element-plus/icons-vue'
import request from '../utils/request'

const subjectMap = { 1: 'Java', 2: '前端', 3: 'Python', 4: '大数据', 5: 'UI设计' }

const loading = ref(false)
const clazzList = ref([])
const total = ref(0)
const masterOptions = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref(null)
const dateRange = ref([])

const queryParams = reactive({
  page: 1,
  pageSize: 10,
  name: '',
  masterName: '',
  subject: null,
  begin: '',
  end: ''
})

const clazzForm = reactive({
  id: null,
  name: '',
  room: '',
  beginDate: '',
  endDate: '',
  masterId: null,
  subject: null
})

const rules = {
  name: [{ required: true, message: '请输入班级名称', trigger: 'blur' }],
  room: [{ required: true, message: '请输入教室', trigger: 'blur' }],
  beginDate: [{ required: true, message: '请选择开课时间', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结课时间', trigger: 'change' }],
  masterId: [{ required: true, message: '请选择班主任', trigger: 'change' }],
  subject: [{ required: true, message: '请选择学科', trigger: 'change' }]
}

const statusType = (status) => {
  if (status === '未开班') return 'info'
  if (status === '在读') return ''
  if (status === '已结课') return 'success'
  return 'warning'
}

// 加载班级列表
const loadClazzList = async () => {
  loading.value = true
  try {
    const res = await request.get('/clazzs', { params: queryParams })
    clazzList.value = res.data.data
    total.value = res.data.count
  } catch (error) {
    console.error('加载班级列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 加载班主任选项（从员工列表中获取职位为班主任的）
const loadMasterOptions = async () => {
  try {
    const res = await request.get('/emps', { params: { page: 1, pageSize: 200, job: 1 } })
    masterOptions.value = res.data.data || []
  } catch (error) {
    console.error('加载班主任列表失败:', error)
  }
}

// 日期范围变化
const handleDateChange = (val) => {
  if (val) {
    queryParams.begin = val[0]
    queryParams.end = val[1]
  } else {
    queryParams.begin = ''
    queryParams.end = ''
  }
}

// 查询
const handleSearch = () => {
  queryParams.page = 1
  loadClazzList()
}

// 重置
const handleReset = () => {
  queryParams.name = ''
  queryParams.masterName = ''
  queryParams.subject = null
  queryParams.begin = ''
  queryParams.end = ''
  dateRange.value = []
  handleSearch()
}

// 新增
const handleAdd = () => {
  isEdit.value = false
  Object.assign(clazzForm, {
    id: null, name: '', room: '', beginDate: '', endDate: '',
    masterId: null, subject: null
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(clazzForm, { ...row })
  dialogVisible.value = true
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除班级「${row.name}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await request.delete(`/clazzs/${row.id}`)
      ElMessage.success('删除成功')
      loadClazzList()
    } catch (error) {
      // 错误已在拦截器中处理
    }
  }).catch(() => {})
}

// 提交表单
const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitLoading.value = true
  try {
    if (isEdit.value) {
      await request.put('/clazzs', clazzForm)
      ElMessage.success('更新成功')
    } else {
      await request.post('/clazzs', clazzForm)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    loadClazzList()
  } catch (error) {
    // 错误已在拦截器中处理
  } finally {
    submitLoading.value = false
  }
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
}

onMounted(() => {
  loadClazzList()
  loadMasterOptions()
})
</script>

<style scoped>
.clazz-container {
  min-height: 100%;
}

.search-card {
  margin-bottom: 16px;
}

.table-card {
  margin-bottom: 16px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>