import Vue from 'vue'
import VueRouter from 'vue-router'
// import Login from './components/Login.vue'
const Login = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/login.vue')
// import Home from './components/Home.vue'
const Home = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/home.vue')
// import Welcome from './components/Welcome.vue'
const Welcome = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/welcome.vue')

// import Users from './components/user/Users.vue'
const Users = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/user/users.vue')
// import Rights from './components/power/Rights.vue'
const Rights = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/power/rights.vue')
// import Roles from './components/power/Roles.vue'
const Roles = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/power/roles.vue')

// import Cate from './components/goods/Cate.vue'
const Cate = () => import(/* webpackChunkName: "Cate_Params" */ '../components/goods/cate.vue')
// import Params from './components/goods/Params.vue'
const Params = () => import(/* webpackChunkName: "Cate_Params" */ '../components/goods/params.vue')

// import GoodsList from './components/goods/List.vue'
const GoodsList = () => import(/* webpackChunkName: "GoodsList_Add" */ '../components/goods/list.vue')
// import Add from './components/goods/Add.vue'
const Add = () => import(/* webpackChunkName: "GoodsList_Add" */ '../components/goods/add.vue')

// import Order from './components/order/Order.vue'
const Order = () => import(/* webpackChunkName: "Order_Report" */ '../components/orders/orders.vue')
// import Report from './components/report/Report.vue'
const Report = () => import(/* webpackChunkName: "Order_Report" */ '../components/report/reports.vue')

Vue.use(VueRouter)

const routes = [
  { path: '/login', component: Login },
  {
    path: '/home', component: Home, redirect: '/welcome', children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: GoodsList },
      { path: '/goods_add', component: Add },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report }
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

//挂载路由守卫
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})


export default router
