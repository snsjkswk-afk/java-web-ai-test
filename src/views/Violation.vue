<template>
  <div class="violation-container">
    <!-- 表格区域 -->
    <el-card shadow="never" class="table-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px">
        <div>
          <el-button :icon="ArrowLeft" link @click="$router.push('/student')" style="margin-right: 10px">
            返回
          </el-button>
          <span style="color: #409EFF; font-weight: bold">
            学生ID: {{ studentId }}
          </span>
        </div>
      </div>

      <el-table
        :data="violationList"
        border
        stripe
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column prop="studentId" label="学生ID" align="center" width="120" />
        <el-table-column label="违纪类型" align="center" width="150">
          <template #default="{ row }">
            <el-tag :type="getViolationType(row.violationType)" size="small">
              {{ row.violationType || '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="violationScore" label="扣分" align="center" width="100">
          <template #default="{ row }">
            <span style="color: #f56c6c; font-weight: bold">{{ row.violationScore }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="violationTime" label="违纪时间" align="center">
          <template #default="{ row }">
            {{ formatTime(row.violationTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" align="center" />
      </el-table>

      <el-empty v-if="!loading && violationList.length === 0" description="暂无违纪记录" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import request from '../utils/request'

const route = useRoute()

const studentId = ref(route.query.studentId || '')
const violationTypeColor = { '迟到': 'warning', '早退': 'danger', '旷课': 'info', '打架': 'danger' }

const loading = ref(false)
const violationList = ref([])

// 获取违纪类型标签颜色
const getViolationType = (type) => {
  return violationTypeColor[type] || 'info'
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return '-'
  return time.replace('T', ' ').substring(0, 19)
}

// 加载违纪记录
const loadViolationList = async () => {
  if (!studentId.value) {
    ElMessage.warning('未指定学生ID')
    return
  }

  loading.value = true
  try {
    const res = await request.get(`/students/${studentId.value}/violations`)
    violationList.value = res.data || []
  } catch (error) {
    console.error('加载违纪记录失败:', error)
    ElMessage.error('加载违纪记录失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadViolationList()
})
</script>

<style scoped>
.violation-container {
  min-height: 100%;
}

.table-card {
  margin-bottom: 16px;
}
</style>