"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _vue = _interopRequireDefault(require("vue"));

var _vueRouter = _interopRequireDefault(require("vue-router"));

var _login = _interopRequireDefault(require("../components/login.vue"));

var _home = _interopRequireDefault(require("../components/home.vue"));

var _welcome = _interopRequireDefault(require("../components/welcome.vue"));

var _users = _interopRequireDefault(require("../components/user/users.vue"));

var _rights = _interopRequireDefault(require("../components/power/rights.vue"));

var _roles = _interopRequireDefault(require("../components/power/roles.vue"));

var _cate = _interopRequireDefault(require("../components/goods/cate.vue"));

var _params = _interopRequireDefault(require("../components/goods/params.vue"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

_vue["default"].use(_vueRouter["default"]);

var routes = [{
  path: '/login',
  component: _login["default"]
}, {
  path: '/home',
  component: _home["default"],
  redirect: '/welcome',
  children: [{
    path: '/welcome',
    component: _welcome["default"]
  }, {
    path: '/users',
    component: _users["default"]
  }, {
    path: '/rights',
    component: _rights["default"]
  }, {
    path: '/roles',
    component: _roles["default"]
  }, {
    path: '/categories',
    component: _cate["default"]
  }, {
    path: '/params',
    component: _params["default"]
  }]
}];
var router = new _vueRouter["default"]({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: routes
}); //挂载路由守卫

router.beforeEach(function (to, from, next) {
  if (to.path === '/login') return next();
  var tokenStr = window.sessionStorage.getItem('token');
  if (!tokenStr) return next('/login');
  next();
});
var _default = router;
exports["default"] = _default;