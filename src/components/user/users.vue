<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片试图 -->
    <el-card class="box-card">
      <!-- 搜索框 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" @clear="queryUser" clearable>
            <el-button slot="append" icon="el-icon-search" @click="queryUser"></el-button>
          </el-input>
        </el-col>

        <el-col :span="4">
          <el-button type="primary" @click="addUserVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区 -->
      <el-table :data="userlist" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态" prop="mg_state" width="150px">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="putState(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editUser(scope.row.id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="delUser(scope.row.id)"
            ></el-button>
            <el-tooltip
              class="item"
              effect="dark"
              content="修改角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-s-tools"
                size="mini"
                @click="editRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 8]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      ></el-pagination>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="addUserVisible" width="50%" @close="addUserClose">
      <!-- 对话框内容区 -->
      <el-form :model="userForm" status-icon :rules="userRules" ref="addUserRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input type="text" v-model="userForm.username" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="userForm.password" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input type="text" v-model="userForm.email" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input type="text" v-model="userForm.mobile" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addUserVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户" :visible.sync="editUserVisible" width="50%" @close="editUserClose">
      <!-- 对话框内容区 -->
      <el-form
        :model="editUserData"
        status-icon
        :rules="editRules"
        ref="editUserRef"
        label-width="70px"
      >
        <el-form-item label="用户名">
          <el-input type="text" v-model="editUserData.username" autocomplete="off" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input type="text" v-model="editUserData.email" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input type="text" v-model="editUserData.mobile" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editUserVisible = false">取 消</el-button>
        <el-button type="primary" @click="modifyUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改角色对话框 -->
    <el-dialog title="修改角色" :visible.sync="editRoleVisible" width="50%" @close="editRoleClose">
      <div>
        <p>当前的用户：{{editRoleInfo.username}}</p>
        <p>当前的角色：{{editRoleInfo.role_name}}</p>
        <p>分配新角色：</p>
        <el-select v-model="editRoleInfoSelect" placeholder="请选择">
          <el-option
            v-for="item in editRoleList"
            :key="item.id"
            :label="item.roleName"
            :value="item.id"
          ></el-option>
        </el-select>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleVisible = false">取 消</el-button>
        <el-button type="primary" @click="modifyRole()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created() {
    this.getUsersList();
  },
  data() {
    //邮箱校验规则
    const checkEmail = (rule, value, cb) => {
      const regEmail = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
      if (regEmail.test(value)) {
        return cb();
      }
      cb(new Error("请输入合法邮箱"));
    };
    //手机号验证规则
    const checkmobile = (rule, value, cb) => {
      const regmobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
      if (regmobile.test(value)) {
        return cb();
      }
      cb(new Error("请输入合法手机号"));
    };
    return {
      queryInfo: {
        //查询参数
        query: "",
        // 当前页码
        pagenum: 1,
        pagesize: 8,
      },
      //用户数据
      userlist: [],
      //修改角色时需要展示的数据
      editRoleInfo: "",
      //用户列表
      total: 0,
      //添加用户对话框显示参数
      addUserVisible: false,
      //修改用户对话框显示参数
      editUserVisible: false,
      //修改角色对话框显示参数
      editRoleVisible: false,
      //修改角色select数据
      editRoleInfoSelect: "",
      //所有角色数据
      editRoleList: "",
      //添加用户数据
      userForm: {
        username: "",
        password: "",
        email: "",
        mobile: "",
      },
      //修改用户数据
      editUserData: {},
      //用户验证规则
      userRules: {
        username: [
          { required: true, message: "用户名不能为空", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "长度在 3 到 10 个字符",
            trigger: "blur",
          },
        ],
        password: [
          { required: true, message: "密码不能为空", trigger: "blur" },
          {
            min: 6,
            max: 16,
            message: "长度在 6 到 16 个字符",
            trigger: "blur",
          },
        ],
        email: [
          { required: true, message: "邮箱不能为空", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "手机号不能为空", trigger: "blur" },
          { validator: checkmobile, trigger: "blur" },
        ],
      },
      //修改用户验证规则
      editRules: {
        email: [
          { required: true, message: "邮箱不能为空", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "手机号不能为空", trigger: "blur" },
          { validator: checkmobile, trigger: "blur" },
        ],
      },
    };
  },
  methods: {
    //获取用户列表
    async getUsersList() {
      const { data: res } = await this.$http.get("/users", {
        params: this.queryInfo,
      });
      if (res.meta.status != 200)
        return this.$Message.error(res.meta.msg);
      this.userlist = res.data.users;
      this.total = res.data.total;
    },
    //设置每页多少条数据
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getUsersList();
    },
    //设置页码
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getUsersList();
    },
    //设置用户状态
    async putState(user) {
      let { data: res } = await this.$http.put(
        `users/${user.id}/state/${user.mg_state}`
      );
      if (res.meta.status != 200) {
        user.mg_state = !user.mg_state;
        return this.$Message.error(res.meta.msg);
      }
      this.$Message.success(res.meta.msg);
    },
    //查询用户
    queryUser() {
      this.getUsersList();
    },
    //添加对话框关闭事件
    addUserClose() {
      this.$refs.addUserRef.resetFields();
    },
    //添加用户
    addUser() {
      this.$refs.addUserRef.validate(async (valid) => {
        if (!valid) return;
        let { data: res } = await this.$http.post("users", this.userForm);
        if (res.meta.status != 201) return this.$Message.error(res.meta.msg);
        this.$Message.success(res.meta.msg);
        this.addUserVisible = false;
        this.getUsersList();
      });
    },
    //获取修改用户
    async editUser(id) {
      let { data: res } = await this.$http.get("users/" + id);
      if (res.meta.status != 200) return this.$Message.error(res.meta.msg);
      this.editUserData = res.data;
      this.editUserVisible = true;
    },
    //修改用户对话框关闭事件
    editUserClose() {
      this.$refs.editUserRef.resetFields();
    },
    //修改用户
    async modifyUser() {
      this.$refs.editUserRef.validate(async (valid) => {
        if (!valid) return;
        let { data: res } = await this.$http.put(
          "users/" + this.editUserData.id,
          {
            email: this.editUserData.email,
            mobile: this.editUserData.mobile,
          }
        );
        if (res.meta.status != 200) return this.$Message.error(res.meta.msg);
        this.$Message.success(res.meta.msg);
        this.editUserVisible = false;
        this.getUsersList();
      });
    },
    //删除用户
    delUser(id) {
      this.$confirm("此操作将永久删除该用户, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          let { data: res } = await this.$http.delete("users/" + id);
          if (res.meta.status != 200) return this.$Message.error(res.meta.msg);
          this.$Message.success(res.meta.msg);
          this.queryInfo.pagenum = 1;
          this.getUsersList();
        })
        .catch(() => {
          this.$Message.info("已取消删除");
        });
    },
    //展示修改角色对话框
    async editRole(editRoleInfo) {
      this.editRoleInfo = editRoleInfo;
      let { data: res } = await this.$http.get("roles");
      if (res.meta.status != 200) {
        this.editRoleVisible = false;
        return this.$Message.error(res.meta.msg);
      }
      this.editRoleList = res.data;
      this.editRoleVisible = true;
    },
    //修改角色
    async modifyRole() {
      if (!this.editRoleInfoSelect)
        return this.$Message.error("你还没有选中角色");
      let { data: res } = await this.$http.put(
        `users/${this.editRoleInfo.id}/role`,
        {
          rid: this.editRoleInfoSelect,
        }
      );
      if (res.meta.status != 200) return this.$Message.error(res.meta.msg);
      this.$Message.success(res.meta.msg);
      this.getUsersList();
      this.editRoleVisible = false;
    },
    //修改角色对话框关闭事件
    editRoleClose() {
      this.editRoleInfoSelect = "";
      this.editRoleInfo = "";
    },
  },
};
</script>

<style lang="less" scoped>
.el-table {
  margin-top: 15px;
  text-align: center;
}
</style>