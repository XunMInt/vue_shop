<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片试图 -->
    <el-card class="box-card">
      <!-- 警示框 -->
      <el-alert show-icon title="注意：只允许为第三级分类设置相关参数！" type="warning" :closable="false"></el-alert>
      <!-- 级联选择框 -->
      <div class="cascader">
        <span class="demonstration">选择商品分类：</span>
        <el-cascader
          v-model="cateKeys"
          :options="cateList"
          :props="cateProps"
          @change="cascaderChange"
        ></el-cascader>
      </div>
      <!-- tabs区域 -->
      <el-tabs v-model="activeName" @tab-click="tabsClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="small" :disabled="isBtuDisabled" @click="addDialog">添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyData" style="width: 100%" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  :disable-transitions="true"
                  @close="TagClose(index,scope.row)"
                  closable
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                >{{item}}</el-tag>
                <!-- 添加标签区 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.addTagValue"
                  ref="saveTagInput"
                  size="small"
                  :disable-transitions="false"
                  @keyup.enter.native="$event.target.blur"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="small"
                  @click="editDialog(scope.row)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="small"
                  @click="delData(scope.row)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="small" :disabled="isBtuDisabled" @click="addDialog">添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyData" style="width: 100%" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  :disable-transitions="true"
                  closable
                  @close="TagClose(index,scope.row)"
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                >{{item}}</el-tag>
                <!-- 添加标签区 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.addTagValue"
                  ref="saveTagInput"
                  size="small"
                  :disable-transitions="false"
                  @keyup.enter.native="$event.target.blur"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="small"
                  @click="editDialog(scope.row)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="small"
                  @click="delData(scope.row)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加对话框 -->
    <el-dialog
      :title="'添加' + dialogTitle"
      :visible.sync="addVisible"
      width="50%"
      @close="addDialogClose"
    >
      <el-form ref="addFromRef" :rules="addRules" :model="addFrom" label-width="80px">
        <el-form-item :label="dialogTitle" prop="attr_name">
          <el-input v-model="addFrom.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addVisible = false">取 消</el-button>
        <el-button type="primary" @click="addData">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改对话框 -->
    <el-dialog
      :title="'修改' + dialogTitle"
      :visible.sync="editVisible"
      width="50%"
      @close="editDialogClose"
    >
      <el-form ref="editFromRef" :rules="editRules" :model="editFrom" label-width="80px">
        <el-form-item :label="dialogTitle" prop="attr_name">
          <el-input v-model="editFrom.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false">取 消</el-button>
        <el-button type="primary" @click="editData">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template> 

<script>
export default {
  data() {
    return {
      //分类列表数据
      cateList: [],
      //选中数据值
      cateKeys: [],
      //级联选择器配置项
      cateProps: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
      //tabs启用名称
      activeName: "many",
      //动态参数数据
      manyData: [],
      //静态属性数据
      onlyData: [],
      //添加数据
      addFrom: {
        attr_name: "",
      },
      //修改数据
      editFrom: {
        attr_name: "",
        attr_id: "",
      },
      //添加验证规则
      addRules: {
        attr_name: {
          required: true,
          message: "请输入参数名称",
          trigger: "blur",
        },
      },
      //修改验证规则
      editRules: {
        attr_name: {
          required: true,
          message: "请输入参数名称",
          trigger: "blur",
        },
      },
      //添加对话框显示参数
      addVisible: false,
      //修改对话框显示参数
      editVisible: false,
    };
  },
  created() {
    this.getCateList();
  },
  computed: {
    //判断是否为三级属性
    isBtuDisabled() {
      if (this.cateKeys.length !== 3) {
        return true;
      }
      return false;
    },
    //获取三级ID
    getCateId() {
      if (this.cateKeys.length !== 3) {
        return null;
      }
      return this.cateKeys[this.cateKeys.length - 1];
    },
    //获取添加对话框标题
    dialogTitle() {
      if (this.activeName == "many") {
        return "静态参数";
      } else if (this.activeName == "only") {
        return "动态属性";
      }
    },
  },
  methods: {
    //获取分类列表
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status != 200) return this.$Message.error(res.meta.msg);
      this.cateList = res.data;
    },
    //级联选择框change事件
    async cascaderChange() {
      this.getCateData();
    },
    //tabs点击事件
    tabsClick() {
      this.getCateData();
    },
    //获取选中三级分类具体参数与属性
    async getCateData() {
      if (this.cateKeys.length !== 3) {
        this.manyData = [];
        this.onlyData = [];
        return;
      }
      const { data: res } = await this.$http.get(
        `categories/${this.getCateId}/attributes`,
        {
          params: {
            sel: this.activeName,
          },
        }
      );
      if (res.meta.status != 200) return this.$Message.error(res.meta.msg);
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
        item.addTagValue = "";
        item.inputVisible = false;
      });
      if (this.activeName == "many") {
        this.manyData = res.data;
      } else {
        this.onlyData = res.data;
      }
    },
    //添加对话框点击事件
    addDialog() {
      this.addVisible = true;
    },
    //修改对话框点击事件
    editDialog(data) {
      this.editFrom.attr_name = data.attr_name;
      this.editFrom.attr_id = data.attr_id;
      this.editVisible = true;
    },
    //添加对话框关闭事件
    addDialogClose() {
      this.$refs.addFromRef.resetFields();
    },
    //修改对话框关闭事件
    editDialogClose() {
      this.$refs.editFromRef.resetFields();
      this.editFrom.attr_name = "";
      this.editFrom.attr_id = "";
    },
    //添加属性
    async addData() {
      this.$refs.addFromRef.validate(async (val) => {
        if (!val) return;
        const { data: res } = await this.$http.post(
          `categories/${this.getCateId}/attributes`,
          {
            attr_name: this.addFrom.attr_name,
            attr_sel: this.activeName,
          }
        );
        if (res.meta.status != 201) return this.$Message.error(res.meta.msg);
        this.$Message.success(res.meta.msg);
        this.getCateData();
        this.addVisible = false;
      });
    },
    //修改数据
    editData() {
      this.$refs.editFromRef.validate(async (val) => {
        if (!val) return;
        const { data: res } = await this.$http.put(
          `categories/${this.getCateId}/attributes/${this.editFrom.attr_id}`,
          {
            attr_name: this.editFrom.attr_name,
            attr_sel: this.activeName,
          }
        );
        if (res.meta.status != 200) return this.$Message.error(res.meta.msg);
        this.$Message.success(res.meta.msg);
        this.getCateData();
        this.editVisible = false;
      });
    },
    //删除数据
    async delData(data) {
      this.$confirm("是否删除该分类?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(
            `categories/${data.cat_id}/attributes/${data.attr_id}`
          );
          if (res.meta.status != 200) return this.$Message.error(res.meta.msg);
          this.$Message.success(res.meta.msg);
          this.getCateData();
        })
        .catch(() => {
          this.$Message.info("已取消删除");
        });
    },
    //tag添加焦点移除事件
    handleInputConfirm(row) {
      if (row.addTagValue.trim().length === 0) {
        row.inputVisible = false;
        row.addTagValue = "";
        return;
      }
      row.attr_vals.push(row.addTagValue.trim());
      row.inputVisible = false;
      //服务器请求添加参数
      this.putTag(row);
    },
    // 修改或删除Tag
    async putTag(row) {
      const { data: res } = await this.$http.put(
        `categories/${row.cat_id}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(" "),
        }
      );
      if (res.meta.status != 200) return this.$Message.error(res.meta.msg);
      this.$Message.success(res.meta.msg);
      row.addTagValue = "";
    },
    //添加标签点击事件
    showInput(row) {
      row.inputVisible = true;
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    TagClose(i, row) {
      row.attr_vals.splice(i, 1);
      this.putTag(row);
    },
  },
};
</script>

<style lang="less" scoped>
.el-alert1 {
  font-size: 16px;
}
.cascader {
  margin: 15px 0;
}
.el-table {
  margin: 15px 0;
}
.el-tag {
  margin: 5px;
}

.input-new-tag,
.button-new-tag {
  margin: 5px;
  width: 90px;
}
</style>