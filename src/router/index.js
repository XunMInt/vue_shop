import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/login.vue'
import Home from '../components/home.vue'
Vue.use(VueRouter)

const routes = [
  { path: '/login', component: Login },
  { path: '/home', component: Home }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

//挂载路由守卫
router.beforeEach((to,from,next)=>{
  if(to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if(!tokenStr) return  next('/login')
  next()
})


export default router
