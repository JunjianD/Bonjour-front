import { createStore } from 'vuex'
import uiStore from './uiStore.js'
import chatStore from './chatStore.js'
import friendStore from './friendStore.js'
import userStore from './userStore.js'
import groupStore from "./groupStore.js";

export default createStore({
    modules: { uiStore, chatStore, friendStore, userStore, groupStore },
    state: {},
    mutations: {},
    actions: {
        async load({ dispatch }) {
            console.log('load')
            try{
                await dispatch('loadUser')
                await Promise.all([
                    dispatch('loadFriend'),
                    dispatch('loadGroup'),
                    dispatch('loadChat'),
                ])
            }catch(error){
                this.$message.error("加载数据出错",error.message)
            }
        },
        unload({ commit }) {
            commit('clear')
        }
    },
    strict: process.env.NODE_ENV !== 'production',
})
