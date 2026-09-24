<template>
  <div class="dept-container">
    <!-- 搜索区域 -->
    <el-card shadow="never" class="search-card">
      <el-button type="primary" :icon="Plus" @click="handleAdd">
        新增部门
      </el-button>
    </el-card>

    <!-- 表格区域 -->
    <el-card shadow="never" class="table-card">
      <el-table :data="deptList" border stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="name" label="部门名称" align="center" />
        <el-table-column prop="createTime" label="创建时间" align="center" width="180" />
        <el-table-column prop="updateTime" label="更新时间" align="center" width="180" />
        <el-table-column label="操作" align="center" width="200">
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
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑部门' : '新增部门'"
      width="500px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="deptForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="部门名称" prop="name">
          <el-input v-model="deptForm.name" placeholder="请输入部门名称" />
        </el-form-item>
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
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import request from '../utils/request'

const deptList = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref(null)

const deptForm = reactive({
  id: null,
  name: ''
})

const rules = {
  name: [{ required: true, message: '请输入部门名称', trigger: 'blur' }]
}

// 加载部门列表
const loadDeptList = async () => {
  try {
    const res = await request.get('/depts')
    deptList.value = res.data
  } catch (error) {
    console.error('加载部门列表失败:', error)
  }
}

// 新增
const handleAdd = () => {
  isEdit.value = false
  deptForm.id = null
  deptForm.name = ''
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  isEdit.value = true
  deptForm.id = row.id
  deptForm.name = row.name
  dialogVisible.value = true
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除部门「${row.name}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await request.delete(`/depts/${row.id}`)
      ElMessage.success('删除成功')
      loadDeptList()
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
      await request.put('/depts', deptForm)
      ElMessage.success('更新成功')
    } else {
      await request.post('/depts', deptForm)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    loadDeptList()
  } catch (error) {
    // 错误已在拦截器中处理
  } finally {
    submitLoading.value = false
  }
}

// 重置表单
const resetForm = () => {
  deptForm.id = null
  deptForm.name = ''
  formRef.value?.resetFields()
}

onMounted(() => {
  loadDeptList()
})
</script>

<style scoped>
.dept-container {
  min-height: 100%;
}

.search-card {
  margin-bottom: 16px;
}

.table-card {
  margin-bottom: 16px;
}
</style>
