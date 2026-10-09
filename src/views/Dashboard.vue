<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <!-- 员工职位分布 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span class="card-title">员工职位分布</span>
          </template>
          <div ref="jobChartRef" class="chart"></div>
        </el-card>
      </el-col>
      <!-- 员工性别分布 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span class="card-title">员工性别分布</span>
          </template>
          <div ref="genderChartRef" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20" style="margin-top: 20px">
      <!-- 学生学历分布 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span class="card-title">学生学历分布</span>
          </template>
          <div ref="degreeChartRef" class="chart"></div>
        </el-card>
      </el-col>
      <!-- 班级人数统计 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span class="card-title">班级人数统计</span>
          </template>
          <div ref="countChartRef" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import request from '../utils/request'

const jobChartRef = ref(null)
const genderChartRef = ref(null)
const degreeChartRef = ref(null)
const countChartRef = ref(null)

let jobChart = null
let genderChart = null
let degreeChart = null
let countChart = null

// 职位映射
const jobMap = {
  1: '班主任',
  2: '讲师',
  3: '学工主管',
  4: '教研主管',
  5: '咨询师'
}

// 学历映射
const degreeMap = {
  1: '初中',
  2: '高中',
  3: '大专',
  4: '本科',
  5: '硕士',
  6: '博士'
}

const initJobChart = (data) => {
  jobChart = echarts.init(jobChartRef.value)
  const option = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: '0%' },
    color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399'],
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
        label: { show: true, formatter: '{b}: {c}人' },
        data: data.dataList.map((val, idx) => ({
          name: data.jobList[idx] || `职位${idx + 1}`,
          value: val
        }))
      }
    ]
  }
  jobChart.setOption(option)
}

const initGenderChart = (data) => {
  genderChart = echarts.init(genderChartRef.value)
  const option = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: '0%' },
    color: ['#409EFF', '#F56C6C'],
    series: [
      {
        type: 'pie',
        radius: '65%',
        data: [
          { name: '男', value: data.dataList[0] || 0 },
          { name: '女', value: data.dataList[1] || 0 }
        ],
        label: { formatter: '{b}: {c}人' },
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 }
      }
    ]
  }
  genderChart.setOption(option)
}

const initDegreeChart = (data) => {
  degreeChart = echarts.init(degreeChartRef.value)
  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: data.jobList.map(item => degreeMap[item] || item),
      axisTick: { alignWithLabel: true }
    },
    yAxis: { type: 'value' },
    series: [
      {
        type: 'bar',
        data: data.dataList,
        barWidth: '40%',
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#409EFF' },
            { offset: 1, color: '#79bbff' }
          ])
        }
      }
    ]
  }
  degreeChart.setOption(option)
}

const initCountChart = (data) => {
  countChart = echarts.init(countChartRef.value)
  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: data.jobList,
      axisLabel: { rotate: 30 }
    },
    yAxis: { type: 'value' },
    series: [
      {
        type: 'bar',
        data: data.dataList,
        barWidth: '40%',
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#67C23A' },
            { offset: 1, color: '#95d475' }
          ])
        }
      }
    ]
  }
  countChart.setOption(option)
}

const loadData = async () => {
  try {
    const [jobRes, genderRes, degreeRes, countRes] = await Promise.all([
      request.get('/report/empsJobData'),
      request.get('/report/empsGenderData'),
      request.get('/report/studentDegreeData'),
      request.get('/report/studentCountData')
    ])
    initJobChart(jobRes.data)
    initGenderChart(genderRes.data)
    initDegreeChart(degreeRes.data)
    initCountChart(countRes.data)
  } catch (error) {
    console.error('加载报表数据失败:', error)
  }
}

// 窗口大小变化时重新调整图表
const handleResize = () => {
  jobChart?.resize()
  genderChart?.resize()
  degreeChart?.resize()
  countChart?.resize()
}

onMounted(() => {
  loadData()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  jobChart?.dispose()
  genderChart?.dispose()
  degreeChart?.dispose()
  countChart?.dispose()
})
</script>

<style scoped>
.dashboard {
  min-height: 100%;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.chart {
  height: 350px;
  width: 100%;
}
</style>