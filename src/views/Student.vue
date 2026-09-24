<template>
  <div class="student-container">
    <!-- 搜索区域 -->
    <el-card shadow="never" class="search-card">
      <el-form :model="queryParams" inline>
        <el-form-item label="姓名">
          <el-input
            v-model="queryParams.name"
            placeholder="请输入学生姓名"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item label="学历">
          <el-select v-model="queryParams.degree" placeholder="请选择" clearable>
            <el-option label="初中" value="1" />
            <el-option label="高中" value="2" />
            <el-option label="大专" value="3" />
            <el-option label="本科" value="4" />
            <el-option label="硕士" value="5" />
            <el-option label="博士" value="6" />
          </el-select>
        </el-form-item>
        <el-form-item label="班级">
          <el-select v-model="queryParams.clazzId" placeholder="请选择班级" clearable>
            <el-option
              v-for="clazz in clazzOptions"
              :key="clazz.id"
              :label="clazz.name"
              :value="clazz.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格区域 -->
    <el-card shadow="never" class="table-card">
      <div style="display: flex; justify-content: space-between; margin-bottom: 16px">
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增学生</el-button>
        <el-button type="danger" :icon="Delete" @click="handleBatchDelete" :disabled="!selectedIds.length">
          批量删除
        </el-button>
      </div>

      <el-table
        :data="studentList"
        border
        stripe
        v-loading="loading"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column prop="name" label="姓名" align="center" width="100" />
        <el-table-column prop="no" label="学号" align="center" width="120" />
        <el-table-column label="性别" align="center" width="70">
          <template #default="{ row }">
            <el-tag :type="row.gender === 1 ? '' : 'danger'" size="small">
              {{ row.gender === 1 ? '男' : '女' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" align="center" width="130" />
        <el-table-column label="学历" align="center" width="80">
          <template #default="{ row }">
            {{ degreeMap[row.degree] || '未知' }}
          </template>
        </el-table-column>
        <el-table-column prop="clazzName" label="班级" align="center" width="120" />
        <el-table-column label="院校来源" align="center" width="90">
          <template #default="{ row }">
            <el-tag :type="row.isCollege === 1 ? 'success' : 'info'" size="small">
              {{ row.isCollege === 1 ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="violationCount" label="违纪次数" align="center" width="90" />
        <el-table-column prop="violationScore" label="违纪扣分" align="center" width="90" />
        <el-table-column label="操作" align="center" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" :icon="Edit" link @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="warning" :icon="Warning" link @click="handleViolation(row)">
              违纪
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
          @size-change="loadStudentList"
          @current-change="loadStudentList"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑学生' : '新增学生'"
      width="650px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="studentForm"
        :rules="rules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="studentForm.name" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学号" prop="no">
              <el-input v-model="studentForm.no" placeholder="请输入学号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="studentForm.gender">
                <el-radio :value="1">男</el-radio>
                <el-radio :value="2">女</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="studentForm.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="身份证号" prop="idCard">
              <el-input v-model="studentForm.idCard" placeholder="请输入身份证号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最高学历" prop="degree">
              <el-select v-model="studentForm.degree" placeholder="请选择" style="width: 100%">
                <el-option label="初中" :value="1" />
                <el-option label="高中" :value="2" />
                <el-option label="大专" :value="3" />
                <el-option label="本科" :value="4" />
                <el-option label="硕士" :value="5" />
                <el-option label="博士" :value="6" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="院校来源" prop="isCollege">
              <el-radio-group v-model="studentForm.isCollege">
                <el-radio :value="1">是</el-radio>
                <el-radio :value="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="毕业时间" prop="graduationDate">
              <el-date-picker
                v-model="studentForm.graduationDate"
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
            <el-form-item label="班级" prop="clazzId">
              <el-select v-model="studentForm.clazzId" placeholder="请选择班级" style="width: 100%">
                <el-option
                  v-for="clazz in clazzOptions"
                  :key="clazz.id"
                  :label="clazz.name"
                  :value="clazz.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系地址" prop="address">
              <el-input v-model="studentForm.address" placeholder="请输入联系地址" />
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

    <!-- 违纪处理对话框 -->
    <el-dialog v-model="violationVisible" title="违纪处理" width="450px">
      <el-form :model="violationForm" label-width="100px">
        <el-form-item label="违纪类型">
          <el-select v-model="violationForm.violation" placeholder="请选择违纪类型" style="width: 100%">
            <el-option label="迟到" :value="1" />
            <el-option label="早退" :value="2" />
            <el-option label="旷课" :value="3" />
            <el-option label="打架" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="扣分">
          <el-input-number v-model="violationForm.score" :min="1" :max="10" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="violationVisible = false">取消</el-button>
        <el-button type="primary" @click="submitViolation">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Search, Refresh, Warning } from '@element-plus/icons-vue'
import request from '../utils/request'

const degreeMap = { 1: '初中', 2: '高中', 3: '大专', 4: '本科', 5: '硕士', 6: '博士' }

const loading = ref(false)
const studentList = ref([])
const total = ref(0)
const clazzOptions = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref(null)
const selectedIds = ref([])
const violationVisible = ref(false)

const queryParams = reactive({
  page: 1,
  pageSize: 10,
  name: '',
  degree: '',
  clazzId: null
})

const studentForm = reactive({
  id: null,
  name: '',
  no: '',
  gender: 1,
  phone: '',
  idCard: '',
  isCollege: 1,
  address: '',
  degree: null,
  graduationDate: '',
  clazzId: null
})

const violationForm = reactive({
  id: null,
  violation: null,
  score: 1
})

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  no: [{ required: true, message: '请输入学号', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  degree: [{ required: true, message: '请选择学历', trigger: 'change' }],
  clazzId: [{ required: true, message: '请选择班级', trigger: 'change' }]
}

// 加载学生列表
const loadStudentList = async () => {
  loading.value = true
  try {
    const res = await request.get('/students', { params: queryParams })
    studentList.value = res.data.data
    total.value = res.data.count
  } catch (error) {
    console.error('加载学生列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 加载班级选项
const loadClazzOptions = async () => {
  try {
    const res = await request.get('/clazzs', { params: { page: 1, pageSize: 200 } })
    clazzOptions.value = res.data.data || []
  } catch (error) {
    console.error('加载班级列表失败:', error)
  }
}

// 查询
const handleSearch = () => {
  queryParams.page = 1
  loadStudentList()
}

// 重置
const handleReset = () => {
  queryParams.name = ''
  queryParams.degree = ''
  queryParams.clazzId = null
  handleSearch()
}

// 多选
const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map(item => item.id)
}

// 新增
const handleAdd = () => {
  isEdit.value = false
  Object.assign(studentForm, {
    id: null, name: '', no: '', gender: 1, phone: '',
    idCard: '', isCollege: 1, address: '', degree: null,
    graduationDate: '', clazzId: null
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(studentForm, { ...row })
  dialogVisible.value = true
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除学生「${row.name}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await request.delete(`/students/${row.id}`)
      ElMessage.success('删除成功')
      loadStudentList()
    } catch (error) {
      // 错误已在拦截器中处理
    }
  }).catch(() => {})
}

// 批量删除
const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 名学生吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await request.delete(`/students/${selectedIds.value.join(',')}`)
      ElMessage.success('批量删除成功')
      loadStudentList()
    } catch (error) {
      // 错误已在拦截器中处理
    }
  }).catch(() => {})
}

// 违纪处理
const handleViolation = (row) => {
  violationForm.id = row.id
  violationForm.violation = null
  violationForm.score = 1
  violationVisible.value = true
}

// 提交违纪
const submitViolation = async () => {
  if (!violationForm.violation) {
    ElMessage.warning('请选择违纪类型')
    return
  }
  try {
    await request.put(`/students/${violationForm.violation}/${violationForm.id}/${violationForm.score}`)
    ElMessage.success('违纪处理成功')
    violationVisible.value = false
    loadStudentList()
  } catch (error) {
    // 错误已在拦截器中处理
  }
}

// 提交表单
const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitLoading.value = true
  try {
    if (isEdit.value) {
      await request.put('/students', studentForm)
      ElMessage.success('更新成功')
    } else {
      await request.post('/students', studentForm)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    loadStudentList()
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
  loadStudentList()
  loadClazzOptions()
})
</script>

<style scoped>
.student-container {
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
