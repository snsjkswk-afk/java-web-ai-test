<template>
  <div class="login-container">
    <!-- 背景装饰线条 -->
    <div class="bg-decoration">
      <svg class="decoration-svg" viewBox="0 0 1920 1080" preserveAspectRatio="none">
        <!-- 左侧装饰 -->
        <path class="deco-line deco-left-1" d="M 100,200 Q 200,150 250,250 T 350,300" />
        <path class="deco-line deco-left-2" d="M 150,400 Q 250,350 300,450 T 400,500" />
        <path class="deco-line deco-left-3" d="M 80,600 Q 180,550 230,650 T 330,700" />
        <path class="deco-line deco-left-4" d="M 200,800 Q 300,750 350,850 T 450,900" />
        <circle class="deco-circle deco-left-5" cx="300" cy="200" r="8" />
        <circle class="deco-circle deco-left-6" cx="150" cy="500" r="6" />
        <circle class="deco-circle deco-left-7" cx="250" cy="750" r="10" />
        
        <!-- 右侧装饰 -->
        <path class="deco-line deco-right-1" d="M 1600,200 Q 1700,150 1750,250 T 1850,300" />
        <path class="deco-line deco-right-2" d="M 1550,400 Q 1650,350 1700,450 T 1800,500" />
        <path class="deco-line deco-right-3" d="M 1620,600 Q 1720,550 1770,650 T 1870,700" />
        <path class="deco-line deco-right-4" d="M 1500,800 Q 1600,750 1650,850 T 1750,900" />
        <circle class="deco-circle deco-right-5" cx="1650" cy="250" r="8" />
        <circle class="deco-circle deco-right-6" cx="1750" cy="550" r="6" />
        <circle class="deco-circle deco-right-7" cx="1600" cy="800" r="10" />
        
        <!-- 顶部装饰 -->
        <path class="deco-line deco-top-1" d="M 600,100 Q 700,50 800,100 T 900,80" />
        <path class="deco-line deco-top-2" d="M 1100,120 Q 1200,70 1300,120 T 1400,100" />
        
        <!-- 底部装饰 -->
        <path class="deco-line deco-bottom-1" d="M 500,950 Q 600,900 700,950 T 800,930" />
        <path class="deco-line deco-bottom-2" d="M 1200,960 Q 1300,910 1400,960 T 1500,940" />
      </svg>
    </div>
    
    <div class="login-card">
      <div class="login-header">
        <h2>登录</h2>
        <p class="subtitle">员工管理系统</p>
      </div>
      
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            :prefix-icon="User"
            size="large"
            class="custom-input"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            size="large"
            show-password
            class="custom-input"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="login-btn"
            @click="handleLogin"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-footer">
        <p>© 2026 TLIAS. All rights reserved.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import request from '../utils/request'

const router = useRouter()
const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  const valid = await loginFormRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    const res = await request.post('/login', {
      username: loginForm.username,
      password: loginForm.password
    })
    // 保存登录信息
    const loginInfo = res.data
    localStorage.setItem('token', loginInfo.token)
    localStorage.setItem('userInfo', JSON.stringify(loginInfo))
    ElMessage.success('登录成功')
    router.push('/')
  } catch (error) {
    // 错误已在拦截器中处理
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2B5DE5;
  position: relative;
  overflow: hidden;
}

/* 背景装饰 */
.bg-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
}

.decoration-svg {
  width: 100%;
  height: 100%;
}

.deco-line {
  fill: none;
  stroke: rgba(255, 255, 255, 0.3);
  stroke-width: 3;
  stroke-linecap: round;
  animation: drawLine 3s ease-out forwards;
}

.deco-circle {
  fill: rgba(255, 255, 255, 0.4);
  animation: fadeIn 2s ease-out forwards;
}

.deco-left-1 { animation-delay: 0.2s; }
.deco-left-2 { animation-delay: 0.4s; }
.deco-left-3 { animation-delay: 0.6s; }
.deco-left-4 { animation-delay: 0.8s; }
.deco-left-5 { animation-delay: 1s; }
.deco-left-6 { animation-delay: 1.2s; }
.deco-left-7 { animation-delay: 1.4s; }

.deco-right-1 { animation-delay: 0.3s; }
.deco-right-2 { animation-delay: 0.5s; }
.deco-right-3 { animation-delay: 0.7s; }
.deco-right-4 { animation-delay: 0.9s; }
.deco-right-5 { animation-delay: 1.1s; }
.deco-right-6 { animation-delay: 1.3s; }
.deco-right-7 { animation-delay: 1.5s; }

.deco-top-1 { animation-delay: 0.5s; }
.deco-top-2 { animation-delay: 0.7s; }
.deco-bottom-1 { animation-delay: 0.6s; }
.deco-bottom-2 { animation-delay: 0.8s; }

@keyframes drawLine {
  from {
    stroke-dasharray: 1000;
    stroke-dashoffset: 1000;
    opacity: 0;
  }
  to {
    stroke-dasharray: 1000;
    stroke-dashoffset: 0;
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 登录卡片 */
.login-card {
  width: 420px;
  padding: 50px 45px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.5s ease-out;
  position: relative;
  z-index: 1;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-header h2 {
  font-size: 32px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
}

.subtitle {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.login-form {
  margin-top: 30px;
}

/* 输入框样式 - QQ风格 */
:deep(.custom-input .el-input__wrapper) {
  border-radius: 8px;
  padding: 12px 15px;
  background: #f5f7fa;
  border: 1px solid transparent;
  box-shadow: none;
  transition: all 0.3s ease;
}

:deep(.custom-input .el-input__wrapper:hover) {
  background: #fff;
  border-color: #2B5DE5;
}

:deep(.custom-input .el-input__wrapper.is-focus) {
  background: #fff;
  border-color: #2B5DE5;
  box-shadow: 0 0 0 2px rgba(43, 93, 229, 0.1);
}

:deep(.el-form-item) {
  margin-bottom: 24px;
}

/* 登录按钮 - QQ风格 */
.login-btn {
  width: 100%;
  height: 48px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 4px;
  background: #2B5DE5;
  border: none;
  box-shadow: 0 4px 12px rgba(43, 93, 229, 0.3);
  transition: all 0.3s ease;
  margin-top: 10px;
}

.login-btn:hover {
  background: #1E4FD4;
  box-shadow: 0 6px 16px rgba(43, 93, 229, 0.4);
  transform: translateY(-1px);
}

.login-btn:active {
  transform: translateY(0);
}

/* 底部版权信息 */
.login-footer {
  margin-top: 35px;
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.login-footer p {
  font-size: 12px;
  color: #999;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-card {
    width: 90%;
    padding: 40px 30px;
  }
  
  .login-header h2 {
    font-size: 28px;
  }
}
</style>