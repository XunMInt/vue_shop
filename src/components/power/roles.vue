<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片试图 -->
    <el-card class="box-card">
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRolesVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 权限列表 -->
      <el-table :data="rolesList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['el-rowbot','bdbottom',i1 === 0 ? 'bdtop' : '' ,'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="i1"
            >
              <el-col :span="5">
                <el-tag @close="delRights(scope.row,item1.id)" closable>{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <el-row
                  :class="['el-rowbot',i2 === 0 ? ' ' : 'bdtop' ,'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="i2"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      @close="delRights(scope.row,item2.id)"
                      closable
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      v-for="(item3, i3) in item2.children"
                      :key="i3"
                      type="warning"
                      closable
                      @close="delRights(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" prop="level" width="300px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="getEditRoles(scope.row.id)"
            >编辑</el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="delRoles(scope.row.id)"
            >删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-s-tools"
              size="mini"
              @click="editRightsData(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色" :visible.sync="addRolesVisible" width="50%" @close="addRolesClose">
      <!-- 对话框内容区 -->
      <el-form
        :model="addRolesData"
        status-icon
        :rules="addRolesRules"
        ref="addRolesRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input type="text" v-model="addRolesData.roleName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input type="text" v-model="addRolesData.roleDesc" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRolesVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改角色对话框 -->
    <el-dialog title="修改角色" :visible.sync="editRolesVisible" width="50%" @close="editRolesClose">
      <!-- 对话框内容区 -->
      <el-form
        :model="editRolesData"
        status-icon
        :rules="editRolesRules"
        ref="editRolesRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input type="text" v-model="editRolesData.roleName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input type="text" v-model="editRolesData.roleDesc" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRolesVisible = false">取 消</el-button>
        <el-button type="primary" @click="modifyRoles()">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改权限对话框 -->
    <el-dialog title="修改权限" :visible.sync="editRightsVisible" width="50%">
      <!-- 树型组件 -->
      <el-tree
        ref="treeRef"
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRightsVisible = false">取 消</el-button>
        <el-button type="primary" @click="modifyRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //角色列表数据
      rolesList: [],
      //权限列表数据
      rightsList: [],
      //添加角色数据
      addRolesData: {
        roleName: "",
        roleDesc: "",
      },
      //修改角色数据
      editRolesData: {
        roleId: "",
        roleName: "",
        roleDesc: "",
        rolePermissionDesc: "",
      },
      //添加角色验证规则
      addRolesRules: {
        roleName: [
          { required: true, message: "角色名称不能为空", trigger: "blur" },
          {
            min: 2,
            max: 10,
            message: "长度在 2 到 10 个字符",
            trigger: "blur",
          },
        ],
      },
      //修改角色验证规则
      editRolesRules: {
        roleName: [
          { required: true, message: "角色名称不能为空", trigger: "blur" },
          {
            min: 2,
            max: 10,
            message: "长度在 2 到 10 个字符",
            trigger: "blur",
          },
        ],
      },
      //树型控件绑定对象
      treeProps: {
        label: "authName",
        children: "children",
      },
      //默认勾选的id值
      defKeys: [],
      //即将修改的角色id
      roleId: "",
      //添加角色弹窗显示数据
      addRolesVisible: false,
      //修改角色弹出显示显示数据
      editRolesVisible: false,
      //分配权限对话框显示数据
      editRightsVisible: false,
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    //获取角色列表数据
    async getRolesList() {
      let { data: res } = await this.$http.get("roles");
      if (res.meta.status != 200) return this.$Message.error(res.meta.msg);
      this.rolesList = res.data;
    },
    //添加角色
    addRoles() {
      this.$refs.addRolesRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post("roles", this.addRolesData);
        if (res.meta.status != 201) return this.$Message.error(res.meta.msg);
        this.$Message.success(res.meta.msg);
        this.addRolesVisible = false;
        this.getRolesList();
      });
    },
    //添加对话框关闭事件
    addRolesClose() {
      this.addRolesData.roleName = "";
      this.addRolesData.roleDesc = "";
      this.$refs.addRolesRef.resetFields();
    },
    //修改对话框关闭事件
    editRolesClose() {
      this.editRolesData.roleName = "";
      this.editRolesData.roleDesc = "";
      this.$refs.editRolesRef.resetFields();
    },
    //获取修改角色数据
    async getEditRoles(id) {
      this.editRolesVisible = true;
      const { data: res } = await this.$http.get("roles/" + id);
      if (res.meta.status != 200) return this.$Message.error(res.meta.msg);
      this.editRolesData.roleId = res.data.roleId;
      this.editRolesData.roleName = res.data.roleName;
      this.editRolesData.roleDesc = res.data.roleDesc;
      this.editRolesData.rolePermissionDesc = res.data.rolePermissionDesc;
    },
    //修改用户
    async modifyRoles() {
      this.$refs.editRolesRef.validate(async (valid) => {
        if (!valid) return;
        let { data: res } = await this.$http.put(
          "roles/" + this.editRolesData.roleId,
          {
            roleName: this.editRolesData.roleName,
            roleDesc: this.editRolesData.roleDesc || " ",
          }
        );
        if (res.meta.status != 200) return this.$Message.error(res.meta.msg);
        this.$Message.success("修改成功");
        this.editRolesVisible = false;
        this.getRolesList();
      });
    },
    //删除角色
    delRoles(id) {
      this.$confirm("此操作将永久删除该角色, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          let { data: res } = await this.$http.delete("roles/" + id);
          if (res.meta.status != 200) return this.$Message.error(res.meta.msg);
          this.$Message.success(res.meta.msg);
          this.getRolesList();
        })
        .catch(() => {
          this.$Message.info("已取消删除");
        });
    },
    //删除权限
    delRights(rights, id) {
      this.$confirm("是否删除该权限?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          let { data: res } = await this.$http.delete(
            `roles/${rights.id}/rights/${id}`
          );
          if (res.meta.status != 200) return this.$Message.error(res.meta.msg);
          this.$Message.success(res.meta.msg);
          rights.children = res.data;
        })
        .catch(() => {
          this.$Message.info("已取消删除");
        });
    },
    //分配权限展示数据
    async editRightsData(role) {
      this.roleId = role.id;
      let { data: res } = await this.$http.get("rights/tree");
      if (res.meta.status != 200) return this.$Message.error(res.meta.msg);
      this.rightsList = res.data;
      this.defKeys = [];
      this.getDefKeys(role, this.defKeys);
      this.editRightsVisible = true;
    },
    // 递归获取三级节点
    getDefKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id);
      }
      node.children.forEach((item) => {
        this.getDefKeys(item, arr);
      });
    },
    //修改权限
    async modifyRights() {
      //获取所有选中权限
      let keys = [
        ...this.$refs.treeRef.getCheckedNodes(),
        ...this.$refs.treeRef.getHalfCheckedNodes(),
      ];
      let keysId = [];
      //提取权限id为数组
      keys.forEach((item) => {
        keysId.push(item.id);
      });
      keysId = keysId.join(",");
      let { data: res } = await this.$http.post(
        `roles/${(this, this.roleId)}/rights`,
        { rids: keysId }
      );
      if (res.meta.status != 200) return this.$Message.error(res.meta.msg);
      this.$Message.success(res.meta.msg);
      this.getRolesList();
      this.editRightsVisible = false;
    },
  },
};
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
</style>