import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../layout/Layout.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { title: '仪表盘' }
      },
      {
        path: 'dept',
        name: 'Dept',
        component: () => import('../views/Dept.vue'),
        meta: { title: '部门管理' }
      },
      {
        path: 'emp',
        name: 'Emp',
        component: () => import('../views/Emp.vue'),
        meta: { title: '员工管理' }
      },
      {
        path: 'clazz',
        name: 'Clazz',
        component: () => import('../views/Clazz.vue'),
        meta: { title: '班级管理' }
      },
      {
        path: 'student',
        name: 'Student',
        component: () => import('../views/Student.vue'),
        meta: { title: '学生管理' }
      },
      {
        path: 'log',
        name: 'Log',
        component: () => import('../views/Log.vue'),
        meta: { title: '操作日志' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫：检查登录状态
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
