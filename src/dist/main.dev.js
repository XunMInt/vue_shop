"use strict";

var _vue = _interopRequireDefault(require("vue"));

var _App = _interopRequireDefault(require("./App.vue"));

var _router = _interopRequireDefault(require("./router"));

require("./plugins/element.js");

require("./assets/css/global.css");

var _axios = _interopRequireDefault(require("axios"));

var _vueTableWithTreeGrid = _interopRequireDefault(require("vue-table-with-tree-grid"));

var _vueQuillEditor = _interopRequireDefault(require("vue-quill-editor"));

require("quill/dist/quill.core.css");

require("quill/dist/quill.snow.css");

require("quill/dist/quill.bubble.css");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// import styles
// for snow theme
// for bubble theme
//设置axios默认请求路径
_axios["default"].defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'; //请求拦截器

_axios["default"].interceptors.request.use(function (config) {
  //为请求头添加token字段
  config.headers.Authorization = window.sessionStorage.getItem('token');
  return config;
});

_vue["default"].prototype.$http = _axios["default"];
_vue["default"].config.productionTip = false;

_vue["default"].component('tree-table', _vueTableWithTreeGrid["default"]);

_vue["default"].use(_vueQuillEditor["default"]); //时间过滤器


_vue["default"].filter('dateFromat', function (val) {
  var dt = new Date(val);
  var y = dt.getFullYear();
  var m = (dt.getMonth() + 1 + '').padStart(2, '0');
  var d = (dt.getDate() + '').padStart(2, '0');
  var hh = (dt.getHours() + '').padStart(2, '0');
  var mm = (dt.getMinutes() + '').padStart(2, '0');
  var ss = (dt.getSeconds() + '').padStart(2, '0');
  return "".concat(y, "-").concat(m, "-").concat(d, " ").concat(hh, ":").concat(mm, ":").concat(ss);
});

new _vue["default"]({
  router: _router["default"],
  render: function render(h) {
    return h(_App["default"]);
  }
}).$mount('#app');