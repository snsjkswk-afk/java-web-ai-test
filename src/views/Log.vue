<template>
  <div class="log-container">
    <el-card shadow="never">
      <template #header>
        <span class="card-title">操作日志</span>
      </template>

      <el-table :data="logList" border stripe v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="operateTime" label="操作时间" align="center" width="200" />
        <el-table-column prop="info" label="操作详情" align="center" show-overflow-tooltip />
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadLogList"
          @current-change="loadLogList"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '../utils/request'

const loading = ref(false)
const logList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const loadLogList = async () => {
  loading.value = true
  try {
    const res = await request.get('/log/page', {
      params: {
        page: currentPage.value,
        pageSize: pageSize.value
      }
    })
    logList.value = res.data.data
    total.value = res.data.count
  } catch (error) {
    console.error('加载操作日志失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadLogList()
})
</script>

<style scoped>
.log-container {
  min-height: 100%;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
