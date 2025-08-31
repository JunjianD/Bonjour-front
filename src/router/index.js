import { createRouter, createWebHistory } from 'vue-router'
import BjLogin from '../view/BJLogin.vue'
import BjRegister from '../view/BJRegister.vue'
import BjHome from '../view/BJHome.vue'

// 路由表
const routes = [
    {
        path: '/',
        redirect: '/login'
    },
    {
        name: 'Login',
        path: '/login',
        component: BjLogin
    },
    {
        name: 'Register',
        path: '/register',
        component: BjRegister
    },
    {
        name: 'Home',
        path: '/home',
        component: BjHome,
        children: [
            {
                name: 'Chat',
                path: 'chat', // 子路由不要加 /home 前缀
                component: () => import('../view/UserChat.vue')
            },
            {
                name: 'Friends',
                path: 'friend',
                component: () => import('../view/BJFriend.vue')
            },
            {
                name: 'Group',
                path: 'group',
                component: () => import('../view/BJGroup.vue')
            }
        ]
    }
]

// 创建路由实例
const router = createRouter({
    history: createWebHistory(), // 如果想用 hash 模式就换成 createWebHashHistory()
    routes
})

export default router

