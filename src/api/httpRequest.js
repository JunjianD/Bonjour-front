import axios from 'axios'
import router from '@/router'  // Vue3 router 导入方式一般不变
import { ElMessage } from 'element-plus'  // element-plus 的 Message

const http = axios.create({
    baseURL: process.env.VUE_APP_BASE_API,
    timeout: 1000 * 30,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json; charset=utf-8'
    }
})

/**
 * 请求拦截
 */
http.interceptors.request.use(config => {
    const accessToken = sessionStorage.getItem('accessToken')
    if (accessToken) {
        config.headers.accessToken = encodeURIComponent(accessToken)
    }
    return config
}, error => {
    return Promise.reject(error)
})

/**
 * 响应拦截
 */
http.interceptors.response.use(async response => {
    if (response.data.code === 200) {
        return response.data.data
    } else if (response.data.code === 400) {
        router.replace('/login')
    } else if (response.data.code === 401) {
        console.log('token失效，尝试重新获取')
        const refreshToken = sessionStorage.getItem('refreshToken')
        // console.log('refreshToken：',refreshToken)
        if (!refreshToken) {
            this.$message.error('登录已失效，请重新登录', { duration: 3000 })
            router.replace('/login')
        }

        try{
            const data = await http({
                method: 'put',
                url: '/user-server/refreshToken',
                headers: {
                    refreshToken
                }
            })

            sessionStorage.setItem('accessToken', data.accessToken)
            sessionStorage.setItem('refreshToken', data.refreshToken)

            // 如果 response.config.data 不是对象，清掉 headers
            if (typeof response.config.data !== 'object') {
                response.config.headers = undefined
            }
            return http(response.config)
        }catch(err){
            router.replace('/login')
            return Promise.reject('刷新token失败，请重新登录')
        }
    }else {
        return Promise.reject(response.data.message)
    }
}, error => {
    let errMessage;
    switch (error.response?.status) {
        case 401:
            errMessage = 'HTTP: 未授权'
            router.replace('/login')
            break
        case 404:
            errMessage = 'HTTP: 请求资源不存在'
            break
        case 405:
            // ElMessage({
            //     message: 'http请求方式有误',
            //     type: 'error',
            //     duration: 1500,
            //     customClass: 'element-error-message-zindex'
            // })
            errMessage = 'HTTP: http请求方式有误'
            break
        case 500:
            // ElMessage({
            //     message: '系统繁忙，请稍后再试',
            //     type: 'error',
            //     duration: 1500,
            //     customClass: 'element-error-message-zindex'
            // })
            errMessage = 'HTTP: 系统繁忙'
            break
        case 501:
            // ElMessage({
            //     message: '服务器不支持当前请求所需要的某个功能',
            //     type: 'error',
            //     duration: 1500,
            //     customClass: 'element-error-message-zindex'
            // })
            errMessage = 'HTTP: 服务器不支持当前请求所需功能'
            break
        default:
            // ElMessage({
            //     message: error.response?.data?.message || '请求出错，请稍后再试',
            //     type: 'error',
            //     duration: 1500,
            //     customClass: 'element-error-message-zindex'
            // })
            errMessage = 'HTTP: 请求参数错误'
    }
    return Promise.reject(error)
})

export default http
