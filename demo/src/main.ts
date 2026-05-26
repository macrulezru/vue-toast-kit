import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { VueToastPlugin } from 'vue-toast-kit'
import App from './App.vue'

import BasicDemo from './demos/BasicDemo.vue'
import PromiseDemo from './demos/PromiseDemo.vue'
import UndoDemo from './demos/UndoDemo.vue'
import GroupDemo from './demos/GroupDemo.vue'
import HeadlessDemo from './demos/HeadlessDemo.vue'
import MultiInstanceDemo from './demos/MultiInstanceDemo.vue'
import DesignSystemDemo from './demos/DesignSystemDemo.vue'
import AnimationsDemo from './demos/AnimationsDemo.vue'
import StackDemo from './demos/StackDemo.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/basic' },
    { path: '/basic', component: BasicDemo },
    { path: '/promise', component: PromiseDemo },
    { path: '/undo', component: UndoDemo },
    { path: '/group', component: GroupDemo },
    { path: '/headless', component: HeadlessDemo },
    { path: '/multi', component: MultiInstanceDemo },
    { path: '/design', component: DesignSystemDemo },
    { path: '/animations', component: AnimationsDemo },
    { path: '/stack', component: StackDemo },
  ],
})

const app = createApp(App)
app.use(router)
app.use(VueToastPlugin, { position: 'bottom-right' })
app.mount('#app')
