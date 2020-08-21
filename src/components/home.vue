<template>
  <el-container>
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img class="logo" src="../assets/images/logo.png" alt />
        <span>电商后台管理系统</span>
        <el-button type="info" @click="logout">退出登录</el-button>
      </div>
    </el-header>
    <!-- 身体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle_button" @click="menutoggle">
          <i :class="isCollapse ? 'el-icon-s-unfold' : 'el-icon-s-fold'"></i>
        </div>
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409eff"
          unique-opened
          :collapse-transition='false'
          :collapse='isCollapse'
          router
          :default-active='activeItem'
        >
          <el-submenu :index="item.id+''" v-for="(item) in menulsit" :key="item.id">
            <template slot="title">
              <i :class="menuIcon[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>

            <el-menu-item
              :index="subitem.path+''"
              v-for="(subitem) in item.children"
              :key="subitem.id"
              @click="setActiveItem(subitem.path)"
            >
              <i class="el-icon-menu"></i>
              <span>{{subitem.authName}}</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 主体区域 -->
      <el-main>
          <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  created() {
    this.getMenuList();
    this.activeItem = window.sessionStorage.getItem('activeItem');
  },
  data() {
    return {
      menulsit: [],
      menuIcon: {
        "125": "el-icon-user-solid",
        "103": "el-icon-s-check",
        "101": "el-icon-s-goods",
        "102": "el-icon-s-order",
        "145": "el-icon-s-data",
      },
      isCollapse:false,
      activeItem:''
    };
  },
  methods: {
    //退出登录
    logout() {
      window.sessionStorage.clear();
      this.$router.push("/login");
      this.$Message("你已退出登录");
    },
    //获取菜单数据
    async getMenuList() {
      let { data: res } = await this.$http.get("menus");
      if (res.meta.status != 200) return this.$Message.error("数据获取失败");
      this.menulsit = res.data;
    },
    //侧边栏切换
    menutoggle(){
        this.isCollapse = !this.isCollapse;
    },
    setActiveItem(name){
        window.sessionStorage.setItem('activeItem',name);
        this.activeItem = name;
    }
  },
};
</script>

<style lang="less" scoped>
.el-container {
  height: 100%;
}

.el-header {
  background-color: #373b41;
  .logo {
    margin-top: 8px;
    width: 45px;
    margin-right: 15px;
  }
  span {
    font-size: 20px;
    color: #fff;
    vertical-align: top;
    line-height: 60px;
  }
  .el-button {
    margin-top: 10px;
    float: right;
  }
}

.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: none;
  }
  .toggle_button {
    font-size: 26px;
    background-color: #4a5064;
    color: #fff;
    text-align: center;
    cursor: pointer;
  }
}

.el-main {
  background-color: #eaedf1;
}
</style>